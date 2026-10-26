# CreditLens Database Package
from .session import engine, SessionLocal, get_db, is_mysql_connected, get_active_db_type
from .models import (
    Base,
    UserRecord,
    ApplicantProfileRecord,
    ApplicationRecord,
    DocumentRecord,
    ULASAssessmentRecord,
    FinancialXRayRecord,
    AuditEventRecord,
    ChatMessageRecord
)
from .init_db import initialize_database
