from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...db import repository as repo
from ...models.domain import get_application, documents_db, assessments_db, add_audit_event
from ...schemas.ulas import ULASResponse, SimulationRequest, SimulationResponse, CounterfactualOption
from ...services.ulas.engine import run_ulas_assessment
from ...services.financial_analysis.calculations import calculate_emi

router = APIRouter(prefix="/api/assessments", tags=["Assessments & ULAS"])

from datetime import datetime

def normalize_and_validate_ulas(
    raw: Dict[str, Any],
    application_id: str,
    db_assessment: Optional[Any] = None
) -> ULASResponse:
    data = dict(raw)
    if not data.get("application_id") or data["application_id"] == "APP-UNKNOWN":
        data["application_id"] = application_id
    if not data.get("assessment_id") or data["assessment_id"] == "ASM-LEGACY":
        data["assessment_id"] = getattr(db_assessment, "assessment_id", f"ASM-{application_id}")
    if not data.get("assessment_status"):
        data["assessment_status"] = "COMPLETED"
    if not data.get("assessed_at"):
        created_at = getattr(db_assessment, "created_at", None)
        data["assessed_at"] = created_at.strftime("%Y-%m-%dT%H:%M:%SZ") if created_at else datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Normalize subscores dictionary
    subscores = data.get("subscores", {})
    if isinstance(subscores, dict):
        normalized_subs = {}
        for k, v in subscores.items():
            if isinstance(v, dict):
                sub_copy = dict(v)
                if "status" not in sub_copy:
                    sub_copy["status"] = "AVAILABLE" if sub_copy.get("score") is not None else "UNAVAILABLE"
                if "weight" not in sub_copy:
                    sub_copy["weight"] = 0.20
                normalized_subs[k] = sub_copy
            else:
                normalized_subs[k] = v
        data["subscores"] = normalized_subs

    return ULASResponse.model_validate(data)

@router.get("/{application_id}", response_model=ULASResponse)
def get_ulas_assessment(application_id: str, db: Session = Depends(get_db)):
    # 1. Check database for existing persistent assessment first
    db_assessment = repo.get_latest_ulas_assessment(db, application_id)
    if db_assessment and db_assessment.raw_response:
        try:
            return normalize_and_validate_ulas(db_assessment.raw_response, application_id, db_assessment)
        except Exception:
            pass

    # 2. Check in-memory domain store or database application record
    app_item = get_application(application_id)
    if not app_item:
        db_app = repo.get_application_by_id(db, application_id)
        if db_app:
            app_item = {
                "id": db_app.id,
                "applicantName": db_app.applicant_name,
                "businessName": db_app.business_name,
                "requestedAmount": db_app.loan_amount,
                "tenureMonths": db_app.tenure_months,
                "status": db_app.status,
                "stage": db_app.stage,
                "submissionDate": db_app.submission_date.strftime("%Y-%m-%d") if db_app.submission_date else "",
                "purpose": db_app.product_name,
                "borrower_id": db_app.user_id,
                "financials": {"grossMonthlyIncome": 95000.0, "monthlyLivingExpenses": 32000.0, "existingDebtObligations": 14000.0},
                "creditHistory": {"bureauBand": "Standard Prime (765)", "onTimePaymentPct": 99.2}
            }
        else:
            raise HTTPException(status_code=404, detail=f"Application {application_id} not found")

    # If cached assessment exists in-memory, return it
    if application_id in assessments_db:
        return assessments_db[application_id]

    docs = documents_db.get(application_id, [])
    docs_data = {}
    for d in docs:
        cat_key = d.category.value.lower().replace(" ", "_")
        docs_data[cat_key] = d.extracted_fields

    assessment = run_ulas_assessment(app_item, docs_data)
    assessments_db[application_id] = assessment

    # Persist in database
    user_id = app_item.get("borrower_id", "USR-84091")
    try:
        repo.save_ulas_assessment(db, application_id, user_id, assessment.model_dump())
    except Exception as exc:
        print(f"[CreditLens DB] Assessment persistence warning: {exc}")

    return assessment

@router.post("/{application_id}/run", response_model=ULASResponse, status_code=status.HTTP_201_CREATED)
def trigger_ulas_assessment(application_id: str, db: Session = Depends(get_db)):
    app_item = get_application(application_id)
    if not app_item:
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found")

    docs = documents_db.get(application_id, [])
    docs_data = {}
    for d in docs:
        cat_key = d.category.value.lower().replace(" ", "_")
        docs_data[cat_key] = d.extracted_fields

    assessment = run_ulas_assessment(app_item, docs_data)
    assessments_db[application_id] = assessment

    # Persist in database (creates a new historical score entry)
    user_id = app_item.get("borrower_id", "USR-84091")
    try:
        repo.save_ulas_assessment(db, application_id, user_id, assessment.model_dump())
        repo.log_audit_event(
            db,
            application_id=application_id,
            user_id=user_id,
            event_type="ULAS Assessment Executed",
            description=f"ULAS calculated as {assessment.ulas} (Band {assessment.band}) with recommendation {assessment.decision_recommendation}.",
            user_name="ULAS Engine v0.2",
            changed_values={
                "ulas": assessment.ulas,
                "band": assessment.band,
                "decision_recommendation": assessment.decision_recommendation,
                "confidence": assessment.confidence
            }
        )
    except Exception as exc:
        print(f"[CreditLens DB] Assessment trigger persistence warning: {exc}")

    add_audit_event(
        application_id,
        "ULAS Assessment Executed",
        f"ULAS calculated as {assessment.ulas} (Band {assessment.band}) with recommendation {assessment.decision_recommendation}.",
        user="ULAS Engine v0.2",
        changed_values={
            "ulas": assessment.ulas,
            "band": assessment.band,
            "decision_recommendation": assessment.decision_recommendation,
            "confidence": assessment.confidence
        }
    )

    return assessment

@router.get("/{application_id}/history")
def get_ulas_history(application_id: str, db: Session = Depends(get_db)):
    """
    Retrieves chronological ULAS evaluation score history from the persistent database.
    """
    history = repo.get_ulas_score_history(db, application_id)
    # If history is empty but assessment exists, synthesize initial entry
    if not history and application_id in assessments_db:
        item = assessments_db[application_id]
        history = [{
            "assessment_id": "ULAS-INIT-001",
            "application_id": application_id,
            "ulas_score": round(item.ulas, 1),
            "band": item.band,
            "decision_recommendation": item.decision_recommendation,
            "confidence": round(item.confidence, 2),
            "calibrated_pd": round(item.calibrated_pd, 4),
            "formatted_date": "Initial Evaluation"
        }]
    return {
        "application_id": application_id,
        "total_records": len(history),
        "history": history
    }

@router.post("/simulate", response_model=SimulationResponse)
def simulate_loan(request: SimulationRequest):
    emi = calculate_emi(request.principal, request.annual_interest_rate, request.tenure_months)
    total_repayment = emi * request.tenure_months
    total_interest = total_repayment - request.principal
    
    monthly_income = request.monthly_income or 85000.0
    existing_emi = request.existing_emi or 0.0
    total_projected_emi = existing_emi + emi
    dti_impact = round((total_projected_emi / monthly_income) * 100, 1) if monthly_income > 0 else 0.0
    affordability_status = "Very Affordable" if dti_impact <= 35.0 else "Manageable" if dti_impact <= 50.0 else "High Risk"

    # Counterfactual 1: Extend Tenure by 12 Months
    tenure_ext = request.tenure_months + 12
    emi_ext = calculate_emi(request.principal, request.annual_interest_rate, tenure_ext)
    savings_ext = round(emi - emi_ext, 2)

    # Counterfactual 2: Reduce Principal by 20%
    principal_red = round(request.principal * 0.8, -3)
    emi_red = calculate_emi(principal_red, request.annual_interest_rate, request.tenure_months)
    savings_red = round(emi - emi_red, 2)

    return SimulationResponse(
        input={
            "principal": request.principal,
            "annual_interest_rate": request.annual_interest_rate,
            "tenure_months": request.tenure_months,
            "monthly_income": monthly_income,
            "existing_emi": existing_emi
        },
        simulation={
            "monthlyEMI": emi,
            "totalInterest": round(total_interest, 2),
            "totalRepayment": round(total_repayment, 2),
            "dtiImpactPct": dti_impact,
            "affordabilityStatus": affordability_status
        },
        counterfactualOptions=[
            CounterfactualOption(
                strategy="Extend Tenure by 12 Months",
                tenureMonths=tenure_ext,
                adjustedEMI=emi_ext,
                monthlySavings=savings_ext,
                projectedUlasImpact="Lowers monthly installment burden by approx. 8-12%; improves FOIR score."
            ),
            CounterfactualOption(
                strategy="Reduce Principal Borrowing by 20%",
                adjustedPrincipal=principal_red,
                adjustedEMI=emi_red,
                monthlySavings=savings_red,
                projectedUlasImpact="Lowers leverage and debt burden, potentially improving ULAS tier by +5 to +8 points."
            )
        ]
    )
