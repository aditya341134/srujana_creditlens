"""
No-Dues Affidavit Verification Module
Treats the affidavit as a borrower self-declaration rather than authoritative bank closure proof.
"""

import re
from typing import Dict, Any

def verify_affidavit_content(text: str) -> Dict[str, Any]:
    t = text.lower()

    is_declaration = bool(
        "no dues" in t or
        "solemnly declare" in t or
        "hereby affirm" in t or
        "undertaking" in t
    )

    is_notarized = bool(
        "notary public" in t or
        "sworn before me" in t or
        "advocate & notary" in t or
        "oath commissioner" in t
    )

    claims_no_past_debt = bool(
        "no previous loan" in t or
        "no outstanding liability" in t or
        "free from any encumbrance" in t or
        "zero debt" in t
    )

    return {
        "is_declaration_format": is_declaration,
        "is_notarized": is_notarized,
        "claims_no_past_debt": claims_no_past_debt,
        "legal_status": "Self-Declaration (Requires corroborating verification where external tradelines exist)",
        "confidence": 0.85
    }
