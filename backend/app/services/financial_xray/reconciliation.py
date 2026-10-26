"""
Bureau Reconciliation & Formal Dispute Letter Draft Generator.
Performs cross-referencing between Credit Information Reports (CIR) and verifiable Bank Statement records.
Generates compliant, editable dispute letter drafts without automatic submission.
"""

from datetime import datetime
from typing import Dict, Any, List
from .models import BureauTradelineMatch, DisputeLetterDraft

def generate_dispute_letter(
    borrower_name: str,
    borrower_pan: str,
    bureau_name: str,
    tradeline: BureauTradelineMatch
) -> DisputeLetterDraft:
    """
    Generates a formal, editable draft of a dispute letter to be submitted manually by the borrower.
    Does NOT auto-submit. Highlights evidence dates, amounts, and account control numbers.
    """
    letter_id = f"DISP-{datetime.now().strftime('%Y%m%d')}-{tradeline.tradeline_id[-4:]}"
    today_str = datetime.now().strftime("%d %B %Y")
    
    subject = f"Notice of Disputed Tradeline Information — Account Ref: {tradeline.tradeline_id} ({tradeline.lender_name})"
    
    body = f"""Date: {today_str}

To,
The Grievance Redressal Officer / Dispute Resolution Department
{bureau_name}
India

Subject: Request for Correction / Rectification of Disputed Account Information in Credit Information Report

Dear Sir / Madam,

I am writing to formally request an investigation and factual correction regarding a tradeline currently reported on my Credit Information Report (CIR). 

1. APPLICANT DETAILS:
- Full Name: {borrower_name}
- PAN / Identification: {borrower_pan}
- Dispute Reference ID: {letter_id}

2. DISPUTED TRADELINE DETAILS:
- Reporting Financial Institution: {tradeline.lender_name}
- Account / Tradeline ID: {tradeline.tradeline_id}
- Credit Facility Type: {tradeline.loan_type}
- Status Currently Reported by Bureau: {tradeline.bureau_status}
- Balance Amount Reported: ₹{tradeline.bureau_balance:,.2f}

3. GROUNDS FOR DISPUTE & BANKING EVIDENCE:
Upon reviewing my authenticated bank account statements, I have identified the following discrepancy:
{tradeline.bank_statement_evidence}

Reconciliation Assessment: {tradeline.reconciliation_finding.replace('_', ' ').title()}
The available bank transaction records indicate that the reported delinquency or active status on this tradeline is either outdated or misclassified due to inter-bank clearing timing or administrative delay.

4. RELIEF REQUESTED:
In accordance with the Credit Information Companies (Regulation) Act (CICRA) and relevant RBI master guidelines on credit reporting accuracy:
a) Kindly initiate verification with {tradeline.lender_name} regarding the disputed record.
b) Update my credit record to reflect the accurate repayment and account closure status.
c) Provide an updated Credit Information Report reflecting this rectification.

Attached please find relevant bank statement extracts demonstrating successful debit clearance.

Yours faithfully,

{borrower_name}
Contact: Available on file
"""

    evidence_points = [
        f"Contradicting statement record: {tradeline.bank_statement_evidence}",
        f"Reported bureau status '{tradeline.bureau_status}' with balance ₹{tradeline.bureau_balance:,.2f} recorded on {tradeline.bureau_reported_date}.",
        f"Reconciliation matching confidence: {int(tradeline.matching_confidence * 100)}%."
    ]

    return DisputeLetterDraft(
        letter_id=letter_id,
        generated_at=today_str,
        borrower_name=borrower_name,
        borrower_pan=borrower_pan,
        bureau_name=bureau_name,
        reference_number=tradeline.tradeline_id,
        subject=subject,
        body=body,
        supporting_evidence_points=evidence_points,
        disclaimer="DRAFT ONLY: CreditLens provides this document for review and personal submission. CreditLens does not automatically submit disputes to credit bureaus or guarantee bureau record alterations."
    )
