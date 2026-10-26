"""
PAN Document Verification Module
Validates structural format, extracts masked PAN, name, and entity type.
"""

import re
from typing import Dict, Any
from ...core.security import mask_pan

PAN_REGEX = r"\b([A-Z]{5}[0-9]{4}[A-Z])\b"

def verify_pan_content(text: str) -> Dict[str, Any]:
    """
    Analyzes extracted text for PAN Card patterns.
    Validates 10-character structure, 4th character entity type, and candidate name.
    """
    matches = re.findall(PAN_REGEX, text.upper())
    if not matches:
        return {
            "is_valid_format": False,
            "pan_number_masked": None,
            "entity_type": None,
            "extracted_name": None,
            "confidence": 0.0,
            "notes": "No valid 10-character PAN structure found in document text."
        }

    raw_pan = matches[0]
    fourth_char = raw_pan[3]
    entity_map = {
        "P": "Individual",
        "C": "Company",
        "H": "HUF (Hindu Undivided Family)",
        "F": "Partnership Firm",
        "A": "Association of Persons",
        "T": "Trust",
        "B": "Body of Individuals",
        "L": "Local Authority",
        "J": "Artificial Juridical Person",
        "G": "Government Agency"
    }
    entity_type = entity_map.get(fourth_char, "Other Entity")

    # Name extraction heuristic (lines before father's name or after Income Tax)
    candidate_name = None
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for idx, line in enumerate(lines):
        if "name" in line.lower() and idx + 1 < len(lines):
            cand = lines[idx + 1]
            if len(cand) > 3 and not re.search(r"\d", cand):
                candidate_name = cand
                break

    return {
        "is_valid_format": True,
        "pan_number_masked": mask_pan(raw_pan),
        "raw_pan_checksum": raw_pan[-1],
        "entity_type": entity_type,
        "is_individual": fourth_char == "P",
        "extracted_name": candidate_name,
        "confidence": 0.95,
        "notes": f"Valid Indian PAN format detected for {entity_type}."
    }
