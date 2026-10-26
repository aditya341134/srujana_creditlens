"""
CreditLens AI Finance Assistant Service
Grounded conversational agent for explaining ULAS scores, Financial X-Ray findings,
cash-flow metrics, and credit bureau reconciliation.
Supports real AI providers (Gemini / OpenAI) with intelligent, grounded rule-based fallback.
"""

import os
import re
from typing import Dict, Any, List, Optional
import httpx

SYSTEM_PROMPT = """You are the CreditLens AI Finance Assistant, a knowledgeable, empathetic, and objective financial intelligence advisor.
CreditLens provides explainable creditworthiness assessment through two flagship engines:
1. ULAS (Universal Loan Acceptance Score v0.2)
2. AI Financial X-Ray

CRITICAL DIRECTIVES:
1. Ground your answers strictly in the provided applicant data and verified financial metrics.
2. If certain data is missing or not computable, state this clearly without inventing values.
3. Treat discrepancies (such as declared vs. observed income) as items requiring investigation and documentary verification, NEVER as proof of fraud or deceit.
4. Never guarantee loan approval or a specific credit score increase. Antigravity/CreditLens is a decision-support platform, not an automated final credit authority.
5. Provide actionable, constructive steps the borrower can take (e.g. extending loan tenure, providing Form 16, reviewing bureau tradelines).
6. Maintain a calm, professional, and accessible tone.
"""

CREDITLENS_KNOWLEDGE_BASE = {
    "ulas_definition": (
        "The Universal Loan Acceptance Score (ULAS v0.2) is CreditLens's flagship explainable credit score ranging from 0 to 100. "
        "Unlike black-box bureau scores, ULAS evaluates 5 distinct financial dimensions: Credit Conduct (35%), Repayment Capacity (25%), "
        "Banking Behaviour (20%), Debt & Collateral Hygiene (12%), and Profile Stability (8%). It also verifies 7 hard Underwriting Policy Gates (G1 to G7)."
    ),
    "net_cash_flow": (
        "Net Cash Flow is the difference between total monthly bank inflows (salary, deposits, earnings) and total monthly outflows (living expenses, existing loan EMIs, utility bills, card payments). "
        "A positive net cash flow indicates a surplus buffer to absorb new loan installments, while sustained negative cash flow signals liquidity pressure."
    ),
    "income_mismatch": (
        "A declared-versus-observed income mismatch occurs when self-reported gross earnings differ from regular, identifiable recurring payroll credits in bank statements. "
        "In CreditLens, this is treated as a discrepancy requiring documentation (e.g. tax returns, annual bonus letters, or multiple account statements)—NOT as fraud. Non-income credits like tax refunds, transfers from family, or investment liquidations are excluded from regular debt-servicing capacity."
    ),
    "thin_credit": (
        "A thin credit file refers to an applicant with little or no formal borrowing track record on credit bureau reports (often New-to-Credit). "
        "Instead of rejecting thin-file borrowers, ULAS uses cash-flow banking behaviour, income consistency, and alternative evidence to evaluate repayment capacity fairly."
    ),
    "bureau_dispute": (
        "Before disputing a bureau discrepancy, verify your banking statement records against the bureau tradeline. Look for: "
        "1) An account reported active that you already paid off and closed, "
        "2) A reported 30+ DPD late payment where your bank statement shows timely debit clearance, or "
        "3) Outdated balance figures due to bureau reporting delays. You can generate an editable dispute letter draft directly inside CreditLens."
    ),
    "document_upload": (
        "CreditLens accepts official PDF bank statements (up to 15MB) from all scheduled commercial banks. "
        "Documents undergo SHA-256 integrity verification, digital signature inspection, and field-level masking (e.g. masking Aadhaar and account digits) to ensure data privacy."
    )
}

def generate_rule_based_response(
    query: str,
    user_context: Dict[str, Any],
    xray_report: Optional[Dict[str, Any]] = None,
    ulas_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Intelligent, grounded, deterministic rule-based NLP engine.
    Activated when no external AI API key is configured or when offline.
    """
    q = query.lower().strip()
    
    # Extract contextual numbers if available
    applicant_name = user_context.get("name", "Applicant")
    ulas_score = ulas_data.get("ulas") if ulas_data else None
    ulas_band = ulas_data.get("band") if ulas_data else None
    decision = ulas_data.get("decision_recommendation") if ulas_data else None
    
    xray_status = xray_report.get("overall_health_rating") if xray_report else None
    net_cash_flow = xray_report.get("net_cash_flow_avg") if xray_report else None
    avg_inflow = xray_report.get("monthly_inflows_avg") if xray_report else None
    avg_outflow = xray_report.get("monthly_outflows_avg") if xray_report else None
    income_recon = xray_report.get("income_reconciliation") if xray_report else {}
    anomalies = xray_report.get("anomalies", []) if xray_report else []
    stress_indicators = xray_report.get("stress_indicators", []) if xray_report else []
    
    # 1. ULAS Score Interpretation
    if any(k in q for k in ["ulas", "score", "what does my score mean", "band", "rating"]):
        if ulas_score is not None:
            ans = (
                f"Your authoritative **Universal Loan Acceptance Score (ULAS v0.2)** is **{ulas_score} / 100** (Band **{ulas_band}**), "
                f"with an underwriting recommendation of **{decision.replace('_', ' ') if decision else 'STANDARD_REVIEW'}**.\n\n"
                f"{CREDITLENS_KNOWLEDGE_BASE['ulas_definition']}\n\n"
                f"### How Your Score is Composed:\n"
                f"- **Credit Conduct (35%)**: Evaluates historical on-time formal repayment.\n"
                f"- **Repayment Capacity (25%)**: Measures disposable income surplus relative to proposed installments.\n"
                f"- **Banking Behaviour (20%)**: Checks cash flow consistency and inward return events.\n"
                f"- **Debt Hygiene (12%)**: Assesses credit utilization and active tradelines.\n"
                f"- **Profile Stability (8%)**: Employment vintage and residential stability.\n\n"
                f"*Next Step*: Inspect your policy gates in the **ULAS Assessment** section to see specific driver contributions."
            )
        else:
            ans = (
                f"{CREDITLENS_KNOWLEDGE_BASE['ulas_definition']}\n\n"
                f"To compute your personal ULAS score, submit your loan application or run an assessment on your uploaded financial records."
            )
        return {"response": ans, "provider": "CreditLens Deterministic Financial Engine", "is_grounded": True}

    # 2. Net Cash Flow Inquiry
    if any(k in q for k in ["cash flow", "cashflow", "net cash", "inflow", "outflow", "buffer"]):
        if net_cash_flow is not None:
            status_text = "healthy positive surplus" if net_cash_flow > 0 else "deficit requiring attention"
            ans = (
                f"### Your Net Cash Flow Analysis:\n"
                f"- **Average Monthly Inflow**: ₹{avg_inflow:,.2f}\n"
                f"- **Average Monthly Outflow**: ₹{avg_outflow:,.2f}\n"
                f"- **Net Monthly Cash Flow**: **₹{net_cash_flow:,.2f}** ({status_text})\n\n"
                f"{CREDITLENS_KNOWLEDGE_BASE['net_cash_flow']}\n\n"
                f"A positive net cash flow indicates how much room you have after living costs to safely service a new loan. "
                f"You can explore month-by-month changes in the **AI Financial X-Ray > Cash Flow Trend** visualizer."
            )
        else:
            ans = (
                f"{CREDITLENS_KNOWLEDGE_BASE['net_cash_flow']}\n\n"
                f"Upload your latest 6-month bank statement or load Hackathon Demo Scenario A/B in Financial X-Ray to view your exact monthly cash-flow curve."
            )
        return {"response": ans, "provider": "CreditLens Deterministic Financial Engine", "is_grounded": True}

    # 3. Income Mismatch & Discrepancy
    if any(k in q for k in ["mismatch", "discrepancy", "declared income", "observed income", "differ", "salary"]):
        if income_recon:
            dec = income_recon.get("declared_monthly_income", 0.0)
            obs = income_recon.get("observed_recurring_income", 0.0)
            pct = income_recon.get("variance_percentage", 0.0)
            notes = income_recon.get("classification_notes", "")
            ans = (
                f"### Declared vs. Observed Income Reconciliation:\n"
                f"- **Declared Income**: ₹{dec:,.2f} / month\n"
                f"- **Observed Recurring Payroll**: ₹{obs:,.2f} / month\n"
                f"- **Variance**: {pct}% (Status: **{income_recon.get('status', 'REVIEW')}**)\n\n"
                f"**Engine Note**: {notes}\n\n"
                f"{CREDITLENS_KNOWLEDGE_BASE['income_mismatch']}\n\n"
                f"**Recommended Action**: If you receive secondary income (e.g. freelance earnings, annual performance bonuses, or rental income) that flows into another bank account, "
                f"you can upload those additional statements or provide your latest Income Tax Return (ITR) to corroborate the total figure."
            )
        else:
            ans = (
                f"{CREDITLENS_KNOWLEDGE_BASE['income_mismatch']}\n\n"
                f"You can inspect this comparison in the **AI Financial X-Ray > Income Reconciliation** tab once your statement is processed."
            )
        return {"response": ans, "provider": "CreditLens Deterministic Financial Engine", "is_grounded": True}

    # 4. Financial X-Ray Findings & Anomalies
    if any(k in q for k in ["x-ray", "xray", "anomaly", "stress", "finding", "issue", "identified"]):
        if stress_indicators or anomalies:
            items_text = []
            for s in stress_indicators:
                items_text.append(f"- **{s.get('title')}** ({s.get('severity')}): {s.get('description')}")
            for a in anomalies:
                items_text.append(f"- **{a.get('title')}** (Priority: {a.get('priority')}): {a.get('supporting_evidence')}")
            
            ans = (
                f"### Key Findings from Your AI Financial X-Ray:\n"
                + "\n".join(items_text[:4]) + "\n\n"
                f"**Important Context**: Every finding includes specific supporting transactions, detection rules, and uncertainty levels. "
                f"Findings are highlighted to help you understand what an institutional underwriter looks for and to provide an opportunity to clarify details."
            )
        else:
            ans = (
                f"The AI Financial X-Ray scans for recurring cash-flow patterns, balance depletion, payment bounces, and unusual outsized transactions. "
                f"Load **Scenario A** or **Scenario B** in the Financial X-Ray dashboard to see active findings and explanations."
            )
        return {"response": ans, "provider": "CreditLens Deterministic Financial Engine", "is_grounded": True}

    # 5. Bureau Dispute & Reconciliation
    if any(k in q for k in ["dispute", "bureau", "cibil", "experian", "late payment", "rectify", "wrong"]):
        ans = (
            f"### Bureau Reconciliation & Dispute Guidance:\n"
            f"{CREDITLENS_KNOWLEDGE_BASE['bureau_dispute']}\n\n"
            f"**Action Steps inside CreditLens**:\n"
            f"1. Navigate to **AI Financial X-Ray > Bureau Reconciliation**.\n"
            f"2. Inspect tradelines where your bank statement debits contradict bureau records.\n"
            f"3. Click **Generate Dispute Letter Draft** to download or copy an official, pre-filled representation letter citing CICRA guidelines.\n"
            f"4. Verify the dates with your lender's statement of account before personal submission."
        )
        return {"response": ans, "provider": "CreditLens Deterministic Financial Engine", "is_grounded": True}

    # 6. Upload & Document Guidelines
    if any(k in q for k in ["upload", "document", "statement", "pdf", "file"]):
        ans = (
            f"### Document Intake & Privacy Protocol:\n"
            f"{CREDITLENS_KNOWLEDGE_BASE['document_upload']}\n\n"
            f"**Supported Documents**:\n"
            f"- Bank Account Statements (Savings / Current, 3 to 12 months)\n"
            f"- Identity Verification (PAN, Aadhaar with automated masking)\n"
            f"- Credit Information Reports (CIBIL, Experian, Equifax PDF)\n\n"
            f"You can upload records in the **Evidence & Documents** or **Financial X-Ray** sections."
        )
        return {"response": ans, "provider": "CreditLens Deterministic Financial Engine", "is_grounded": True}

    # 7. Thin Credit History
    if any(k in q for k in ["thin", "new to credit", "no credit", "no cibil", "first loan"]):
        ans = (
            f"### Guidance for Thin-File & New-to-Credit Borrowers:\n"
            f"{CREDITLENS_KNOWLEDGE_BASE['thin_credit']}\n\n"
            f"**Key Factors that Strengthen a Thin-File Application**:\n"
            f"- Demonstrating at least 6 months of uninterrupted salary credits.\n"
            f"- Maintaining an average month-end balance above 1.5x your proposed EMI.\n"
            f"- Keeping utility and telecommunication bills paid on time without mandate returns."
        )
        return {"response": ans, "provider": "CreditLens Deterministic Financial Engine", "is_grounded": True}

    # Default Helpful Financial Response
    ans = (
        f"Hello {applicant_name}, I am your CreditLens AI Finance Assistant. I can help explain:\n"
        f"1. **Your ULAS Score**: How your creditworthiness is evaluated across 5 transparent dimensions.\n"
        f"2. **AI Financial X-Ray Findings**: Understanding net cash flow, spending breakdown, and stress factors.\n"
        f"3. **Income Reconciliation**: Why declared income may differ from observable bank credits.\n"
        f"4. **Bureau Reconciliation & Disputes**: How to detect discrepancies and generate formal dispute drafts.\n"
        f"5. **Document Verification**: Requirements for bank statements and identity proofs.\n\n"
        f"Feel free to ask a specific question or select one of the suggested prompts above!"
    )
    return {"response": ans, "provider": "CreditLens Deterministic Financial Engine", "is_grounded": True}

async def get_assistant_response(
    query: str,
    user_context: Dict[str, Any],
    conversation_history: Optional[List[Dict[str, str]]] = None,
    xray_report: Optional[Dict[str, Any]] = None,
    ulas_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Main entrypoint for AI Finance Assistant.
    Attempts calling configured AI providers (Gemini / OpenAI), gracefully falling back
    to the verified CreditLens deterministic intelligence engine.
    """
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    
    # 1. Try Gemini Provider if configured
    if gemini_key:
        try:
            # Build context payload
            context_summary = f"""APPLICANT CONTEXT:
Name: {user_context.get('name', 'Applicant')}
Email: {user_context.get('email', 'N/A')}

ULAS DATA:
{ulas_data if ulas_data else 'Assessment pending or not yet run.'}

FINANCIAL X-RAY SUMMARY:
{xray_report if xray_report else 'Financial X-Ray not yet generated.'}
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"{SYSTEM_PROMPT}\n\n{context_summary}\n\nUser Question: {query}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 800
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "response": text,
                        "provider": "Google Gemini 1.5 Flash (Grounded on CreditLens Data)",
                        "is_grounded": True
                    }
        except Exception as e:
            # Fall through to deterministic engine
            pass

    # 2. Try OpenAI Provider if configured
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Context: {xray_report or {}}\nULAS: {ulas_data or {}}\nQuestion: {query}"}
            ]
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.2}
                )
                if res.status_code == 200:
                    data = res.json()
                    text = data["choices"][0]["message"]["content"]
                    return {
                        "response": text,
                        "provider": "OpenAI (Grounded on CreditLens Data)",
                        "is_grounded": True
                    }
        except Exception:
            pass

    # 3. Deterministic, fully grounded CreditLens Rule-Based Engine
    return generate_rule_based_response(query, user_context, xray_report, ulas_data)
