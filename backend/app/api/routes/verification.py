"""
Verification & Evidence Quality API Endpoints
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from ...models.domain import get_application, documents_db, verification_tasks_db
from ...schemas.documents import VerificationReportResponse
from ...services.document_processing.verification_report import generate_verification_report

router = APIRouter(prefix="/api", tags=["Verification"])

@router.get("/applications/{application_id}/verification-report", response_model=VerificationReportResponse)
def get_verification_report(application_id: str):
    app_item = get_application(application_id)
    if not app_item:
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found")

    docs = documents_db.get(application_id, [])
    report = generate_verification_report(app_item, docs)
    return report

@router.get("/verification-tasks")
def list_verification_tasks(application_id: Optional[str] = None):
    if application_id:
        return [v for v in verification_tasks_db if v.get("applicationId") == application_id]
    return verification_tasks_db
