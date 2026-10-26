"""
ULAS Reason Codes Catalogue & Driver Explainability Engine (Stage 14)
Computes point-level dimension contributions relative to reference population means.
Maps machine-readable reason codes to safe borrower narratives and banker details.
"""

from typing import Dict, List, Tuple, Any
from ...schemas.ulas import DriverItem, ReasonCodeItem, NextActionItem, SubscoreDetail
from ...core.config import population_means

REASON_CODE_CATALOGUE: Dict[str, Dict[str, str]] = {
    "RC_FOIR_OPTIMAL": {
        "title": "Low Fixed Obligation Ratio",
        "borrower_explanation": "Your debt obligations absorb a modest percentage of your verified monthly earnings, leaving strong surplus buffer.",
        "banker_detail": "FOIR <= 35%; proposed installment leaves adequate cushion for adverse shocks.",
        "severity": "INFO",
        "action": "Maintain low credit card balance utilization to preserve capacity."
    },
    "RC_HIGH_DTI": {
        "title": "Elevated Debt-to-Income Exposure",
        "borrower_explanation": "Existing loan and card installments absorb a significant portion of your monthly income.",
        "banker_detail": "FOIR exceeds 50%; debt service leaves narrow margin for living costs.",
        "severity": "CAUTION",
        "action": "Consider choosing a longer tenure to lower monthly payments or pay down existing card balances."
    },
    "RC_CLEAN_BUREAU": {
        "title": "Clean Repayment Track Record",
        "borrower_explanation": "Your credit history demonstrates consistent on-time payments across previous formal borrowings.",
        "banker_detail": "Zero 30+ DPD delinquencies recorded in prior 24 months across all open tradelines.",
        "severity": "INFO",
        "action": "Continue making credit payments on or before the due date."
    },
    "RC_DELINQUENCY_DETECTED": {
        "title": "Historical Delayed Payments",
        "borrower_explanation": "Recent payment delays were recorded in your credit bureau history.",
        "banker_detail": "At least one 30+ DPD event identified in past 24 months triggering derogation penalty.",
        "severity": "ADVERSE",
        "action": "Ensure all ongoing card and loan payments are automated through NACH mandate to build positive history."
    },
    "RC_INCOME_DISCREPANCY": {
        "title": "Income Evidence Discrepancy",
        "borrower_explanation": "The income credits reflected in your bank statement differ from the salary amount declared in your application.",
        "banker_detail": "Bank statement median credit varies by >30% from claimed net salary.",
        "severity": "CAUTION",
        "action": "Upload your latest Form 16 or 3 consecutive months salary slips to corroborate variable bonus income."
    },
    "RC_STABLE_EMPLOYMENT": {
        "title": "Established Employment Stability",
        "borrower_explanation": "Your duration with your current employer indicates stable occupational tenure.",
        "banker_detail": "Employment vintage exceeds 3 years at recognized employer entity.",
        "severity": "INFO",
        "action": "Maintain continuous employment documentation."
    },
    "RC_BOUNCED_PAYMENTS": {
        "title": "Account Inward/Outward Return Events",
        "borrower_explanation": "One or more payment debit return/bounce events were detected in your bank statement.",
        "banker_detail": "NACH/ECS mandate bounce recorded; indicates temporary cash-flow shortfall on due dates.",
        "severity": "ADVERSE",
        "action": "Maintain a minimum cash balance of at least 3 days EMI prior to scheduled payment dates."
    },
    "RC_THIN_FILE_NO_BUREAU": {
        "title": "First-Time Borrower / Thin Credit File",
        "borrower_explanation": "No prior formal credit bureau record was found. You are being evaluated as a first-time borrower.",
        "banker_detail": "Applicant has no active or closed tradelines on bureau file; routed to cash-flow based underwriting.",
        "severity": "INFO",
        "action": "Consider starting with a smaller loan or credit card to establish an active credit footprint."
    }
}

def compute_driver_contributions(
    subscores: Dict[str, SubscoreDetail],
    sum_available_weights: float
) -> Tuple[List[DriverItem], List[DriverItem]]:
    """
    Computes dimension-level point contributions:
    contribution_i = 100 * (weight_i / sum_w) * (subscore_i - population_mean_i) / 100
    Returns: (positive_drivers, negative_drivers)
    """
    positive: List[DriverItem] = []
    negative: List[DriverItem] = []

    mean_map = {
        "credit_conduct": population_means.credit_conduct,
        "repayment_capacity": population_means.repayment_capacity,
        "banking_behaviour": population_means.banking_behaviour,
        "debt_collateral_hygiene": population_means.debt_collateral_hygiene,
        "profile_stability": population_means.profile_stability
    }

    labels = {
        "credit_conduct": "Credit History & Conduct",
        "repayment_capacity": "Income & Repayment Capacity",
        "banking_behaviour": "Cash Flow & Account Discipline",
        "debt_collateral_hygiene": "Debt Leverage & Hygiene",
        "profile_stability": "Employment & Profile Vintage"
    }

    if sum_available_weights <= 0:
        return positive, negative

    for dim_key, item in subscores.items():
        if item.status == "AVAILABLE" and item.score is not None:
            mean_val = mean_map.get(dim_key, 60.0)
            relative_diff = item.score - mean_val
            contribution = (item.weight / sum_available_weights) * relative_diff
            pts = round(contribution, 1)

            driver = DriverItem(
                feature=labels.get(dim_key, dim_key),
                impact="Positive" if pts >= 0 else "Negative",
                contribution_points=pts,
                description=f"Scored {item.score:.0f} vs population baseline {mean_val:.0f} (impact {pts:+.1f} pts).",
                dimension=dim_key
            )

            if pts >= 0:
                positive.append(driver)
            else:
                negative.append(driver)

    # Sort by absolute impact
    positive.sort(key=lambda d: abs(d.contribution_points), reverse=True)
    negative.sort(key=lambda d: abs(d.contribution_points), reverse=True)

    return positive, negative

def generate_reason_codes(
    features: Dict[str, Any],
    subscores: Dict[str, SubscoreDetail]
) -> List[ReasonCodeItem]:
    """Generates structured, traceable reason codes based on feature triggers."""
    codes: List[ReasonCodeItem] = []

    def add_code(c_key: str):
        meta = REASON_CODE_CATALOGUE.get(c_key)
        if meta:
            codes.append(ReasonCodeItem(
                code=c_key,
                title=meta["title"],
                borrower_explanation=meta["borrower_explanation"],
                banker_detail=meta["banker_detail"],
                severity=meta["severity"],
                recommended_action=meta["action"]
            ))

    foir_pct = features.get("foir_pct", 35.0)
    if foir_pct is not None:
        if foir_pct <= 35.0:
            add_code("RC_FOIR_OPTIMAL")
        elif foir_pct > 50.0:
            add_code("RC_HIGH_DTI")

    delinquencies = features.get("delinquencies_24m", 0)
    if delinquencies == 0:
        add_code("RC_CLEAN_BUREAU")
    else:
        add_code("RC_DELINQUENCY_DETECTED")

    if features.get("bureau_score") is None:
        add_code("RC_THIN_FILE_NO_BUREAU")

    if features.get("income_mismatch_pct", 0.0) > 0.30:
        add_code("RC_INCOME_DISCREPANCY")

    if features.get("returned_cheques_ecs_count", 0) > 0:
        add_code("RC_BOUNCED_PAYMENTS")

    if features.get("employment_vintage_years", 3.0) >= 3.0:
        add_code("RC_STABLE_EMPLOYMENT")

    return codes

def generate_next_actions(reason_codes: List[ReasonCodeItem]) -> List[NextActionItem]:
    """Generates prioritized, constructive improvement actions for the borrower."""
    actions: List[NextActionItem] = []
    p = 1
    seen = set()

    for r in reason_codes:
        if r.severity in ["CAUTION", "ADVERSE"] and r.recommended_action not in seen:
            seen.add(r.recommended_action)
            actions.append(NextActionItem(
                priority=p,
                title=r.title,
                action=r.recommended_action,
                category="Credit Readiness"
            ))
            p += 1

    if not actions:
        actions.append(NextActionItem(
            priority=1,
            title="Maintain Positive Discipline",
            action="Continue maintaining timely payments and low revolving credit utilization.",
            category="Readiness"
        ))

    return actions
