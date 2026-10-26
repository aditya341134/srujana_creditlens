"""
Unit Tests for Document Processing, PDF Validation, and Cross-Document Verification
"""

import pytest
from fastapi import HTTPException
from app.services.storage import validate_pdf_content, calculate_sha256, MAX_DOCUMENT_SIZE_BYTES
from app.services.document_processing.classification import classify_document_text
from app.services.document_processing.pan_checks import verify_pan_content
from app.services.document_processing.aadhaar_checks import verify_aadhaar_content
from app.services.document_processing.cross_document import perform_cross_document_checks
from app.core.security import mask_aadhaar, mask_pan, fuzzy_name_match

def test_validate_pdf_content_magic_bytes():
    # Valid PDF header
    valid_pdf = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj"
    validate_pdf_content(valid_pdf, "sample.pdf")  # Should not raise

    # Invalid non-PDF file
    invalid_file = b"This is a text file renamed to .pdf"
    with pytest.raises(HTTPException) as exc_info:
        validate_pdf_content(invalid_file, "fake.pdf")
    assert exc_info.value.status_code == 400
    assert "missing %PDF header" in exc_info.value.detail

def test_validate_pdf_content_oversized():
    oversized = b"%PDF-" + b"0" * (MAX_DOCUMENT_SIZE_BYTES + 100)
    with pytest.raises(HTTPException) as exc_info:
        validate_pdf_content(oversized, "huge.pdf")
    assert exc_info.value.status_code == 413

def test_validate_pdf_content_empty():
    with pytest.raises(HTTPException) as exc_info:
        validate_pdf_content(b"", "empty.pdf")
    assert exc_info.value.status_code == 400

def test_sha256_hash():
    content = b"%PDF-1.4 sample content"
    h1 = calculate_sha256(content)
    h2 = calculate_sha256(content)
    assert h1 == h2
    assert len(h1) == 64

def test_pan_checks():
    text = "INCOME TAX DEPARTMENT\nGOVT OF INDIA\nABCCE1234F\nPriya Sharma"
    res = verify_pan_content(text)
    assert res["is_valid_format"] is True
    assert res["entity_type"] == "Company"  # 4th letter 'C' is Company
    assert "XXXXX" in res["pan_number_masked"]

    # Individual PAN
    text_ind = "Permanent Account Number: ABGPS1234K"
    res_ind = verify_pan_content(text_ind)
    assert res_ind["is_valid_format"] is True
    assert res_ind["is_individual"] is True
    assert res_ind["entity_type"] == "Individual"

def test_aadhaar_checks_masking():
    text = "Unique Identification Authority of India\nEnrollment No: 12345\n9820 4412 8901\nDOB: 15/08/1990\nMale"
    res = verify_aadhaar_content(text)
    assert res["is_valid_format"] is True
    assert res["aadhaar_masked"] == "XXXXXXXX8901"
    assert "9820" not in res["aadhaar_masked"]

def test_classification_and_mismatch():
    pan_text = "INCOME TAX DEPARTMENT GOVT OF INDIA PERMANENT ACCOUNT NUMBER ABCDE1234F"
    cat, conf, mismatch = classify_document_text(pan_text, declared_category="PAN")
    assert cat.value == "PAN"
    assert mismatch is False

    # Declared as Bank Statement but text is PAN Card
    cat2, conf2, mismatch2 = classify_document_text(pan_text, declared_category="Bank Statement")
    assert mismatch2 is True

def test_cross_document_checks():
    app_data = {
        "applicantName": "Priya Sharma",
        "grossMonthlyIncome": 95000,
        "existingDebtObligations": 12000,
        "hasPreviousLoan": "no"
    }
    # Case: Bank statement credits verified at 45,000 (mismatch > 30%)
    docs_extracted = {
        "pan": {"extracted_name": "Priya Sharma"},
        "bank_statement": {"median_salary_credit": 45000, "returned_cheques_ecs_count": 0},
        "cir": {"active_credit_lines": 3}
    }
    discrepancies = perform_cross_document_checks(app_data, docs_extracted)
    # Expect: Income discrepancy and contradictory previous loan declaration
    disc_names = [d.check_name for d in discrepancies]
    assert any("Income Evidence Discrepancy" in name for name in disc_names)
    assert any("Contradictory Previous Loan Declaration" in name for name in disc_names)

def test_digital_signature_inspection():
    from app.services.document_processing.signatures import inspect_pdf_digital_signatures
    from app.schemas.documents import DigitalSignatureStatus, SignerTrustStatus

    # 1. Unsigned PDF
    unsigned_pdf = b"%PDF-1.4\n1 0 obj\n<< /Title (Simple Doc) >>\nendobj\ntrailer\n<<>>\n%%EOF"
    res_unsigned = inspect_pdf_digital_signatures(unsigned_pdf)
    assert res_unsigned["signature_present"] is False
    assert res_unsigned["signature_status"] == DigitalSignatureStatus.ABSENT
    assert res_unsigned["signer_trust_status"] == SignerTrustStatus.NOT_APPLICABLE
    assert "not evidence of forgery" in res_unsigned["limitations"]

    # 2. Signed PDF with ByteRange & Sig dictionary
    signed_pdf = (
        b"%PDF-1.4\n1 0 obj\n<< /Type /Sig /ByteRange [0 100 200 100] /Name (Test Signer) "
        b"/Contents <30820100000000000000000000000000> >>\nendobj\ntrailer\n<<>>\n%%EOF"
    )
    res_signed = inspect_pdf_digital_signatures(signed_pdf)
    assert res_signed["signature_present"] is True
    assert res_signed["signature_status"] == DigitalSignatureStatus.PRESENT_UNVERIFIED_TRUST
    assert res_signed["signer_trust_status"] == SignerTrustStatus.UNKNOWN

def test_passport_mrz_icao_check_digits():
    from app.services.document_processing.passport_checks import calculate_icao_check_digit, verify_passport_content

    # Check digit test: "L898902C<" -> check digit
    cd = calculate_icao_check_digit("L898902C<")
    assert cd.isdigit()

    # Full MRZ test
    doc_num = "Z1234567<"
    doc_cd = calculate_icao_check_digit(doc_num)
    dob = "950101"
    dob_cd = calculate_icao_check_digit(dob)
    exp = "300101"
    exp_cd = calculate_icao_check_digit(exp)

    line1 = "P<INDSINGH<<GURPREET<<<<<<<<<<<<<<<<<<<<<<<<"
    line2 = f"{doc_num}{doc_cd}IND{dob}{dob_cd}M{exp}{exp_cd}<<<<<<<<<<<<<<00"

    passport_text = f"PASSPORT REPUBLIC OF INDIA\n{line1}\n{line2}\nDate of Expiry: 01/01/2030"
    res = verify_passport_content(passport_text)
    assert res["is_valid_format"] is True
    assert res["has_mrz"] is True
    assert res["mrz_check_digits_valid"] is True

def test_bank_statement_reconciliation_and_non_income_separation():
    from app.services.document_processing.bank_statement import verify_bank_statement_content

    statement_text = """
    HDFC Bank Account Statement
    Account No: 50100234567890
    Opening Balance: ₹50,000.00
    01/05/2026 Salary Credit by NEFT: ₹85,000.00
    05/05/2026 Self Transfer Own A/C: ₹20,000.00
    10/05/2026 Refund from Amazon: ₹4,500.00
    15/05/2026 HDFC Home Loan EMI Auto Debit: ₹25,000.00
    Closing Balance: ₹134,500.00
    """
    res = verify_bank_statement_content(statement_text)
    assert res["bank_name"] == "HDFC Bank"
    # Salary should only count genuine salary (85,000), not refund or self transfer
    assert res["median_salary_credit"] == 85000.0
    assert res["non_income_inflow_count"] >= 2
    assert res["total_monthly_emi_debits"] == 25000.0
    assert res["balance_reconciliation_status"] == "RECONCILED"

def test_credit_report_no_fabricated_score():
    from app.services.document_processing.credit_report import verify_credit_report_content

    # Thin file credit report without score
    thin_cir_text = """
    TransUnion CIBIL CIR
    Applicant: Rohit Verma
    Total Accounts: 0
    No credit accounts or enquiries found for this identification.
    """
    res = verify_credit_report_content(thin_cir_text)
    assert res["has_score"] is False
    assert res["bureau_score"] is None
    assert res["active_credit_lines"] == 0

def test_comprehensive_verification_report_structure():
    from app.services.document_processing.verification_report import generate_verification_report
    from app.schemas.documents import DocumentItem, DocumentCategory, DocumentProcessingStatus, DocumentVerificationStatus

    app_data = {
        "id": "APP-TEST-001",
        "applicantName": "Rohit Verma",
        "grossMonthlyIncome": 85000,
        "existingDebtObligations": 10000,
        "hasPreviousLoan": "no"
    }

    doc_item = DocumentItem(
        document_id="DOC-PAN-1",
        application_id="APP-TEST-001",
        filename="pan.pdf",
        category=DocumentCategory.PAN,
        file_size_bytes=1024,
        sha256_hash="a" * 64,
        uploaded_at="2026-10-26",
        uploaded_by="Borrower",
        processing_status=DocumentProcessingStatus.READABLE,
        verification_status=DocumentVerificationStatus.VERIFIED,
        digital_signature_present=False,
        digital_signature_valid=False,
        extracted_fields={"is_valid_format": True, "entity_type": "Individual", "extracted_name": "Rohit Verma"}
    )

    report = generate_verification_report(app_data, [doc_item])
    assert report.application_id == "APP-TEST-001"
    assert len(report.document_reports) == 5
    # Check Section 13 required fields are present on each report item
    for doc_rep in report.document_reports:
        assert doc_rep.document_type is not None
        assert doc_rep.required_status is not None
        assert doc_rep.file_processing is not None
        assert doc_rep.extraction_status is not None
        assert doc_rep.digital_signature_status is not None
        assert doc_rep.signer_trust_status is not None
        assert doc_rep.authoritative_verification is not None
        assert doc_rep.consistency_status is not None
        assert doc_rep.review_status is not None
        assert isinstance(doc_rep.findings, list)
        assert isinstance(doc_rep.limitations, list)
        assert isinstance(doc_rep.review_actions, list)

