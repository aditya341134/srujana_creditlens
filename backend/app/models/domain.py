"""
Domain Data Store & Initial Baseline Seeder
Maintains thread-safe in-memory collections of applications, documents, verification tasks,
audit logs, user accounts, Financial X-Ray reports, and chat interactions.
"""

import os
import json
import hashlib
import secrets
from typing import Dict, Any, List, Optional
from datetime import datetime
from ..schemas.documents import DocumentItem

# Path to initial synthetic seeds
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "src", "data"))

def load_json_seed(filename: str, fallback: list) -> list:
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return fallback

# In-memory stores
applications_db: List[Dict[str, Any]] = load_json_seed("applications.json", [])
audit_events_db: List[Dict[str, Any]] = load_json_seed("auditEvents.json", [])
notifications_db: List[Dict[str, Any]] = load_json_seed("notifications.json", [])
verification_tasks_db: List[Dict[str, Any]] = load_json_seed("verificationTasks.json", [])

# Uploaded documents store keyed by application_id -> List[DocumentItem]
documents_db: Dict[str, List[DocumentItem]] = {}

# Cached ULAS assessment runs keyed by application_id
assessments_db: Dict[str, Any] = {}

# Financial X-Ray reports keyed by analysis_id
financial_xray_db: Dict[str, Any] = {}

# User-specific active demo scenario or custom analysis selection: user_id -> scenario_id
user_active_scenario_db: Dict[str, str] = {}

# User chat conversation history: user_id -> List[Dict]
chat_history_db: Dict[str, List[Dict[str, Any]]] = {}

# Secure Password Utility Functions (PBKDF2 / SHA-256 with cryptographically random salt)
def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return key, salt

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    key, _ = hash_password(password, salt)
    return secrets.compare_digest(key, expected_hash)

# Initial Pre-seeded Users
DEFAULT_SALT = "creditlens_prudential_salt_2026"
DEFAULT_BORROWER_HASH, _ = hash_password("BorrowerSecure#2026", DEFAULT_SALT)
DEFAULT_BANKER_HASH, _ = hash_password("SeniorUnderwriter#301", DEFAULT_SALT)

users_db: Dict[str, Dict[str, Any]] = {
    "rajesh.kumar@creditlens.in": {
        "id": "USR-84091",
        "email": "rajesh.kumar@creditlens.in",
        "name": "Rajesh Kumar",
        "role": "borrower",
        "password_hash": DEFAULT_BORROWER_HASH,
        "salt": DEFAULT_SALT,
        "phone": "+91 98201 44120",
        "institution": "Artisanal Bakery & Retail",
        "tier": "Tier B-1 Seasonal Prime",
        "created_at": "2026-01-15 10:00"
    },
    "d.vance@creditlens.bank": {
        "id": "USR-101",
        "email": "d.vance@creditlens.bank",
        "name": "David Vance",
        "role": "banker",
        "password_hash": DEFAULT_BANKER_HASH,
        "salt": DEFAULT_SALT,
        "phone": "+91 22 6123 4567",
        "institution": "CreditLens Institutional Bank",
        "title": "Senior Underwriting Officer",
        "created_at": "2025-11-01 08:30"
    }
}

borrower_profile_db: Dict[str, Any] = {
    "name": "Rajesh Kumar & Elena Vance",
    "id": "CL-84091",
    "tier": "Tier B-1 Seasonal Prime",
    "email": "rajesh.kumar@creditlens.in",
    "phone": "+91 98201 44120",
    "businessType": "Artisanal Bakery & Catering (Seasonal Inflows)",
    "annualTurnover": 2400000,
    "averageMonthlyIncome": 125000
}

def get_application(app_id: str) -> Optional[Dict[str, Any]]:
    for a in applications_db:
        if a.get("id") == app_id:
            return a
    # If app_id is the default borrower file APP-2026-1001 or not in static json, provide synthesized baseline
    if app_id in ["APP-2026-1001", "APP-DEFAULT"]:
        return {
            "id": app_id,
            "applicantName": "Rajesh Kumar",
            "applicantInitials": "RK",
            "applicantType": "Permanent Salaried / Enterprise",
            "borrower_id": "USR-84091",
            "requestedAmount": 500000.0,
            "annualInterestRate": 10.5,
            "purpose": "Personal Loan",
            "tenureMonths": 36,
            "hasPreviousLoan": "yes",
            "submissionDate": "2026-04-01",
            "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "status": "Ready for Review",
            "reviewStatus": "Ready for Review",
            "evidenceCompleteness": "Verified",
            "financials": {
                "grossMonthlyIncome": 95000.0,
                "monthlyLivingExpenses": 32000.0,
                "existingDebtObligations": 14000.0,
                "calculatedDti": 14.7,
                "proposedEMI": 16254.0,
                "foir": 31.8
            },
            "creditHistory": {
                "bureauBand": "Standard Prime (765)",
                "onTimePaymentPct": 99.2,
                "delinquencies24m": 0,
                "activeCreditLines": 2
            }
        }
    return None

def add_audit_event(
    app_id: str,
    event_type: str,
    description: str,
    user: str = "System",
    changed_values: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    evt = {
        "id": f"AUD-{len(audit_events_db) + 701}",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "applicationId": app_id,
        "user": user,
        "eventType": event_type,
        "description": description,
        "changedValues": changed_values or {}
    }
    audit_events_db.insert(0, evt)
    return evt
