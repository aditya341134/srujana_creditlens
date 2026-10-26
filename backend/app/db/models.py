"""
CreditLens Database ORM Schema Definitions
Defines relational models for users, applications, documents, ULAS score history,
Financial X-Ray reports, audit logs, and AI assistant interactions.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    Text,
    ForeignKey,
    Boolean,
    JSON
)
from sqlalchemy.orm import relationship
from .session import Base

class UserRecord(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    role = Column(String(32), default="borrower", nullable=False)
    password_hash = Column(String(128), nullable=False)
    salt = Column(String(64), nullable=False)
    phone = Column(String(32), nullable=True)
    institution = Column(String(128), nullable=True)
    tier = Column(String(64), default="Standard", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    applications = relationship("ApplicationRecord", back_populates="user", cascade="all, delete-orphan")
    ulas_assessments = relationship("ULASAssessmentRecord", back_populates="user", cascade="all, delete-orphan")
    xray_records = relationship("FinancialXRayRecord", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessageRecord", back_populates="user", cascade="all, delete-orphan")

class ApplicantProfileRecord(Base):
    __tablename__ = "applicant_profiles"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    tier = Column(String(64), nullable=True)
    email = Column(String(128), nullable=False)
    phone = Column(String(32), nullable=True)
    business_type = Column(String(128), nullable=True)
    annual_turnover = Column(Float, default=0.0, nullable=False)
    average_monthly_income = Column(Float, default=0.0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class ApplicationRecord(Base):
    __tablename__ = "applications"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    applicant_name = Column(String(128), nullable=False)
    business_name = Column(String(128), nullable=True)
    product_name = Column(String(64), default="Personal Loan", nullable=False)
    loan_amount = Column(Float, default=500000.0, nullable=False)
    tenure_months = Column(Integer, default=36, nullable=False)
    status = Column(String(32), default="SUBMITTED", nullable=False)
    stage = Column(String(64), default="Underwriting Review", nullable=False)
    submission_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("UserRecord", back_populates="applications")
    documents = relationship("DocumentRecord", back_populates="application", cascade="all, delete-orphan")
    ulas_assessments = relationship("ULASAssessmentRecord", back_populates="application", cascade="all, delete-orphan")

class DocumentRecord(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, index=True)
    application_id = Column(String(64), ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    storage_path = Column(String(512), nullable=False)
    extracted_fields = Column(JSON, default=dict, nullable=False)
    verification_status = Column(String(32), default="VERIFIED", nullable=False)
    verification_flags = Column(JSON, default=list, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    application = relationship("ApplicationRecord", back_populates="documents")

class ULASAssessmentRecord(Base):
    """
    Stores historical and current ULAS evaluations.
    Maintains a versioned audit trail of scores without overwriting previous assessments.
    """
    __tablename__ = "ulas_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    assessment_id = Column(String(64), unique=True, index=True, nullable=False)
    application_id = Column(String(64), ForeignKey("applications.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    ulas_score = Column(Float, index=True, nullable=False) # Standardized 0 to 100
    band = Column(String(8), nullable=False)               # A+, A, B, C, D, E
    decision_recommendation = Column(String(64), nullable=False)
    calibrated_pd = Column(Float, default=0.0, nullable=False)
    confidence = Column(Float, default=1.0, nullable=False)
    composite_r = Column(Float, default=0.0, nullable=False)
    policy_gates = Column(JSON, default=dict, nullable=False)
    subscores = Column(JSON, default=dict, nullable=False)
    positive_drivers = Column(JSON, default=list, nullable=False)
    risk_drivers = Column(JSON, default=list, nullable=False)
    reason_codes = Column(JSON, default=list, nullable=False)
    raw_response = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationships
    application = relationship("ApplicationRecord", back_populates="ulas_assessments")
    user = relationship("UserRecord", back_populates="ulas_assessments")

class FinancialXRayRecord(Base):
    __tablename__ = "financial_xray_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    scenario_id = Column(String(32), default="SCENARIO_A", nullable=False)
    cash_flow_grade = Column(String(16), default="A+", nullable=False)
    net_cash_buffer = Column(Float, default=0.0, nullable=False)
    discrepancy_amount = Column(Float, default=0.0, nullable=False)
    bureau_concordance_pct = Column(Float, default=100.0, nullable=False)
    overall_risk_band = Column(String(16), default="LOW", nullable=False)
    raw_payload = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationships
    user = relationship("UserRecord", back_populates="xray_records")

class AuditEventRecord(Base):
    __tablename__ = "audit_events"

    id = Column(String(64), primary_key=True, index=True)
    application_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), index=True, nullable=True)
    user_name = Column(String(128), default="System", nullable=False)
    event_type = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    changed_values = Column(JSON, default=dict, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

class ChatMessageRecord(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String(16), nullable=False) # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    sources = Column(JSON, default=list, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    # Relationships
    user = relationship("UserRecord", back_populates="chat_messages")
