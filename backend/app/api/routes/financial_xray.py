"""
AI Financial X-Ray API Endpoints
Provides analysis execution, demo scenario loading, report generation, and bureau dispute drafting.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Header, Depends
from pydantic import BaseModel

from ...models.domain import (
    financial_xray_db,
    user_active_scenario_db,
    borrower_profile_db,
    add_audit_event
)
from ...core.security import get_current_user_from_header
from ...services.financial_xray import (
    run_financial_xray,
    generate_dispute_letter,
    FinancialXRayReport,
    DisputeLetterDraft
)
from ...services.financial_xray.models import BureauTradelineMatch

router = APIRouter(prefix="/api/financial-xray", tags=["AI Financial X-Ray"])

class AnalyzeRequest(BaseModel):
    declared_income: Optional[float] = None
    applicant_name: Optional[str] = None
    scenario_override: Optional[str] = None  # "scenario_a" or "scenario_b"
    monthly_data: Optional[List[Dict[str, Any]]] = None
    expenses_by_category: Optional[List[Dict[str, Any]]] = None

class DisputeLetterRequest(BaseModel):
    borrower_name: str
    borrower_pan: str
    bureau_name: Optional[str] = "TransUnion CIBIL"
    tradeline: BureauTradelineMatch

from ...db.session import get_db
from ...db import repository as repo
from sqlalchemy.orm import Session

@router.post("/analyze", response_model=FinancialXRayReport)
def analyze_financial_xray(
    payload: AnalyzeRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = get_current_user_from_header(authorization)
    user_id = user.get("sub", "USR-84091")
    applicant_name = payload.applicant_name or user.get("name", borrower_profile_db.get("name", "Applicant"))
    declared_income = payload.declared_income or float(borrower_profile_db.get("averageMonthlyIncome", 95000.0))

    report = run_financial_xray(
        user_id=user_id,
        applicant_name=applicant_name,
        declared_income=declared_income,
        scenario_override=payload.scenario_override,
        custom_monthly_data=payload.monthly_data,
        custom_expenses=payload.expenses_by_category
    )

    financial_xray_db[report.analysis_id] = report
    user_active_scenario_db[user_id] = report.analysis_id

    try:
        repo.save_financial_xray(
            db=db,
            user_id=user_id,
            scenario_id=payload.scenario_override or "SCENARIO_A",
            xray_payload=report.model_dump()
        )
    except Exception as exc:
        print(f"[CreditLens DB] X-Ray persistence warning: {exc}")

    add_audit_event(
        report.analysis_id,
        "AI Financial X-Ray Executed",
        f"Health rating: {report.overall_health_rating}. Net cash flow: ₹{report.net_cash_flow_avg:,.2f}. Stress indicators detected: {len(report.stress_indicators)}.",
        user=applicant_name,
        changed_values={
            "analysis_id": report.analysis_id,
            "overall_health_rating": report.overall_health_rating,
            "variance_pct": report.income_reconciliation.variance_percentage,
            "anomalies_count": len(report.anomalies)
        }
    )

    return report

@router.get("/current", response_model=FinancialXRayReport)
def get_current_user_xray(
    scenario: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = get_current_user_from_header(authorization)
    user_id = user.get("sub", "USR-84091")

    # If scenario requested explicitly (e.g. ?scenario=scenario_a)
    if scenario in ["scenario_a", "scenario_b"]:
        return analyze_financial_xray(
            AnalyzeRequest(scenario_override=scenario),
            authorization=authorization,
            db=db
        )

    # Check if user has an existing active analysis
    active_id = user_active_scenario_db.get(user_id)
    if active_id and active_id in financial_xray_db:
        return financial_xray_db[active_id]

    # Check database for recent X-Ray record
    db_xray = repo.get_latest_financial_xray(db, user_id)
    if db_xray and db_xray.raw_payload:
        return db_xray.raw_payload

    # Default to generating baseline or Scenario A for rich demonstration
    default_report = run_financial_xray(
        user_id=user_id,
        applicant_name=user.get("name", borrower_profile_db.get("name", "Rajesh Kumar")),
        declared_income=float(borrower_profile_db.get("averageMonthlyIncome", 95000.0)),
        scenario_override="scenario_a"
    )
    financial_xray_db[default_report.analysis_id] = default_report
    user_active_scenario_db[user_id] = default_report.analysis_id

    try:
        repo.save_financial_xray(
            db=db,
            user_id=user_id,
            scenario_id="scenario_a",
            xray_payload=default_report.model_dump()
        )
    except Exception as exc:
        print(f"[CreditLens DB] X-Ray persistence warning: {exc}")

    return default_report

@router.get("/{analysis_id}", response_model=FinancialXRayReport)
def get_xray_by_id(analysis_id: str):
    if analysis_id not in financial_xray_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Financial X-Ray analysis '{analysis_id}' not found."
        )
    return financial_xray_db[analysis_id]

@router.post("/demo/{scenario_id}", response_model=FinancialXRayReport)
def load_demo_scenario(
    scenario_id: str,
    authorization: Optional[str] = Header(None)
):
    if scenario_id not in ["scenario_a", "scenario_b"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scenario ID. Supported options: 'scenario_a' (Stable) or 'scenario_b' (Requires Review)."
        )

    user = get_current_user_from_header(authorization)
    user_id = user.get("sub", "USR-84091")

    report = run_financial_xray(
        user_id=user_id,
        applicant_name=user.get("name", "Demo Applicant"),
        declared_income=95000.0 if scenario_id == "scenario_a" else 120000.0,
        scenario_override=scenario_id
    )

    financial_xray_db[report.analysis_id] = report
    user_active_scenario_db[user_id] = report.analysis_id
    return report

@router.post("/dispute-letter", response_model=DisputeLetterDraft)
def create_dispute_letter(payload: DisputeLetterRequest):
    return generate_dispute_letter(
        borrower_name=payload.borrower_name,
        borrower_pan=payload.borrower_pan,
        bureau_name=payload.bureau_name or "TransUnion CIBIL",
        tradeline=payload.tradeline
    )
