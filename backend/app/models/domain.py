"""
Domain Data Store & Initial Baseline Seeder
Maintains thread-safe in-memory collections of applications, documents, verification tasks, and audit logs.
"""

import os
import json
from typing import Dict, Any, List, Optional
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

borrower_profile_db: Dict[str, Any] = {
    "name": "Rajesh Kumar & Elena Vance",
    "id": "CL-84091",
    "tier": "Tier B-1 Seasonal Prime",
    "email": "rajesh.elena@artisanoven.com",
    "phone": "+91 98201 44120",
    "businessType": "Artisanal Bakery & Catering (Seasonal Inflows)",
    "annualTurnover": 2400000,
    "averageMonthlyIncome": 125000
}

def get_application(app_id: str) -> Optional[Dict[str, Any]]:
    for a in applications_db:
        if a.get("id") == app_id:
            return a
    return None

def add_audit_event(
    app_id: str,
    event_type: str,
    description: str,
    user: str = "System",
    changed_values: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    from datetime import datetime
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
