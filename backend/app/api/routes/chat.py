"""
CreditLens AI Finance Assistant API Endpoints
Handles user conversational messages, grounding with active financial data, and chat history.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel

from ...models.domain import (
    chat_history_db,
    user_active_scenario_db,
    financial_xray_db,
    assessments_db,
    borrower_profile_db,
    get_application
)
from ...core.security import get_current_user_from_header
from ...services.chat.assistant import get_assistant_response

router = APIRouter(prefix="/api/chat", tags=["AI Finance Assistant"])

class ChatMessageRequest(BaseModel):
    message: str
    scenario_context: Optional[str] = None

class ChatMessageResponse(BaseModel):
    response: str
    provider: str
    is_grounded: bool
    suggestions: List[str] = []

SUGGESTED_QUESTIONS = [
    "What does my ULAS score mean?",
    "Why did my Financial X-Ray identify an income discrepancy?",
    "What is net cash flow and how is it calculated?",
    "What steps should I take before disputing a bureau discrepancy?",
    "How do I upload and verify my bank statement?",
    "What does a thin credit history mean for my application?"
]

from ...db.session import get_db
from ...db import repository as repo
from sqlalchemy.orm import Session
from fastapi import Depends

@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(
    payload: ChatMessageRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be blank."
        )

    user = get_current_user_from_header(authorization)
    user_id = user.get("sub", "USR-84091")

    # Fetch user's active Financial X-Ray data if available
    active_xray_id = user_active_scenario_db.get(user_id)
    xray_report = financial_xray_db.get(active_xray_id)
    if xray_report:
        xray_dict = xray_report.model_dump() if hasattr(xray_report, "model_dump") else xray_report.dict()
    else:
        xray_dict = None

    # Fetch user's ULAS data if available
    ulas_dict = None
    if assessments_db:
        first_key = next(iter(assessments_db))
        ass = assessments_db[first_key]
        ulas_dict = ass.model_dump() if hasattr(ass, "model_dump") else ass.dict()

    # Get conversation history
    history = chat_history_db.get(user_id, [])

    result = await get_assistant_response(
        query=payload.message,
        user_context={
            "id": user_id,
            "name": user.get("name", borrower_profile_db.get("name", "Borrower")),
            "email": user.get("email", "borrower@creditlens.in")
        },
        conversation_history=history,
        xray_report=xray_dict,
        ulas_data=ulas_dict
    )

    # Append to user chat history in-memory and database
    if user_id not in chat_history_db:
        chat_history_db[user_id] = []
    
    chat_history_db[user_id].append({"role": "user", "text": payload.message})
    chat_history_db[user_id].append({
        "role": "assistant",
        "text": result["response"],
        "provider": result["provider"],
        "is_grounded": result["is_grounded"]
    })

    try:
        repo.save_chat_message(db, user_id=user_id, role="user", content=payload.message)
        repo.save_chat_message(db, user_id=user_id, role="assistant", content=result["response"])
    except Exception as exc:
        print(f"[CreditLens DB] Chat persistence warning: {exc}")

    return ChatMessageResponse(
        response=result["response"],
        provider=result["provider"],
        is_grounded=result["is_grounded"],
        suggestions=SUGGESTED_QUESTIONS[:3]
    )

@router.get("/history")
def get_chat_history(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    user = get_current_user_from_header(authorization)
    user_id = user.get("sub", "USR-84091")
    db_history = repo.get_chat_history(db, user_id)
    if db_history:
        formatted = [{"role": h["role"], "text": h["content"]} for h in db_history]
        return {"user_id": user_id, "history": formatted}
    return {
        "user_id": user_id,
        "history": chat_history_db.get(user_id, [])
    }

@router.delete("/history")
def clear_chat_history(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    user = get_current_user_from_header(authorization)
    user_id = user.get("sub", "USR-84091")
    chat_history_db[user_id] = []
    try:
        repo.clear_user_chat_history(db, user_id)
    except Exception as exc:
        print(f"[CreditLens DB] Chat history clear warning: {exc}")
    return {"message": "Chat history cleared successfully."}

@router.get("/suggestions")
def get_chat_suggestions():
    return {"suggestions": SUGGESTED_QUESTIONS}
