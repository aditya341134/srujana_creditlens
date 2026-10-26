# srujana_creditlens
# CreditLens — Fair and Explainable Creditworthiness Assessment

> **Problem Statement:** F-04 — Fair and Explainable Creditworthiness Assessment  
> **Domain:** Lending and Financial Inclusion  
> **Project Type:** Hackathon Prototype

CreditLens is a prototype designed to help assess the creditworthiness of individuals and small businesses whose financial records may be limited, incomplete, or irregular. It aims to make financial assessment more transparent by presenting evidence, affordability calculations, potential inconsistencies, and understandable explanations instead of relying on a score alone.

> **Important:** CreditLens is a decision-support prototype, not a production lending system. Its scores, thresholds, automated findings, and recommendations must be validated before real-world use. A missing credit history or a flagged anomaly must not automatically be treated as proof that an applicant is unable or unwilling to repay.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Key Features](#key-features)
- [ULAS — Universal Loan Acceptance Score](#ulas--universal-loan-acceptance-score)
- [AI Financial X-Ray](#ai-financial-x-ray)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Data and Database](#data-and-database)
- [Testing and Validation](#testing-and-validation)
- [Security and Responsible Use](#security-and-responsible-use)
- [Current Limitations](#current-limitations)
- [Future Scope](#future-scope)
- [Team Members and Contributions](#team-members-and-contributions)
- [Acknowledgements](#acknowledgements)

---

## Problem Statement

Traditional credit assessment can be difficult for applicants who have limited formal credit history, irregular earnings, seasonal income, or incomplete financial documentation. A single score may not explain the evidence behind an assessment or show an applicant what they could improve.

CreditLens explores a more explainable approach by considering cash flow, existing obligations, income consistency, evidence coverage, and data discrepancies. It is designed to distinguish between:

- **Insufficient evidence:** information needed to make a reliable assessment is missing.
- **Potential inconsistency:** two records or claims do not appear to match and may need verification.
- **Affordability concern:** available information suggests that repayments could place pressure on the applicant's cash flow.
- **Assessment outcome:** a lender's decision made under its documented policy and review process.

These categories should not be treated as interchangeable.

## Proposed Solution

CreditLens provides separate experiences for borrowers and bankers/reviewers.

### Borrower Interface

The borrower-facing experience is intended to let applicants:

- Enter personal, professional, and financial information.
- Submit supporting evidence, such as bank statements or transaction records, where supported.
- View an explainable assessment and application status.
- Explore hypothetical loan amounts, interest rates, and repayment tenures.
- Understand identified information gaps and potential affordability concerns.
- Receive a Credit Readiness Copilot action plan.
- Review financial trends, including seasonal income patterns, where sufficient data is available.

### Banker / Reviewer Interface

The reviewer-facing experience is intended to support:

- A searchable application queue and application status tracking.
- Review of declared information and submitted evidence.
- Financial verification checklists and discrepancy review.
- Cash-flow and repayment-capacity analysis.
- Comparison of hypothetical loan scenarios.
- A decision audit trail containing relevant inputs, evidence states, rule versions, reviewer actions, timestamps, and rationales.
- A readable assessment report with assumptions, limitations, findings, and next steps.

Feature availability depends on the current implementation. See [Current Limitations](#current-limitations) and verify each feature against the running application.

## Key Features

### 1. Explainable Credit Assessment

Present the main factors behind an assessment, such as:

- Monthly income and income consistency.
- Essential expenses and estimated surplus cash flow.
- Existing monthly repayments and proposed EMI.
- Evidence coverage and missing information.
- Relevant discrepancies that require verification.
- Assumptions and limitations affecting the assessment.

### 2. Loan Comparison Simulator

Compare alternative loan scenarios by changing the principal, annual interest rate, or tenure. Results should be labelled **hypothetical** and should not be presented as a lender commitment or approval.

### 3. Financial Verification Checklist

Help reviewers track which records have been received, which periods they cover, what has been checked, and which discrepancies or clarifications remain open.

### 4. Credit Readiness Copilot

Provide practical, evidence-based actions that may help an applicant address identified gaps. Recommendations should be specific, understandable, and linked to the available evidence rather than guaranteeing approval.

### 5. Seasonal Income Intelligence

Where enough historical data is available, examine monthly income variation, recurring high- and low-income periods, and possible mismatches between expected cash inflows and repayment dates.

### 6. Fairness and Decision Audit Trail

Record the evidence and rules used for an assessment, meaningful changes, review actions, and decision rationales. Access to sensitive audit data should be restricted and controlled.

### 7. Potential Anomaly and Inconsistency Review

Flag items such as unusual deposits, repeated transactions, missing periods, or differences between declared and observed information for human review. An anomaly is a **reason to investigate**, not proof of fraud.

---

## ULAS — Universal Loan Acceptance Score

ULAS is the proposed composite scoring framework for CreditLens. It is intended to summarize multiple dimensions of an applicant's financial profile while retaining explanations for the component factors.

### Proposed Dimensions and Weights

| Dimension | Weight | What it is intended to examine |
|---|---:|---|
| Credit Conduct | 35% | Available repayment and credit-conduct evidence |
| Repayment Capacity | 25% | Income, expenses, existing obligations, and estimated affordability |
| Banking Behaviour | 20% | Observed cash-flow patterns and account activity |
| Debt & Collateral Hygiene | 12% | Existing debt information and relevant collateral details, where applicable |
| Profile & Stability | 8% | Relevant stability indicators supported by available information |
| **Total** | **100%** | |

If each component is normalized to a value from 0 to 100, the proposed weighted score is:

`R = (35A + 25B + 20C + 12D + 8E) / 100`

Where `A`, `B`, `C`, `D`, and `E` are the normalized component scores in the order listed above.

### Proposed Score Bands

The following bands are **draft prototype policy pathways**, not validated lending rules:

| Score | Proposed pathway |
|---:|---|
| 88–100 | A+ — potential streamlined review |
| 78–87.9 | A — light-check pathway |
| 70–77.9 | B — conditional review |
| 60–69.9 | C — manual underwriting |
| 45–59.9 | D — weak or incomplete profile; further review may be needed |
| 0–44.9 | E — high concern under the draft framework; review required |

A score band must not independently make a real lending decision. Policy gates, evidence quality, applicable law, lender policy, and human review may change the outcome. Do not describe these bands as validated until they have been tested and approved against suitable historical outcomes.

### Proposed Policy Gates

The draft framework also identifies checks that may need to be completed independently of the composite score:

1. Identity/KYC status.
2. Document integrity and material inconsistencies.
3. Defined adverse credit events, where reliable data is available.
4. Minimum verified income, where required by policy.
5. Repayment capacity and fixed-obligation-to-income ratio.
6. Credit-bureau requirements, where applicable and lawfully available.
7. Relevant age, employment, or business-vintage requirements under lender policy.

Each gate should have a documented definition, configurable threshold, evidence requirement, and version history. Do not invent a pass result when evidence is unavailable.

### Repayment-Capacity Example

A common affordability measure is the fixed-obligation-to-income ratio (FOIR):

`FOIR (%) = ((Existing monthly EMIs + Proposed EMI) / Verified monthly income) × 100`

For example, if verified monthly income is ₹60,000, existing monthly EMIs are ₹10,000, and the proposed EMI is ₹8,000:

`FOIR = ((₹10,000 + ₹8,000) / ₹60,000) × 100 = 30%`

This example illustrates the calculation only. The acceptable threshold depends on lender policy and applicant circumstances.

### Calibration and Transparency

Any mapping from ULAS to a probability of repayment or default must be calibrated using suitable, representative historical data and evaluated for performance and fairness. A mathematical transformation alone does not make a score a calibrated probability. Until validation is completed, ULAS should be described as a **prototype score**, not a guaranteed probability of acceptance or repayment.

---

## AI Financial X-Ray

AI Financial X-Ray is the proposed financial-analysis workflow for extracting useful patterns from submitted financial records and turning them into reviewable findings.

### Intended Analysis

Depending on the data and parsers available, the workflow may examine:

- Recurring salary-like credits and other income patterns.
- Monthly inflows, outflows, and net cash flow.
- Expense patterns and recurring EMI-like payments.
- Balance trends and periods of negative or declining cash flow.
- Income variability and possible seasonal patterns.
- Differences between declared income/obligations and observed transaction evidence.
- Unusual deposits, duplicate-looking transactions, missing periods, and cross-document inconsistencies.

### Intended Output

A financial-analysis report should state:

- Which files or data periods were analyzed.
- Data coverage and any missing periods.
- Extracted income, expenses, obligations, and cash-flow summaries.
- Findings and the transactions or records supporting them.
- Whether each finding is an observation, an inconsistency, or an item requiring verification.
- Known limitations, assumptions, and suggested next verification steps.

### Suggested Visualizations

- Monthly income versus expenses.
- Net cash-flow trend.
- Income consistency over time.
- Expense category breakdown, where categories can be reliably assigned.
- Timeline of findings and clarification status.

A chart or anomaly flag is only as reliable as its underlying data and extraction process. If data is synthetic or simulated, label it clearly as demo data.

---

## System Architecture

The intended high-level architecture is:

```text
Borrower UI (React)                 Banker / Reviewer UI (React)
          |                                      |
          +------------------+-------------------+
                             |
                       HTTP / REST API
                             |
                     FastAPI Backend
                             |
       +---------------------+----------------------+
       |                     |                      |
 Authentication       Assessment & ULAS       Evidence Analysis
 and Authorization    Loan Simulations        Financial X-Ray
       |                     |                      |
       +---------------------+----------------------+
                             |
                   Supabase / PostgreSQL
                  (if configured and integrated)
```

The exact implementation may differ. Update this diagram if the current repository uses a different database, authentication provider, or service boundary.

## Technology Stack

| Layer | Intended technology |
|---|---|
| Frontend | React, JavaScript/TypeScript, Vite, CSS |
| Backend API | Python, FastAPI |
| Data validation | Pydantic |
| Database | Supabase / PostgreSQL, depending on current configuration |
| API testing | FastAPI Swagger UI, HTTP client, or project test suite |
| Version control | Git and GitHub |

Only list packages and services as implemented after confirming the current repository and dependency files.

## Project Structure

The following is an **illustrative structure**. Adjust it to match the actual repository rather than renaming folders just to match this README.

```text
CreditLens/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── assets/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── app/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── models/
│   │   ├── auth.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
├── tests/
├── .gitignore
└── README.md
```

## Prerequisites

Install the tools required by your actual project:

- Git
- Node.js and npm (compatible with the frontend dependencies)
- Python (use the version supported by the backend dependencies)
- A Supabase project or PostgreSQL database, if the backend is configured to use one

Check the project's `package.json`, Python dependency file, and configuration before choosing exact version numbers.

## Setup and Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CreditLens
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the repository's actual clone URL.

### 2. Configure the Backend

Open a terminal in the backend directory. In this example, the directory is `server`:

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If the backend dependency file is named differently or is located elsewhere, use the actual path from your repository.

Create a local `.env` file using the project's `.env.example` as a guide. Never commit real credentials.

### 3. Configure the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
```

Create the frontend environment file required by the current Vite configuration, if applicable. Use only environment variable names referenced by the frontend code.

## Environment Variables

The names below are **examples only**. Check the code and `.env.example` files for the exact names the project expects.

### Backend example

```env
# Examples only — replace with the names used by your backend.
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=
SECRET_KEY=
```

### Frontend example

```env
# Examples only — Vite exposes client-side variables prefixed with VITE_.
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Security notes:

- Do not commit `.env` files or secrets.
- Never expose a database password, service-role key, private API key, or signing secret in frontend code.
- Use a restricted public/anonymous key in the frontend only when appropriate and protect database access with correct policies.
- Store production secrets in the deployment platform's secret manager.
- If an environment variable is not used by the code, remove it from the README rather than implying it is required.

## Running the Application

### Start the Backend

From the backend directory, use the command matching the actual package layout. For example, if the import path is `app.main:app`:

```powershell
uvicorn app.main:app --reload
```

If your `main.py` is at the backend root, the command may instead be:

```powershell
uvicorn main:app --reload
```

Use **only the command that matches the actual location of the FastAPI `app` object**. These are alternatives, not commands to run together.

When the server is running, FastAPI commonly provides interactive API documentation at:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/redoc`

These URLs work only if the application is running on that host and port and the documentation routes have not been disabled.

### Start the Frontend

From the frontend directory:

```powershell
npm run dev
```

Open the local URL printed by Vite in the terminal. It is commonly `http://localhost:5173`, but use the address shown by your running process.

### Connecting the Frontend to the Backend

Set the frontend API base URL to the backend address expected by the code. Confirm that:

- The frontend uses the correct environment variable.
- FastAPI CORS settings allow the local frontend origin.
- Frontend and backend route paths agree.
- Authentication headers/cookies match the backend's implementation.

## API Documentation

If the FastAPI server exposes its OpenAPI documentation, visit `/docs` while the backend is running to inspect the endpoints actually registered by the application.

Potential API areas include:

| API area | Purpose |
|---|---|
| Authentication and profile | User access and profile management |
| Loan applications | Create, retrieve, and track applications |
| Evidence management | Register and review submitted evidence |
| Credit assessment | Generate an explainable assessment |
| Loan simulation | Compare hypothetical repayment scenarios |
| Financial analysis | Summarize transaction patterns and findings |
| Audit trail | Record reviewer actions and decision rationale |

This table describes intended API areas, not a guarantee that every endpoint exists. Use the generated OpenAPI schema or route files as the source of truth for endpoint names, methods, request bodies, and permissions.

## Data and Database

The project may use Supabase/PostgreSQL to store application and assessment information. The final schema should be documented from the actual database migrations or table definitions.

Potential logical entities include:

- Users and roles.
- Borrower profiles.
- Loan applications.
- Evidence metadata and verification status.
- Financial transactions or extracted summaries.
- Assessment results and ULAS component values.
- Loan simulation scenarios.
- Review actions and audit events.

Do not store sensitive financial documents or personally identifiable information without appropriate access controls, retention rules, and security protections. If the repository uses a CSV dataset for demonstration, identify it as synthetic, anonymized, or otherwise appropriately authorized; do not describe it as real customer data unless that is true and its use is authorized.

## Testing and Validation

Before presenting or deploying the project, test the implemented flows and record the results.

Recommended checks:

- Backend imports and starts successfully.
- API validation rejects malformed or out-of-range inputs.
- Authentication and role-based access controls are enforced.
- Borrowers cannot access another borrower's private application or documents.
- Loan simulation calculations are checked against independently calculated examples.
- ULAS component weights and normalization are tested.
- Missing data is handled explicitly instead of silently treated as zero or as a negative result.
- Financial analysis reports data coverage and extraction limitations.
- Anomaly flags can be reviewed and are not automatically labelled as fraud.
- Frontend loading, error, empty, and success states behave correctly.
- Audit events are created for relevant reviewer actions.
- No secrets or real personal financial data are committed to version control.

Document actual test commands, test counts, and results here once verified. Do not report tests as passing unless they were run.

## Security and Responsible Use

CreditLens concerns financial information and potentially consequential decisions. A responsible implementation should:

- Enforce authentication and least-privilege authorization.
- Protect API endpoints and validate all input on the server.
- Restrict access to financial records and uploaded evidence.
- Use secure transport and suitable secret management.
- Avoid logging passwords, tokens, bank-account details, or unnecessary personal information.
- Keep audit records protected against unauthorized modification.
- Explain the evidence and assumptions behind assessments.
- Distinguish missing data from negative evidence.
- Provide a human review path for material discrepancies and adverse outcomes.
- Evaluate model or rule performance across relevant groups before real-world use.
- Follow applicable privacy, lending, consumer-protection, and data-retention requirements.

ULAS is not a substitute for a lender's regulated underwriting process. No score or automated flag should be represented as proof of fraud, guaranteed approval, or a calibrated default probability without appropriate evidence and validation.

## Current Limitations

Complete this section honestly based on the version being submitted. Possible limitations to verify include:

- ULAS weights and score bands are provisional and require validation.
- Historical outcome data may not be available for calibration.
- Document extraction may depend on file formats and data quality.
- Financial findings may require manual verification.
- External identity, bureau, banking, or fraud-detection integrations may not be configured.
- Some interface elements may use simulated or demonstration data.
- Production deployment, monitoring, access reviews, and security testing may remain incomplete.

Remove any item that does not apply, and add the limitations that do. Clearly label features as **Implemented**, **Partially implemented**, **Demo/simulated**, or **Planned** based on verifiable evidence.

## Future Scope

Potential future improvements include:

- Robust document parsing with extraction confidence and source references.
- Stronger cross-document reconciliation and reviewer feedback workflows.
- Calibration and independent evaluation of ULAS using suitable historical outcomes.
- Fairness testing and explainability reviews.
- Better seasonal cash-flow forecasting with uncertainty ranges.
- Secure integrations with authorized financial-data providers.
- Expanded automated and integration tests.
- Deployment monitoring, security audits, and production-grade access controls.
- Accessibility and usability improvements based on borrower and reviewer feedback.

## Team Members and Contributions

Replace the placeholders below with the actual names and work completed by each team member.

| Team Member | Role | Contribution |
|---|---|---|
| `[Member 1 Name]` | Backend Developer | `[FastAPI routes, services, assessment logic, or other completed work]` |
| `[Member 2 Name]` | Frontend Developer | `[React pages, borrower dashboard, banker dashboard, or other completed work]` |
| `[Member 3 Name]` | Data / AI Developer | `[Financial analysis, data processing, ULAS components, or other completed work]` |
| `[Member 4 Name]` | Database / Integration | `[Schema, Supabase/PostgreSQL integration, testing, or other completed work]` |

Adjust the number of rows and descriptions to reflect the actual team. Credit should reflect each person's real contribution.

## Acknowledgements

CreditLens was developed as a prototype for the **F-04: Fair and Explainable Creditworthiness Assessment** problem in the lending and financial-inclusion domain.

Add the actual hackathon name, organizer, mentors, datasets, libraries, and other resources used by your team. Do not claim sponsorship, endorsement, or access to third-party services unless confirmed.

---

## Pre-Submission Checklist

- [ ] Replace all placeholders with correct repository, team, and event information.
- [ ] Match the project structure and run commands to the actual files.
- [ ] Confirm environment variable names from the code.
- [ ] Verify which features are implemented versus simulated or planned.
- [ ] Run and record tests.
- [ ] Add screenshots or a short demo link if permitted.
- [ ] Ensure no secrets, credentials, or private financial data are committed.
- [ ] Confirm the README's ULAS description and limitations match the implementation.
