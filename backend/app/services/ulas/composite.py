"""
ULAS Composite Score Calculation & Missing Dimension Renormalization (Stage 11)
Calculates composite R across available dimensions, redistributing weights transparently.
"""

from typing import Dict, Tuple, Optional, List
from ...schemas.ulas import SubscoreDetail

def calculate_composite_r(
    subscores: Dict[str, SubscoreDetail]
) -> Tuple[Optional[float], float, List[str]]:
    """
    Computes composite R:
    R = sum(w_i * s_i for available dimensions) / sum(w_i for available dimensions)
    Returns: (composite_r, sum_available_weights, missing_dimensions)
    """
    total_weighted_score = 0.0
    sum_available_weights = 0.0
    missing_dimensions = []

    for name, item in subscores.items():
        if item.status == "AVAILABLE" and item.score is not None:
            total_weighted_score += item.weight * item.score
            sum_available_weights += item.weight
        else:
            missing_dimensions.append(name)

    # If all dimensions or critical dimensions are missing, score is not computable
    if sum_available_weights <= 0:
        return None, 0.0, missing_dimensions

    # Check if both primary credit conduct and capacity are missing
    if "credit_conduct" in missing_dimensions and "repayment_capacity" in missing_dimensions:
        return None, sum_available_weights, missing_dimensions

    composite_r = round(total_weighted_score / sum_available_weights, 2)
    return composite_r, sum_available_weights, missing_dimensions
