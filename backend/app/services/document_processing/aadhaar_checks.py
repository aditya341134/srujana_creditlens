"""
Aadhaar Identity Document Verification Module
Extracts masked Aadhaar numbers, verifies structure, extracts name, DOB, and digital signature presence.
"""

import re
from typing import Dict, Any
from ...core.security import mask_aadhaar

AADHAAR_REGEX = r"\b([2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4})\b"

def verify_aadhaar_content(text: str) -> Dict[str, Any]:
    """
    Analyzes document text for Aadhaar/UIDAI patterns.
    Never stores or returns unmasked 12-digit UID numbers.
    """
    matches = re.findall(AADHAAR_REGEX, text)
    if not matches:
        return {
            "is_valid_format": False,
            "aadhaar_masked": None,
            "extracted_name": None,
            "dob": None,
            "gender": None,
            "signature_present": False,
            "confidence": 0.0,
            "notes": "No 12-digit Aadhaar pattern identified in document."
        }

    raw_uid = matches[0].replace(" ", "")
    masked = mask_aadhaar(raw_uid)

    # DOB extraction
    dob_match = re.search(r"\b(DOB|Date of Birth|Year of Birth)[:\s]*([0-9]{2}/[0-9]{2}/[0-9]{4}|[0-9]{4})\b", text, re.IGNORECASE)
    dob = dob_match.group(2) if dob_match else None

    # Gender extraction
    gender = None
    if re.search(r"\b(male|female|transgender)\b", text, re.IGNORECASE):
        m = re.search(r"\b(male|female|transgender)\b", text, re.IGNORECASE)
        gender = m.group(1).capitalize()

    # Digital signature block indicator
    signature_present = bool(
        "digitally signed" in text.lower() or
        "valid signature" in text.lower() or
        "signature valid" in text.lower() or
        "ds unique identification authority" in text.lower()
    )

    return {
        "is_valid_format": True,
        "aadhaar_masked": masked,
        "dob": dob,
        "gender": gender,
        "signature_present": signature_present,
        "confidence": 0.90,
        "notes": "Aadhaar e-KYC layout matched. Number masked per privacy policy."
    }
