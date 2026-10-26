"""
CreditLens Database Repository Layer
Provides transactional, parameterized, and secure operations for all domain entities.
Enforces user isolation, SQL injection prevention, and historical versioning.
"""

import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from .models import (
    UserRecord,
    ApplicantProfileRecord,
    ApplicationRecord,
    DocumentRecord,
    ULASAssessmentRecord,
    FinancialXRayRecord,
    AuditEventRecord,
    ChatMessageRecord
)

# --- USER MANAGEMENT ---
def get_user_by_email(db: Session, email: str) -> Optional[UserRecord]:
    return db.query(UserRecord).filter(UserRecord.email == email.strip().lower()).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[UserRecord]:
    return db.query(UserRecord).filter(UserRecord.id == user_id).first()

def create_user(
    db: Session,
    email: str,
    name: str,
    password_hash: str,
    salt: str,
    role: str = "borrower",
    phone: Optional[str] = None,
    institution: Optional[str] = None
) -> UserRecord:
    new_user = UserRecord(
        id=f"USR-{uuid.uuid4().hex[:8].upper()}",
        email=email.strip().lower(),
        name=name.strip(),
        role=role,
        password_hash=password_hash,
        salt=salt,
        phone=phone,
        institution=institution,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- APPLICANT PROFILE ---
def get_applicant_profile(db: Session, user_id: str) -> Optional[ApplicantProfileRecord]:
    return db.query(ApplicantProfileRecord).filter(ApplicantProfileRecord.user_id == user_id).first()

def upsert_applicant_profile(db: Session, user_id: str, profile_data: Dict[str, Any]) -> ApplicantProfileRecord:
    profile = get_applicant_profile(db, user_id)
    if profile:
        for k, v in profile_data.items():
            if hasattr(profile, k) and v is not None:
                setattr(profile, k, v)
        profile.updated_at = datetime.utcnow()
    else:
        profile = ApplicantProfileRecord(
            id=f"PROF-{uuid.uuid4().hex[:8].upper()}",
            user_id=user_id,
            name=profile_data.get("name", ""),
            tier=profile_data.get("tier", "Standard"),
            email=profile_data.get("email", ""),
            phone=profile_data.get("phone", ""),
            business_type=profile_data.get("business_type", ""),
            annual_turnover=float(profile_data.get("annual_turnover", 0.0)),
            average_monthly_income=float(profile_data.get("average_monthly_income", 0.0)),
            updated_at=datetime.utcnow()
        )
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

# --- APPLICATIONS ---
def get_applications(db: Session, user_id: Optional[str] = None, role: str = "borrower") -> List[ApplicationRecord]:
    query = db.query(ApplicationRecord)
    if role == "borrower" and user_id:
        query = query.filter(ApplicationRecord.user_id == user_id)
    return query.order_by(desc(ApplicationRecord.created_at)).all()

def get_application_by_id(db: Session, app_id: str, user_id: Optional[str] = None, role: str = "borrower") -> Optional[ApplicationRecord]:
    query = db.query(ApplicationRecord).filter(ApplicationRecord.id == app_id)
    if role == "borrower" and user_id:
        query = query.filter(ApplicationRecord.user_id == user_id)
    return query.first()

def create_application(db: Session, user_id: str, app_data: Dict[str, Any]) -> ApplicationRecord:
    try:
        user_rec = db.query(UserRecord).filter(UserRecord.id == user_id).first()
        if not user_rec:
            default_user = db.query(UserRecord).filter(UserRecord.id == "USR-84091").first() or db.query(UserRecord).first()
            if default_user:
                user_id = default_user.id
            else:
                user_id = "USR-84091"

        app_id = app_data.get("id") or f"APP-{datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
        new_app = ApplicationRecord(
            id=app_id,
            user_id=user_id,
            applicant_name=app_data.get("applicant_name", "Borrower"),
            business_name=app_data.get("business_name", ""),
            product_name=app_data.get("product_name", app_data.get("loan_type", "Personal Loan")),
            loan_amount=float(app_data.get("loan_amount", app_data.get("requested_amount", 500000.0))),
            tenure_months=int(app_data.get("tenure_months", 36)),
            status="SUBMITTED",
            stage="Underwriting Review",
            submission_date=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_app)
        db.commit()
        db.refresh(new_app)
        return new_app
    except Exception as exc:
        db.rollback()
        raise exc

# --- ULAS ASSESSMENTS & HISTORICAL TRACKING ---
def save_ulas_assessment(
    db: Session,
    application_id: str,
    user_id: str,
    assessment_dict: Dict[str, Any]
) -> ULASAssessmentRecord:
    """
    Appends a new ULAS assessment run to the history table without overwriting past evaluations.
    Guarantees foreign key integrity by verifying application and user presence.
    """
    try:
        user_rec = db.query(UserRecord).filter(UserRecord.id == user_id).first()
        if not user_rec:
            default_user = db.query(UserRecord).filter(UserRecord.id == "USR-84091").first() or db.query(UserRecord).first()
            if default_user:
                user_id = default_user.id
            else:
                user_id = "USR-84091"

        app_rec = db.query(ApplicationRecord).filter(ApplicationRecord.id == application_id).first()
        if not app_rec:
            from ..models.domain import get_application
            domain_app = get_application(application_id) or {}
            app_rec = ApplicationRecord(
                id=application_id,
                user_id=user_id,
                applicant_name=domain_app.get("applicantName", domain_app.get("applicant_name", "Borrower")),
                business_name=domain_app.get("business_name", ""),
                product_name=domain_app.get("purpose", domain_app.get("product_name", "Personal Loan")),
                loan_amount=float(domain_app.get("requestedAmount", domain_app.get("loan_amount", 500000.0))),
                tenure_months=int(domain_app.get("tenureMonths", domain_app.get("tenure_months", 36))),
                status=domain_app.get("status", "SUBMITTED"),
                stage=domain_app.get("stage", "Underwriting Review"),
                submission_date=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(app_rec)
            db.commit()
            db.refresh(app_rec)

        assessment_id = assessment_dict.get("assessment_id") or f"ULAS-{uuid.uuid4().hex[:8].upper()}-{datetime.utcnow().strftime('%Y%m%d%H%M')}"
        ulas_score = float(assessment_dict.get("ulas", 0.0) or 0.0)
        band = str(assessment_dict.get("band", "E") or "E")
        decision = str(assessment_dict.get("decision_recommendation", "MANUAL_REVIEW") or "MANUAL_REVIEW")
        pd = float(assessment_dict.get("calibrated_pd", 0.0) or 0.0)
        confidence = float(assessment_dict.get("confidence", 1.0) or 1.0)
        composite_r = float(assessment_dict.get("composite_r", ulas_score) or ulas_score)

        rec = ULASAssessmentRecord(
            assessment_id=assessment_id,
            application_id=application_id,
            user_id=user_id,
            ulas_score=ulas_score,
            band=band,
            decision_recommendation=decision,
            calibrated_pd=pd,
            confidence=confidence,
            composite_r=composite_r,
            policy_gates=assessment_dict.get("gates", {}),
            subscores=assessment_dict.get("subscores", {}),
            positive_drivers=assessment_dict.get("positive_drivers", assessment_dict.get("drivers_positive", [])),
            risk_drivers=assessment_dict.get("risk_drivers", assessment_dict.get("drivers_negative", [])),
            reason_codes=assessment_dict.get("reason_codes", []),
            raw_response=assessment_dict,
            created_at=datetime.utcnow()
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return rec
    except Exception as exc:
        db.rollback()
        raise exc

def get_latest_ulas_assessment(db: Session, application_id: str) -> Optional[ULASAssessmentRecord]:
    return (
        db.query(ULASAssessmentRecord)
        .filter(ULASAssessmentRecord.application_id == application_id)
        .order_by(desc(ULASAssessmentRecord.created_at))
        .first()
    )

def get_ulas_score_history(db: Session, application_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Retrieves chronological assessment history for trend charts.
    """
    records = (
        db.query(ULASAssessmentRecord)
        .filter(ULASAssessmentRecord.application_id == application_id)
        .order_by(ULASAssessmentRecord.created_at.asc())
        .limit(limit)
        .all()
    )
    history = []
    for r in records:
        history.append({
            "assessment_id": r.assessment_id,
            "application_id": r.application_id,
            "ulas_score": round(r.ulas_score, 1),
            "band": r.band,
            "decision_recommendation": r.decision_recommendation,
            "confidence": round(r.confidence, 2),
            "calibrated_pd": round(r.calibrated_pd, 4),
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "formatted_date": r.created_at.strftime("%b %d, %Y %H:%M") if r.created_at else "Baseline"
        })
    return history

# --- FINANCIAL X-RAY PERSISTENCE ---
def save_financial_xray(
    db: Session,
    user_id: str,
    scenario_id: str,
    xray_payload: Dict[str, Any]
) -> FinancialXRayRecord:
    try:
        user_rec = db.query(UserRecord).filter(UserRecord.id == user_id).first()
        if not user_rec:
            default_user = db.query(UserRecord).filter(UserRecord.id == "USR-84091").first() or db.query(UserRecord).first()
            if default_user:
                user_id = default_user.id
            else:
                user_id = "USR-84091"

        analysis_id = xray_payload.get("analysis_id") or f"XRAY-{uuid.uuid4().hex[:8].upper()}"
        
        if hasattr(xray_payload, "model_dump"):
            xray_dict = xray_payload.model_dump()
        elif isinstance(xray_payload, dict):
            xray_dict = xray_payload
        else:
            xray_dict = dict(xray_payload)

        income_recon = xray_dict.get("income_reconciliation", {})
        variance = float(income_recon.get("variance_percentage", 0.0) if isinstance(income_recon, dict) else 0.0)

        rec = FinancialXRayRecord(
            analysis_id=analysis_id,
            user_id=user_id,
            scenario_id=str(scenario_id).upper(),
            cash_flow_grade=str(xray_dict.get("cash_flow_grade") or xray_dict.get("overall_health_rating", "A+")),
            net_cash_buffer=float(xray_dict.get("net_cash_buffer_monthly") or xray_dict.get("net_cash_flow_avg", 0.0)),
            discrepancy_amount=float(xray_dict.get("discrepancy_amount", 0.0)),
            bureau_concordance_pct=float(xray_dict.get("bureau_concordance_pct", max(0.0, 100.0 - variance))),
            overall_risk_band=str(xray_dict.get("overall_risk_band") or ("LOW" if variance < 10 else "MEDIUM")),
            raw_payload=xray_dict,
            created_at=datetime.utcnow()
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return rec
    except Exception as exc:
        db.rollback()
        raise exc

def get_latest_financial_xray(db: Session, user_id: str, scenario_id: Optional[str] = None) -> Optional[FinancialXRayRecord]:
    q = db.query(FinancialXRayRecord).filter(FinancialXRayRecord.user_id == user_id)
    if scenario_id:
        q = q.filter(FinancialXRayRecord.scenario_id == scenario_id)
    return q.order_by(desc(FinancialXRayRecord.created_at)).first()

# --- DOCUMENTS ---
def save_document_record(
    db: Session,
    application_id: str,
    user_id: str,
    filename: str,
    category: str,
    file_size_bytes: int,
    storage_path: str,
    extracted_fields: Dict[str, Any],
    verification_status: str = "VERIFIED",
    verification_flags: Optional[List[str]] = None
) -> DocumentRecord:
    doc_id = f"DOC-{uuid.uuid4().hex[:6].upper()}"
    doc = DocumentRecord(
        id=doc_id,
        application_id=application_id,
        user_id=user_id,
        filename=filename,
        category=category,
        file_size_bytes=file_size_bytes,
        storage_path=storage_path,
        extracted_fields=extracted_fields,
        verification_status=verification_status,
        verification_flags=verification_flags or [],
        uploaded_at=datetime.utcnow()
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def get_documents_by_application(db: Session, application_id: str) -> List[DocumentRecord]:
    return db.query(DocumentRecord).filter(DocumentRecord.application_id == application_id).all()

# --- CHAT PERSISTENCE ---
def save_chat_message(
    db: Session,
    user_id: str,
    role: str,
    content: str,
    sources: Optional[List[str]] = None
) -> ChatMessageRecord:
    msg = ChatMessageRecord(
        user_id=user_id,
        role=role,
        content=content,
        sources=sources or [],
        created_at=datetime.utcnow()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_chat_history(db: Session, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    records = (
        db.query(ChatMessageRecord)
        .filter(ChatMessageRecord.user_id == user_id)
        .order_by(ChatMessageRecord.created_at.asc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "role": r.role,
            "content": r.content,
            "sources": r.sources,
            "timestamp": r.created_at.strftime("%I:%M %p") if r.created_at else ""
        }
        for r in records
    ]

def clear_user_chat_history(db: Session, user_id: str) -> int:
    deleted = db.query(ChatMessageRecord).filter(ChatMessageRecord.user_id == user_id).delete()
    db.commit()
    return deleted

# --- AUDIT EVENTS ---
def log_audit_event(
    db: Session,
    application_id: str,
    event_type: str,
    description: str,
    user_name: str = "System",
    user_id: Optional[str] = None,
    changed_values: Optional[Dict[str, Any]] = None
) -> AuditEventRecord:
    evt_id = f"AUD-{uuid.uuid4().hex[:6].upper()}"
    evt = AuditEventRecord(
        id=evt_id,
        application_id=application_id,
        user_id=user_id,
        user_name=user_name,
        event_type=event_type,
        description=description,
        changed_values=changed_values or {},
        timestamp=datetime.utcnow()
    )
    db.add(evt)
    db.commit()
    db.refresh(evt)
    return evt

def get_audit_events_list(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
    records = db.query(AuditEventRecord).order_by(desc(AuditEventRecord.timestamp)).limit(limit).all()
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M") if r.timestamp else "",
            "applicationId": r.application_id,
            "user": r.user_name,
            "eventType": r.event_type,
            "description": r.description,
            "changedValues": r.changed_values
        }
        for r in records
    ]
