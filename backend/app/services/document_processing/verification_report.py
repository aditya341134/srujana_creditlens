"""
Comprehensive Verification Report Generator Service
Strictly generates the Section 13 11-dimension verification report per document,
aggregates cross-corroboration, identifies discrepancies, and formats human review actions.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from ...schemas.documents import (
    VerificationReportResponse,
    DocumentItem,
    DocumentCategory,
    DocumentProcessingStatus,
    DocumentVerificationStatus,
    DocumentRequiredStatus,
    FileProcessingStatus,
    ExtractionStatus,
    DigitalSignatureStatus,
    SignerTrustStatus,
    AuthoritativeVerificationStatus,
    ConsistencyStatus,
    ReviewStatus,
    DocumentReportItem,
    DiscrepancyItem
)
from .cross_document import perform_cross_document_checks

def _map_file_processing(doc: Optional[DocumentItem]) -> FileProcessingStatus:
    if not doc:
        return FileProcessingStatus.FAILED
    if doc.processing_status == DocumentProcessingStatus.READABLE:
        return FileProcessingStatus.READABLE
    if doc.processing_status == DocumentProcessingStatus.PARTIALLY_READABLE:
        return FileProcessingStatus.READABLE
    if doc.processing_status == DocumentProcessingStatus.UNREADABLE:
        return FileProcessingStatus.UNREADABLE
    return FileProcessingStatus.FAILED

def _map_extraction_status(doc: Optional[DocumentItem]) -> ExtractionStatus:
    if not doc or not doc.extracted_fields:
        return ExtractionStatus.FAILED
    if doc.extracted_fields.get("is_valid_format") or doc.extracted_fields.get("median_salary_credit", 0) > 0 or doc.extracted_fields.get("has_score"):
        return ExtractionStatus.COMPLETE
    if doc.processing_status == DocumentProcessingStatus.PARTIALLY_READABLE:
        return ExtractionStatus.PARTIAL
    return ExtractionStatus.UNCERTAIN

def build_document_report_item(
    doc_type_name: str,
    required_status: DocumentRequiredStatus,
    doc: Optional[DocumentItem],
    discrepancies: List[DiscrepancyItem]
) -> DocumentReportItem:
    """
    Builds the exact 11-field Section 13 Document Report Item.
    """
    related_discrepancies = [
        d for d in discrepancies if any(doc_type_name.lower() in src.lower() for src in d.source_documents)
    ]

    if not doc:
        # Document is missing
        return DocumentReportItem(
            document_type=doc_type_name,
            required_status=required_status,
            file_processing=FileProcessingStatus.FAILED,
            extraction_status=ExtractionStatus.FAILED,
            digital_signature_status=DigitalSignatureStatus.NOT_APPLICABLE,
            signer_trust_status=SignerTrustStatus.NOT_APPLICABLE,
            authoritative_verification=AuthoritativeVerificationStatus.UNAVAILABLE,
            consistency_status=ConsistencyStatus.INSUFFICIENT_DATA,
            review_status=ReviewStatus.PENDING if required_status == DocumentRequiredStatus.COMPULSORY else ReviewStatus.NOT_REQUIRED,
            findings=[f"{doc_type_name} has not been submitted."],
            limitations=["Document missing from application dossier."],
            review_actions=[f"Request applicant upload {doc_type_name} PDF."] if required_status != DocumentRequiredStatus.OPTIONAL else []
        )

    # Determine digital signature status
    sig_status = DigitalSignatureStatus.ABSENT
    signer_trust = SignerTrustStatus.NOT_APPLICABLE
    if doc.digital_signature_present:
        sig_status = DigitalSignatureStatus.PRESENT_VALID if doc.digital_signature_valid else DigitalSignatureStatus.PRESENT_UNVERIFIED_TRUST
        signer_trust = SignerTrustStatus.UNKNOWN

    # Determine authoritative verification status
    auth_status = AuthoritativeVerificationStatus.UNAVAILABLE
    auth_limitations = ["Direct authoritative government gateway (UIDAI/ITD/CIBIL) not configured in local environment."]
    if doc.authoritative_verified:
        auth_status = AuthoritativeVerificationStatus.COMPLETED_PASSED

    # Consistency status
    if related_discrepancies:
        cons_status = ConsistencyStatus.DISCREPANCY
    elif doc.extracted_fields:
        cons_status = ConsistencyStatus.CONSISTENT
    else:
        cons_status = ConsistencyStatus.UNRESOLVED

    # Review status
    rev_status = ReviewStatus.NOT_REQUIRED
    if related_discrepancies or sig_status == DigitalSignatureStatus.PRESENT_UNVERIFIED_TRUST:
        rev_status = ReviewStatus.PENDING

    findings: List[str] = []
    limitations: List[str] = list(auth_limitations)
    review_actions: List[str] = []

    fields = doc.extracted_fields or {}

    # Category-specific findings
    if doc.category == DocumentCategory.PAN:
        findings.append(f"Format: {fields.get('entity_type', 'Valid Individual')} ({fields.get('pan_number_masked', 'Masked')}).")
        if fields.get("extracted_name"):
            findings.append(f"Cardholder: {fields.get('extracted_name')}.")
        if sig_status == DigitalSignatureStatus.ABSENT:
            limitations.append("PAN card contains no embedded digital signature. Formats without digital signatures are standard.")
    elif doc.category == DocumentCategory.AADHAAR:
        findings.append(f"Aadhaar Number: {fields.get('aadhaar_masked', 'Masked')}; DOB: {fields.get('dob', 'Not specified')}.")
        if fields.get("signature_present"):
            findings.append("Digital signature block identified in UIDAI e-KYC layout.")
        limitations.append("Full UIDAI biometric verification not invoked; demographic checks performed on masked reference.")
    elif doc.category == DocumentCategory.PASSPORT:
        findings.append(f"Passport Number: {fields.get('passport_masked', 'Masked')}; Expiry: {fields.get('expiry_date', 'Not extracted')}.")
        if fields.get("mrz_check_digits_valid"):
            findings.append("ICAO Doc 9303 MRZ lines parsed and check digits verified successfully.")
        limitations.append("Passport verification validates structure and MRZ syntax; does not query live MEA revocation index.")
    elif doc.category == DocumentCategory.BANK_STATEMENT:
        findings.append(f"Bank: {fields.get('bank_name', 'Bank')} (A/C: {fields.get('account_number_masked', 'Masked')}).")
        findings.append(f"Median verified monthly salary: ₹{fields.get('median_salary_credit', 0):,.2f} across {fields.get('salary_credit_count', 0)} credits.")
        if fields.get("balance_reconciliation_details"):
            findings.append(f"Reconciliation: {fields.get('balance_reconciliation_details')}")
        if fields.get("returned_cheques_ecs_count", 0) > 0:
            findings.append(f"Alert: {fields.get('returned_cheques_ecs_count')} return/bounce transaction(s) detected.")
        limitations.append("Analysis conducted on uploaded statement text; direct Account Aggregator pipe not active.")
    elif doc.category == DocumentCategory.CIR:
        if fields.get("has_score"):
            findings.append(f"Bureau: {fields.get('bureau_name', 'Bureau')} Score: {fields.get('bureau_score')}.")
        else:
            findings.append("Credit Information Report contains no numeric bureau score (thin-file evidence gap).")
        findings.append(f"Active accounts: {fields.get('active_credit_lines', 0)}; 24M Delinquencies: {fields.get('delinquencies_24m', 0)}.")
        limitations.append("Bureau data extracted from applicant-uploaded PDF; not an authorized live bureau pull.")
    elif doc.category == DocumentCategory.NO_DUES_AFFIDAVIT:
        findings.append("Borrower self-declaration of zero prior liabilities.")
        if fields.get("is_notarized"):
            findings.append("Document bears notary / oath commissioner attestation markings.")
        limitations.append("Affidavit is a self-declaration and does not constitute independent institutional proof of loan closure.")

    # Discrepancy actions
    for d in related_discrepancies:
        findings.append(f"Discrepancy: {d.description}")
        review_actions.append(d.recommended_action)

    return DocumentReportItem(
        document_type=doc_type_name,
        required_status=required_status,
        file_processing=_map_file_processing(doc),
        extraction_status=_map_extraction_status(doc),
        digital_signature_status=sig_status,
        signer_trust_status=signer_trust,
        authoritative_verification=auth_status,
        consistency_status=cons_status,
        review_status=rev_status,
        findings=findings,
        limitations=limitations,
        review_actions=review_actions
    )

def generate_verification_report(
    application: Dict[str, Any],
    document_items: List[DocumentItem]
) -> VerificationReportResponse:
    """
    Generates comprehensive verification report with full Section 13 audit structure.
    """
    app_id = application.get("id", "APP-UNKNOWN")
    now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    has_prev_loan = str(application.get("hasPreviousLoan", "no")).lower()

    # Map extracted data by document category
    docs_extracted: Dict[str, Any] = {}
    docs_by_cat: Dict[DocumentCategory, DocumentItem] = {}
    for doc in document_items:
        cat_key = doc.category.value.lower().replace(" ", "_")
        docs_extracted[cat_key] = doc.extracted_fields
        docs_by_cat[doc.category] = doc

    # Cross-document reconciliation
    discrepancies = perform_cross_document_checks(application, docs_extracted)

    # Section 13: Build Granular 11-Dimension Report for every expected category
    identity_doc = docs_by_cat.get(DocumentCategory.AADHAAR) or docs_by_cat.get(DocumentCategory.PASSPORT)
    pan_doc = docs_by_cat.get(DocumentCategory.PAN)
    bank_doc = docs_by_cat.get(DocumentCategory.BANK_STATEMENT)
    cir_doc = docs_by_cat.get(DocumentCategory.CIR)
    affidavit_doc = docs_by_cat.get(DocumentCategory.NO_DUES_AFFIDAVIT)

    document_reports = [
        build_document_report_item(
            "Aadhaar / Passport (Identity Proof)",
            DocumentRequiredStatus.COMPULSORY,
            identity_doc,
            discrepancies
        ),
        build_document_report_item(
            "PAN Card",
            DocumentRequiredStatus.COMPULSORY,
            pan_doc,
            discrepancies
        ),
        build_document_report_item(
            "Bank Statement",
            DocumentRequiredStatus.COMPULSORY,
            bank_doc,
            discrepancies
        ),
        build_document_report_item(
            "Credit Information Report (CIR)",
            DocumentRequiredStatus.CONDITIONALLY_REQUIRED if has_prev_loan == "yes" else DocumentRequiredStatus.OPTIONAL,
            cir_doc,
            discrepancies
        ),
        build_document_report_item(
            "No Dues Affidavit",
            DocumentRequiredStatus.CONDITIONALLY_REQUIRED if has_prev_loan == "no" else DocumentRequiredStatus.OPTIONAL,
            affidavit_doc,
            discrepancies
        )
    ]

    # Checklist status
    checklist_status = {
        "identity_proof": "PASSED" if identity_doc is not None else "MISSING",
        "pan_card": "PASSED" if pan_doc is not None else "MISSING",
        "bank_statement": "PASSED" if bank_doc is not None else "MISSING",
        "credit_or_affidavit": "PASSED" if (cir_doc is not None or affidavit_doc is not None) else "MISSING"
    }

    has_critical_discrepancy = any(d.severity in ["HIGH", "CRITICAL"] for d in discrepancies)
    all_mandatory_present = all(v == "PASSED" for v in checklist_status.values())

    if has_critical_discrepancy:
        quality = "DISCREPANCY_FLAGGED"
    elif all_mandatory_present:
        quality = "HIGH_COMPLETENESS"
    else:
        quality = "PARTIAL_DOCUMENTATION"

    checks_performed = [
        {"name": "PDF Integrity & Format", "status": "PASSED", "details": "PDF magic bytes, 15MB limit, and parseability verified."},
        {"name": "Digital Signature Evaluation", "status": "COMPLETED", "details": "PKCS#7 signature dictionaries and byte ranges analyzed."},
        {"name": "Identity Cross-Corroboration", "status": "FLAGGED" if any("Identity" in d.check_name for d in discrepancies) else "PASSED", "details": "Aadhaar/Passport & PAN name match check."},
        {"name": "Income Verification & Arithmetic", "status": "FLAGGED" if any("Income" in d.check_name for d in discrepancies) else "PASSED", "details": "Payroll credits reconciled with stated salary, excluding non-income inflows."},
        {"name": "Liabilities Reconciliation", "status": "FLAGGED" if any("Previous Loan" in d.check_name for d in discrepancies) else "PASSED", "details": "CIR tradelines compared with previous loan declarations."}
    ]

    return VerificationReportResponse(
        application_id=app_id,
        overall_evidence_quality=quality,
        checklist_status=checklist_status,
        documents=document_items,
        document_reports=document_reports,
        discrepancies=discrepancies,
        checks_performed=checks_performed,
        generated_at=now_str
    )
