"""
Synthetic Financial Datasets for Hackathon Demonstration.
Scenario A: Stable Financial Pattern (Prime, consistent cash flow, high resilience).
Scenario B: Financial Pattern Requiring Review (Income discrepancy, negative cashflow spells, bounce event).
All synthetic records are isolated and clearly labeled.
"""

from typing import Dict, Any, List

def get_scenario_a_transactions() -> Dict[str, Any]:
    """
    Scenario A — Stable Financial Pattern
    - Declared Income: ₹95,000
    - Observed Verified Salary: ₹95,000 (Apex Global Technologies Ltd)
    - Predictable Expenses: Rent ₹24,000, EMI ₹14,000, Groceries ₹12,500, Utilities ₹4,500
    - Positive Net Cash Flow across all 6 periods (~ +₹30,000 to +₹35,000/mo)
    - No bounces, low volatility, healthy balance growth from ₹1,45,000 to ₹3,35,000
    """
    months = ["Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026"]
    
    monthly_data = [
        {
            "month": "Nov 2025",
            "inflow": 95000.0,
            "outflow": 61500.0,
            "net_cash_flow": 33500.0,
            "salary_credit": 95000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 178500.0
        },
        {
            "month": "Dec 2025",
            "inflow": 98500.0, # ₹95,000 salary + ₹3,500 annual interest credit
            "outflow": 64200.0,
            "net_cash_flow": 34300.0,
            "salary_credit": 95000.0,
            "non_salary_credit": 3500.0,
            "closing_balance": 212800.0
        },
        {
            "month": "Jan 2026",
            "inflow": 95000.0,
            "outflow": 62800.0,
            "net_cash_flow": 32200.0,
            "salary_credit": 95000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 245000.0
        },
        {
            "month": "Feb 2026",
            "inflow": 95000.0,
            "outflow": 60900.0,
            "net_cash_flow": 34100.0,
            "salary_credit": 95000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 279100.0
        },
        {
            "month": "Mar 2026",
            "inflow": 95000.0,
            "outflow": 63500.0,
            "net_cash_flow": 31500.0,
            "salary_credit": 95000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 310600.0
        },
        {
            "month": "Apr 2026",
            "inflow": 95000.0,
            "outflow": 61200.0,
            "net_cash_flow": 33800.0,
            "salary_credit": 95000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 344400.0
        }
    ]

    expenses_by_category = [
        {"category": "Rent & Housing", "amount": 144000.0, "percentage": 38.5, "count": 6, "is_recurring": True},
        {"category": "Existing Loan EMIs", "amount": 84000.0, "percentage": 22.4, "count": 6, "is_recurring": True},
        {"category": "Groceries & Daily Essentials", "amount": 75000.0, "percentage": 20.0, "count": 28, "is_recurring": False},
        {"category": "Utilities & Telecommunications", "amount": 27000.0, "percentage": 7.2, "count": 18, "is_recurring": True},
        {"category": "Discretionary & Health", "amount": 44100.0, "percentage": 11.9, "count": 15, "is_recurring": False}
    ]

    bureau_tradelines = [
        {
            "tradeline_id": "TL-HDFC-9912",
            "lender_name": "HDFC Bank Ltd",
            "loan_type": "Auto Loan (Secured)",
            "bureau_status": "Active (Standard)",
            "bureau_balance": 245000.0,
            "bureau_reported_date": "2026-03-31",
            "bank_statement_evidence": "Monthly NACH debit ₹14,000 cleared on 5th of every month. Zero delays.",
            "reconciliation_finding": "CONCORDANT",
            "matching_confidence": 0.98,
            "recommended_step": "No action needed. Tradeline perfectly corroborated with bank statement cash flow."
        },
        {
            "tradeline_id": "TL-ICICI-4011",
            "lender_name": "ICICI Bank Ltd",
            "loan_type": "Credit Card Revolving",
            "bureau_status": "Active (Standard)",
            "bureau_balance": 12400.0,
            "bureau_reported_date": "2026-03-31",
            "bank_statement_evidence": "Full statement bill payment of ₹12,400 cleared via NEFT on 12th April.",
            "reconciliation_finding": "CONCORDANT",
            "matching_confidence": 0.95,
            "recommended_step": "Low utilization (<15%). Excellent revolving hygiene."
        }
    ]

    return {
        "scenario_id": "scenario_a",
        "scenario_title": "Scenario A — Stable Financial Pattern",
        "applicant_name": "Aarav Sharma",
        "declared_income": 95000.0,
        "monthly_data": monthly_data,
        "expenses_by_category": expenses_by_category,
        "bureau_tradelines": bureau_tradelines,
        "employer": "Apex Global Technologies Ltd",
        "initial_balance": 145000.0
    }

def get_scenario_b_transactions() -> Dict[str, Any]:
    """
    Scenario B — Financial Pattern Requiring Review
    - Declared Income: ₹1,20,000
    - Observed Verified Salary: ₹75,000 (Zenith Retail Corp)
    - Income Discrepancy: 37.5% shortfall between declared and recurring payroll
    - Non-recurring credit: ₹45,000 one-time tax refund / family transfer in Dec 2025
    - Sustained Negative Cash Flow in Jan 2026 (-₹14,500) and Mar 2026 (-₹18,200)
    - ECS Loan Bounce on 14th Feb 2026 (Insufficient Funds, ₹8,500)
    - Unusual Outflow: ₹65,000 IMPS transfer to individual account in Jan 2026
    - Bureau Discrepancy: Bureau reports a 30 DPD delinquency on an SBI Personal Loan, but bank shows payment was debited on 8th Feb.
    """
    monthly_data = [
        {
            "month": "Nov 2025",
            "inflow": 75000.0,
            "outflow": 68000.0,
            "net_cash_flow": 7000.0,
            "salary_credit": 75000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 92000.0
        },
        {
            "month": "Dec 2025",
            "inflow": 120000.0, # ₹75,000 regular salary + ₹45,000 one-time IT refund/transfer
            "outflow": 76500.0,
            "net_cash_flow": 43500.0,
            "salary_credit": 75000.0,
            "non_salary_credit": 45000.0,
            "closing_balance": 135500.0
        },
        {
            "month": "Jan 2026",
            "inflow": 75000.0,
            "outflow": 89500.0, # Negative cashflow due to unusual ₹65,000 transfer
            "net_cash_flow": -14500.0,
            "salary_credit": 75000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 121000.0
        },
        {
            "month": "Feb 2026",
            "inflow": 75000.0,
            "outflow": 73200.0,
            "net_cash_flow": 1800.0,
            "salary_credit": 75000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 122800.0
        },
        {
            "month": "Mar 2026",
            "inflow": 75000.0,
            "outflow": 93200.0, # Sustained negative cash flow (medical/festive)
            "net_cash_flow": -18200.0,
            "salary_credit": 75000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 104600.0
        },
        {
            "month": "Apr 2026",
            "inflow": 75000.0,
            "outflow": 71800.0,
            "net_cash_flow": 3200.0,
            "salary_credit": 75000.0,
            "non_salary_credit": 0.0,
            "closing_balance": 107800.0
        }
    ]

    expenses_by_category = [
        {"category": "Rent & Housing", "amount": 132000.0, "percentage": 28.0, "count": 6, "is_recurring": True},
        {"category": "Existing Loan EMIs", "amount": 76500.0, "percentage": 16.2, "count": 6, "is_recurring": True},
        {"category": "Unusual Transfers / Capital Outflows", "amount": 65000.0, "percentage": 13.8, "count": 1, "is_recurring": False},
        {"category": "Groceries & Household", "amount": 84000.0, "percentage": 17.8, "count": 31, "is_recurring": False},
        {"category": "Medical & Hospital Bills", "amount": 42000.0, "percentage": 8.9, "count": 4, "is_recurring": False},
        {"category": "Utilities & Card Debits", "amount": 72700.0, "percentage": 15.3, "count": 22, "is_recurring": True}
    ]

    bureau_tradelines = [
        {
            "tradeline_id": "TL-SBI-7721",
            "lender_name": "State Bank of India",
            "loan_type": "Personal Loan (Unsecured)",
            "bureau_status": "30+ DPD Delinquent",
            "bureau_balance": 164000.0,
            "bureau_reported_date": "2026-02-28",
            "bank_statement_evidence": "Bank statement shows successful clearance of ₹8,500 EMI on 8th Feb (Reference: UPI/SBI/991204). Bureau record may be an erroneous reporting lag or delayed reconciliation.",
            "reconciliation_finding": "DISPUTABLE_DELINQUENCY",
            "matching_confidence": 0.88,
            "recommended_step": "Generate Bureau Dispute Letter draft. Bank statement debits contradict bureau 30+ DPD flag."
        },
        {
            "tradeline_id": "TL-BAJAJ-3109",
            "lender_name": "Bajaj Finance Ltd",
            "loan_type": "Consumer Durable Loan",
            "bureau_status": "Active (Reported Open)",
            "bureau_balance": 32000.0,
            "bureau_reported_date": "2026-01-31",
            "bank_statement_evidence": "Final foreclosure debit of ₹32,000 cleared on 15th January. No further debits observed in statement.",
            "reconciliation_finding": "ACTIVE_VS_CLOSED_DISCREPANCY",
            "matching_confidence": 0.92,
            "recommended_step": "Request No Objection Certificate (NOC) from lender; tradeline closed in banking records but lingering open in CIR."
        }
    ]

    return {
        "scenario_id": "scenario_b",
        "scenario_title": "Scenario B — Financial Pattern Requiring Review",
        "applicant_name": "Priya Mehra",
        "declared_income": 120000.0,
        "monthly_data": monthly_data,
        "expenses_by_category": expenses_by_category,
        "bureau_tradelines": bureau_tradelines,
        "employer": "Zenith Retail Corp",
        "initial_balance": 85000.0
    }
