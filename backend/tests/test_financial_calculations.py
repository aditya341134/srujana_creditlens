"""
Unit Tests for Financial Calculations
Tests reducing-balance EMI, zero-interest handling, FOIR, and income verification.
"""

import pytest
from app.services.financial_analysis.calculations import (
    calculate_emi,
    calculate_total_repayment,
    calculate_total_interest,
    calculate_income_verified,
    calculate_foir,
    calculate_dscr
)

def test_calculate_emi_standard():
    # 5,00,000 at 10.5% for 36 months
    # Monthly rate = 0.105 / 12 = 0.00875
    # Factor = (1 + 0.00875)^36 = 1.3682
    # Expected EMI around 16,252
    emi = calculate_emi(500000, 10.5, 36)
    assert 16200 < emi < 16300

def test_calculate_emi_zero_interest():
    # 1,20,000 at 0% for 12 months = 10,000/mo
    emi = calculate_emi(120000, 0, 12)
    assert emi == 10000.0

def test_calculate_emi_invalid_inputs():
    assert calculate_emi(0, 10, 12) == 0.0
    assert calculate_emi(-50000, 10, 12) == 0.0
    assert calculate_emi(50000, 10, 0) == 0.0

def test_calculate_total_repayment_and_interest():
    emi = 10000.0
    repayment = calculate_total_repayment(emi, 12)
    assert repayment == 120000.0
    interest = calculate_total_interest(repayment, 100000.0)
    assert interest == 20000.0

def test_calculate_income_verified():
    # min(claimed, median)
    verified, note = calculate_income_verified(95000, 82000)
    assert verified == 82000.0
    assert "Corroborated" in note

    # when median is higher than claimed
    verified2, _ = calculate_income_verified(60000, 75000)
    assert verified2 == 60000.0

    # missing inputs
    verified3, note3 = calculate_income_verified(0, 0)
    assert verified3 == 0.0
    assert "NOT_COMPUTABLE" in note3

def test_calculate_foir():
    # Existing EMI 12,000 + Proposed EMI 16,252 = 28,252 on income 82,000 -> 34.45%
    ratio, pct = calculate_foir(12000, 16252, 82000)
    assert ratio is not None
    assert 34.0 <= pct <= 35.0

    # Zero income -> Not computable, not zero!
    ratio_zero, pct_zero = calculate_foir(10000, 5000, 0)
    assert ratio_zero is None
    assert pct_zero is None
