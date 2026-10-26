"""
CreditLens + ULAS — Master FastAPI Application
Modular, Auditable Credit Underwriting & Document Processing Service.
"""

from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from .api.routes import auth, applications, documents, verification, assessment, banker, financial_xray, chat
from .models.domain import applications_db, audit_events_db, documents_db
from .db import initialize_database, get_active_db_type, is_mysql_connected

app = FastAPI(
    title="CreditLens + ULAS API",
    description="Explainable Credit Assessment & Universal Loan Acceptance Score (ULAS v0.2) Engine",
    version="1.0.0"
)

# Startup hook to initialize MySQL / Fallback database
@app.on_event("startup")
def on_startup():
    initialize_database()

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(documents.router)
app.include_router(verification.router)
app.include_router(assessment.router)
app.include_router(banker.router)
app.include_router(financial_xray.router)
app.include_router(chat.router)

@app.get("/")
def get_root():
    return {
        "service": "CreditLens + ULAS API",
        "status": "online",
        "version": "1.0.0",
        "engine": "ULAS v0.2 Deterministic",
        "database": get_active_db_type(),
        "mysql_connected": is_mysql_connected(),
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth/login",
            "applications": "/api/applications",
            "documents_upload": "/api/applications/{application_id}/documents",
            "verification_report": "/api/applications/{application_id}/verification-report",
            "ulas_assessment": "/api/assessments/{application_id}",
            "ulas_history": "/api/assessments/{application_id}/history",
            "simulation": "/api/assessments/simulate",
            "audit_trail": "/api/audit-events"
        }
    }

@app.get("/api/health")
def get_health():
    total_docs = sum(len(docs) for docs in documents_db.values())
    return {
        "status": "healthy",
        "engine": "ULAS-0.2.0-deterministic",
        "database": get_active_db_type(),
        "mysql_connected": is_mysql_connected(),
        "applications_count": len(applications_db),
        "audit_events_count": len(audit_events_db),
        "documents_count": total_docs,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting CreditLens API server on http://localhost:8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
