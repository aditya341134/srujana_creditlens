"""
Loan Application Request & Response Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class LoanApplicationCreate(BaseModel):
    applicantName: str
    applicantType: Optional[str] = "Salaried Professional"
    requestedAmount: float = Field(..., gt=0, description="Requested principal in INR")
    tenureMonths: int = Field(36, gt=0, le=360, description="Tenure in months")
    purpose: str
    annualInterestRate: Optional[float] = 10.5
    grossMonthlyIncome: Optional[float] = 75000.0
    monthlyLivingExpenses: Optional[float] = 25000.0
    existingDebtObligations: Optional[float] = 0.0
    hasPreviousLoan: Optional[str] = "no"  # "yes" or "no"
    cityTier: Optional[str] = "Tier 2"

class StatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    reviewer: Optional[str] = "Senior Underwriter"

class AuditEventCreate(BaseModel):
    applicationId: str
    eventType: str
    description: str
    user: Optional[str] = "Senior Underwriter"
    changedValues: Optional[Dict[str, Any]] = None
