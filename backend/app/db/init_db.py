"""
CreditLens Database Initializer & Baseline Seeder
Creates relational tables and seeds baseline records if database is empty.
"""

import logging
from datetime import datetime
from sqlalchemy.orm import Session
from .session import engine, SessionLocal, get_active_db_type, is_mysql_connected
from .models import (
    Base,
    UserRecord,
    ApplicantProfileRecord,
    ApplicationRecord,
    ULASAssessmentRecord,
    FinancialXRayRecord,
    AuditEventRecord,
    ChatMessageRecord,
    DocumentRecord
)
from ..models.domain import (
    users_db,
    borrower_profile_db,
    applications_db,
    audit_events_db,
    DEFAULT_BORROWER_HASH,
    DEFAULT_BANKER_HASH,
    DEFAULT_SALT
)

logger = logging.getLogger("creditlens.db.init")

def initialize_database():
    """Creates schema tables and populates baseline initial records if empty."""
    try:
        # Create all tables safely
        Base.metadata.create_all(bind=engine)
        logger.info(f"[CreditLens DB] Schema verified for active database ({get_active_db_type()}).")
    except Exception as e:
        logger.error(f"[CreditLens DB] Error creating tables: {e}")
        return

    db: Session = SessionLocal()
    try:
        # 1. Seed Users
        existing_users_count = db.query(UserRecord).count()
        if existing_users_count == 0:
            logger.info("[CreditLens DB] Seeding default authenticated users...")
            for email, u_data in users_db.items():
                user_rec = UserRecord(
                    id=u_data["id"],
                    email=u_data["email"],
                    name=u_data["name"],
                    role=u_data["role"],
                    password_hash=u_data["password_hash"],
                    salt=u_data["salt"],
                    phone=u_data.get("phone", "+91 98201 44120"),
                    institution=u_data.get("institution", "Artisanal Bakery & Retail"),
                    tier=u_data.get("tier", "Tier B-1 Seasonal Prime"),
                    created_at=datetime.utcnow()
                )
                db.add(user_rec)
            db.commit()

        # 2. Seed Applicant Profile
        existing_profile_count = db.query(ApplicantProfileRecord).count()
        if existing_profile_count == 0:
            logger.info("[CreditLens DB] Seeding default applicant profile...")
            profile_rec = ApplicantProfileRecord(
                id="PROF-84091",
                user_id="USR-84091",
                name=borrower_profile_db["name"],
                tier=borrower_profile_db["tier"],
                email=borrower_profile_db["email"],
                phone=borrower_profile_db["phone"],
                business_type=borrower_profile_db["businessType"],
                annual_turnover=float(borrower_profile_db["annualTurnover"]),
                average_monthly_income=float(borrower_profile_db["averageMonthlyIncome"]),
                updated_at=datetime.utcnow()
            )
            db.add(profile_rec)
            db.commit()

        # 3. Seed Applications
        existing_apps_count = db.query(ApplicationRecord).count()
        if existing_apps_count == 0:
            logger.info("[CreditLens DB] Seeding default loan applications...")
            for app_data in applications_db:
                app_rec = ApplicationRecord(
                    id=app_data["id"],
                    user_id=app_data.get("borrower_id", "USR-84091"),
                    applicant_name=app_data.get("applicant_name", "Rajesh Kumar"),
                    business_name=app_data.get("business_name", "Artisanal Bakery & Retail"),
                    product_name=app_data.get("product_name", app_data.get("loan_type", "Personal Loan")),
                    loan_amount=float(app_data.get("requested_amount", 500000.0)),
                    tenure_months=int(app_data.get("tenure_months", 36)),
                    status=app_data.get("status", "SUBMITTED"),
                    stage=app_data.get("stage", "Underwriting Review"),
                    submission_date=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(app_rec)
            db.commit()

        # Ensure baseline borrower application APP-2026-1001 exists for ULAS evaluations
        app_1001 = db.query(ApplicationRecord).filter(ApplicationRecord.id == "APP-2026-1001").first()
        if not app_1001:
            app_1001 = ApplicationRecord(
                id="APP-2026-1001",
                user_id="USR-84091",
                applicant_name="Rajesh Kumar",
                business_name="Artisanal Bakery & Retail",
                product_name="Personal Loan",
                loan_amount=500000.0,
                tenure_months=36,
                status="Ready for Review",
                stage="Underwriting Review",
                submission_date=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(app_1001)
            db.commit()

        # 4. Seed Baseline ULAS Assessment Record for APP-2026-1001
        existing_assessments_count = db.query(ULASAssessmentRecord).count()
        if existing_assessments_count == 0:
            logger.info("[CreditLens DB] Seeding baseline ULAS assessment history...")
            baseline_assessment = ULASAssessmentRecord(
                assessment_id="ULAS-84091-20260401-001",
                application_id="APP-2026-1001",
                user_id="USR-84091",
                ulas_score=78.4,
                band="A",
                decision_recommendation="STANDARD_APPROVAL",
                calibrated_pd=0.22,
                confidence=0.90,
                composite_r=76.8,
                policy_gates={
                    "G1_identity": {"status": "PASS", "rule": "Identity & KYC Verification"},
                    "G2_income": {"status": "PASS", "rule": "Declared vs Observed Income"},
                    "G3_credit": {"status": "PASS", "rule": "36-Month Adverse History"},
                    "G4_floor": {"status": "PASS", "rule": "Net Income Floor Criterion"},
                    "G5_foir": {"status": "PASS", "rule": "FOIR Obligation Ceiling"},
                    "G6_bureau": {"status": "PASS", "rule": "Bureau Score Threshold"},
                    "G7_age": {"status": "PASS", "rule": "Age & Vintage Bounds"}
                },
                subscores={
                    "credit_conduct": {"name": "Credit Conduct", "weight": 35.0, "score": 82.0, "status": "AVAILABLE"},
                    "repayment_capacity": {"name": "Repayment Capacity", "weight": 25.0, "score": 75.0, "status": "AVAILABLE"},
                    "banking_behaviour": {"name": "Banking Behaviour", "weight": 20.0, "score": 78.0, "status": "AVAILABLE"},
                    "debt_collateral_hygiene": {"name": "Debt Hygiene", "weight": 12.0, "score": 72.0, "status": "AVAILABLE"},
                    "profile_stability": {"name": "Profile Stability", "weight": 8.0, "score": 80.0, "status": "AVAILABLE"}
                },
                positive_drivers=[
                    {"name": "Impeccable Repayment History", "impact": "+8.5 pts", "description": "36-month zero 30+ DPD track record across all credit lines."},
                    {"name": "Solid Inflow Seasonality", "impact": "+5.2 pts", "description": "Demonstrated consistent cash buffer during peak operating months."}
                ],
                risk_drivers=[
                    {"name": "Moderate FOIR Level", "impact": "-3.1 pts", "description": "Existing monthly obligations consume 42% of regular observed income."}
                ],
                reason_codes=[
                    {"code": "RC-01", "description": "Standard prime risk band qualification met."},
                    {"code": "RC-02", "description": "Bank statement liquidity ratio exceeds required baseline."}
                ],
                raw_response={},
                created_at=datetime.utcnow()
            )
            db.add(baseline_assessment)
            db.commit()

        # 5. Seed Audit Events
        existing_audits_count = db.query(AuditEventRecord).count()
        if existing_audits_count == 0:
            logger.info("[CreditLens DB] Seeding initial audit events...")
            for evt in audit_events_db[:10]:
                audit_rec = AuditEventRecord(
                    id=evt.get("id", f"AUD-{datetime.utcnow().timestamp()}"),
                    application_id=evt.get("applicationId", "APP-2026-1001"),
                    user_name=evt.get("user", "System"),
                    event_type=evt.get("eventType", "Application Submitted"),
                    description=evt.get("description", "Application received for underwriting."),
                    changed_values=evt.get("changedValues", {}),
                    timestamp=datetime.utcnow()
                )
                db.add(audit_rec)
            db.commit()

    except Exception as exc:
        db.rollback()
        logger.error(f"[CreditLens DB] Error seeding database: {exc}")
    finally:
        db.close()
