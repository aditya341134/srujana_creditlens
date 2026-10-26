"""
Pydantic schemas and data contracts for AI Financial X-Ray.
Defines patterns, stress indicators, income reconciliation, anomalies, visualizations, and bureau reconciliation.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CashFlowMonth(BaseModel):
    month: str                         # e.g., "2026-05" or "May 2026"
    inflow: float                      # Total credits for month
    outflow: float                     # Total debits for month
    net_cash_flow: float               # inflow - outflow
    is_positive: bool                  # net_cash_flow >= 0
    salary_credit: float               # Verified salary component
    non_salary_credit: float           # Non-salary / one-time credits
    closing_balance: float             # Month-end balance
    cumulative_cash_flow: float = 0.0

class RecurringIncomeItem(BaseModel):
    source_employer: str
    amount: float
    typical_day_of_month: int
    frequency: str = "Monthly"
    is_regular: bool = True
    variance_percentage: float = 0.0
    first_detected_date: str
    last_detected_date: str
    sample_transaction_ids: List[str] = []

class IncomeReconciliation(BaseModel):
    declared_monthly_income: float
    observed_recurring_income: float
    variance_amount: float
    variance_percentage: float
    status: str                        # "MATCHED", "MODERATE_MISMATCH", "SIGNIFICANT_MISMATCH"
    confidence: float                  # 0.0 to 1.0
    classification_notes: str
    non_income_deposits_total: float
    non_income_deposits_breakdown: List[Dict[str, Any]] = []
    recurring_credits_evidence: List[Dict[str, Any]] = []

class StressIndicator(BaseModel):
    id: str
    indicator_type: str                # e.g., "NEGATIVE_CASH_FLOW", "HIGH_EXPENSE_RATIO", "BOUNCE_EVENT", "BALANCE_DEPLETION"
    severity: str                      # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    title: str
    description: str
    evidence: str
    affected_periods: List[str] = []
    metric_value: Optional[float] = None
    threshold: Optional[float] = None
    recommended_action: str

class FinancialAnomaly(BaseModel):
    id: str
    title: str
    priority: str                      # "LOW", "MEDIUM", "HIGH"
    detection_rule: str
    confidence: float                  # e.g., 0.85
    supporting_evidence: str
    uncertainty_factors: str
    suggested_verification_step: str
    date_detected: Optional[str] = None
    transaction_amount: Optional[float] = None

class ExpenseCategoryItem(BaseModel):
    category: str                      # e.g., "Rent & Housing", "Loan EMIs", "Utilities & Bills", "Card Repayments", "Discretionary"
    amount: float
    percentage_of_total: float
    transaction_count: int
    is_recurring: bool = False
    sample_transactions: List[Dict[str, Any]] = []

class BureauTradelineMatch(BaseModel):
    tradeline_id: str
    lender_name: str
    loan_type: str
    bureau_status: str                 # e.g., "Active", "Closed", "30 DPD"
    bureau_balance: float
    bureau_reported_date: str
    bank_statement_evidence: str
    reconciliation_finding: str       # "CONCORDANT", "POTENTIAL_TIMING_LAG", "ACTIVE_VS_CLOSED_DISCREPANCY", "DISPUTABLE_DELINQUENCY"
    matching_confidence: float         # 0.0 to 1.0
    recommended_step: str

class DisputeLetterDraft(BaseModel):
    letter_id: str
    generated_at: str
    borrower_name: str
    borrower_pan: str
    bureau_name: str                   # e.g., "TransUnion CIBIL" or "Experian"
    reference_number: str
    subject: str
    body: str
    supporting_evidence_points: List[str]
    disclaimer: str

class FinancialVisualizationsData(BaseModel):
    monthly_comparison: List[CashFlowMonth]
    spending_breakdown: List[ExpenseCategoryItem]
    income_consistency_series: List[Dict[str, Any]]
    balance_trend_series: List[Dict[str, Any]]
    timeline_findings: List[Dict[str, Any]]
    income_reconciliation_summary: Dict[str, Any]

class FinancialXRayReport(BaseModel):
    analysis_id: str
    user_id: str
    applicant_name: str
    generated_at: str
    data_source: str                   # "LIVE_UPLOAD", "SCENARIO_A_STABLE", "SCENARIO_B_REVIEW"
    is_demo: bool = False
    
    # Financial Pattern Discovery
    monthly_inflows_avg: float
    monthly_outflows_avg: float
    net_cash_flow_avg: float
    inflow_volatility_cv: float        # Coefficient of variation (std dev / mean)
    savings_rate_avg: float            # Percentage of income saved
    balance_trajectory: str            # "STABLE", "GROWING", "DECLINING", "HIGHLY_VOLATILE"
    
    # Core Findings
    income_reconciliation: IncomeReconciliation
    stress_indicators: List[StressIndicator]
    anomalies: List[FinancialAnomaly]
    bureau_reconciliation: List[BureauTradelineMatch]
    
    # Visualizations
    visualizations: FinancialVisualizationsData
    
    # Summary & Guidance
    overall_health_rating: str         # "STRONG", "FAIR", "NEEDS_REVIEW"
    data_completeness_pct: float       # Percentage of required fields available
    next_steps: List[str]
