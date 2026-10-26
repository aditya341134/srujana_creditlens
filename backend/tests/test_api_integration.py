"""
Integration Tests for CreditLens + ULAS FastAPI Endpoints
Tests authentication, applications, PDF document upload, and ULAS scoring.
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["engine"] == "ULAS-0.2.0-deterministic"

def test_list_applications():
    response = client.get("/api/applications")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0

def test_create_application():
    payload = {
        "applicantName": "Rohit Verma",
        "applicantType": "Software Engineer (5 Yrs)",
        "requestedAmount": 600000,
        "tenureMonths": 36,
        "purpose": "Personal Loan",
        "annualInterestRate": 10.5,
        "grossMonthlyIncome": 90000,
        "monthlyLivingExpenses": 30000,
        "existingDebtObligations": 10000,
        "hasPreviousLoan": "yes"
    }
    response = client.post("/api/applications", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["applicantName"] == "Rohit Verma"
    assert "APP-2026-" in data["id"]
    assert data["financials"]["proposedEMI"] > 0
    assert data["financials"]["foir"] > 0

def test_document_upload_and_pdf_validation():
    # 1. Reject non-PDF
    fake_txt = io.BytesIO(b"Hello world, I am not a pdf file")
    resp_reject = client.post(
        "/api/applications/APP-2026-0891/documents",
        files={"file": ("fake.pdf", fake_txt, "application/pdf")},
        data={"category": "PAN"}
    )
    assert resp_reject.status_code == 400
    assert "missing %PDF header" in resp_reject.json()["detail"]

    # 2. Accept valid PDF
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    pdf_out = io.BytesIO()
    writer.write(pdf_out)
    valid_pdf_content = pdf_out.getvalue()
    pdf_stream = io.BytesIO(valid_pdf_content)
    resp_valid = client.post(
        "/api/applications/APP-2026-0891/documents",
        files={"file": ("pan_card.pdf", pdf_stream, "application/pdf")},
        data={"category": "PAN"}
    )
    assert resp_valid.status_code == 201
    doc = resp_valid.json()
    assert doc["category"] == "PAN"
    assert doc["processing_status"] in ["READABLE", "PARTIALLY_READABLE"]
    assert len(doc["sha256_hash"]) == 64

def test_get_ulas_assessment_contract():
    response = client.get("/api/assessments/APP-2026-0891")
    assert response.status_code == 200
    data = response.json()

    # Check canonical schema fields per Section 6
    assert data["application_id"] == "APP-2026-0891"
    assert "assessment_id" in data
    assert data["model_version"] == "ulas-0.2.0"
    assert data["calibration_status"] == "UNCALIBRATED"
    assert data["pd_model_status"] == "NOT_AVAILABLE"
    assert "G1_kyc" in data["gates"]
    assert "G5_capacity" in data["gates"]
    assert "credit_conduct" in data["subscores"]
    assert "repayment_capacity" in data["subscores"]
    assert "drivers_positive" in data
    assert "reason_codes" in data
    assert "next_actions" in data
    assert data["band"] in ["A+", "A", "B", "C", "D", "E"]

def test_counterfactual_simulation():
    payload = {
        "principal": 500000,
        "annual_interest_rate": 10.5,
        "tenure_months": 36,
        "monthly_income": 85000,
        "existing_emi": 10000
    }
    response = client.post("/api/assessments/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["simulation"]["monthlyEMI"] > 0
    assert len(data["counterfactualOptions"]) == 2
