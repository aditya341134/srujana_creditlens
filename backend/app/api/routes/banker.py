"""
Banker Desk, Governance, Audit Trail & Notifications API Endpoints
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from ...models.domain import (
    audit_events_db,
    notifications_db,
    borrower_profile_db,
    add_audit_event
)
from ...schemas.applications import AuditEventCreate

router = APIRouter(prefix="/api", tags=["Banker & Governance"])

@router.get("/audit-events")
def list_audit_events(limit: int = 50):
    return audit_events_db[:limit]

@router.post("/audit-events", status_code=status.HTTP_201_CREATED)
def create_audit_event(event: AuditEventCreate):
    return add_audit_event(
        app_id=event.applicationId,
        event_type=event.eventType,
        description=event.description,
        user=event.user or "Senior Underwriter",
        changed_values=event.changedValues
    )

@router.get("/notifications")
def list_notifications():
    return notifications_db

@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str):
    for notif in notifications_db:
        if notif.get("id") == notification_id:
            notif["read"] = True
            return {"message": "Notification marked as read", "notification": notif}
    raise HTTPException(status_code=404, detail="Notification not found")

@router.get("/user/profile")
def get_user_profile():
    return borrower_profile_db

@router.put("/user/profile")
def update_user_profile(payload: Dict[str, Any]):
    borrower_profile_db.update(payload)
    return {"message": "Profile updated successfully", "profile": borrower_profile_db}
