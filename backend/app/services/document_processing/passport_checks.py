"""
Passport Identity Document Verification Module
Parses passport number, MRZ lines, calculates ICAO Doc 9303 check digits,
nationality, and expiration dates.
"""

import re
from typing import Dict, Any, List

def calculate_icao_check_digit(data_str: str) -> str:
    """
    Computes ICAO Doc 9303 check digit using repeating weights [7, 3, 1].
    Digits 0-9 have values 0-9; letters A-Z have values 10-35; '<' has value 0.
    """
    weights = [7, 3, 1]
    total = 0
    for idx, char in enumerate(data_str.upper()):
        weight = weights[idx % 3]
        if '0' <= char <= '9':
            val = int(char)
        elif 'A' <= char <= 'Z':
            val = ord(char) - ord('A') + 10
        elif char == '<':
            val = 0
        else:
            val = 0
        total += val * weight
    return str(total % 10)

def verify_passport_content(text: str) -> Dict[str, Any]:
    """
    Parses Indian passport text and Machine Readable Zone (MRZ).
    Validates ICAO 9303 check digits for passport number, DOB, and expiry.
    """
    passport_match = re.search(r"\b([A-Z]{1}[0-9]{7})\b", text)
    passport_num = passport_match.group(1) if passport_match else None
    masked_passport = f"{passport_num[:2]}XXXXX{passport_num[-1]}" if passport_num else None

    # Check for MRZ Lines (TD3 format: 2 lines of 44 characters)
    mrz_lines: List[str] = []
    for line in text.split("\n"):
        clean = line.strip().replace(" ", "").upper()
        if clean.startswith("P<IND") or clean.startswith("P<") or (len(clean) == 44 and "<" in clean):
            mrz_lines.append(clean)

    has_mrz = len(mrz_lines) >= 2
    mrz_check_digits_valid = False
    mrz_doc_num = None
    mrz_dob = None
    mrz_expiry = None

    if has_mrz:
        line2 = mrz_lines[1]
        if len(line2) >= 44:
            # 1. Document Number (chars 0-8) and Check Digit (char 9)
            doc_data = line2[0:9]
            doc_cd = line2[9]
            expected_doc_cd = calculate_icao_check_digit(doc_data)
            doc_valid = (doc_cd == expected_doc_cd)

            # 2. DOB (chars 13-18) and Check Digit (char 19)
            dob_data = line2[13:19]
            dob_cd = line2[19]
            expected_dob_cd = calculate_icao_check_digit(dob_data)
            dob_valid = (dob_cd == expected_dob_cd)

            # 3. Expiry (chars 21-26) and Check Digit (char 27)
            exp_data = line2[21:27]
            exp_cd = line2[27]
            expected_exp_cd = calculate_icao_check_digit(exp_data)
            exp_valid = (exp_cd == expected_exp_cd)

            mrz_check_digits_valid = doc_valid and dob_valid and exp_valid
            mrz_doc_num = doc_data.replace("<", "")
            mrz_dob = dob_data
            mrz_expiry = exp_data

    # Expiry extraction from visible text
    expiry_match = re.search(r"\b(Expiry|Date of Expiry)[:\s]*([0-9]{2}/[0-9]{2}/[0-9]{4})\b", text, re.IGNORECASE)
    expiry_date = expiry_match.group(2) if expiry_match else None

    return {
        "is_valid_format": bool(passport_num or has_mrz),
        "passport_masked": masked_passport,
        "has_mrz": has_mrz,
        "mrz_check_digits_valid": mrz_check_digits_valid,
        "mrz_line_count": len(mrz_lines),
        "mrz_doc_num": mrz_doc_num,
        "expiry_date": expiry_date,
        "confidence": 0.95 if mrz_check_digits_valid else 0.85 if has_mrz else 0.70 if passport_num else 0.0,
        "limitations": "MRZ checksum validates syntax and structural integrity. Authoritative passport verification requires MEA Passport Seva integration.",
        "notes": f"Passport format analyzed; MRZ check digits valid: {mrz_check_digits_valid}."
    }
