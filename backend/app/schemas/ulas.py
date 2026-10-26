"""
ULAS — Universal Loan Acceptance Score Engine Schemas
Defines canonical API response contracts, gates, sub-scores, and counterfactual simulation schemas.
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class GateResult(BaseModel):
    status: str  # "PASS", "FAIL", "PENDING", "NOT_EVALUATED", "NEEDS_MANUAL_REVIEW"
    reason_codes: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    evaluated_value: Optional[Any] = None
    threshold: Optional[Any] = None

class SubscoreDetail(BaseModel):
    score: Optional[float] = None
    status: str = "AVAILABLE"  # "AVAILABLE", "UNAVAILABLE"
    weight: float = 0.20
    description: Optional[str] = None
    input_features: Dict[str, Any] = Field(default_factory=dict)
    assumptions: Optional[str] = None

class DriverItem(BaseModel):
    feature: str
    impact: str  # "Positive", "Negative", "Neutral"
    contribution_points: float
    description: str
    dimension: str

class ReasonCodeItem(BaseModel):
    code: str
    title: str
    borrower_explanation: str
    banker_detail: str
    severity: str  # "INFO", "CAUTION", "ADVERSE"
    recommended_action: str

class NextActionItem(BaseModel):
    priority: int
    title: str
    action: str
    category: str

class ULASResponse(BaseModel):
    application_id: str = "APP-UNKNOWN"
    assessment_id: str = "ASM-LEGACY"
    assessment_status: str = "COMPLETED"  # "COMPLETED", "NEEDS_MANUAL_REVIEW", "INSUFFICIENT_DATA", "FAILED", "FAILED_POLICY_GATE"
    ulas: Optional[float] = None
    ulas_base: Optional[float] = None
    ulas_policy_adjusted: Optional[float] = None
    band: str = "C"  # "A+", "A", "B", "C", "D", "E"
    decision_recommendation: str = "MANUAL_REVIEW"  # "AUTOMATED_APPROVAL", "STANDARD_APPROVAL", "CONDITIONAL_APPROVAL", "MANUAL_REVIEW", "DECLINE_RECOMMENDED"
    official_lender_decision: Optional[str] = None
    p_grant_estimate: Optional[float] = None
    p_default_12m: Optional[float] = None
    pd_model_status: str = "NOT_AVAILABLE"
    confidence: float = 1.0
    calibration_status: str = "UNCALIBRATED"
    composite_r: Optional[float] = None
    gates: Dict[str, GateResult] = Field(default_factory=dict)
    subscores: Dict[str, SubscoreDetail] = Field(default_factory=dict)
    drivers_positive: List[DriverItem] = Field(default_factory=list)
    drivers_negative: List[DriverItem] = Field(default_factory=list)
    reason_codes: List[ReasonCodeItem] = Field(default_factory=list)
    missing_evidence: List[str] = Field(default_factory=list)
    document_summary: List[Dict[str, Any]] = Field(default_factory=list)
    next_actions: List[NextActionItem] = Field(default_factory=list)
    model_version: str = "ulas-0.2.0"
    policy_version: str = "2026.1"
    feature_schema_version: str = "1.0.0"
    calibration_version: Optional[str] = None
    assessed_at: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"))

class SimulationRequest(BaseModel):
    principal: float = Field(..., gt=0)
    annual_interest_rate: float = Field(..., gt=0)
    tenure_months: int = Field(..., gt=0)
    monthly_income: Optional[float] = None
    existing_emi: Optional[float] = 0.0

class CounterfactualOption(BaseModel):
    strategy: str
    adjustedPrincipal: Optional[float] = None
    tenureMonths: Optional[int] = None
    adjustedEMI: float
    monthlySavings: float
    projectedUlasImpact: str

class SimulationResponse(BaseModel):
    input: Dict[str, Any]
    simulation: Dict[str, Any]
    counterfactualOptions: List[CounterfactualOption]
