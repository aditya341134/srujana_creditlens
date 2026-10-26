"""
PDF Text & Table Extraction Engine
Uses pypdf for deterministic native extraction, with page provenance and error handling.
"""

import io
from typing import Dict, Any, List
from pypdf import PdfReader
from ...schemas.documents import DocumentProcessingStatus

def extract_text_from_pdf_bytes(content: bytes) -> Dict[str, Any]:
    """
    Extracts text from PDF bytes.
    Captures page-level provenance, character counts, and extraction status.
    """
    try:
        stream = io.BytesIO(content)
        reader = PdfReader(stream)

        # Check encryption
        if reader.is_encrypted:
            return {
                "status": DocumentProcessingStatus.UNREADABLE,
                "text": "",
                "page_count": 0,
                "pages": [],
                "error": "Document is password-protected or encrypted. Please upload an unprotected PDF."
            }

        page_count = len(reader.pages)
        if page_count == 0:
            return {
                "status": DocumentProcessingStatus.UNREADABLE,
                "text": "",
                "page_count": 0,
                "pages": [],
                "error": "Document contains 0 pages (empty PDF)."
            }

        extracted_pages = []
        full_text_list = []

        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            extracted_pages.append({
                "page_number": idx + 1,
                "text": page_text,
                "char_count": len(page_text)
            })
            full_text_list.append(page_text)

        full_text = "\n\n".join(full_text_list).strip()

        if len(full_text) < 20:
            # Document might be scanned or image-only
            return {
                "status": DocumentProcessingStatus.PARTIALLY_READABLE,
                "text": full_text,
                "page_count": page_count,
                "pages": extracted_pages,
                "extraction_method": "ocr_fallback_required",
                "notes": "Low text density detected. Document appears to be a scanned image."
            }

        return {
            "status": DocumentProcessingStatus.READABLE,
            "text": full_text,
            "page_count": page_count,
            "pages": extracted_pages,
            "extraction_method": "pypdf_native",
            "notes": f"Successfully parsed {page_count} page(s) with {len(full_text)} characters."
        }

    except Exception as e:
        return {
            "status": DocumentProcessingStatus.FAILED,
            "text": "",
            "page_count": 0,
            "pages": [],
            "error": f"Failed to extract text from PDF: {str(e)}"
        }
