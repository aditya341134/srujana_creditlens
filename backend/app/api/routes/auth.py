"""
Authentication & Authorization API Endpoints
"""

from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter

from ...models.domain import applications_db
from ...core.security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "borrower"

@router.post("/login")
def login(payload: LoginRequest):
    role = payload.role if payload.role in ["banker", "borrower", "user"] else "borrower"
    name = "David Vance (Senior Underwriter)" if role == "banker" else "Rajesh Kumar (Borrower)"
    token = create_access_token(
        user_id="USR-101" if role == "banker" else "USR-84091",
        email=payload.email,
        role=role
    )
    return {
        "token": token,
        "user": {
            "id": "USR-101" if role == "banker" else "USR-84091",
            "name": name,
            "email": payload.email,
            "role": role,
            "institution": "CreditLens Institutional Bank"
        }
    }

@router.post("/register")
def register(user_data: Dict[str, Any]):
    return {
        "message": "User registered successfully",
        "userId": f"USR-{len(applications_db) + 9000}",
        "email": user_data.get("email", "borrower@creditlens.in")
    }

@router.get("/me")
def get_current_user():
    return {
        "id": "USR-101",
        "name": "David Vance",
        "role": "banker",
        "title": "Senior Underwriting Officer",
        "permissions": ["view_applications", "review_assessment", "simulate_loans", "approve_decline"]
    }
