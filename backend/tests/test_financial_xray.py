"""
Tests for AI Financial X-Ray Engine & Bureau Reconciliation
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.financial_xray import run_financial_xray, generate_dispute_letter
from app.services.financial_xray.models import BureauTradelineMatch

client = TestClient(app)

def test_financial_xray_scenario_a_stable():
    report = run_financial_xray(
        user_id="TEST-USR-1",
        applicant_name="Aarav Sharma",
        declared_income=95000.0,
        scenario_override="scenario_a"
    )
    assert report.is_demo is True
    assert report.data_source == "SCENARIO_A_STABLE"
    assert report.overall_health_rating == "STRONG"
    assert report.net_cash_flow_avg > 30000.0
    assert report.inflow_volatility_cv < 0.05
    assert report.balance_trajectory in ["GROWING", "STABLE"]
    assert report.income_reconciliation.status == "MATCHED"
    assert len(report.stress_indicators) == 0
    assert len(report.visualizations.monthly_comparison) == 6
    assert len(report.bureau_reconciliation) >= 1

def test_financial_xray_scenario_b_review():
    report = run_financial_xray(
        user_id="TEST-USR-2",
        applicant_name="Priya Mehra",
        declared_income=120000.0,
        scenario_override="scenario_b"
    )
    assert report.is_demo is True
    assert report.data_source == "SCENARIO_B_REVIEW"
    assert report.overall_health_rating == "NEEDS_REVIEW"
    assert report.income_reconciliation.status == "SIGNIFICANT_MISMATCH"
    assert report.income_reconciliation.variance_percentage > 25.0
    
    # Stress indicators
    stress_types = [s.indicator_type for s in report.stress_indicators]
    assert "NEGATIVE_CASH_FLOW" in stress_types
    assert "BOUNCE_EVENT" in stress_types
    
    # Anomalies
    anom_ids = [a.id for a in report.anomalies]
    assert "ANOM-HIGH-TRANSFER" in anom_ids
    assert "ANOM-INCOME-DISCREPANCY" in anom_ids

def test_generate_dispute_letter():
    tradeline = BureauTradelineMatch(
        tradeline_id="TL-SBI-7721",
        lender_name="State Bank of India",
        loan_type="Personal Loan",
        bureau_status="30+ DPD",
        bureau_balance=164000.0,
        bureau_reported_date="2026-02-28",
        bank_statement_evidence="Paid on 8th Feb via UPI",
        reconciliation_finding="DISPUTABLE_DELINQUENCY",
        matching_confidence=0.88,
        recommended_step="File representation"
    )
    letter = generate_dispute_letter(
        borrower_name="Priya Mehra",
        borrower_pan="ABCDE1234F",
        bureau_name="TransUnion CIBIL",
        tradeline=tradeline
    )
    assert "TL-SBI-7721" in letter.body
    assert "Priya Mehra" in letter.body
    assert "DRAFT ONLY" in letter.disclaimer

def test_api_financial_xray_endpoints():
    # 1. Analyze endpoint
    res = client.post("/api/financial-xray/analyze", json={
        "scenario_override": "scenario_a"
    })
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    assert data["overall_health_rating"] == "STRONG"

    # 2. Current endpoint
    res_curr = client.get("/api/financial-xray/current?scenario=scenario_b")
    assert res_curr.status_code == 200
    assert res_curr.json()["overall_health_rating"] == "NEEDS_REVIEW"

    # 3. Demo endpoint
    res_demo = client.post("/api/financial-xray/demo/scenario_a")
    assert res_demo.status_code == 200
    assert res_demo.json()["is_demo"] is True

    # 4. Dispute letter endpoint
    tradeline_payload = {
        "tradeline_id": "TL-SBI-7721",
        "lender_name": "State Bank of India",
        "loan_type": "Personal Loan",
        "bureau_status": "30+ DPD",
        "bureau_balance": 164000.0,
        "bureau_reported_date": "2026-02-28",
        "bank_statement_evidence": "Paid on 8th Feb",
        "reconciliation_finding": "DISPUTABLE_DELINQUENCY",
        "matching_confidence": 0.88,
        "recommended_step": "Draft dispute"
    }
    res_disp = client.post("/api/financial-xray/dispute-letter", json={
        "borrower_name": "Priya Mehra",
        "borrower_pan": "ABCDE1234F",
        "bureau_name": "TransUnion CIBIL",
        "tradeline": tradeline_payload
    })
    assert res_disp.status_code == 200
    assert "letter_id" in res_disp.json()
