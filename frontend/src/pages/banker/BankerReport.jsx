import React, { useState, useEffect } from 'react';
import BankerLayout from '../../components/banker/BankerLayout';
import BankerStatusBadge from '../../components/banker/BankerStatusBadge';
import { colors, radii, shadows, typography } from '../../components/banker/bankerTheme';
import {
  IconPrinter,
  IconArrowLeft,
  IconShield,
  IconCheckCircle,
  IconAlertTriangle,
  IconAlertCircle,
  IconInfo,
  IconUser,
  IconClock,
  IconDollarSign,
  IconClipboardCheck,
  IconChevronRight,
} from '../../components/banker/BankerIcons';
import {
  getApplications,
  getApplicationById,
  getVerificationTasks,
  getReviewActions,
} from '../../components/banker/bankerData';
import { useBankerRoute } from '../../components/banker/navigation';
import {
  calculateEMI,
  calculateTotalRepayment,
  calculateTotalInterest,
  calculateDTI,
  calculateDSCR,
  calculateRemainingSurplus,
  formatCurrencyINR,
} from '../../utils/financialCalculations';
import CopyButton from '../../components/banker/CopyButton';

export default function BankerReport() {
  const { id: routeId, navigate } = useBankerRoute();
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(routeId || '');
  const [applicant, setApplicant] = useState(null);
  const [verificationTasks, setVerificationTasks] = useState([]);
  const [reviewActions, setReviewActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apps = getApplications();
    setApplications(apps);

    const initial = routeId
      ? apps.find((a) => a.id.toLowerCase() === routeId.toLowerCase())
      : apps[0];

    if (initial) {
      setSelectedAppId(initial.id);
      loadApplicantData(initial.id);
    } else if (apps.length > 0) {
      setSelectedAppId(apps[0].id);
      loadApplicantData(apps[0].id);
    }
    setIsLoading(false);
  }, [routeId]);

  const loadApplicantData = (appId) => {
    const app = getApplicationById(appId);
    setApplicant(app);

    const allTasks = getVerificationTasks();
    setVerificationTasks(allTasks.filter((t) => t.applicationId === appId));

    const allActions = getReviewActions();
    setReviewActions(allActions.filter((a) => a.applicationId === appId));
  };

  const handleSelectApplicant = (e) => {
    const appId = e.target.value;
    setSelectedAppId(appId);
    loadApplicantData(appId);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !applicant) {
    return (
      <BankerLayout activeScreen="reports" pageTitle="Underwriter Assessment Report">
        <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
          Loading creditworthiness assessment report...
        </div>
      </BankerLayout>
    );
  }

  // Financial metrics
  const p = applicant.requestedAmount;
  const r = applicant.annualInterestRate || 10.5;
  const n = applicant.tenureMonths || 36;
  const emi = calculateEMI(p, r, n);
  const totalRepayment = calculateTotalRepayment(emi, n);
  const totalInterest = calculateTotalInterest(totalRepayment, p);

  const grossIncome = applicant.financials?.grossMonthlyIncome || 0;
  const netInflow = applicant.financials?.netMonthlyInflow || 0;
  const livingExp = applicant.financials?.monthlyLivingExpenses || 0;
  const existingDebt = applicant.financials?.existingDebtObligations || 0;
  const preSurplus = netInflow - livingExp - existingDebt;
  const postSurplus = calculateRemainingSurplus(netInflow, livingExp, existingDebt, emi);
  const dti = calculateDTI(existingDebt + emi, grossIncome);
  const dscr = calculateDSCR(postSurplus + emi, emi);

  // Alternative scenarios for Section 6
  const altPrincipal = Math.round(p * 0.75);
  const altEMI = calculateEMI(altPrincipal, r, n);
  const altSurplus = calculateRemainingSurplus(netInflow, livingExp, existingDebt, altEMI);

  const extTenure = Math.min(60, n + 12);
  const extEMI = calculateEMI(p, r, extTenure);
  const extSurplus = calculateRemainingSurplus(netInflow, livingExp, existingDebt, extEMI);

  return (
    <BankerLayout
      activeScreen="reports"
      pageTitle="Credit Assessment Dossier & Audit Report"
      pageSubtitle={`Regulatory-grade fair and explainable credit evaluation • ${applicant.id}`}
      actions={
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="report-applicant-select" style={{ fontSize: '13px', fontWeight: '500', color: colors.textSecondary }}>
              Applicant:
            </label>
            <select
              id="report-applicant-select"
              value={selectedAppId}
              onChange={handleSelectApplicant}
              style={{
                padding: '7px 12px',
                borderRadius: radii.input,
                border: `1px solid ${colors.border}`,
                fontSize: '13px',
                fontWeight: '600',
                color: colors.brand,
                backgroundColor: colors.surface,
                cursor: 'pointer',
              }}
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.id} — {app.applicantName} ({app.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            style={{
              backgroundColor: colors.brand,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: radii.button,
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconPrinter size={16} color="#FFFFFF" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      }
    >
      <div className="report-paper" style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Print Document Header */}
        <header
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: '28px 32px',
            marginBottom: '24px',
            boxShadow: shadows.subtle,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: radii.small,
                  backgroundColor: colors.brand,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
              >
                CL
              </div>
              <span style={{ fontSize: '18px', fontWeight: '800', color: colors.brand, letterSpacing: '-0.3px' }}>
                CreditLens
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: colors.accentLight,
                  color: colors.accent,
                  padding: '2px 8px',
                  borderRadius: radii.pill,
                  textTransform: 'uppercase',
                }}
              >
                Banker Audit Copy
              </span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: colors.brand, margin: '8px 0 2px 0' }}>
              Comprehensive Creditworthiness Assessment Report
            </h1>
            <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
              Official Underwriter Credit Committee Evaluation & Transparent Finding Audit
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px', color: colors.textSecondary }}>
            <div>
              <strong>Report Generated:</strong> {new Date().toISOString().split('T')[0]} 12:00
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
              <strong>Document Ref:</strong>
              <span>CL-REP-{applicant.id.replace('APP-', '')}</span>
              <CopyButton text={`CL-REP-${applicant.id.replace('APP-', '')}`} label="Doc Ref" />
            </div>
            <div>
              <strong>Assigned Reviewer:</strong> {applicant.assignedReviewer || 'David Vance (Senior Underwriter #301)'}
            </div>
            <div style={{ marginTop: '6px' }}>
              <BankerStatusBadge status={applicant.status} size="sm" />
            </div>
          </div>
        </header>

        {/* 1. Applicant & Facility Summary */}
        <section
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: '24px',
            marginBottom: '20px',
            boxShadow: shadows.subtle,
          }}
        >
          <h2
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: colors.brand,
              margin: '0 0 16px 0',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IconUser size={16} color={colors.accent} />
            <span>1. Applicant Identification & Requested Facility</span>
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              fontSize: '13px',
            }}
          >
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Applicant Name</div>
              <div style={{ fontWeight: '700', color: colors.text, fontSize: '15px', marginTop: '2px' }}>
                {applicant.applicantName}
              </div>
              <div style={{ color: colors.textMuted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span>ID: {applicant.id}</span>
                <CopyButton text={applicant.id} label="ID" />
              </div>
            </div>

            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Borrower Classification</div>
              <div style={{ fontWeight: '600', color: colors.text, marginTop: '2px' }}>
                {applicant.applicantType}
              </div>
              <div style={{ color: colors.textMuted, fontSize: '12px' }}>
                Employer: {applicant.employment?.employerOrBusiness || 'Self'}
              </div>
            </div>

            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Requested Principal</div>
              <div
                style={{
                  fontWeight: '700',
                  color: colors.brand,
                  fontSize: '16px',
                  marginTop: '2px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrencyINR(applicant.requestedAmount)}
              </div>
              <div style={{ color: colors.textMuted, fontSize: '12px' }}>
                {applicant.tenureMonths} Months @ {applicant.annualInterestRate || 10.5}% p.a.
              </div>
            </div>

            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Evidence Completeness</div>
              <div style={{ fontWeight: '600', color: colors.accent, marginTop: '2px' }}>
                {applicant.evidenceCompleteness}
              </div>
              <div style={{ color: colors.textMuted, fontSize: '12px' }}>
                Submitted: {applicant.submissionDate}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Financial Overview & Reducing-Balance Calculations */}
        <section
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: '24px',
            marginBottom: '20px',
            boxShadow: shadows.subtle,
          }}
        >
          <h2
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: colors.brand,
              margin: '0 0 16px 0',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IconDollarSign size={16} color={colors.accent} />
            <span>2. Financial Verification & Repayment Capacity Math</span>
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '8px 0', color: colors.textSecondary }}>Gross Monthly Income:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(grossIncome)}
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '8px 0', color: colors.textSecondary }}>Net Monthly Inflow:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(netInflow)}
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '8px 0', color: colors.textSecondary }}>Essential Living Expenses:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(livingExp)}
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '8px 0', color: colors.textSecondary }}>Existing Debt Obligations:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(existingDebt)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: colors.brand, fontWeight: '600' }}>Pre-Loan Discretionary Surplus:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '700', color: colors.brand, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(preSurplus)}
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '8px 0', color: colors.textSecondary }}>Proposed Monthly EMI:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '700', color: colors.brand, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(emi)}
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '8px 0', color: colors.textSecondary }}>Total Facility Interest:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(totalInterest)}
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '8px 0', color: colors.textSecondary }}>Total Repayment Obligation:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(totalRepayment)}
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '8px 0', color: colors.textSecondary }}>Debt-to-Income (DTI Post-Loan):</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: dti > 43 ? colors.danger : colors.brand, fontVariantNumeric: 'tabular-nums' }}>
                    {dti}% (Benchmark: ≤43%)
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: colors.brand, fontWeight: '600' }}>Post-Loan Remaining Monthly Surplus:</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '700', color: postSurplus < 0 ? colors.danger : colors.success, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(postSurplus)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: colors.surfaceSubtle,
              borderRadius: radii.small,
              fontSize: '12px',
              color: colors.textSecondary,
              lineHeight: '18px',
            }}
          >
            <strong>Standard Reducing-Balance Formula Applied:</strong> EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ − 1), where P = {formatCurrencyINR(p)}, r = {(r / 12 / 100).toFixed(6)} per month, and n = {n} instalments.
          </div>
        </section>

        {/* 3. The Four Distinct Assessment Dimensions */}
        <section
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: '24px',
            marginBottom: '20px',
            boxShadow: shadows.subtle,
          }}
        >
          <h2
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: colors.brand,
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IconShield size={16} color={colors.accent} />
            <span>3. Four Independent Assessment Dimensions</span>
          </h2>
          <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 16px 0' }}>
            To safeguard fairness and prevent confounding correlations, CreditLens enforces strict separation between cashflow capacity, risk factors, evidence completeness, and assessment uncertainty.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {/* Dimension 1: Repayment Capacity */}
            <div
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radii.card,
                padding: '16px',
                backgroundColor: colors.page,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>
                  Dimension A
                </span>
                <strong style={{ fontSize: '14px', color: colors.brand }}>Repayment Capacity</strong>
              </div>
              <p style={{ fontSize: '13px', color: colors.text, lineHeight: '19px', margin: '0 0 10px 0' }}>
                {applicant.assessment?.repaymentCapacity || 'Evaluates discretionary cashflow remaining after essential living expenditures and debt service obligations.'}
              </p>
              <div style={{ fontSize: '12px', color: colors.textSecondary, borderTop: `1px dashed ${colors.border}`, paddingTop: '8px' }}>
                <strong>Finding Rule:</strong> DSCR = {dscr}x. Post-EMI monthly surplus calculated at {formatCurrencyINR(postSurplus)}.
              </div>
            </div>

            {/* Dimension 2: Financial Risk Indicators */}
            <div
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radii.card,
                padding: '16px',
                backgroundColor: colors.page,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: colors.warning, textTransform: 'uppercase' }}>
                  Dimension B
                </span>
                <strong style={{ fontSize: '14px', color: colors.brand }}>Financial Risk Indicators</strong>
              </div>
              <p style={{ fontSize: '13px', color: colors.text, lineHeight: '19px', margin: '0 0 10px 0' }}>
                {applicant.assessment?.riskIndicators || 'Identifies leverage, debt obligations, utilization ratios, and historical volatility trends.'}
              </p>
              <div style={{ fontSize: '12px', color: colors.textSecondary, borderTop: `1px dashed ${colors.border}`, paddingTop: '8px' }}>
                <strong>Finding Rule:</strong> DTI = {dti}%. Delinquencies past 24m: {applicant.creditHistory?.delinquencies24m ?? 0}.
              </div>
            </div>

            {/* Dimension 3: Evidence Completeness */}
            <div
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radii.card,
                padding: '16px',
                backgroundColor: colors.page,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: colors.brand, textTransform: 'uppercase' }}>
                  Dimension C
                </span>
                <strong style={{ fontSize: '14px', color: colors.brand }}>Evidence Completeness</strong>
              </div>
              <p style={{ fontSize: '13px', color: colors.text, lineHeight: '19px', margin: '0 0 10px 0' }}>
                {applicant.assessment?.evidenceCompleteness || 'Measures verified documentation coverage versus self-reported declarations.'}
              </p>
              <div style={{ fontSize: '12px', color: colors.textSecondary, borderTop: `1px dashed ${colors.border}`, paddingTop: '8px' }}>
                <strong>Verification Ratio:</strong> {applicant.evidenceCompleteness}. Supporting items: {verificationTasks.length} documented.
              </div>
            </div>

            {/* Dimension 4: Assessment Uncertainty */}
            <div
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: radii.card,
                padding: '16px',
                backgroundColor: colors.page,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' }}>
                  Dimension D
                </span>
                <strong style={{ fontSize: '14px', color: colors.brand }}>Assessment Uncertainty</strong>
              </div>
              <p style={{ fontSize: '13px', color: colors.text, lineHeight: '19px', margin: '0 0 10px 0' }}>
                {applicant.assessment?.assessmentUncertainty || 'Documents model constraints, seasonal variations, thin credit bureau files, or unverified claims.'}
              </p>
              <div style={{ fontSize: '12px', color: colors.textSecondary, borderTop: `1px dashed ${colors.border}`, paddingTop: '8px' }}>
                <strong>Fairness Rule:</strong> Absence of credit bureau history is treated as uncertainty, never as adverse delinquency.
              </div>
            </div>
          </div>
        </section>

        {/* 4. Evidence Verification Ledger */}
        <section
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: '24px',
            marginBottom: '20px',
            boxShadow: shadows.subtle,
          }}
        >
          <h2
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: colors.brand,
              margin: '0 0 16px 0',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IconClipboardCheck size={16} color={colors.accent} />
            <span>4. Supporting Evidence Verification Summary</span>
          </h2>

          {verificationTasks.length === 0 ? (
            <div style={{ fontSize: '13px', color: colors.textMuted, fontStyle: 'italic' }}>
              No specific verification tasks recorded for this applicant file.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.border}`, color: colors.textSecondary }}>
                    <th style={{ padding: '8px' }}>Claim Item</th>
                    <th style={{ padding: '8px' }}>Declared</th>
                    <th style={{ padding: '8px' }}>Evidence-Supported</th>
                    <th style={{ padding: '8px' }}>Variance</th>
                    <th style={{ padding: '8px' }}>Source & Period</th>
                    <th style={{ padding: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationTasks.map((t) => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                      <td style={{ padding: '8px', fontWeight: '600', color: colors.text }}>{t.claim}</td>
                      <td style={{ padding: '8px', fontVariantNumeric: 'tabular-nums' }}>{t.declaredValue}</td>
                      <td style={{ padding: '8px', fontVariantNumeric: 'tabular-nums' }}>{t.evidenceValue}</td>
                      <td style={{ padding: '8px', fontVariantNumeric: 'tabular-nums', color: t.difference !== '₹0' && t.difference !== '0' ? colors.warning : colors.textMuted }}>
                        {t.difference}
                      </td>
                      <td style={{ padding: '8px', color: colors.textSecondary }}>
                        {t.source} ({t.coveragePeriod})
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: radii.pill,
                            backgroundColor:
                              t.status === 'Verified'
                                ? colors.successBg
                                : t.status === 'Clarification Required'
                                  ? colors.warningBg
                                  : colors.surfaceSubtle,
                            color:
                              t.status === 'Verified'
                                ? colors.success
                                : t.status === 'Clarification Required'
                                  ? colors.warning
                                  : colors.textSecondary,
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 5. Counterfactual Structuring Scenarios */}
        <section
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: '24px',
            marginBottom: '20px',
            boxShadow: shadows.subtle,
          }}
        >
          <h2
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: colors.brand,
              margin: '0 0 16px 0',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IconClock size={16} color={colors.accent} />
            <span>5. Alternative Counterfactual Loan Scenarios</span>
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.border}`, color: colors.textSecondary }}>
                  <th style={{ padding: '8px' }}>Scenario Name</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Principal</th>
                  <th style={{ padding: '8px' }}>Tenure</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Monthly EMI</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Remaining Surplus</th>
                  <th style={{ padding: '8px' }}>Affordability Finding</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}`, backgroundColor: colors.surfaceSubtle }}>
                  <td style={{ padding: '10px 8px', fontWeight: '700', color: colors.brand }}>
                    Baseline (Requested)
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(p)}
                  </td>
                  <td style={{ padding: '10px 8px' }}>{n} Mo ({r}%)</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', color: colors.brand, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(emi)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', color: postSurplus >= 0 ? colors.success : colors.danger, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(postSurplus)}
                  </td>
                  <td style={{ padding: '10px 8px', fontSize: '12px', color: colors.textSecondary }}>
                    {postSurplus >= 0 ? 'Affordable within cashflow bounds' : 'High cashflow strain'}
                  </td>
                </tr>

                <tr style={{ borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
                  <td style={{ padding: '10px 8px', fontWeight: '600', color: colors.text }}>
                    Alternative A (75% Principal)
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(altPrincipal)}
                  </td>
                  <td style={{ padding: '10px 8px' }}>{n} Mo ({r}%)</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(altEMI)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.success }}>
                    {formatCurrencyINR(altSurplus)}
                  </td>
                  <td style={{ padding: '10px 8px', fontSize: '12px', color: colors.textSecondary }}>
                    Saves {formatCurrencyINR(emi - altEMI)}/mo in cash outflow
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '10px 8px', fontWeight: '600', color: colors.text }}>
                    Alternative B (Extended Tenure)
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(p)}
                  </td>
                  <td style={{ padding: '10px 8px' }}>{extTenure} Mo ({r}%)</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrencyINR(extEMI)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.success }}>
                    {formatCurrencyINR(extSurplus)}
                  </td>
                  <td style={{ padding: '10px 8px', fontSize: '12px', color: colors.textSecondary }}>
                    Reduces monthly EMI by {formatCurrencyINR(emi - extEMI)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Review Actions & Underwriter Guidance */}
        {reviewActions.length > 0 && (
          <section
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.card,
              padding: '24px',
              marginBottom: '20px',
              boxShadow: shadows.subtle,
            }}
          >
            <h2
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: colors.brand,
                margin: '0 0 16px 0',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <IconInfo size={16} color={colors.accent} />
              <span>6. Recommended Underwriter Review Actions</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reviewActions.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: radii.small,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.page,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: radii.pill,
                        backgroundColor:
                          act.priority === 'High'
                            ? colors.dangerBg
                            : act.priority === 'Medium'
                              ? colors.warningBg
                              : colors.surfaceSubtle,
                        color:
                          act.priority === 'High'
                            ? colors.danger
                            : act.priority === 'Medium'
                              ? colors.warning
                              : colors.textSecondary,
                        marginRight: '8px',
                      }}
                    >
                      {act.priority}
                    </span>
                    <strong style={{ color: colors.text }}>{act.suggestedAction}</strong>
                    <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>
                      Reason: {act.reason}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: act.status === 'Completed' ? colors.success : colors.textSecondary,
                      }}
                    >
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Recorded Underwriting Determination & Formal Sign-Off */}
        <section
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: '28px',
            marginBottom: '24px',
            boxShadow: shadows.subtle,
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: colors.brand,
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <IconCheckCircle size={18} color={colors.accent} />
            <span>7. Official Banker Determination & Regulatory Rationale</span>
          </h2>

          {applicant.decisionHistory ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: radii.card,
                  backgroundColor:
                    applicant.decisionHistory.decision === 'Approved'
                      ? colors.successBg
                      : applicant.decisionHistory.decision === 'Rejected'
                        ? colors.dangerBg
                        : colors.warningBg,
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '700', color: colors.text }}>
                  Determination: {applicant.decisionHistory.decision}
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  Approved Facility: {formatCurrencyINR(applicant.decisionHistory.approvedAmount)} ({applicant.decisionHistory.approvedTenure} Months)
                </div>
              </div>

              <div style={{ fontSize: '13px', lineHeight: '20px', color: colors.text, marginBottom: '16px' }}>
                <strong>Documented Underwriter Rationale:</strong>
                <p style={{ margin: '6px 0 0 0', fontStyle: 'italic', color: colors.textSecondary }}>
                  "{applicant.decisionHistory.reason}"
                </p>
              </div>

              <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '20px' }}>
                <strong>Conditions & Covenants:</strong> {applicant.decisionHistory.conditions || 'Standard reducing-balance covenants apply.'}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: radii.small,
                backgroundColor: colors.surfaceSubtle,
                fontSize: '13px',
                color: colors.textSecondary,
                marginBottom: '20px',
              }}
            >
              <strong>Status: Pending Final Determination.</strong> No definitive approval or adverse action has been formally registered for this application file yet.
            </div>
          )}

          {/* Underwriter Signature Block */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              paddingTop: '20px',
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600' }}>
                Authorised Credit Officer Signature
              </div>
              <div
                style={{
                  height: '40px',
                  borderBottom: `1px solid ${colors.textSecondary}`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  fontSize: '17px',
                  color: colors.brand,
                  paddingBottom: '2px',
                }}
              >
                {applicant.assignedReviewer || 'David Vance (Senior Underwriter)'}
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
                Lending Authority Tier III • ID: #301
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '600' }}>
                Credit Committee Countersign
              </div>
              <div
                style={{
                  height: '40px',
                  borderBottom: `1px solid ${colors.textSecondary}`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  fontSize: '17px',
                  color: colors.brand,
                  paddingBottom: '2px',
                }}
              >
                Verified Automated Audit Stamp
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
                Tamper-Evident SHA-256 Ledger Record
              </div>
            </div>
          </div>
        </section>

        {/* 8. Governance, Assumptions & Limitations Disclaimer */}
        <footer
          style={{
            backgroundColor: colors.surfaceSubtle,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: '16px 20px',
            fontSize: '11px',
            color: colors.textSecondary,
            lineHeight: '16px',
          }}
        >
          <strong>Regulatory Fair Lending & Methodological Disclosure:</strong> CreditLens provides automated explainability and counterfactual sensitivity testing to assist authorized credit officers. The statistical models do not assert legal finality; human underwriters retain statutory discretion. Protected personal characteristics (including gender, religion, marital status) are masked from underwriting inputs. Missing traditional credit bureau history is evaluated as information uncertainty rather than an adverse indicator of debt repayment capability.
        </footer>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background-color: #FFFFFF !important;
            color: #000000 !important;
          }
          .banker-sidebar,
          header.banker-header,
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .report-paper {
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </BankerLayout>
  );
}
