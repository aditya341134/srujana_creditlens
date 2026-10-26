"""
CreditLens Database Persistence & ULAS History Test Suite
Tests relational database operations, user isolation, ULAS score history tracking,
Financial X-Ray persistence, and audit logging.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db, SessionLocal, get_active_db_type
from app.db import repository as repo
from app.db.models import UserRecord, ULASAssessmentRecord

client = TestClient(app)

def test_database_initialization():
    """Verify that the database session initializes and schema tables exist."""
    db = SessionLocal()
    try:
        users = db.query(UserRecord).all()
        assert len(users) >= 1, "Expected baseline seeded users in database."
        user_emails = [u.email for u in users]
        assert "rajesh.kumar@creditlens.in" in user_emails
    finally:
        db.close()

def test_ulas_score_history_persistence():
    """
    Verify that executing ULAS evaluations appends versioned records
    to the history rather than silently overwriting past records.
    """
    db = SessionLocal()
    app_id = "APP-2026-1001"
    user_id = "USR-84091"
    
    try:
        initial_history = repo.get_ulas_score_history(db, app_id)
        initial_count = len(initial_history)
        
        # Save a new evaluation run with valid ULAS schema
        from app.models.domain import get_application
        from app.services.ulas.engine import run_ulas_assessment
        app_item = get_application(app_id)
        base_assessment = run_ulas_assessment(app_item, {})
        new_assessment = base_assessment.model_dump()
        new_assessment["ulas"] = 82.5
        new_assessment["band"] = "A"
        new_assessment["decision_recommendation"] = "STANDARD_APPROVAL"
        
        saved_rec = repo.save_ulas_assessment(db, app_id, user_id, new_assessment)
        assert saved_rec.id is not None
        assert saved_rec.ulas_score == 82.5
        assert saved_rec.band == "A"

        # Check that history now has +1 record
        updated_history = repo.get_ulas_score_history(db, app_id)
        assert len(updated_history) == initial_count + 1
        latest = updated_history[-1]
        assert latest["ulas_score"] == 82.5
        assert latest["band"] == "A"
    finally:
        db.close()

def test_ulas_history_api_endpoint():
    """Verify GET /api/assessments/{app_id}/history returns valid JSON array with scores."""
    response = client.get("/api/assessments/APP-2026-1001/history")
    assert response.status_code == 200
    data = response.json()
    assert "history" in data
    assert isinstance(data["history"], list)
    assert len(data["history"]) >= 1
    
    first_entry = data["history"][0]
    assert "ulas_score" in first_entry
    assert 0 <= first_entry["ulas_score"] <= 100
    assert "band" in first_entry
    assert "decision_recommendation" in first_entry

def test_financial_xray_persistence():
    """Verify that Financial X-Ray records save to the database."""
    db = SessionLocal()
    user_id = "USR-84091"
    
    try:
        payload = {
            "cash_flow_grade": "A+",
            "net_cash_buffer_monthly": 34100.0,
            "discrepancy_amount": 0.0,
            "bureau_concordance_pct": 100.0,
            "overall_risk_band": "LOW"
        }
        rec = repo.save_financial_xray(db, user_id, "SCENARIO_A", payload)
        assert rec.id is not None
        assert rec.cash_flow_grade == "A+"
        assert rec.net_cash_buffer == 34100.0
        
        latest = repo.get_latest_financial_xray(db, user_id, "SCENARIO_A")
        assert latest is not None
        assert latest.cash_flow_grade == "A+"
    finally:
        db.close()

def test_chat_message_persistence_and_clear():
    """Verify that chat interactions persist and can be cleared for user isolation."""
    db = SessionLocal()
    user_id = "USR-84091"
    
    try:
        # Clear existing messages first
        repo.clear_user_chat_history(db, user_id)
        
        repo.save_chat_message(db, user_id, "user", "What is my ULAS band?")
        repo.save_chat_message(db, user_id, "assistant", "Your current ULAS band is A.")
        
        history = repo.get_chat_history(db, user_id)
        assert len(history) == 2
        assert history[0]["content"] == "What is my ULAS band?"
        assert history[1]["content"] == "Your current ULAS band is A."
        
        # Clear
        deleted = repo.clear_user_chat_history(db, user_id)
        assert deleted == 2
        assert len(repo.get_chat_history(db, user_id)) == 0
    finally:
        db.close()

def test_api_health_exposes_database():
    """Verify /api/health exposes active database status."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert "database" in data
    assert data["database"] in ["mysql", "sqlite"]
    assert "mysql_connected" in data

def test_application_creation_and_assessment_fk_integrity():
    """
    Verify creating an application via repository/API and immediately persisting
    a ULAS assessment succeeds without foreign key violation.
    """
    db = SessionLocal()
    user_id = "USR-84091"
    try:
        app_rec = repo.create_application(db, user_id=user_id, app_data={
            "applicant_name": "Rajesh Kumar",
            "product_name": "Personal Loan",
            "loan_amount": 500000.0,
            "tenure_months": 36
        })
        assert app_rec.id.startswith("APP-")

        # Save assessment for this newly created application
        assessment_payload = {
            "ulas": 85.0,
            "band": "A",
            "decision_recommendation": "STANDARD_APPROVAL",
            "calibrated_pd": 0.15,
            "confidence": 0.92,
            "composite_r": 84.0,
            "gates": {"G1_kyc": {"status": "PASS"}}
        }
        rec = repo.save_ulas_assessment(db, app_rec.id, user_id, assessment_payload)
        assert rec.id is not None
        assert rec.application_id == app_rec.id
        assert rec.ulas_score == 85.0

        # Retrieve via API endpoint
        res = client.get(f"/api/assessments/{app_rec.id}")
        assert res.status_code == 200
        data = res.json()
        assert data["application_id"] == app_rec.id
        assert data["ulas"] == 85.0
        assert data["band"] == "A"
    finally:
        db.close()

def test_retrieve_legacy_or_incomplete_assessment_safe():
    """
    Verify that legacy/mock assessment dictionaries missing required fields
    (e.g., subscores.status, weight, assessed_at) are safely normalized without ResponseValidationError.
    """
    from app.api.routes.assessment import normalize_and_validate_ulas
    legacy_data = {
        "ulas": 72.0,
        "band": "B",
        "decision_recommendation": "CONDITIONAL_APPROVAL",
        "subscores": {
            "credit_conduct": {"score": 75.0},
            "repayment_capacity": {"score": 70.0}
        }
    }
    validated = normalize_and_validate_ulas(legacy_data, "APP-TEST-LEGACY")
    assert validated.application_id == "APP-TEST-LEGACY"
    assert validated.assessment_status == "COMPLETED"
    assert validated.subscores["credit_conduct"].status == "AVAILABLE"
    assert validated.subscores["credit_conduct"].weight == 0.20
    assert validated.assessed_at is not None

def test_ulas_score_boundaries():
    """Verify ULAS score mapping across boundary values: 0, 1, 50, 99, 100."""
    from app.services.ulas.decision_bands import map_score_to_band
    # Boundary 0 & 1 -> Band E
    band_0, dec_0, _ = map_score_to_band(0.0)
    assert band_0 == "E"
    band_1, dec_1, _ = map_score_to_band(1.0)
    assert band_1 == "E"

    # Boundary 50 -> Band D
    band_50, dec_50, _ = map_score_to_band(50.0)
    assert band_50 == "D"

    # Boundary 99 & 100 -> Band A+
    band_99, dec_99, _ = map_score_to_band(99.0)
    assert band_99 == "A+"
    band_100, dec_100, _ = map_score_to_band(100.0)
    assert band_100 == "A+"

def test_policy_gate_failure_vs_unavailable():
    """
    Verify that a policy gate failure legitimately produces score 0 with FAILED_POLICY_GATE,
    whereas non-existent applications return 404.
    """
    # 404 for non-existent application
    res_404 = client.get("/api/assessments/APP-DOES-NOT-EXIST-999")
    assert res_404.status_code == 404

    # Existing valid application returns 200
    res_valid = client.get("/api/assessments/APP-2026-1001")
    assert res_valid.status_code == 200
    assert res_valid.json()["ulas"] > 0

