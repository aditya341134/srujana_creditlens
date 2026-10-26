"""
Document Processing & Verification Schemas
Strictly implementing the 11-dimension verification report contract and Section 12/13 requirements.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class DocumentCategory(str, Enum):
    AADHAAR = "Aadhaar"
    PASSPORT = "Passport"
    PAN = "PAN"
    BANK_STATEMENT = "Bank Statement"
    CIR = "Credit Information Report"
    NO_DUES_AFFIDAVIT = "No Dues Affidavit"
    UNKNOWN = "Unknown"

class DocumentProcessingStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READABLE = "READABLE"
    PARTIALLY_READABLE = "PARTIALLY_READABLE"
    UNREADABLE = "UNREADABLE"
    FAILED = "FAILED"

class DocumentVerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    NEEDS_MANUAL_REVIEW = "NEEDS_MANUAL_REVIEW"
    VERIFICATION_FAILED = "VERIFICATION_FAILED"
    MISSING = "MISSING"
    UNREADABLE = "UNREADABLE"

# Section 13 Table Granular Dimension Enums
class DocumentRequiredStatus(str, Enum):
    COMPULSORY = "COMPULSORY"
    CONDITIONALLY_REQUIRED = "CONDITIONALLY_REQUIRED"
    OPTIONAL = "OPTIONAL"

class FileProcessingStatus(str, Enum):
    READABLE = "READABLE"
    UNREADABLE = "UNREADABLE"
    PROTECTED = "PROTECTED"
    FAILED = "FAILED"

class ExtractionStatus(str, Enum):
    COMPLETE = "COMPLETE"
    PARTIAL = "PARTIAL"
    UNCERTAIN = "UNCERTAIN"
    FAILED = "FAILED"

class DigitalSignatureStatus(str, Enum):
    PRESENT_VALID = "PRESENT_VALID"
    PRESENT_UNVERIFIED_TRUST = "PRESENT_UNVERIFIED_TRUST"
    ABSENT = "ABSENT"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class SignerTrustStatus(str, Enum):
    TRUSTED = "TRUSTED"
    UNTRUSTED = "UNTRUSTED"
    UNKNOWN = "UNKNOWN"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class AuthoritativeVerificationStatus(str, Enum):
    COMPLETED_PASSED = "COMPLETED_PASSED"
    COMPLETED_FAILED = "COMPLETED_FAILED"
    UNAVAILABLE = "UNAVAILABLE"
    NOT_AUTHORIZED = "NOT_AUTHORIZED"
    PENDING = "PENDING"

class ConsistencyStatus(str, Enum):
    CONSISTENT = "CONSISTENT"
    DISCREPANCY = "DISCREPANCY"
    UNRESOLVED = "UNRESOLVED"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"

class ReviewStatus(str, Enum):
    NOT_REQUIRED = "NOT_REQUIRED"
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"

# Canonical Document Item Schema for Uploaded PDFs
class DocumentItem(BaseModel):
    document_id: str
    application_id: str
    filename: str
    category: DocumentCategory
    detected_category: Optional[DocumentCategory] = None
    file_size_bytes: int
    sha256_hash: str
    uploaded_at: str
    uploaded_by: str
    processing_status: DocumentProcessingStatus
    verification_status: DocumentVerificationStatus
    digital_signature_present: bool = False
    digital_signature_valid: bool = False
    authoritative_verified: bool = False
    extracted_fields: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = None

class DiscrepancyItem(BaseModel):
    check_name: str
    source_documents: List[str]
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    description: str
    recommended_action: str

# Section 13 Document Report Item
class DocumentReportItem(BaseModel):
    document_type: str
    required_status: DocumentRequiredStatus
    file_processing: FileProcessingStatus
    extraction_status: ExtractionStatus
    digital_signature_status: DigitalSignatureStatus
    signer_trust_status: SignerTrustStatus
    authoritative_verification: AuthoritativeVerificationStatus
    consistency_status: ConsistencyStatus
    review_status: ReviewStatus
    findings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    review_actions: List[str] = Field(default_factory=list)

class VerificationReportResponse(BaseModel):
    application_id: str
    overall_evidence_quality: str
    checklist_status: Dict[str, str]
    documents: List[DocumentItem]
    document_reports: List[DocumentReportItem] = Field(default_factory=list)
    discrepancies: List[DiscrepancyItem]
    checks_performed: List[Dict[str, Any]]
    generated_at: str
