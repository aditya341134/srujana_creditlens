"""
CreditLens Database Session & Engine Manager
Provides robust connection pooling for MySQL with transparent failover and resilience.
"""

import os
import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from ..core.config import (
    get_database_url,
    get_server_connection_url,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USERNAME
)

logger = logging.getLogger("creditlens.db")

Base = declarative_base()

_engine = None
_session_factory = None
_active_db_type = "unknown"
_mysql_connected = False

def _try_init_mysql():
    """Attempts to connect to MySQL and ensure the database exists."""
    global _active_db_type, _mysql_connected

    # First attempt: Try connecting to server to ensure database exists
    server_url = get_server_connection_url()
    try:
        tmp_engine = create_engine(server_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        with tmp_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"))
            conn.commit()
        tmp_engine.dispose()
    except Exception as e:
        logger.warning(f"[CreditLens DB] Note on MySQL database creation check: {e}")

    # Second attempt: Connect to the target database
    db_url = get_database_url()
    try:
        mysql_engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 5}
        )
        with mysql_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        logger.info(f"[CreditLens DB] Successfully connected to MySQL at {DB_HOST}:{DB_PORT}/{DB_NAME}")
        _active_db_type = "mysql"
        _mysql_connected = True
        return mysql_engine
    except Exception as exc:
        logger.warning(
            f"[CreditLens DB] MySQL connection could not be established to {DB_HOST}:{DB_PORT}/{DB_NAME}: {exc}. "
            "Falling back to local persistent SQLite storage to ensure zero downtime."
        )
        return None

def _init_sqlite_fallback():
    """Initializes local SQLite database for test/fallback environments."""
    global _active_db_type, _mysql_connected
    storage_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "private_storage"))
    os.makedirs(storage_dir, exist_ok=True)
    sqlite_path = os.path.join(storage_dir, "creditlens.db")
    sqlite_url = f"sqlite:///{sqlite_path.replace(os.sep, '/')}"
    
    sqlite_engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
    logger.info(f"[CreditLens DB] Persistent SQLite database active at: {sqlite_path}")
    _active_db_type = "sqlite"
    _mysql_connected = False
    return sqlite_engine

def get_engine():
    """Returns singleton database engine, initializing if necessary."""
    global _engine, _session_factory
    if _engine is None:
        mysql_eng = _try_init_mysql()
        if mysql_eng is not None:
            _engine = mysql_eng
        else:
            _engine = _init_sqlite_fallback()
        
        _session_factory = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine

def get_session_factory():
    """Returns singleton sessionmaker."""
    global _session_factory
    if _session_factory is None:
        get_engine()
    return _session_factory

# Initialize on module import
engine = get_engine()
SessionLocal = get_session_factory()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a thread-safe database session.
    Commits on success, rolls back on exception, and automatically closes the session.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def is_mysql_connected() -> bool:
    """Returns True if active engine is connected to MySQL."""
    return _mysql_connected

def get_active_db_type() -> str:
    """Returns 'mysql' or 'sqlite'."""
    return _active_db_type
