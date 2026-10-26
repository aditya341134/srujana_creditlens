"""
ULAS Provisional Calibration & Confidence Shrinkage (Stage 11 & 12)
Implements logistic grant probability mapping, confidence shrinkage, and soft integrity adjustments.
"""

import math
from typing import Tuple
from ...core.config import calibration_settings

def calculate_provisional_calibration(
    composite_r: float,
    missing_optional_count: int,
    statement_months: int,
    has_soft_integrity_concern: bool
) -> Tuple[float, float, float, float, float]:
    """
    Applies the documented ULAS v0.2 calibration pipeline:
    1. Logistic mapping: P = 1 / (1 + exp(-((R - 50) / 18)))
    2. Confidence shrinkage: confidence = clamp(1 - 0.15*missing - 0.1*(months < 6), 0.5, 1.0)
    3. P_final = confidence*P + (1-confidence)*P_population_median (0.50 default)
    4. ULAS_base = round(100*P_final, 1)
    5. ULAS_policy_adjusted = round(ULAS_base * 0.90, 1) if soft concern
    Returns: (p_estimate, confidence, p_final, ulas_base, ulas_adjusted)
    """
    # 1. Logistic Mapping
    midpoint = calibration_settings.logistic_midpoint  # 50.0
    scale = calibration_settings.logistic_scale        # 18.0
    z = (composite_r - midpoint) / scale
    # Clamp z to avoid overflow in exp
    z_clamped = max(-10.0, min(10.0, z))
    p_estimate = 1.0 / (1.0 + math.exp(-z_clamped))

    # 2. Confidence Shrinkage
    statement_penalty = calibration_settings.statement_short_penalty if statement_months < 6 else 0.0
    raw_confidence = 1.0 - (calibration_settings.missing_optional_penalty * missing_optional_count) - statement_penalty
    confidence = max(calibration_settings.confidence_min, min(calibration_settings.confidence_max, raw_confidence))

    # 3. Final Grant Probability
    p_median = calibration_settings.population_median_p  # 0.50
    p_final = confidence * p_estimate + (1.0 - confidence) * p_median

    # 4. ULAS Base
    ulas_base = round(100.0 * p_final, 1)

    # 5. Policy Adjustment (0.90x for soft integrity concerns)
    if has_soft_integrity_concern:
        ulas_adjusted = round(ulas_base * calibration_settings.soft_integrity_multiplier, 1)
    else:
        ulas_adjusted = ulas_base

    return (
        round(p_estimate, 4),
        round(confidence, 2),
        round(p_final, 4),
        ulas_base,
        ulas_adjusted
    )
