"""
Unit Tests for ULAS v0.2 Engine
Tests gates G1-G7, sub-scores A-E, composite R, calibration, confidence, and reason codes.
"""

import pytest
from app.services.ulas.engine import run_ulas_assessment, build_canonical_features
from app.services.ulas.gates import evaluate_policy_gates
from app.services.ulas.sub_scores import (
    calculate_dimension_a_credit_conduct,
    calculate_dimension_b_repayment_capacity,
    calculate_dimension_c_banking_behaviour,
    calculate_dimension_d_debt_collateral,
    calculate_dimension_e_profile_stability,
    interpolate_foir_score
)
from app.services.ulas.composite import calculate_composite_r
from app.services.ulas.calibration import calculate_provisional_calibration
from app.services.ulas.decision_bands import map_score_to_band
from app.core.config import get_product_policy

def test_interpolate_foir_score_anchors():
    assert interpolate_foir_score(25.0) == 100.0
    assert interpolate_foir_score(30.0) == 100.0
    assert interpolate_foir_score(40.0) == 85.0
    assert interpolate_foir_score(50.0) == 65.0
    assert interpolate_foir_score(60.0) == 40.0
    assert interpolate_foir_score(65.0) < 40.0

def test_subscores_bounded():
    features = {
        "bureau_score": 750,
        "on_time_payment_pct": 99.0,
        "revolving_utilization_pct": 18.0,
        "enquiries_6m": 1,
        "credit_age_years": 6.0,
        "delinquencies_24m": 0,
        "has_settlement_24m": False,
        "income_verified": 80000.0,
        "foir_pct": 28.5,
        "existing_monthly_emi": 5000.0,
        "proposed_monthly_emi": 15000.0,
        "employment_vintage_years": 4.0,
        "statement_months_verified": 6,
        "average_monthly_balance": 35000.0,
        "returned_cheques_ecs_count": 0,
        "total_statement_credits": 480000.0,
        "total_statement_debits": 320000.0,
        "days_balance_below_one_day_emi": 0,
        "has_gambling_or_circular_flows": False,
        "active_credit_lines": 3,
        "unsecured_outstanding": 40000.0,
        "total_outstanding": 120000.0,
        "borrower_age": 32,
        "employment_type": "Corporate Salaried",
        "employment_vintage_months": 48,
        "residence_vintage_months": 36
    }
    policy = get_product_policy("Personal Loan")

    dim_a = calculate_dimension_a_credit_conduct(features)
    dim_b = calculate_dimension_b_repayment_capacity(features, policy)
    dim_c = calculate_dimension_c_banking_behaviour(features)
    dim_d = calculate_dimension_d_debt_collateral(features, policy)
    dim_e = calculate_dimension_e_profile_stability(features)

    assert 0.0 <= dim_a.score <= 100.0
    assert 0.0 <= dim_b.score <= 100.0
    assert 0.0 <= dim_c.score <= 100.0
    assert 0.0 <= dim_d.score <= 100.0
    assert 0.0 <= dim_e.score <= 100.0

def test_gates_evaluation_pass():
    features = {
        "name_match_score": 0.95,
        "pan_format_valid": True,
        "has_identity_doc": True,
        "income_mismatch_pct": 0.10,
        "has_material_contradiction": False,
        "has_major_derogatory": False,
        "has_settlement_36m": False,
        "open_dpd_90_plus": False,
        "income_verified": 65000.0,
        "foir_ratio": 0.32,
        "bureau_score": 760,
        "borrower_age": 29,
        "tenure_months": 36,
        "employment_vintage_months": 36
    }
    policy = get_product_policy("Personal Loan")
    all_passed, gate_results = evaluate_policy_gates(features, policy)
    assert all_passed is True
    assert all(g.status == "PASS" for g in gate_results.values())

def test_gates_evaluation_fail_stops_subsequent():
    # Case: FOIR exceeds ceiling (G5 fails with 72% FOIR)
    features = {
        "name_match_score": 0.95,
        "pan_format_valid": True,
        "has_identity_doc": True,
        "income_mismatch_pct": 0.10,
        "has_material_contradiction": False,
        "has_major_derogatory": False,
        "has_settlement_36m": False,
        "open_dpd_90_plus": False,
        "income_verified": 65000.0,
        "foir_ratio": 0.72,  # Breaches 65% ceiling
        "bureau_score": 760,
        "borrower_age": 29,
        "tenure_months": 36,
        "employment_vintage_months": 36
    }
    policy = get_product_policy("Personal Loan")
    all_passed, gate_results = evaluate_policy_gates(features, policy)
    assert all_passed is False
    assert gate_results["G5_capacity"].status == "FAIL"
    # G6 and G7 should be NOT_EVALUATED
    assert gate_results["G6_bureau_floor"].status == "NOT_EVALUATED"
    assert gate_results["G7_age_vintage"].status == "NOT_EVALUATED"

def test_calibration_and_confidence():
    # Composite R = 75.0, missing 0 dimensions, 6 months statement
    p_est, conf, p_final, ulas_base, ulas_adj = calculate_provisional_calibration(
        composite_r=75.0,
        missing_optional_count=0,
        statement_months=6,
        has_soft_integrity_concern=False
    )
    assert 0.0 < p_est < 1.0
    assert conf == 1.0
    assert ulas_base == ulas_adj
    assert 70.0 <= ulas_base <= 90.0

    # With soft integrity concern -> 0.90x adjustment
    _, _, _, base_soft, adj_soft = calculate_provisional_calibration(
        composite_r=75.0,
        missing_optional_count=0,
        statement_months=6,
        has_soft_integrity_concern=True
    )
    assert adj_soft == round(base_soft * 0.90, 1)

def test_map_score_to_band():
    assert map_score_to_band(92.0)[0] == "A+"
    assert map_score_to_band(82.0)[0] == "A"
    assert map_score_to_band(74.0)[0] == "B"
    assert map_score_to_band(64.0)[0] == "C"
    assert map_score_to_band(52.0)[0] == "D"
    assert map_score_to_band(38.0)[0] == "E"

def test_run_ulas_assessment_full_pipeline():
    app = {
        "id": "APP-TEST-001",
        "applicantName": "Priya Sharma",
        "requestedAmount": 500000,
        "annualInterestRate": 10.5,
        "tenureMonths": 36,
        "purpose": "Personal Loan",
        "financials": {
            "grossMonthlyIncome": 95000,
            "existingDebtObligations": 12000
        },
        "creditHistory": {
            "bureauScore": 782,
            "onTimePaymentPct": 99.4,
            "delinquencies24m": 0
        },
        "employment": {
            "vintageYears": 5.0,
            "type": "Salaried Senior Architect"
        }
    }
    docs = {
        "bank_statement": {
            "median_salary_credit": 92000,
            "coverage_months": 6,
            "returned_cheques_ecs_count": 0
        }
    }

    res = run_ulas_assessment(app, docs)
    assert res.application_id == "APP-TEST-001"
    assert res.assessment_status == "COMPLETED"
    assert res.ulas is not None and res.ulas > 75.0
    assert res.band in ["A+", "A"]
    assert res.decision_recommendation in ["AUTOMATED_APPROVAL", "STANDARD_APPROVAL"]
    assert len(res.drivers_positive) > 0
    assert len(res.reason_codes) > 0
    assert res.calibration_status == "UNCALIBRATED"
    assert res.pd_model_status == "NOT_AVAILABLE"

def test_run_ulas_assessment_with_wrong_document():
    # Case: User uploaded a wrong/fake document with 0 verifiable income or invalid format
    app = {
        "id": "APP-TEST-WRONG-DOC",
        "applicantName": "Rohit Verma",
        "requestedAmount": 500000,
        "annualInterestRate": 10.5,
        "tenureMonths": 36,
        "purpose": "Personal Loan",
        "financials": {
            "grossMonthlyIncome": 85000,
            "existingDebtObligations": 10000
        }
    }
    # Uploaded bank statement was a wrong document (0 verifiable salary credits)
    docs = {
        "bank_statement": {
            "median_salary_credit": 0.0,
            "coverage_months": 0,
            "returned_cheques_ecs_count": 0
        }
    }
    res = run_ulas_assessment(app, docs)
    # Gate G2 (Document Integrity) must FAIL (due to 100% income mismatch) and stop subsequent gates
    assert res.gates["G2_integrity"].status == "FAIL"
    assert res.gates["G4_minimum_income"].status == "NOT_EVALUATED"
    assert res.assessment_status == "FAILED_POLICY_GATE"
    assert res.band == "E"
    assert res.decision_recommendation == "DECLINE_RECOMMENDED"
    assert res.ulas == 0.0

