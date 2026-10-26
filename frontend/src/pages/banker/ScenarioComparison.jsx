import React, { useState, useEffect } from 'react';
import BankerLayout from '../../components/banker/BankerLayout';
import { colors, radii, shadows, typography } from '../../components/banker/bankerTheme';
import {
  IconCompare,
  IconArrowLeft,
  IconRefresh,
  IconCheckCircle,
  IconAlertTriangle,
  IconInfo,
} from '../../components/banker/BankerIcons';
import { getApplications, getApplicationById } from '../../components/banker/bankerData';
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

export default function ScenarioComparison({ applicantId = null }) {
  const { id: routeId, navigate } = useBankerRoute();
  const targetId = applicantId || routeId;

  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(targetId || '');
  const [selectedApp, setSelectedApp] = useState(null);

  // Counterfactual Scenario State
  const [scenarioPrincipal, setScenarioPrincipal] = useState(500000);
  const [scenarioRate, setScenarioRate] = useState(11.0);
  const [scenarioTenure, setScenarioTenure] = useState(36);
  const [scenarioEvidenceCompleteness, setScenarioEvidenceCompleteness] = useState('High');

  useEffect(() => {
    const apps = getApplications();
    setApplications(apps);
    const initial = targetId ? apps.find((a) => a.id === targetId) : apps[0];
    if (initial) {
      loadApplication(initial);
    }
  }, [targetId]);

  const loadApplication = (app) => {
    setSelectedAppId(app.id);
    setSelectedApp(app);
    // Baseline terms
    setScenarioPrincipal(Math.round(app.requestedAmount * 0.75)); // Default to 75% counterfactual
    setScenarioRate(app.annualInterestRate || 11.0);
    setScenarioTenure(app.tenureMonths ? Math.min(60, app.tenureMonths + 12) : 36);
    setScenarioEvidenceCompleteness('High');
  };

  const handleSelectApp = (appId) => {
    const app = getApplicationById(appId);
    if (app) loadApplication(app);
  };

  const handleResetToOriginal = () => {
    if (selectedApp) {
      setScenarioPrincipal(selectedApp.requestedAmount);
      setScenarioRate(selectedApp.annualInterestRate || 11.0);
      setScenarioTenure(selectedApp.tenureMonths || 36);
      setScenarioEvidenceCompleteness(selectedApp.evidenceCompleteness || 'High');
    }
  };

  if (!selectedApp) {
    return (
      <BankerLayout activeScreen="scenarios" pageTitle="Scenario Comparison">
        <div style={{ padding: '40px', textAlign: 'center', color: colors.textSecondary }}>
          Loading counterfactual modeling tool...
        </div>
      </BankerLayout>
    );
  }

  // Original Baseline Calculations
  const origP = selectedApp.requestedAmount;
  const origR = selectedApp.annualInterestRate || 11.0;
  const origN = selectedApp.tenureMonths || 36;
  const origEMI = calculateEMI(origP, origR, origN);
  const origTotalRepay = calculateTotalRepayment(origEMI, origN);
  const origInterest = calculateTotalInterest(origTotalRepay, origP);

  const netIncome = selectedApp.financials?.netMonthlyInflow || 75000;
  const livingExp = selectedApp.financials?.monthlyLivingExpenses || 32000;
  const existingDebt = selectedApp.financials?.existingDebtObligations || 12000;
  const grossIncome = selectedApp.financials?.grossMonthlyIncome || 85000;

  const origSurplus = calculateRemainingSurplus(netIncome, livingExp, existingDebt, origEMI);
  const origDSCR = calculateDSCR(netIncome - livingExp - existingDebt, origEMI);
  const origDTI = calculateDTI(existingDebt + origEMI, grossIncome);

  // Counterfactual Scenario Calculations
  const scenP = scenarioPrincipal;
  const scenR = scenarioRate;
  const scenN = scenarioTenure;
  const scenEMI = calculateEMI(scenP, scenR, scenN);
  const scenTotalRepay = calculateTotalRepayment(scenEMI, scenN);
  const scenInterest = calculateTotalInterest(scenTotalRepay, scenP);

  const scenSurplus = calculateRemainingSurplus(netIncome, livingExp, existingDebt, scenEMI);
  const scenDSCR = calculateDSCR(netIncome - livingExp - existingDebt, scenEMI);
  const scenDTI = calculateDTI(existingDebt + scenEMI, grossIncome);

  // Deltas (Scenario - Original)
  const diffEMI = scenEMI - origEMI;
  const diffInterest = scenInterest - origInterest;
  const diffTotalRepay = scenTotalRepay - origTotalRepay;
  const diffSurplus = scenSurplus - origSurplus;

  return (
    <BankerLayout
      activeScreen="scenarios"
      pageTitle="Counterfactual Scenario Comparison"
      pageSubtitle="Side-by-side comparative stress test of alternative loan structures without modifying original borrower records."
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate('applicant', selectedApp.id)}
            style={{
              backgroundColor: colors.surface,
              color: colors.brand,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.button,
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconArrowLeft size={14} />
            <span>Applicant File</span>
          </button>
          <button
            onClick={handleResetToOriginal}
            style={{
              backgroundColor: colors.surfaceSubtle,
              color: colors.brand,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.button,
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconRefresh size={14} />
            <span>Reset to Original</span>
          </button>
        </div>
      }
    >
      {/* Top Application Context Selector */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          border: `1px solid ${colors.border}`,
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: shadows.subtle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="scenario-app-select" style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>
            Select Dossier:
          </label>
          <select
            id="scenario-app-select"
            value={selectedAppId}
            onChange={(e) => handleSelectApp(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: radii.input,
              border: `1px solid ${colors.border}`,
              fontSize: '13px',
              color: colors.text,
              backgroundColor: colors.surface,
              cursor: 'pointer',
            }}
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.id} — {app.applicantName} ({app.profileArchetype || app.applicantType})
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '13px', color: colors.textSecondary }}>
          Archetype: <strong style={{ color: colors.brand }}>{selectedApp.profileArchetype}</strong>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}
        className="comparison-grid"
      >
        {/* Column 1: Original Application Baseline */}
        <section
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.card,
            border: `1.5px solid ${colors.border}`,
            padding: '24px',
            boxShadow: shadows.subtle,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${colors.surfaceSubtle}` }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.textMuted, fontWeight: '700' }}>
                Baseline Record
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.brand, margin: '2px 0 0 0' }}>
                Original Requested Terms
              </h2>
            </div>
            <span style={{ fontSize: '11px', backgroundColor: colors.surfaceSubtle, padding: '4px 8px', borderRadius: radii.small, color: colors.textSecondary, fontWeight: '600' }}>
              Locked Input
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: colors.textSecondary }}>Loan Principal:</span>
              <strong style={{ color: colors.brand, fontVariantNumeric: 'tabular-nums' }}>{formatCurrencyINR(origP)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: colors.textSecondary }}>Interest Rate:</span>
              <strong style={{ color: colors.text }}>{origR}% p.a.</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: colors.textSecondary }}>Tenure:</span>
              <strong style={{ color: colors.text }}>{origN} Months ({origN / 12} Yrs)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: colors.textSecondary }}>Evidence Completeness:</span>
              <strong style={{ color: colors.text }}>{selectedApp.evidenceCompleteness}</strong>
            </div>
          </div>

          <div style={{ backgroundColor: colors.surfaceSubtle, padding: '16px', borderRadius: radii.small, marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase' }}>Baseline Monthly Installment</span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: colors.brand, fontVariantNumeric: 'tabular-nums', marginTop: '4px' }}>
              {formatCurrencyINR(origEMI)} <span style={{ fontSize: '13px', fontWeight: '400', color: colors.textSecondary }}>/ mo</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', borderTop: `1px solid ${colors.surfaceSubtle}`, paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Total Interest:</span>
              <strong style={{ color: colors.text }}>{formatCurrencyINR(origInterest)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Total Repayment:</span>
              <strong style={{ color: colors.text }}>{formatCurrencyINR(origTotalRepay)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Remaining Monthly Surplus:</span>
              <strong style={{ color: origSurplus >= 0 ? colors.success : colors.danger }}>
                {formatCurrencyINR(origSurplus)} / mo
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Debt Service Coverage (DSCR):</span>
              <strong style={{ color: origDSCR >= 1.2 ? colors.success : colors.danger }}>{origDSCR}x</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Post-Loan DTI:</span>
              <strong style={{ color: origDTI > 45 ? colors.danger : colors.brand }}>{origDTI}%</strong>
            </div>
          </div>
        </section>

        {/* Column 2: Alternative Counterfactual Scenario */}
        <section
          style={{
            backgroundColor: '#FAFCFF',
            borderRadius: radii.card,
            border: `2px solid ${colors.accent}`,
            padding: '24px',
            boxShadow: shadows.elevated,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid #BFDBFE` }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.accent, fontWeight: '700' }}>
                Counterfactual Simulation
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.brand, margin: '2px 0 0 0' }}>
                Alternative Structure
              </h2>
            </div>
            <span style={{ fontSize: '11px', backgroundColor: colors.accentLight, padding: '4px 8px', borderRadius: radii.small, color: colors.accent, fontWeight: '700' }}>
              Hypothetical
            </span>
          </div>

          {/* Interactive Controls for Scenario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: colors.text }}>Adjust Principal:</span>
                <strong style={{ color: colors.brand }}>{formatCurrencyINR(scenarioPrincipal)}</strong>
              </div>
              <input
                type="range"
                min="50000"
                max={origP * 1.5}
                step="25000"
                value={scenarioPrincipal}
                onChange={(e) => setScenarioPrincipal(Number(e.target.value))}
                style={{ width: '100%', accentColor: colors.accent }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: colors.text }}>Adjust Annual Rate:</span>
                <strong style={{ color: colors.brand }}>{scenarioRate}%</strong>
              </div>
              <input
                type="range"
                min="8.0"
                max="18.0"
                step="0.25"
                value={scenarioRate}
                onChange={(e) => setScenarioRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: colors.accent }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: colors.text }}>Adjust Tenure:</span>
                <strong style={{ color: colors.brand }}>{scenarioTenure} Months ({scenarioTenure / 12} Yrs)</strong>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                step="12"
                value={scenarioTenure}
                onChange={(e) => setScenarioTenure(Number(e.target.value))}
                style={{ width: '100%', accentColor: colors.accent }}
              />
            </div>
          </div>

          {/* Scenario EMI & Diff Tag */}
          <div style={{ backgroundColor: '#EFF6FF', padding: '16px', borderRadius: radii.small, marginBottom: '20px', border: '1px solid #BFDBFE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#1E40AF', textTransform: 'uppercase', fontWeight: '600' }}>
                Simulated Counterfactual EMI
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: diffEMI <= 0 ? colors.success : colors.danger,
                }}
              >
                {diffEMI <= 0 ? `▼ ${formatCurrencyINR(Math.abs(diffEMI))}/mo` : `▲ ${formatCurrencyINR(diffEMI)}/mo`}
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: colors.brand, fontVariantNumeric: 'tabular-nums', marginTop: '4px' }}>
              {formatCurrencyINR(scenEMI)} <span style={{ fontSize: '13px', fontWeight: '400', color: colors.textSecondary }}>/ mo</span>
            </div>
          </div>

          {/* Comparison Ratios & Deltas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', borderTop: `1px solid #DBEAFE`, paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Total Interest:</span>
              <span>
                <strong>{formatCurrencyINR(scenInterest)}</strong>{' '}
                <span style={{ fontSize: '11px', color: diffInterest <= 0 ? colors.success : colors.danger }}>
                  ({diffInterest <= 0 ? `Saved ${formatCurrencyINR(Math.abs(diffInterest))}` : `+${formatCurrencyINR(diffInterest)}`})
                </span>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Total Repayment:</span>
              <strong style={{ color: colors.text }}>{formatCurrencyINR(scenTotalRepay)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Remaining Monthly Surplus:</span>
              <span style={{ fontWeight: '700', color: scenSurplus >= 0 ? colors.success : colors.danger }}>
                {formatCurrencyINR(scenSurplus)} / mo{' '}
                <span style={{ fontSize: '11px' }}>
                  ({diffSurplus >= 0 ? `+${formatCurrencyINR(diffSurplus)}` : formatCurrencyINR(diffSurplus)})
                </span>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Debt Service Coverage (DSCR):</span>
              <strong style={{ color: scenDSCR >= 1.2 ? colors.success : colors.danger }}>
                {scenDSCR}x (vs {origDSCR}x)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.textSecondary }}>Post-Loan DTI:</span>
              <strong style={{ color: scenDTI > 45 ? colors.danger : colors.brand }}>
                {scenDTI}% (vs {origDTI}%)
              </strong>
            </div>
          </div>
        </section>
      </div>

      {/* Fairness & Rule Conformance Note */}
      <div
        style={{
          backgroundColor: colors.surfaceSubtle,
          borderRadius: radii.card,
          border: `1px solid ${colors.border}`,
          padding: '16px 20px',
          fontSize: '13px',
          color: colors.textSecondary,
          lineHeight: '19px',
          display: 'flex',
          gap: '12px',
        }}
      >
        <IconInfo size={20} color={colors.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: colors.text }}>Underwriting Counterfactual Principle:</strong>{' '}
          Changing simulation inputs does not alter the underlying income or obligations of{' '}
          <strong>{selectedApp.applicantName}</strong>. If a smaller principal (e.g. {formatCurrencyINR(scenarioPrincipal)}) is viable, the underwriter can propose a conditional sanction in the Decision tab.
        </div>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .comparison-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </BankerLayout>
  );
}
