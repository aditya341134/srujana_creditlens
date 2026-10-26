"""
Deterministic Financial Calculations Engine
Implements reducing-balance EMI, income verification, FOIR, and DSCR metrics with mathematical precision.
"""

import math
from typing import Optional, Tuple, Dict, Any

def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """
    Standard monthly reducing-balance EMI formula:
    EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    where r is monthly rate as decimal, n is installments.
    """
    p = float(principal)
    rate = float(annual_rate)
    n = int(tenure_months)

    if p <= 0 or n <= 0:
        return 0.0

    # Zero-interest handling
    if rate <= 0:
        return round(p / n, 2)

    monthly_rate = (rate / 100.0) / 12.0
    try:
        factor = math.pow(1.0 + monthly_rate, n)
        if factor <= 1.0:
            return round(p / n, 2)
        emi = p * monthly_rate * factor / (factor - 1.0)
        return round(emi, 2)
    except OverflowError:
        return round(p / n, 2)

def calculate_total_repayment(emi: float, tenure_months: int) -> float:
    return round(emi * int(tenure_months), 2)

def calculate_total_interest(total_repayment: float, principal: float) -> float:
    return round(max(0.0, total_repayment - float(principal)), 2)

def calculate_income_verified(
    claimed_net_salary: Optional[float],
    median_salary_credits: Optional[float]
) -> Tuple[float, str]:
    """
    Applies ULAS Section 8 income verification rule:
    income_verified = min(claimed_net_salary, median_salary_credits_in_statement)
    Returns: (verified_income, status_note)
    """
    c = float(claimed_net_salary) if claimed_net_salary is not None else 0.0
    m = float(median_salary_credits) if median_salary_credits is not None else 0.0

    if c > 0 and m > 0:
        verified = min(c, m)
        return verified, "Corroborated: Verified as minimum of claimed salary and statement median credit."
    elif c > 0:
        return c, "Uncorroborated: Based solely on self-reported salary (statement credit unavailable)."
    elif m > 0:
        return m, "Derived: Based directly on verified statement payroll deposits."
    else:
        return 0.0, "NOT_COMPUTABLE: Insufficient verifiable income evidence."

def calculate_foir(
    existing_monthly_emi: float,
    proposed_monthly_emi: float,
    income_verified: float
) -> Tuple[Optional[float], Optional[float]]:
    """
    FOIR = (existing_monthly_EMI + proposed_monthly_EMI) / income_verified
    Returns: (foir_ratio, foir_percentage)
    """
    if income_verified <= 0:
        return None, None
    total_obligations = float(existing_monthly_emi) + float(proposed_monthly_emi)
    foir_ratio = round(total_obligations / income_verified, 4)
    foir_pct = round(foir_ratio * 100.0, 1)
    return foir_ratio, foir_pct

def calculate_dscr(
    net_disposable_surplus: float,
    proposed_monthly_emi: float
) -> Optional[float]:
    """
    DSCR = net_disposable_surplus / proposed_monthly_emi
    """
    if proposed_monthly_emi <= 0:
        return 1.0
    return round(float(net_disposable_surplus) / proposed_monthly_emi, 2)
