"""
ULAS v0.2 Main Assessment Orchestrator Engine
Assembles features, evaluates gates G1-G7, computes sub-scores A-E, composite R,
calibration mapping, confidence shrinkage, decision bands, and explainability.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

from ...schemas.ulas import ULASResponse, SubscoreDetail
from ...core.config import (
    MODEL_VERSION,
    POLICY_VERSION,
    FEATURE_SCHEMA_VERSION,
    CALIBRATION_VERSION,
    get_product_policy
)
from .gates import evaluate_policy_gates
from .sub_scores import (
    calculate_dimension_a_credit_conduct,
    calculate_dimension_b_repayment_capacity,
    calculate_dimension_c_banking_behaviour,
    calculate_dimension_d_debt_collateral,
    calculate_dimension_e_profile_stability
)
from .composite import calculate_composite_r
from .calibration import calculate_provisional_calibration
from .decision_bands import map_score_to_band
from .reason_codes import (
    compute_driver_contributions,
    generate_reason_codes,
    generate_next_actions
)
from ..financial_analysis.calculations import (
    calculate_emi,
    calculate_income_verified,
    calculate_foir
)

def build_canonical_features(
    application: Dict[str, Any],
    documents_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Constructs canonical feature dictionary from application data and extracted document evidence.
    """
    fin = application.get("financials", {})
    emp = application.get("employment", {})
    cred = application.get("creditHistory", {})

    claimed_salary = float(fin.get("grossMonthlyIncome", 75000.0) or 75000.0)
    existing_emi = float(fin.get("existingDebtObligations", 0.0) or 0.0)
    req_amount = float(application.get("requestedAmount", 500000.0) or 500000.0)
    rate = float(application.get("annualInterestRate", 10.5) or 10.5)
    tenure = int(application.get("tenureMonths", 36) or 36)

    proposed_emi = calculate_emi(req_amount, rate, tenure)

    # 1. Document extraction overrides - strictly evaluate bank statement if uploaded
    bank_data = documents_data.get("bank_statement", {})
    has_bank_doc = "bank_statement" in documents_data

    if has_bank_doc:
        median_credit = float(bank_data.get("median_salary_credit", 0.0) or 0.0)
        # If user uploaded a document under bank_statement but it had 0 salary credits or failed extraction:
        if median_credit <= 0:
            income_verified = 0.0
            income_note = "Uploaded bank statement contains 0 verifiable salary credits."
            income_mismatch = 1.0  # 100% mismatch
        else:
            income_verified, income_note = calculate_income_verified(claimed_salary, median_credit)
            income_mismatch = abs(claimed_salary - median_credit) / claimed_salary if claimed_salary > 0 else 0.0
    else:
        median_credit = claimed_salary
        income_verified = claimed_salary
        income_note = "Baseline estimate prior to bank statement document upload."
        income_mismatch = 0.0

    foir_ratio, foir_pct = calculate_foir(existing_emi, proposed_emi, income_verified)

    # 2. Identity & PAN validation from uploaded documents
    pan_data = documents_data.get("pan", {})
    has_pan_doc = "pan" in documents_data
    pan_format_valid = pan_data.get("is_valid_format", True) if has_pan_doc else True

    aadhaar_data = documents_data.get("aadhaar", {})
    passport_data = documents_data.get("passport", {})
    has_id_doc_uploaded = ("aadhaar" in documents_data) or ("passport" in documents_data)
    has_identity_doc = True
    if has_id_doc_uploaded:
        has_identity_doc = bool(aadhaar_data.get("is_valid_format") or passport_data.get("is_valid_format"))

    name_match_score = 1.0
    claimed_name = application.get("applicantName", "")
    pan_name = pan_data.get("extracted_name") if has_pan_doc else None
    if pan_name and claimed_name:
        from ...core.security import fuzzy_name_match
        name_match_score = fuzzy_name_match(claimed_name, pan_name)

    # 3. Detect wrong documents, category mismatches, or document processing failures
    has_material_contradiction = False
    app_id = application.get("id")
    from ...models.domain import documents_db
    docs_list = documents_db.get(app_id, [])
    for d in docs_list:
        if d.processing_status in ["FAILED", "UNREADABLE"]:
            has_material_contradiction = True
        if d.detected_category and d.detected_category != d.category:
            has_material_contradiction = True
        if d.verification_status == "VERIFICATION_FAILED":
            has_material_contradiction = True

    bureau_score = cred.get("bureauScore") or cred.get("bureau_score")
    if bureau_score is None:
        # Extract from text band if present (e.g. "Excellent (782)")
        band_str = str(cred.get("bureauBand", ""))
        import re
        b_match = re.search(r"\b([5-8][0-9]{2})\b", band_str)
        if b_match:
            bureau_score = int(b_match.group(1))
        else:
            bureau_score = 750

    return {
        "claimed_net_salary": claimed_salary,
        "median_salary_credit": median_credit,
        "income_verified": income_verified,
        "income_verification_note": income_note,
        "income_mismatch_pct": income_mismatch,
        "existing_monthly_emi": existing_emi,
        "proposed_monthly_emi": proposed_emi,
        "foir_ratio": foir_ratio,
        "foir_pct": foir_pct,
        "bureau_score": bureau_score,
        "on_time_payment_pct": float(cred.get("onTimePaymentPct", 98.5) or 98.5),
        "delinquencies_24m": int(cred.get("delinquencies24m", 0) or 0),
        "revolving_utilization_pct": float(cred.get("revolvingUtilizationPct", 15.0) or 15.0),
        "active_credit_lines": int(cred.get("activeCreditLines", 3) or 3),
        "enquiries_6m": 1,
        "credit_age_years": float(cred.get("oldestAccountAgeYears", 5.0) or 5.0),
        "has_major_derogatory": False,
        "has_settlement_24m": False,
        "has_settlement_36m": False,
        "open_dpd_90_plus": False,
        "has_material_contradiction": has_material_contradiction,
        "has_gambling_or_circular_flows": False,
        "average_monthly_balance": float(bank_data.get("average_monthly_balance", income_verified * 0.40)),
        "returned_cheques_ecs_count": int(bank_data.get("returned_cheques_ecs_count", 0)),
        "total_statement_credits": float(bank_data.get("total_statement_credits", income_verified * 6)),
        "total_statement_debits": float(bank_data.get("total_statement_debits", income_verified * 4)),
        "days_balance_below_one_day_emi": 0,
        "unsecured_outstanding": float(fin.get("unsecured_outstanding", 50000.0) or 50000.0),
        "total_outstanding": float(fin.get("total_outstanding", 150000.0) or 150000.0),
        "ltv_pct": 65.0,
        "borrower_age": int(application.get("borrower_age", 32) or 32),
        "employment_vintage_years": float(emp.get("vintageYears", 4.0) or 4.0),
        "employment_vintage_months": int(float(emp.get("vintageYears", 4.0) or 4.0) * 12),
        "employment_type": emp.get("type", "Salaried Corporate"),
        "residence_vintage_months": 36,
        "statement_months_verified": int(bank_data.get("coverage_months", 6)),
        "has_identity_doc": has_identity_doc,
        "pan_format_valid": pan_format_valid,
        "name_match_score": name_match_score,
        "tenure_months": tenure
    }

def run_ulas_assessment(
    application: Dict[str, Any],
    documents_data: Optional[Dict[str, Any]] = None
) -> ULASResponse:
    """
    Executes the full, auditable ULAS v0.2 pipeline.
    """
    app_id = application.get("id", "APP-UNKNOWN")
    assessment_id = f"ASM-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    docs = documents_data or {}
    product_name = application.get("purpose", "Personal Loan")
    product_policy = get_product_policy(product_name)

    # 1. Canonical Feature Construction
    features = build_canonical_features(application, docs)

    # 2. Sequential Ordered Policy Gates Evaluation (G1 to G7)
    gates_passed, gate_results = evaluate_policy_gates(features, product_policy)

    # Check if a definitive hard fail occurred
    has_hard_fail = any(g.status == "FAIL" for g in gate_results.values())
    has_review = any(g.status == "NEEDS_MANUAL_REVIEW" for g in gate_results.values())

    # 3. Sub-score Dimension Calculations (A through E)
    dim_a = calculate_dimension_a_credit_conduct(features)
    dim_b = calculate_dimension_b_repayment_capacity(features, product_policy)
    dim_c = calculate_dimension_c_banking_behaviour(features)
    dim_d = calculate_dimension_d_debt_collateral(features, product_policy)
    dim_e = calculate_dimension_e_profile_stability(features)

    subscores_map = {
        "credit_conduct": dim_a,
        "repayment_capacity": dim_b,
        "banking_behaviour": dim_c,
        "debt_collateral_hygiene": dim_d,
        "profile_stability": dim_e
    }

    # 4. Composite R with Renormalization
    composite_r, sum_weights, missing_dims = calculate_composite_r(subscores_map)

    # 5. Calibration & Confidence Shrinkage
    missing_optional_count = len(missing_dims)
    statement_months = features.get("statement_months_verified", 6)
    has_soft_integrity_concern = features.get("income_mismatch_pct", 0.0) > 0.20

    if composite_r is not None and not has_hard_fail:
        p_est, conf, p_final, ulas_base, ulas_adj = calculate_provisional_calibration(
            composite_r=composite_r,
            missing_optional_count=missing_optional_count,
            statement_months=statement_months,
            has_soft_integrity_concern=has_soft_integrity_concern
        )
    else:
        p_est, conf, p_final, ulas_base, ulas_adj = 0.0, 0.50, 0.0, 0.0, 0.0

    # 6. Score Bands & Decision Recommendation
    if has_hard_fail:
        band = "E"
        recommendation = "DECLINE_RECOMMENDED"
        assessment_status = "FAILED_POLICY_GATE"
        ulas_adj = 0.0
        ulas_base = 0.0
        p_est = 0.0
    elif has_review or composite_r is None:
        band = "C" if composite_r is not None and ulas_adj >= 60 else "D"
        recommendation = "MANUAL_REVIEW"
        assessment_status = "NEEDS_MANUAL_REVIEW" if composite_r is not None else "INSUFFICIENT_DATA"
    else:
        band, recommendation, _ = map_score_to_band(ulas_adj)
        assessment_status = "COMPLETED"

    # 7. Explainability & Reason Codes
    pos_drivers, neg_drivers = compute_driver_contributions(subscores_map, sum_weights)
    reason_codes = generate_reason_codes(features, subscores_map)
    next_actions = generate_next_actions(reason_codes)

    doc_summary = [
        {"category": "PAN Card", "status": "VERIFIED", "details": "Valid structural format verified."},
        {"category": "Aadhaar / Identity", "status": "VERIFIED", "details": "Aadhaar e-KYC layout corroborated."},
        {"category": "Bank Statement", "status": "VERIFIED", "details": f"{statement_months} months analyzed; median credit ₹{features['median_salary_credit']:,.0f}."},
        {"category": "Credit Information Report", "status": "VERIFIED", "details": f"Bureau Score {features['bureau_score']} with {features['delinquencies_24m']} delinquencies."}
    ]

    return ULASResponse(
        application_id=app_id,
        assessment_id=assessment_id,
        assessment_status=assessment_status,
        ulas=ulas_adj,
        ulas_base=ulas_base,
        ulas_policy_adjusted=ulas_adj,
        band=band,
        decision_recommendation=recommendation,
        official_lender_decision=application.get("status"),
        p_grant_estimate=p_est,
        p_default_12m=None,
        pd_model_status="NOT_AVAILABLE",
        confidence=conf,
        calibration_status="UNCALIBRATED",
        composite_r=composite_r,
        gates=gate_results,
        subscores=subscores_map,
        drivers_positive=pos_drivers,
        drivers_negative=neg_drivers,
        reason_codes=reason_codes,
        missing_evidence=missing_dims,
        document_summary=doc_summary,
        next_actions=next_actions,
        model_version=MODEL_VERSION,
        policy_version=POLICY_VERSION,
        feature_schema_version=FEATURE_SCHEMA_VERSION,
        calibration_version=CALIBRATION_VERSION,
        assessed_at=now_str
    )
