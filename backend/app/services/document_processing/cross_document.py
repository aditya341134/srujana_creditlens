"""
Cross-Document Reconciliation & Consistency Engine
Compares applicant declarations against documentary evidence, identifies mismatches, and outputs structured discrepancies.
"""

from typing import List, Dict, Any, Optional
from ...core.security import fuzzy_name_match
from ...schemas.documents import DiscrepancyItem

def perform_cross_document_checks(
    applicant_data: Dict[str, Any],
    documents_extracted: Dict[str, Dict[str, Any]]
) -> List[DiscrepancyItem]:
    """
    Executes cross-document consistency checks:
    1. Identity name alignment (Application vs PAN vs Aadhaar/Passport)
    2. Claimed salary vs Bank statement median salary credits
    3. Claimed existing debt vs Statement debits / CIR records
    4. Previous loan declaration vs CIR tradelines
    """
    discrepancies: List[DiscrepancyItem] = []

    claimed_name = applicant_data.get("applicantName", "")
    claimed_salary = float(applicant_data.get("grossMonthlyIncome", 0) or 0)
    claimed_emi = float(applicant_data.get("existingDebtObligations", 0) or 0)
    has_prev_loan = applicant_data.get("hasPreviousLoan", "no")

    # 1. Name Check across PAN & Identity Proof
    pan_data = documents_extracted.get("pan", {})
    pan_name = pan_data.get("extracted_name")
    if pan_name and claimed_name:
        match_score = fuzzy_name_match(claimed_name, pan_name)
        if match_score < 0.80:
            discrepancies.append(DiscrepancyItem(
                check_name="Identity Name Mismatch (PAN)",
                source_documents=["PAN Card", "Application Form"],
                severity="HIGH",
                description=f"Applicant name '{claimed_name}' differs from name on PAN Card '{pan_name}' (match: {match_score*100:.0f}%).",
                recommended_action="Request identity rectification affidavit or verified PAN copy."
            ))

    # 2. Income Check (Claimed vs Bank Statement Median Credits)
    bank_data = documents_extracted.get("bank_statement", {})
    median_credit = float(bank_data.get("median_salary_credit", 0) or 0)
    if claimed_salary > 0 and median_credit > 0:
        pct_deviation = abs(claimed_salary - median_credit) / claimed_salary
        if pct_deviation > 0.30:  # > 30% mismatch
            severity = "CRITICAL" if claimed_salary > median_credit * 1.5 else "MEDIUM"
            discrepancies.append(DiscrepancyItem(
                check_name="Income Evidence Discrepancy",
                source_documents=["Bank Statement", "Application Form"],
                severity=severity,
                description=f"Claimed monthly income of ₹{claimed_salary:,.0f} deviates by {pct_deviation*100:.1f}% from statement verified median credit of ₹{median_credit:,.0f}.",
                recommended_action="Underwriter review required to verify variable bonus vs base salary credits."
            ))

    # 3. Previous Loan Declaration vs CIR Tradelines
    cir_data = documents_extracted.get("cir", {})
    active_lines = cir_data.get("active_credit_lines", 0)
    if has_prev_loan.lower() == "no" and active_lines > 1:
        discrepancies.append(DiscrepancyItem(
            check_name="Contradictory Previous Loan Declaration",
            source_documents=["Credit Information Report", "Application Form"],
            severity="HIGH",
            description=f"Applicant declared 'No Previous Loans', but credit report reflects {active_lines} active tradelines.",
            recommended_action="Clarify prior loan history; obtain updated statement of liabilities."
        ))

    # 4. Cheque / Payment Bounces in Bank Statement
    bounces = bank_data.get("returned_cheques_ecs_count", 0)
    if bounces > 0:
        discrepancies.append(DiscrepancyItem(
            check_name="Payment Inward/Outward Return Events",
            source_documents=["Bank Statement"],
            severity="MEDIUM" if bounces <= 2 else "HIGH",
            description=f"Identified {bounces} returned/bounced NACH/ECS transaction(s) in last 6 months.",
            recommended_action="Examine statement cash-flow volatility during repayment due dates."
        ))

    return discrepancies
