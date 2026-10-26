"""
Secure Private Storage Service for Document Uploads
Enforces 15 MB limit, SHA-256 fingerprinting, magic bytes inspection, and isolated storage.
"""

import os
import hashlib
from typing import Tuple, Dict, Any, Optional
from fastapi import UploadFile, HTTPException, status
from ..core.config import MAX_DOCUMENT_SIZE_BYTES, STORAGE_DIRECTORY

# Base storage path inside backend
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SECURE_STORAGE_ROOT = os.path.join(BASE_DIR, "private_storage", "documents")

def ensure_storage_dir(application_id: str) -> str:
    app_dir = os.path.join(SECURE_STORAGE_ROOT, application_id)
    os.makedirs(app_dir, exist_ok=True)
    return app_dir

def calculate_sha256(content: bytes) -> str:
    """Calculates SHA-256 digest of byte contents."""
    h = hashlib.sha256()
    h.update(content)
    return h.hexdigest()

def validate_pdf_content(content: bytes, filename: str) -> None:
    """
    Validates that file content is a non-empty, valid PDF file under 15MB.
    Checks PDF magic bytes (%PDF-).
    """
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file '{filename}' is empty (0 bytes)."
        )
    
    if len(content) > MAX_DOCUMENT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of 15 MB (Received {len(content) / (1024*1024):.2f} MB)."
        )

    # Magic bytes check: PDF specification requires files to start with '%PDF-'
    # Allow some leading whitespace/newlines if present
    header = content[:1024]
    if b"%PDF-" not in header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{filename}' is not a valid PDF document (missing %PDF header)."
        )

def save_document_file(
    application_id: str,
    file_bytes: bytes,
    filename: str,
    category: str
) -> Dict[str, Any]:
    """
    Saves document to private isolated directory after validation.
    Returns metadata dict.
    """
    validate_pdf_content(file_bytes, filename)
    sha256_hash = calculate_sha256(file_bytes)
    app_dir = ensure_storage_dir(application_id)

    safe_category = category.lower().replace(" ", "_")
    safe_filename = f"{safe_category}_{sha256_hash[:8]}.pdf"
    file_path = os.path.join(app_dir, safe_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return {
        "file_path": file_path,
        "filename": safe_filename,
        "original_name": filename,
        "file_size": len(file_bytes),
        "sha256": sha256_hash
    }
