"""
Document Classification Service
Analyzes document text, headings, layout, and keywords to classify document type.
Flags discrepancies between user-declared category and detected category.
"""

from typing import Tuple, Optional
from ...schemas.documents import DocumentCategory

def classify_document_text(text: str, declared_category: str) -> Tuple[DocumentCategory, float, bool]:
    """
    Classifies extracted text into a DocumentCategory.
    Returns: (detected_category, confidence, has_category_mismatch)
    """
    decl_map = {
        "aadhaar": DocumentCategory.AADHAAR,
        "passport": DocumentCategory.PASSPORT,
        "pan": DocumentCategory.PAN,
        "bank statement": DocumentCategory.BANK_STATEMENT,
        "credit information report": DocumentCategory.CIR,
        "cir": DocumentCategory.CIR,
        "no dues affidavit": DocumentCategory.NO_DUES_AFFIDAVIT,
        "no dues": DocumentCategory.NO_DUES_AFFIDAVIT
    }
    expected_enum = decl_map.get(declared_category.lower(), DocumentCategory.UNKNOWN)

    if not text:
        if expected_enum != DocumentCategory.UNKNOWN:
            return expected_enum, 0.30, False
        return DocumentCategory.UNKNOWN, 0.0, True

    t = text.lower()

    # Keyword scoring
    scores = {
        DocumentCategory.AADHAAR: 0,
        DocumentCategory.PASSPORT: 0,
        DocumentCategory.PAN: 0,
        DocumentCategory.BANK_STATEMENT: 0,
        DocumentCategory.CIR: 0,
        DocumentCategory.NO_DUES_AFFIDAVIT: 0
    }

    # Aadhaar signals
    if "unique identification authority of india" in t or "uidai" in t or "aadhaar" in t or "mera aadhaar" in t or "enrolment no" in t:
        scores[DocumentCategory.AADHAAR] += 5
    if "vid :" in t or "help@uidai.gov.in" in t or "resident" in t:
        scores[DocumentCategory.AADHAAR] += 3

    # Passport signals
    if "republic of india" in t and "passport" in t:
        scores[DocumentCategory.PASSPORT] += 6
    if "p<ind" in t or "type / type p" in t or "mrz" in t or "nationality indian" in t:
        scores[DocumentCategory.PASSPORT] += 5

    # PAN signals
    if "income tax department" in t or "permanent account number" in t or "pan card" in t:
        scores[DocumentCategory.PAN] += 6
    if "father's name" in t and ("signature" in t or "date of birth" in t) and len(text) < 1500:
        scores[DocumentCategory.PAN] += 3

    # Bank statement signals
    if "account statement" in t or "statement of account" in t or "transaction date" in t or "withdrawal" in t or "deposit" in t:
        scores[DocumentCategory.BANK_STATEMENT] += 4
    if "balance" in t and ("ifsc" in t or "account number" in t or "cr/dr" in t or "cheque" in t):
        scores[DocumentCategory.BANK_STATEMENT] += 4

    # CIR (Credit Information Report) signals
    if "cibil" in t or "equifax" in t or "experian" in t or "crif high mark" in t or "credit information report" in t:
        scores[DocumentCategory.CIR] += 6
    if "tradeline" in t or "dpd" in t or "score:" in t or "credit score" in t:
        scores[DocumentCategory.CIR] += 4

    # No Dues Affidavit signals
    if "no dues" in t or "affidavit" in t or "undertaking" in t or "hereby declare" in t:
        scores[DocumentCategory.NO_DUES_AFFIDAVIT] += 5
    if "notary" in t or "sworn before me" in t or "solemnly affirm" in t:
        scores[DocumentCategory.NO_DUES_AFFIDAVIT] += 4

    # Best match
    best_cat = max(scores, key=scores.get)
    best_score = scores[best_cat]

    if best_score == 0:
        if expected_enum != DocumentCategory.UNKNOWN:
            return DocumentCategory.UNKNOWN, 0.10, True
        return DocumentCategory.UNKNOWN, 0.10, False

    confidence = min(1.0, best_score / 6.0)

    # Map user declared string to enum
    decl_map = {
        "aadhaar": DocumentCategory.AADHAAR,
        "passport": DocumentCategory.PASSPORT,
        "pan": DocumentCategory.PAN,
        "bank statement": DocumentCategory.BANK_STATEMENT,
        "credit information report": DocumentCategory.CIR,
        "cir": DocumentCategory.CIR,
        "no dues affidavit": DocumentCategory.NO_DUES_AFFIDAVIT,
        "no dues": DocumentCategory.NO_DUES_AFFIDAVIT
    }
    expected_enum = decl_map.get(declared_category.lower(), DocumentCategory.UNKNOWN)

    # Check mismatch if confident
    mismatch = False
    if confidence >= 0.6 and expected_enum != DocumentCategory.UNKNOWN and best_cat != expected_enum:
        mismatch = True

    return best_cat, round(confidence, 2), mismatch
