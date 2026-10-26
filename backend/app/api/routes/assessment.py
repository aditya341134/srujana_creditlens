"""
Assessment & ULAS Scoring API Endpoints
Runs the auditable ULAS v0.2 pipeline and counterfactual loan simulations.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from ...models.domain import get_application, documents_db, assessments_db, add_audit_event
from ...schemas.ulas import ULASResponse, SimulationRequest, SimulationResponse, CounterfactualOption
from ...services.ulas.engine import run_ulas_assessment
from ...services.financial_analysis.calculations import calculate_emi

router = APIRouter(prefix="/api/assessments", tags=["Assessments & ULAS"])

@router.get("/{application_id}", response_model=ULASResponse)
def get_ulas_assessment(application_id: str):
    app_item = get_application(application_id)
    if not app_item:
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found")

    # If cached assessment exists, return it, else compute it dynamically
    if application_id in assessments_db:
        return assessments_db[application_id]

    docs = documents_db.get(application_id, [])
    docs_data = {}
    for d in docs:
        cat_key = d.category.value.lower().replace(" ", "_")
        docs_data[cat_key] = d.extracted_fields

    assessment = run_ulas_assessment(app_item, docs_data)
    assessments_db[application_id] = assessment
    return assessment

@router.post("/{application_id}/run", response_model=ULASResponse, status_code=status.HTTP_201_CREATED)
def trigger_ulas_assessment(application_id: str):
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
