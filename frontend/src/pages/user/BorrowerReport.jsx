import React, { useRef } from 'react';
import {
  Printer,
  Download,
  ShieldCheck,
  Info,
  Layers
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import { CopyButton } from '../../components/CopyButton';
import { getTrackedUtm } from '../../utils/utmTracker';
import {
  useUserPortalState,
  formatCurrency,
  formatCurrencyShort,
  calculateEMI,
  calculateSeasonalAffordability,
  calculateSeasonalFlexibleSchedule
} from './userPortalState';

/**
 * Module 10: Borrower Financial Report
 * Comprehensive, printable audit report preview with working download/print options.
 * Clearly distinguishes estimates, self-reported data, synthetic data, and hypothetical scenarios.
 */
export function BorrowerReport({ onNavigate }) {
  const {
    state,
    toastMessage,
    showToast
  } = useUserPortalState();

  const trackedUtm = getTrackedUtm();

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  const reportRef = useRef(null);

  // EMI Calculations
  const emiData = calculateEMI(
    state.application.requestedAmount,
    state.application.apr,
    state.application.termMonths
  );

  // Seasonal analysis
  const seasonalAnalysis = calculateSeasonalAffordability(
    state.financials.monthlyInflows,
    (state.financials.monthlyLivingExpenses || 0) + (state.financials.monthlyBusinessExpenses || 0),
    state.financials.monthlyDebtObligations,
    emiData.monthlyEmi
  );

  const seasonalFlexible = calculateSeasonalFlexibleSchedule(
    state.application.requestedAmount,
    state.application.apr,
    state.application.termMonths,
    state.financials.monthlyInflows,
    (state.financials.monthlyLivingExpenses || 0) + (state.financials.monthlyBusinessExpenses || 0),
    state.financials.monthlyDebtObligations
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      reportTitle: 'CreditLens Borrower Comprehensive Financial & Solvency Dossier',
      generatedDate: new Date().toISOString(),
      dossierId: state.application.dossierProtocol,
      dataClassification: {
        selfReported: 'Applicant form entries',
        bankVerified: 'Simulated Plaid depository transactions',
        synthetic: 'Model generated for demonstration',
        hypothetical: 'Alternative amortization scenarios'
      },
      borrower: state.user,
      loanApplication: {
        ...state.application,
        amortization: emiData
      },
      financialSummary: state.financials,
      assessment: state.assessment,
      seasonalStressAnalysis: seasonalAnalysis,
      seasonalFlexiblePlan: seasonalFlexible,
      evidenceLedger: state.evidence,
      underwritingDecision: state.decision,
      copilotRecommendations: state.recommendations
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CreditLens_Financial_Report_${state.application.dossierProtocol || 'CL-8924'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ Exported comprehensive report dossier as JSON!');
  };

  return (
    <UserPortalLayout
      activePage="financial-report"
      onNavigate={handleNavigate}
      user={state.user}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Control Bar */}
        <div className="cl-card no-print" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Dashboard</span>
                <span>/</span>
                <span style={{ color: '#173B57', fontWeight: '700' }}>Financial Report</span>
              </div>
              <h1 className="cl-page-title" style={{ fontSize: '20px', marginTop: '2px' }}>
                Borrower Financial &amp; Solvency Report
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="cl-btn cl-btn-secondary"
                onClick={handleExportJSON}
                title="Download raw dossier data"
              >
                <Download size={14} />
                <span>Export JSON Data</span>
              </button>
              <button
                type="button"
                className="cl-btn cl-btn-primary"
                onClick={handlePrint}
                title="Print or save as PDF"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legend Notice for Report Reviewers */}
        <div
          className="no-print"
          style={{
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1' }}>
            <Info size={16} />
            <span>
              <strong>Data Classification Legend:</strong> This report clearly distinguishes between verified feeds, self-reported entries, synthetic demo models, and hypothetical scenarios.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="cl-badge cl-badge-teal" style={{ fontSize: '10px' }}>Bank-Verified</span>
            <span className="cl-badge cl-badge-neutral" style={{ fontSize: '10px' }}>Self-Reported</span>
            <span className="cl-badge cl-badge-warning" style={{ fontSize: '10px' }}>Synthetic Demo</span>
            <span className="cl-badge" style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: '10px' }}>Hypothetical</span>
          </div>
        </div>

        {/* Printable Comprehensive Report Document */}
        <div
          ref={reportRef}
          className="cl-report-document"
          style={{
            background: '#FFFFFF',
            border: '1px solid #DCE3EA',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            color: '#172B3A',
            fontSize: '13px',
            lineHeight: 1.6
          }}
        >
          {/* Document Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '24px', borderBottom: '2px solid #173B57', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#173B57', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={16} />
                </div>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#173B57', letterSpacing: '-0.02em' }}>
                  CreditLens
                </span>
                <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600', marginLeft: '6px' }}>
                  Fair &amp; Explainable Lending Platform
                </span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#172B3A', margin: '4px 0 2px' }}>
                Comprehensive Borrower Financial &amp; Solvency Report
              </h2>
              <span style={{ fontSize: '12px', color: '#748391', display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span>Underwriting Protocol: <strong>{state.application.dossierProtocol}</strong></span>
                <CopyButton text={state.application.dossierProtocol} label="Copy Protocol" title="Copy Dossier Protocol" />
                <span>• Evaluation Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="cl-badge cl-badge-teal" style={{ marginBottom: '6px' }}>
                <ShieldCheck size={13} />
                <span>Passed Fair-Check AI Audit</span>
              </span>
              <div style={{ fontSize: '11px', color: '#748391' }}>
                Engine: CreditLens Fair Solvency v4.2<br />
                FCRA &amp; ECOA Compliant Disclosure
              </div>
            </div>
          </div>

          {/* Section 1: Executive Borrower Summary */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
              1. Executive Borrower Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Applicant</span>
                <strong style={{ fontSize: '14px' }}>{state.user.name}</strong>
                <span style={{ fontSize: '11px', color: '#5B6B79', display: 'block' }}>{state.user.businessName}</span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Account / Plaid ID</span>
                <strong style={{ fontSize: '14px' }}>{state.user.id}</strong>
                <span style={{ fontSize: '11px', color: '#0F766E', display: 'block' }}>Plaid Verified Link</span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Solvency Score</span>
                <strong style={{ fontSize: '16px', color: '#0F766E' }}>{state.assessment?.solvencyScore}</strong>
                <span style={{ fontSize: '11px', color: '#5B6B79', display: 'block' }}>{state.assessment?.solvencyGrade}</span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Application Status</span>
                <strong style={{ fontSize: '13px', color: '#173B57' }}>{state.application.status}</strong>
                <span style={{ fontSize: '11px', color: '#925D00', display: 'block' }}>Stage {state.application.currentStage} of 4</span>
              </div>
            </div>
          </div>

          {/* Section 2: Verified Financial Snapshot */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                2. Operating Cashflow &amp; Surplus Snapshot
              </h3>
              <span className="cl-badge cl-badge-teal" style={{ fontSize: '10px' }}>Bank-Verified &amp; Self-Reported</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#748391' }}>Annual Gross Revenue</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#172B3A', margin: '4px 0' }}>
                  {formatCurrencyShort(state.financials.annualGrossRevenue)}
                </div>
                <span style={{ fontSize: '10px', color: '#0F766E' }}>[Plaid Verified Depository]</span>
              </div>

              <div style={{ border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#748391' }}>Average Monthly Net Inflow</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#172B3A', margin: '4px 0' }}>
                  {formatCurrency(state.financials.monthlyNetIncome)}
                </div>
                <span style={{ fontSize: '10px', color: '#0F766E' }}>[12-Month Inflow Average]</span>
              </div>

              <div style={{ border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#748391' }}>Total Monthly Overhead</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#172B3A', margin: '4px 0' }}>
                  {formatCurrency((state.financials.monthlyLivingExpenses || 0) + (state.financials.monthlyBusinessExpenses || 0))}
                </div>
                <span style={{ fontSize: '10px', color: '#5B6B79' }}>[Living $2.1k + Business $1.1k]</span>
              </div>

              <div style={{ border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#748391' }}>Existing Debt Obligations</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#172B3A', margin: '4px 0' }}>
                  {formatCurrency(state.financials.monthlyDebtObligations)}/mo
                </div>
                <span style={{ fontSize: '10px', color: '#0F766E' }}>[Commercial Lease DTI: {state.financials.dti}%]</span>
              </div>

              <div style={{ border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', background: '#F0FDF4' }}>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>Average Free Monthly Surplus</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#15803D', margin: '4px 0' }}>
                  {formatCurrency(state.financials.freeRepaymentSurplus)}/mo
                </div>
                <span style={{ fontSize: '10px', color: '#166534' }}>[Free Cash Cushion Before Loan]</span>
              </div>

              <div style={{ border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', background: '#FFFDF5' }}>
                <span style={{ fontSize: '11px', color: '#854D0E', fontWeight: '700' }}>Off-Season Lean Surplus (July)</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#A16207', margin: '4px 0' }}>
                  +$45.00 (Before Loan)
                </div>
                <span style={{ fontSize: '10px', color: '#854D0E' }}>[Lowest Annual Revenue Month]</span>
              </div>
            </div>
          </div>

          {/* Section 3: Proposed Loan Details & EMI Comparison */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
              3. Loan Structure &amp; EMI Amortization
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {/* Option 1: Standard Flat EMI */}
              <div style={{ border: '1px solid #DCE3EA', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#173B57' }}>Standard Flat Repayment Structure</strong>
                  <span className="cl-badge cl-badge-warning" style={{ fontSize: '10px' }}>3 Deficit Months Risk</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#172B3A' }}>
                  {formatCurrency(emiData.monthlyEmi)} <span style={{ fontSize: '12px', color: '#748391' }}>/ month</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5B6B79' }}>Principal Borrowed:</span>
                    <strong>{formatCurrency(state.application.requestedAmount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5B6B79' }}>APR / Repayment Term:</span>
                    <strong>{state.application.apr}% / {state.application.termMonths} Months</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5B6B79' }}>Total Interest:</span>
                    <strong>{formatCurrency(emiData.totalInterest)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5B6B79' }}>Total Repayment:</span>
                    <strong>{formatCurrency(emiData.totalPayment)}</strong>
                  </div>
                </div>
              </div>

              {/* Option 2: Structured Seasonal Step-EMI */}
              <div style={{ border: '1px solid #0F766E', padding: '16px', borderRadius: '8px', background: '#F0FDF4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#0F766E' }}>Structured Seasonal Step-EMI (Recommended)</strong>
                  <span className="cl-badge cl-badge-teal" style={{ fontSize: '10px' }}>100% Solvency Year-Round</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F766E' }}>
                  $320 Lean / $1,150 Peak
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5B6B79' }}>Summer Lean Months (May–Aug):</span>
                    <strong>$320.00 / month</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5B6B79' }}>Peak Season Months (Sep–Apr):</span>
                    <strong>$1,150.00 / month</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5B6B79' }}>Total Interest Variance:</span>
                    <strong style={{ color: '#0F766E' }}>$0.00 (Identical to Standard)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5B6B79' }}>Default Risk Mitigation:</span>
                    <strong style={{ color: '#0F766E' }}>Zero Deficit Months</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: 12-Month Month-by-Month Cashflow Stress Audit */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
              4. 12-Month Seasonal Stress-Test Audit Table
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #DCE3EA', textAlign: 'left', color: '#5B6B79' }}>
                  <th style={{ padding: '8px' }}>Month</th>
                  <th style={{ padding: '8px' }}>Net Inflow</th>
                  <th style={{ padding: '8px' }}>Overhead + Debt</th>
                  <th style={{ padding: '8px' }}>Pre-Loan Surplus</th>
                  <th style={{ padding: '8px' }}>Standard EMI ($774)</th>
                  <th style={{ padding: '8px' }}>Seasonal Step-EMI</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {seasonalAnalysis.monthRows.map((m, idx) => {
                  const flexRow = seasonalFlexible.flexibleRows[idx];
                  return (
                    <tr
                      key={m.month}
                      style={{
                        borderBottom: '1px solid #E2E8F0',
                        background: m.isDeficit ? '#FFFDF5' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '8px', fontWeight: '700' }}>{m.label}</td>
                      <td style={{ padding: '8px' }}>{formatCurrency(m.inflow)}</td>
                      <td style={{ padding: '8px' }}>{formatCurrency(m.baseExpenses + m.monthlyDebt)}</td>
                      <td style={{ padding: '8px', color: m.surplusBeforeLoan > 0 ? '#15803D' : '#B91C1C' }}>
                        {formatCurrency(m.surplusBeforeLoan)}
                      </td>
                      <td style={{ padding: '8px', color: m.isDeficit ? '#B91C1C' : '#172B3A', fontWeight: m.isDeficit ? '700' : '400' }}>
                        {formatCurrency(m.remainingCash)} {m.isDeficit && '(Deficit)'}
                      </td>
                      <td style={{ padding: '8px', color: '#0F766E', fontWeight: '600' }}>
                        {formatCurrency(flexRow.remainingCash)}
                      </td>
                      <td style={{ padding: '8px' }}>
                        {m.isDeficit ? (
                          <span style={{ color: '#925D00', fontWeight: '600', fontSize: '11px' }}>
                            Lean Deficit
                          </span>
                        ) : (
                          <span style={{ color: '#0F766E', fontWeight: '600', fontSize: '11px' }}>
                            Solvent
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 5: Documentary Evidence Audit Trail */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
              5. Documentary Evidence &amp; Verification Trail
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '12px' }}>
              {(state.evidence || []).map((doc) => (
                <div key={doc.id} style={{ border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: '#172B3A' }}>{doc.name}</strong>
                      <CopyButton text={doc.name} label="Copy" title="Copy Document Name" />
                    </div>
                    <span style={{ fontSize: '11px', color: '#748391' }}>{doc.supports} • {doc.type}</span>
                  </div>
                  <span className={`cl-badge ${doc.status === 'verified' ? 'cl-badge-teal' : 'cl-badge-warning'}`} style={{ fontSize: '10px' }}>
                    {doc.status === 'verified' ? 'Verified' : 'Needs Clarification'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Plain-Language Underwriting Decision & Next Steps */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
              6. Underwriting Decision &amp; Conditions Checklist
            </h3>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '14px', color: '#173B57' }}>
                  Decision: {state.decision?.status || 'Conditional Pre-Approval'}
                </strong>
                <span style={{ fontSize: '11px', color: '#748391' }}>{state.decision?.date}</span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#5B6B79' }}>
                {state.decision?.rationale}
              </p>

              <strong style={{ fontSize: '12px', color: '#173B57', display: 'block', marginBottom: '4px' }}>
                Clear-to-Disburse Conditions:
              </strong>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155' }}>
                {(state.decision?.conditions || []).map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 7: Statutory & Model Governance Disclosures */}
          <div style={{ borderTop: '2px solid #DCE3EA', paddingTop: '16px', fontSize: '11px', color: '#748391', lineHeight: 1.5 }}>
            <strong style={{ color: '#172B3A', display: 'block', marginBottom: '4px' }}>
              Statutory Fair Lending &amp; FCRA Notice:
            </strong>
            This CreditLens Borrower Report has been generated utilizing fair, explainable algorithmic methodologies. Under the Equal Credit Opportunity Act (ECOA) and the Fair Credit Reporting Act (FCRA), credit decisions are based solely on deterministic solvency, verifiable cashflows, and debt obligations, without regard to prohibited demographic bases. Synthetic demonstration records are generated for illustrative simulation and transparency testing.

            {trackedUtm && (trackedUtm.utm_source || trackedUtm.utm_campaign) && (
              <div style={{ marginTop: '10px', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '10px', color: '#64748B' }}>
                Campaign Attribution Tracking: Source = <strong>{trackedUtm.utm_source || 'direct'}</strong> • Medium = <strong>{trackedUtm.utm_medium || 'n/a'}</strong> • Campaign = <strong>{trackedUtm.utm_campaign || 'n/a'}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserPortalLayout>
  );
}

export default BorrowerReport;
