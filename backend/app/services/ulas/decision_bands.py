"""
ULAS Score Bands & Decision Recommendation Engine (Stage 13)
Maps final score to bands A+ through E with policy-based recommendations.
"""

from typing import Tuple

def map_score_to_band(ulas_score: float) -> Tuple[str, str, str]:
    """
    Maps ULAS score (0-100) to starter score band and decision recommendation:
    88–100  -> A+ (Candidate for automated approval workflow)
    78–87.9 -> A  (Candidate for approval with standard/light-touch checks)
    70–77.9 -> B  (Conditional review/terms or alternative amount)
    60–69.9 -> C  (Manual underwriting)
    45–59.9 -> D  (Weak fit; review secured/alternative terms or decline per policy)
    0–44.9  -> E  (Decline recommendation subject to policy)
    Returns: (band, decision_recommendation, interpretation)
    """
    s = float(ulas_score)
    if s >= 88.0:
        return (
            "A+",
            "AUTOMATED_APPROVAL",
            "Prime Tier: Candidate for automated approval workflow subject to final KYC/document sign-off."
        )
    elif s >= 78.0:
        return (
            "A",
            "STANDARD_APPROVAL",
            "Standard Prime: Candidate for approval with standard underwriter verification."
        )
    elif s >= 70.0:
        return (
            "B",
            "CONDITIONAL_APPROVAL",
            "Near-Prime: Conditional review; consider structured terms, guarantor, or revised tenure."
        )
    elif s >= 60.0:
        return (
            "C",
            "MANUAL_REVIEW",
            "Moderate Risk: Manual credit assessment required by senior underwriting officer."
        )
    elif s >= 45.0:
        return (
            "D",
            "DECLINE_OR_SECURED",
            "Elevated Risk: Weak affordability fit; evaluate collateral-backed structures or decline."
        )
    else:
        return (
            "E",
            "DECLINE_RECOMMENDED",
            "Adverse Risk: Debt service distress or significant derogations present; decline recommended."
        )
