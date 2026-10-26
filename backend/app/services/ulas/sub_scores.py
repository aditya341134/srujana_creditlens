"""
ULAS Five Sub-Score Dimension Calculators (Stage 10)
Deterministic, bounded (0-100), unit-tested functions implementing:
A. Credit Conduct (35)
B. Repayment Capacity (25)
C. Banking Behaviour (20)
D. Debt & Collateral Hygiene (12)
E. Profile & Stability (8)
"""

from typing import Dict, Any, Tuple
from ...schemas.ulas import SubscoreDetail
from ...core.config import subscore_weights, ProductPolicy

def clamp(val: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, float(val)))

def calculate_dimension_a_credit_conduct(features: Dict[str, Any]) -> SubscoreDetail:
    """
    Dimension A: Credit Conduct — weight 35
    Formula:
    bureau_norm = clamp((bureau_score - 300) / 600, 0, 1) * 100
    ontime = on_time_payment_pct
    util_score = clamp((90 - utilization_pct) / 60, 0, 1) * 100
    enquiry_score = 100 (<=1), 60 (2-3), 20 (>=4)
    age_score = min(credit_age_years * 12.5, 100)
    base_A = 0.50*bureau_norm + 0.20*ontime + 0.15*util_score + 0.10*enquiry_score + 0.05*age_score
    derogation_multiplier: 1.0 (clean), 0.8 (1x 30+ DPD), 0.6 (2+ 30+ DPD), 0.4 (recent settlement <24m)
    """
    bureau_score = features.get("bureau_score")
    if bureau_score is None:
        return SubscoreDetail(
            score=None,
            status="UNAVAILABLE",
            weight=subscore_weights.credit_conduct,
            description="Credit Bureau record not available (thin file).",
            assumptions="Dimension marked unavailable; weight redistributed across remaining active dimensions."
        )

    bureau_norm = clamp((bureau_score - 300.0) / 600.0, 0.0, 1.0) * 100.0
    ontime = clamp(features.get("on_time_payment_pct", 98.0), 0.0, 100.0)
    
    utilization_pct = features.get("revolving_utilization_pct", 20.0)
    util_score = clamp((90.0 - utilization_pct) / 60.0, 0.0, 1.0) * 100.0

    enquiries = features.get("enquiries_6m", 1)
    enquiry_score = 100.0 if enquiries <= 1 else 60.0 if enquiries <= 3 else 20.0

    credit_age_years = features.get("credit_age_years", 5.0)
    age_score = min(credit_age_years * 12.5, 100.0)

    base_a = (
        0.50 * bureau_norm +
        0.20 * ontime +
        0.15 * util_score +
        0.10 * enquiry_score +
        0.05 * age_score
    )

    # Derogation multiplier
    delinquencies_24m = features.get("delinquencies_24m", 0)
    has_settlement = features.get("has_settlement_24m", False)

    if has_settlement:
        derogation = 0.40
    elif delinquencies_24m >= 2:
        derogation = 0.60
    elif delinquencies_24m == 1:
        derogation = 0.80
    else:
        derogation = 1.00

    final_score = round(clamp(base_a * derogation, 0.0, 100.0), 1)

    return SubscoreDetail(
        score=final_score,
        status="AVAILABLE",
        weight=subscore_weights.credit_conduct,
        description=f"Bureau Score {bureau_score} with {ontime:.1f}% on-time track record and derogation multiplier {derogation}.",
        input_features={
            "bureau_score": bureau_score,
            "bureau_norm": round(bureau_norm, 1),
            "on_time_payment_pct": ontime,
            "revolving_utilization_pct": utilization_pct,
            "enquiries_6m": enquiries,
            "credit_age_years": credit_age_years,
            "derogation_multiplier": derogation
        }
    )

def interpolate_foir_score(foir_pct: float) -> float:
    """
    Interpolates FOIR score anchors:
    <= 30% -> 100
    40%    -> 85
    50%    -> 65
    60%    -> 40
    > 60%  -> 10
    """
    if foir_pct <= 30.0:
        return 100.0
    elif foir_pct <= 40.0:
        # 30 to 40 drops from 100 to 85
        return 100.0 - ((foir_pct - 30.0) / 10.0) * 15.0
    elif foir_pct <= 50.0:
        # 40 to 50 drops from 85 to 65
        return 85.0 - ((foir_pct - 40.0) / 10.0) * 20.0
    elif foir_pct <= 60.0:
        # 50 to 60 drops from 65 to 40
        return 65.0 - ((foir_pct - 50.0) / 10.0) * 25.0
    else:
        # > 60 drops to 10
        return max(5.0, 40.0 - ((foir_pct - 60.0) / 10.0) * 30.0)

def calculate_dimension_b_repayment_capacity(
    features: Dict[str, Any],
    product_policy: ProductPolicy
) -> SubscoreDetail:
    """
    Dimension B: Repayment Capacity — weight 25
    Formula:
    B = 0.70*foir_score + 0.30*stability_score
    If residual income <= 0 after living cost floor, apply 0.5 multiplier.
    """
    income_verified = features.get("income_verified", 0.0)
    foir_pct = features.get("foir_pct")

    if income_verified <= 0 or foir_pct is None:
        return SubscoreDetail(
            score=None,
            status="UNAVAILABLE",
            weight=subscore_weights.repayment_capacity,
            description="Verified income or FOIR ratio cannot be established from submitted evidence."
        )

    foir_score = interpolate_foir_score(foir_pct)

    # Derived Stability score based on employment vintage and regularity
    vintage_years = features.get("employment_vintage_years", 3.0)
    vintage_score = 100.0 if vintage_years >= 3.0 else 80.0 if vintage_years >= 1.0 else 55.0
    statement_months = features.get("statement_months_verified", 6)
    regularity_score = 100.0 if statement_months >= 6 else 75.0
    stability_score = 0.60 * vintage_score + 0.40 * regularity_score

    base_b = 0.70 * foir_score + 0.30 * stability_score

    # Residual income check
    total_monthly_emi = features.get("existing_monthly_emi", 0.0) + features.get("proposed_monthly_emi", 0.0)
    living_cost_assumption = product_policy.living_cost_floor_tier2  # ₹18,000 baseline
    residual_surplus = income_verified - total_monthly_emi - living_cost_assumption

    multiplier = 0.50 if residual_surplus <= 0 else 1.00
    final_score = round(clamp(base_b * multiplier, 0.0, 100.0), 1)

    return SubscoreDetail(
        score=final_score,
        status="AVAILABLE",
        weight=subscore_weights.repayment_capacity,
        description=f"FOIR of {foir_pct:.1f}% yields capacity score {foir_score:.0f} with residual buffer ₹{residual_surplus:,.0f}.",
        input_features={
            "income_verified": income_verified,
            "foir_pct": foir_pct,
            "foir_score": round(foir_score, 1),
            "stability_score": round(stability_score, 1),
            "residual_surplus": round(residual_surplus, 2),
            "residual_multiplier": multiplier
        },
        assumptions=f"Essential living cost estimated at ₹{living_cost_assumption:,.0f} per month."
    )

def calculate_dimension_c_banking_behaviour(features: Dict[str, Any]) -> SubscoreDetail:
    """
    Dimension C: Banking Behaviour — weight 20
    balance_score = clamp(avg_balance / income_verified, 0, 1) * 100
    bounce_score = max(0, 100 - 25 * returns_6m)
    savings_score = clamp((credits - debits) / credits, 0, 0.35) / 0.35 * 100
    dip_score = max(0, 100 - 20 * days_below_one_day_emi)
    C = 0.35*balance + 0.30*bounce + 0.20*savings + 0.15*dip
    redflag_multiplier = 0.85 if suspicious circular transactions detected.
    """
    income_verified = features.get("income_verified", 50000.0)
    avg_balance = features.get("average_monthly_balance", income_verified * 0.40)
    balance_score = clamp(avg_balance / max(1.0, income_verified), 0.0, 1.0) * 100.0

    returns_count = features.get("returned_cheques_ecs_count", 0)
    bounce_score = max(0.0, 100.0 - 25.0 * returns_count)

    credits = features.get("total_statement_credits", income_verified * 6)
    debits = features.get("total_statement_debits", credits * 0.70)
    if credits > 0:
        net_savings_ratio = max(0.0, (credits - debits) / credits)
        savings_score = clamp(net_savings_ratio, 0.0, 0.35) / 0.35 * 100.0
    else:
        savings_score = 50.0

    days_below_emi = features.get("days_balance_below_one_day_emi", 0)
    dip_score = max(0.0, 100.0 - 20.0 * days_below_emi)

    base_c = (
        0.35 * balance_score +
        0.30 * bounce_score +
        0.20 * savings_score +
        0.15 * dip_score
    )

    redflag_multiplier = 0.85 if features.get("has_gambling_or_circular_flows", False) else 1.00
    final_score = round(clamp(base_c * redflag_multiplier, 0.0, 100.0), 1)

    return SubscoreDetail(
        score=final_score,
        status="AVAILABLE",
        weight=subscore_weights.banking_behaviour,
        description=f"Bank statement exhibits {returns_count} return events and {savings_score:.0f}% savings rate.",
        input_features={
            "balance_score": round(balance_score, 1),
            "bounce_score": round(bounce_score, 1),
            "savings_score": round(savings_score, 1),
            "dip_score": round(dip_score, 1),
            "redflag_multiplier": redflag_multiplier
        }
    )

def calculate_dimension_d_debt_collateral(
    features: Dict[str, Any],
    product_policy: ProductPolicy
) -> SubscoreDetail:
    """
    Dimension D: Debt & Collateral Hygiene — weight 12
    hygiene_score = max(0, 100 - 12*max(open_loans - 1, 0) - 40*unsecured_share)
    """
    open_loans = features.get("active_credit_lines", 2)
    unsecured_outstanding = features.get("unsecured_outstanding", 50000.0)
    total_outstanding = features.get("total_outstanding", 150000.0)

    unsecured_share = unsecured_outstanding / max(1.0, total_outstanding) if total_outstanding > 0 else 0.30
    hygiene_score = max(0.0, 100.0 - 12.0 * max(open_loans - 1, 0) - 40.0 * unsecured_share)

    if product_policy.is_secured:
        ltv_pct = features.get("ltv_pct", 65.0)
        ltv_score = clamp((95.0 - ltv_pct) / 25.0, 0.0, 1.0) * 100.0
        final_score = round(clamp(0.60 * hygiene_score + 0.40 * ltv_score, 0.0, 100.0), 1)
    else:
        final_score = round(clamp(hygiene_score, 0.0, 100.0), 1)

    return SubscoreDetail(
        score=final_score,
        status="AVAILABLE",
        weight=subscore_weights.debt_collateral_hygiene,
        description=f"Debt exposure across {open_loans} active lines with {unsecured_share*100:.0f}% unsecured share.",
        input_features={
            "open_loans": open_loans,
            "unsecured_share": round(unsecured_share, 2),
            "hygiene_score": round(hygiene_score, 1)
        }
    )

def calculate_dimension_e_profile_stability(features: Dict[str, Any]) -> SubscoreDetail:
    """
    Dimension E: Profile & Stability — weight 8
    Excludes all protected demographic attributes (gender, caste, marital status, religion).
    E = 0.30*age_band + 0.30*employment_indicator + 0.30*vintage + 0.10*residence_vintage
    """
    age = features.get("borrower_age", 32)
    if 25 <= age <= 45:
        age_score = 100.0
    elif (23 <= age <= 24) or (46 <= age <= 55):
        age_score = 80.0
    else:
        age_score = 60.0

    emp_type = str(features.get("employment_type", "salaried")).lower()
    if "govt" in emp_type or "psu" in emp_type or "mnc" in emp_type:
        emp_score = 100.0
    elif "listed" in emp_type or "corporate" in emp_type or "tcs" in emp_type or "infosys" in emp_type:
        emp_score = 85.0
    elif "sme" in emp_type or "self-employed" in emp_type:
        emp_score = 70.0
    else:
        emp_score = 55.0

    vintage_months = features.get("employment_vintage_months", 36)
    if vintage_months >= 36:
        vintage_score = 100.0
    elif vintage_months >= 12:
        vintage_score = 80.0
    else:
        vintage_score = 55.0

    residence_months = features.get("residence_vintage_months", 36)
    res_score = 100.0 if residence_months >= 24 else 80.0 if residence_months >= 12 else 60.0

    final_score = round(clamp(
        0.30 * age_score +
        0.30 * emp_score +
        0.30 * vintage_score +
        0.10 * res_score,
        0.0, 100.0
    ), 1)

    return SubscoreDetail(
        score=final_score,
        status="AVAILABLE",
        weight=subscore_weights.profile_stability,
        description=f"Employment tenure of {vintage_months} months with enterprise employer profile.",
        input_features={
            "age_score": age_score,
            "employment_score": emp_score,
            "vintage_score": vintage_score,
            "residence_score": res_score
        }
    )
