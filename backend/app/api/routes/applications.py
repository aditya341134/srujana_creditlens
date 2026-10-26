"""
Loan Applications API Endpoints
Handles creation, listing, retrieval, and status updates for borrower loan files.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query

from ...models.domain import applications_db, add_audit_event, get_application
from ...schemas.applications import LoanApplicationCreate, StatusUpdate
from ...services.financial_analysis.calculations import calculate_emi, calculate_foir

router = APIRouter(prefix="/api/applications", tags=["Applications"])

@router.get("")
def list_applications(
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    results = applications_db
    if status and isinstance(status, str) and status.upper() != "ALL":
        s_lower = status.lower()
        results = [a for a in results if s_lower in a.get("status", "").lower() or s_lower in a.get("reviewStatus", "").lower()]
    if search:
        q = search.lower().strip()
        results = [
            a for a in results
            if q in a.get("applicantName", "").lower() or q in a.get("id", "").lower() or q in a.get("purpose", "").lower()
        ]
    return {
        "total": len(results),
        "items": results[skip : skip + limit]
    }

@router.get("/{application_id}")
def get_application_details(application_id: str):
    app_item = get_application(application_id)
    if not app_item:
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found")
    return app_item

@router.post("", status_code=status.HTTP_201_CREATED)
def create_application(payload: LoanApplicationCreate):
    new_id = f"APP-2026-{1000 + len(applications_db)}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    emi = calculate_emi(payload.requestedAmount, payload.annualInterestRate or 10.5, payload.tenureMonths)
    gross_income = payload.grossMonthlyIncome or 75000.0
    living_expenses = payload.monthlyLivingExpenses or 25000.0
    debt = payload.existingDebtObligations or 0.0
    surplus = gross_income - living_expenses - debt
    dti = round((debt / gross_income) * 100.0, 1) if gross_income > 0 else 0.0
    dscr = round(surplus / emi, 2) if emi > 0 else 1.0
    foir_ratio, foir_pct = calculate_foir(debt, emi, gross_income)

    new_app = {
        "id": new_id,
        "applicantName": payload.applicantName,
        "applicantInitials": "".join([p[0].upper() for p in payload.applicantName.split()[:2]]) if payload.applicantName else "AP",
        "applicantType": payload.applicantType,
        "requestedAmount": payload.requestedAmount,
        "annualInterestRate": payload.annualInterestRate,
        "purpose": payload.purpose,
        "tenureMonths": payload.tenureMonths,
        "hasPreviousLoan": payload.hasPreviousLoan,
        "submissionDate": datetime.now().strftime("%Y-%m-%d"),
        "lastUpdated": now_str,
        "status": "Ready for Review",
        "reviewStatus": "Ready for Review",
        "evidenceCompleteness": "Documents Pending",
        "assignedReviewer": "David Vance (Senior Underwriter)",
        "financials": {
            "grossMonthlyIncome": gross_income,
            "monthlyLivingExpenses": living_expenses,
            "existingDebtObligations": debt,
            "calculatedDti": dti,
            "netDiscretionaryCashflow": surplus,
            "debtServiceCoverageRatio": dscr,
            "foir": foir_pct,
            "proposedEMI": emi
        },
        "creditHistory": {
            "bureauBand": "Standard (750)" if payload.hasPreviousLoan == "yes" else "Thin File (New to Credit)",
            "onTimePaymentPct": 98.5 if payload.hasPreviousLoan == "yes" else 100.0,
            "delinquencies24m": 0,
            "revolvingUtilizationPct": 18.0 if payload.hasPreviousLoan == "yes" else 0.0,
            "activeCreditLines": 2 if payload.hasPreviousLoan == "yes" else 0
        },
        "employment": {
            "type": payload.applicantType or "Permanent Salaried",
            "employerOrBusiness": "Corporate Enterprise",
            "industrySector": "Services & Technology",
            "vintageYears": 3.5,
            "verificationStatus": "Pending payroll statement verification"
        }
    }
    applications_db.insert(0, new_app)

    add_audit_event(
        new_id,
        "Application Submitted",
        f"Loan application created for ₹{payload.requestedAmount:,.2f} by {payload.applicantName}.",
        user="Borrower",
        changed_values={"requestedAmount": payload.requestedAmount, "status": "Ready for Review"}
    )

    return new_app

@router.patch("/{application_id}/status")
def update_application_status(application_id: str, payload: StatusUpdate):
    app_item = get_application(application_id)
    if not app_item:
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found")

    old_status = app_item.get("status")
    app_item["status"] = payload.status
    app_item["reviewStatus"] = payload.status
    app_item["lastUpdated"] = datetime.now().strftime("%Y-%m-%d %H:%M")
    if payload.notes:
        app_item["reviewerNotes"] = payload.notes

    add_audit_event(
        application_id,
        f"Decision: {payload.status}",
        payload.notes or f"Application status updated from {old_status} to {payload.status}.",
        user=payload.reviewer or "David Vance (Senior Underwriter)",
        changed_values={"previousStatus": old_status, "newStatus": payload.status}
    )

    return {"message": "Status updated successfully", "application": app_item}
