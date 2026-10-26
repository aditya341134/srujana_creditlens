"""
Document Intake & Processing API Endpoints
Handles secure PDF uploads (15MB limit, SHA-256 fingerprinting, classification, extraction).
"""

import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Header

from ...models.domain import applications_db, documents_db, add_audit_event, get_application
from ...schemas.documents import (
    DocumentItem,
    DocumentCategory,
    DocumentProcessingStatus,
    DocumentVerificationStatus
)
from ...services.storage import save_document_file, MAX_DOCUMENT_SIZE_BYTES
from ...services.document_processing.extraction import extract_text_from_pdf_bytes
from ...services.document_processing.classification import classify_document_text
from ...services.document_processing.pan_checks import verify_pan_content
from ...services.document_processing.aadhaar_checks import verify_aadhaar_content
from ...services.document_processing.passport_checks import verify_passport_content
from ...services.document_processing.bank_statement import verify_bank_statement_content
from ...services.document_processing.credit_report import verify_credit_report_content
from ...services.document_processing.affidavit import verify_affidavit_content
from ...services.document_processing.signatures import inspect_pdf_digital_signatures

router = APIRouter(prefix="/api/applications", tags=["Documents"])

@router.post("/{application_id}/documents", response_model=DocumentItem, status_code=status.HTTP_201_CREATED)
async def upload_document(
    application_id: str,
    file: UploadFile = File(...),
    category: str = Form(...),
    authorization: Optional[str] = Header(None)
):
    app_item = get_application(application_id)
    if not app_item:
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found")

    content = await file.read()

    # 1. Server-side size enforcement
    if len(content) > MAX_DOCUMENT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded file exceeds maximum limit of 15 MB (size: {len(content)/(1024*1024):.1f} MB)."
        )

    # 2. File validation & storage
    storage_meta = save_document_file(application_id, content, file.filename, category)

    # 2b. Digital signature inspection (ISO 32000 / PKCS#7 detection)
    sig_meta = inspect_pdf_digital_signatures(content)

    # 3. Text Extraction
    extraction_res = extract_text_from_pdf_bytes(content)
    extracted_text = extraction_res.get("text", "")
    proc_status = extraction_res.get("status", DocumentProcessingStatus.READABLE)

    # 4. Classification
    detected_cat, class_conf, has_mismatch = classify_document_text(extracted_text, category)

    # 5. Document-Specific Checks
    extracted_fields = {}
    verif_status = DocumentVerificationStatus.VERIFIED
    notes = extraction_res.get("notes", "")

    # Map input category string to canonical DocumentCategory
    cat_lower = category.lower()
    declared_category = DocumentCategory.UNKNOWN
    for cat_enum in DocumentCategory:
        if cat_enum.value.lower() == cat_lower or cat_enum.name.lower() == cat_lower:
            declared_category = cat_enum
            break
    if declared_category == DocumentCategory.UNKNOWN and "statement" in cat_lower:
        declared_category = DocumentCategory.BANK_STATEMENT
    if "pan" in cat_lower:
        extracted_fields = verify_pan_content(extracted_text)
        if not extracted_fields.get("is_valid_format"):
            verif_status = DocumentVerificationStatus.VERIFICATION_FAILED
    elif "aadhaar" in cat_lower:
        extracted_fields = verify_aadhaar_content(extracted_text)
        if not extracted_fields.get("is_valid_format"):
            verif_status = DocumentVerificationStatus.VERIFICATION_FAILED
    elif "passport" in cat_lower:
        extracted_fields = verify_passport_content(extracted_text)
        if not extracted_fields.get("is_valid_format"):
            verif_status = DocumentVerificationStatus.VERIFICATION_FAILED
    elif "statement" in cat_lower:
        extracted_fields = verify_bank_statement_content(extracted_text)
        if extracted_fields.get("median_salary_credit", 0) <= 0:
            verif_status = DocumentVerificationStatus.VERIFICATION_FAILED
    elif "cir" in cat_lower or "credit" in cat_lower:
        extracted_fields = verify_credit_report_content(extracted_text)
    elif "affidavit" in cat_lower or "dues" in cat_lower:
        extracted_fields = verify_affidavit_content(extracted_text)
        verif_status = DocumentVerificationStatus.PARTIALLY_VERIFIED

    extracted_fields["signature_meta"] = sig_meta

    if has_mismatch or (detected_cat != declared_category and declared_category != DocumentCategory.UNKNOWN):
        verif_status = DocumentVerificationStatus.VERIFICATION_FAILED
        notes += f" [Category Mismatch: Declared as '{category}' but text indicates '{detected_cat.value}']"

    doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

    doc_item = DocumentItem(
        document_id=doc_id,
        application_id=application_id,
        filename=storage_meta["filename"],
        category=declared_category,
        detected_category=detected_cat,
        file_size_bytes=storage_meta["file_size"],
        sha256_hash=storage_meta["sha256"],
        uploaded_at=now_str,
        uploaded_by="Borrower",
        processing_status=proc_status,
        verification_status=verif_status,
        digital_signature_present=sig_meta.get("signature_present", False),
        digital_signature_valid=sig_meta.get("signature_present", False),
        authoritative_verified=False,
        extracted_fields=extracted_fields,
        notes=notes
    )

    if application_id not in documents_db:
        documents_db[application_id] = []
    
    # Replace existing version of same category if present
    documents_db[application_id] = [d for d in documents_db[application_id] if d.category != declared_category]
    documents_db[application_id].append(doc_item)

    # Invalidate cached assessment so next fetch dynamically re-evaluates uploaded document
    from ...models.domain import assessments_db
    assessments_db.pop(application_id, None)

    # Record audit event
    add_audit_event(
        application_id,
        "Document Uploaded",
        f"Uploaded {category} ({file.filename}) - SHA256: {storage_meta['sha256'][:12]}... Status: {verif_status.value}",
        user="Borrower",
        changed_values={"documentId": doc_id, "category": category, "status": verif_status.value}
    )

    return doc_item

@router.get("/{application_id}/documents", response_model=List[DocumentItem])
def list_application_documents(application_id: str):
    app_item = get_application(application_id)
    if not app_item:
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found")
    return documents_db.get(application_id, [])

@router.get("/{application_id}/documents/{document_id}", response_model=DocumentItem)
def get_document(application_id: str, document_id: str):
    docs = documents_db.get(application_id, [])
    for d in docs:
        if d.document_id == document_id:
            return d
    raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
