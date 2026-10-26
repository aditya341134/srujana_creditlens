import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  RotateCcw,
  Info,
  Table,
  X,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import {
  useUserPortalState,
  calculateEMI,
  formatCurrency,
  formatCurrencyShort
} from './userPortalState';

/**
 * Module 5: Loan Comparison Simulator &
 * Module 6: Actual vs. Hypothetical Comparison
 * Allows users to change amount, APR, and tenure (handles r=0 correctly).
 * Allows users to compare their saved actual application with hypothetical changes
 * without overwriting the original profile, showing which inputs and results changed.
 */
export function LoanSimulator({ onNavigate }) {
  const {
    state,
    toastMessage,
    showToast,
    hypotheticalScenario,
    updateHypotheticalScenario,
    clearHypotheticalScenario,
    submitLoanApplication
  } = useUserPortalState();

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  // View mode switcher: 'calculator' | 'hypothetical'
  const [activeTab, setActiveTab] = useState('calculator');

  // Simulator Inputs (Module 5)
  const [amount, setAmount] = useState(state.application?.requestedAmount || 25000);
  const [apr, setApr] = useState(state.application?.apr || 6.84);
  const [tenureMonths, setTenureMonths] = useState(state.application?.termMonths || 36);
  const [prepayment, setPrepayment] = useState(0);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Amortization Schedule Drawer
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Pre-calculated EMI (handles r=0 properly)
  const emiData = calculateEMI(amount, apr, tenureMonths, prepayment);

  // Cash surplus telemetry calculations
  const verifiedBuffer = state.financials.freeRepaymentSurplus || 1850;
  const absorptionRate = Math.min(100, Math.round((emiData.monthlyEmi / (verifiedBuffer || 1)) * 1000) / 10);
  const unallocatedSurplus = Math.max(0, verifiedBuffer - emiData.monthlyEmi);

  // Principal vs Interest Split
  const principalPct = emiData.totalPayment > 0
    ? Math.round((amount / emiData.totalPayment) * 1000) / 10
    : 100;
  const interestPct = Math.max(0, Math.round((100 - principalPct) * 10) / 10);

  // Reset defaults for calculator
  const handleResetDefaults = () => {
    setAmount(state.application?.requestedAmount || 25000);
    setApr(state.application?.apr || 6.84);
    setTenureMonths(state.application?.termMonths || 36);
    setPrepayment(0);
    showToast('✓ Reset simulation variables to application baseline.');
  };

  // Quick Amount setter
  const quickAmounts = [10000, 18000, 25000, 40000];

  // Quick APR Tiers
  const aprTiers = [
    { label: 'Zero-Interest (0.0% Promo)', rate: 0.0, isZero: true },
    { label: 'Secured Lien', rate: 5.99 },
    { label: 'Unsecured Prime', rate: 6.84, isPrime: true },
    { label: 'Standard Rate', rate: 8.50 }
  ];

  // Tenures
  const tenures = [
    { months: 12, label: '12 Mo', years: '1 Year' },
    { months: 24, label: '24 Mo', years: '2 Years' },
    { months: 36, label: '36 Mo', years: '3 Years', isBestFit: true },
    { months: 48, label: '48 Mo', years: '4 Years' },
    { months: 60, label: '60 Mo', years: '5 Years' }
  ];

  // Scenario comparisons for trade-off analysis
  const scenarioA = calculateEMI(amount, apr, 24);
  const scenarioB = calculateEMI(amount, apr, 36);
  const scenarioC = calculateEMI(amount, apr, 48);

  const getPayoffDate = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Generate monthly amortization table rows
  const generateAmortizationRows = () => {
    const rows = [];
    let balance = amount;
    const monthlyRate = (apr / 100) / 12;
    const payment = emiData.effectiveMonthlyPayment;

    for (let i = 1; i <= emiData.totalMonths && balance > 0; i++) {
      const interest = apr === 0 ? 0 : balance * monthlyRate;
      let principal = payment - interest;
      if (principal > balance) {
        principal = balance;
      }
      const endBalance = Math.max(0, balance - principal);

      rows.push({
        month: i,
        startBalance: balance,
        payment: principal + interest,
        principal,
        interest,
        endBalance
      });

      balance = endBalance;
    }
    return rows;
  };

  // ==========================================
  // MODULE 6: ACTUAL VS HYPOTHETICAL STATE
  // ==========================================
  const actualAmount = state.application.requestedAmount;
  const actualApr = state.application.apr;
  const actualTerm = state.application.termMonths;
  const actualEmiData = calculateEMI(actualAmount, actualApr, actualTerm);
  const actualSurplusRemaining = state.financials.freeRepaymentSurplus - actualEmiData.monthlyEmi;
  const actualDeficitCount = state.financials.isSeasonal ? 3 : 0;

  // Hypothetical scenario inputs (isolated from saved application state)
  const [hypoAmount, setHypoAmount] = useState(hypotheticalScenario?.amount || 18000);
  const [hypoApr, setHypoApr] = useState(hypotheticalScenario?.apr || actualApr);
  const [hypoTerm, setHypoTerm] = useState(hypotheticalScenario?.termMonths || 36);
  const [hypoExtraIncome, setHypoExtraIncome] = useState(hypotheticalScenario?.extraMonthlyIncome || 0);
  const [hypoReducedDebt, setHypoReducedDebt] = useState(hypotheticalScenario?.reducedExpense || 0);

  const hypoEmiData = calculateEMI(hypoAmount, hypoApr, hypoTerm);
  const hypoSurplusRemaining =
    (state.financials.freeRepaymentSurplus + hypoExtraIncome + hypoReducedDebt) - hypoEmiData.monthlyEmi;

  // Seasonal deficit calculation for hypothetical
  // In July (lowest month: inflow $2,850, base expenses $3,200, debt $380)
  const hypoJulySurplus = (2850 + hypoExtraIncome) - 3200 - (state.financials.monthlyDebtObligations - hypoReducedDebt) - hypoEmiData.monthlyEmi;
  const hypoDeficitCount = hypoJulySurplus < 0 && state.financials.isSeasonal ? 2 : 0;

  // Recommended Right-Sized Scenario ($18,000)
  const recAmount = 18000;
  const recEmiData = calculateEMI(recAmount, actualApr, 36);
  const recSurplusRemaining = state.financials.freeRepaymentSurplus - recEmiData.monthlyEmi;

  // Diffs between Actual and Hypothetical
  const amountDiff = hypoAmount - actualAmount;
  const emiDiff = hypoEmiData.monthlyEmi - actualEmiData.monthlyEmi;
  const interestDiff = hypoEmiData.totalInterest - actualEmiData.totalInterest;
  const surplusDiff = hypoSurplusRemaining - actualSurplusRemaining;
  const deficitDiff = hypoDeficitCount - actualDeficitCount;

  const handleApplyHypotheticalToApplication = () => {
    submitLoanApplication({
      requestedAmount: hypoAmount,
      termMonths: hypoTerm,
      apr: hypoApr,
      loanPurpose: state.application.loanPurpose
    });
    showToast(`✓ Updated actual loan request to ${formatCurrencyShort(hypoAmount)} at ${hypoApr}% for ${hypoTerm} Mo!`);
  };

  const handleResetHypothetical = () => {
    setHypoAmount(actualAmount);
    setHypoApr(actualApr);
    setHypoTerm(actualTerm);
    setHypoExtraIncome(0);
    setHypoReducedDebt(0);
    clearHypotheticalScenario();
    showToast('✓ Reset hypothetical scenario to actual profile baseline.');
  };

  const handleLoadRecommendedPreset = () => {
    setHypoAmount(18000);
    setHypoTerm(36);
    setHypoApr(actualApr);
    setHypoExtraIncome(0);
    setHypoReducedDebt(0);
    updateHypotheticalScenario({
      amount: 18000,
      termMonths: 36,
      apr: actualApr,
      label: 'Recommended Right-Sized Loan ($18k)'
    });
    showToast('✓ Loaded recommended $18,000 right-sized loan scenario.');
  };

  return (
    <UserPortalLayout
      activePage="loan-simulator"
      onNavigate={handleNavigate}
      user={state.user}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Banner & Institutional Context */}
        <div className="cl-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Dashboard</span>
                <span>/</span>
                <span style={{ color: '#173B57', fontWeight: '700' }}>Simulator &amp; Comparison</span>
              </div>
              <h1 className="cl-page-title" style={{ marginTop: '4px' }}>
                Loan Comparison &amp; Scenario Simulator
              </h1>
              <p className="cl-page-subtitle">
                Explore repayment terms and compare your actual saved application against hypothetical scenarios.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="cl-badge cl-badge-teal" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <CheckCircle2 size={14} />
                <span>Monthly Surplus: {formatCurrency(verifiedBuffer)}</span>
              </span>
              <button
                type="button"
                className="cl-btn cl-btn-secondary cl-btn-sm"
                onClick={() => setConfirmResetOpen(true)}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Module 5 (Calculator) vs Module 6 (Actual vs Hypothetical) */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #DCE3EA', paddingBottom: '2px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'calculator' ? '3px solid #0F766E' : '3px solid transparent',
              color: activeTab === 'calculator' ? '#0F766E' : '#5B6B79',
              fontWeight: activeTab === 'calculator' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <Sliders size={16} />
            <span>Interactive Loan Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hypothetical')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'hypothetical' ? '3px solid #0F766E' : '3px solid transparent',
              color: activeTab === 'hypothetical' ? '#0F766E' : '#5B6B79',
              fontWeight: activeTab === 'hypothetical' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <Layers size={16} />
            <span>Actual vs. Hypothetical Comparison</span>
            <span className="cl-badge cl-badge-teal" style={{ fontSize: '10px', padding: '2px 6px' }}>Side-by-Side</span>
          </button>
        </div>

        {/* VIEW 1: INTERACTIVE CALCULATOR (MODULE 5) */}
        {activeTab === 'calculator' && (
          <>
            {/* Main Simulator Workbench: 2-Column Split */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'start' }}>
              {/* LEFT COLUMN: Parameter Controller (7 Cols) */}
              <div className="cl-card" style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '8px 14px', borderRadius: '8px', border: '1px solid #DCE3EA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#173B57', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Sliders size={16} />
                    <span>Loan Settings</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#748391', fontWeight: '500' }}>
                    Tier A-2 Prime Rates
                  </span>
                </div>

                {/* Control 1: Requested Loan Amount */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="cl-label">Loan Amount</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', border: '1px solid #DCE3EA', borderRadius: '8px', padding: '4px 12px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', marginRight: '2px' }}>$</span>
                      <input
                        type="number"
                        value={amount}
                        min={1000}
                        max={60000}
                        step={500}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          fontSize: '18px',
                          fontWeight: '800',
                          color: '#173B57',
                          width: '100px',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick amount chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {quickAmounts.map((q) => {
                      const isSelected = amount === q;
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setAmount(q)}
                          style={{
                            padding: '6px 0',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: isSelected ? '#173B57' : '#DCE3EA',
                            background: isSelected ? '#173B57' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#172B3A',
                            fontSize: '12px',
                            fontWeight: isSelected ? '700' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {formatCurrencyShort(q)}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="range"
                    className="cl-slider"
                    min={1000}
                    max={60000}
                    step={500}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#748391' }}>
                    <span>$1,000 Min</span>
                    <span>Median: $30,000</span>
                    <span>$60,000 Max Cap</span>
                  </div>
                </div>

                {/* Control 2: Annual Interest Rate (APR) with 0.0% handling */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label className="cl-label">Annual Interest Rate (APR)</label>
                      {apr === 0 && (
                        <span className="cl-badge cl-badge-teal" style={{ fontSize: '10px' }}>
                          Zero-Interest Mode Active
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', border: '1px solid #DCE3EA', borderRadius: '8px', padding: '4px 12px' }}>
                      <input
                        type="number"
                        step={0.1}
                        value={apr}
                        min={0}
                        max={25}
                        onChange={(e) => setApr(Number(e.target.value))}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          fontSize: '18px',
                          fontWeight: '800',
                          color: '#173B57',
                          width: '60px',
                          textAlign: 'right'
                        }}
                      />
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', marginLeft: '2px' }}>%</span>
                    </div>
                  </div>

                  {/* APR Tiers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {aprTiers.map((tier) => {
                      const isSelected = apr === tier.rate;
                      return (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => setApr(tier.rate)}
                          style={{
                            padding: '6px 4px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: isSelected ? '#0F766E' : '#DCE3EA',
                            background: isSelected ? '#E6F4F1' : '#FFFFFF',
                            color: isSelected ? '#0F766E' : '#5B6B79',
                            fontSize: '11px',
                            fontWeight: isSelected ? '700' : '500',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <span>{tier.label}</span>
                          <strong>{tier.rate.toFixed(1)}%</strong>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="range"
                    className="cl-slider"
                    min={0}
                    max={20}
                    step={0.25}
                    value={apr}
                    onChange={(e) => setApr(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#748391' }}>
                    <span>0.0% (Zero-Interest)</span>
                    <span>7.0% Prime</span>
                    <span>20.0% Max</span>
                  </div>
                </div>

                {/* Control 3: Repayment Tenure */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="cl-label">Repayment Tenure</label>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#173B57' }}>
                      {tenureMonths} Months ({tenureMonths / 12} Years)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {tenures.map((t) => {
                      const isSelected = tenureMonths === t.months;
                      return (
                        <button
                          key={t.months}
                          type="button"
                          onClick={() => setTenureMonths(t.months)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: isSelected ? '#173B57' : '#DCE3EA',
                            background: isSelected ? '#173B57' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#172B3A',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <strong style={{ fontSize: '13px' }}>{t.label}</strong>
                          <span style={{ fontSize: '10px', opacity: isSelected ? 0.9 : 0.7 }}>{t.years}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Real-Time Results & Surplus Impact (5 Cols) */}
              <div className="cl-card" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #DCE3EA', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
                      Monthly Payment
                    </span>
                    <span className="cl-badge cl-badge-teal">
                      {apr === 0 ? '0.0% APR' : 'Standard Formula'}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '36px', fontWeight: '800', color: '#172B3A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {formatCurrency(emiData.monthlyEmi)}
                      </span>
                      <span style={{ fontSize: '14px', color: '#748391' }}>/ month</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
                      {apr === 0 ? 'Equal principal split over term' : 'Fixed monthly payment (principal & interest)'}
                    </p>
                  </div>

                  {/* Surplus Safety Gauge Meter */}
                  <div className="cl-card-flat" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#172B3A' }}>Monthly Budget Impact</span>
                      <strong style={{ color: absorptionRate > 65 ? '#925D00' : '#0F766E' }}>
                        Uses {absorptionRate}% of cushion
                      </strong>
                    </div>

                    <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${absorptionRate}%`,
                          height: '100%',
                          background: absorptionRate > 65 ? '#925D00' : '#0F766E',
                          transition: 'width 0.3s ease'
                        }}
                      ></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5B6B79', marginTop: '6px' }}>
                      <span>Cushion: {formatCurrency(verifiedBuffer)}</span>
                      <strong style={{ color: '#172B3A' }}>{formatCurrency(unallocatedSurplus)} remaining</strong>
                    </div>
                  </div>

                  {/* Principal vs Interest Visual Donut / Stacked Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5B6B79' }}>
                      <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>Repayment Capital Split</span>
                      <span>{principalPct}% Principal • {interestPct}% Interest</span>
                    </div>

                    <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${principalPct}%`, height: '100%', background: '#173B57' }} title="Principal"></div>
                      <div style={{ width: `${interestPct}%`, height: '100%', background: '#925D00' }} title="Interest"></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#172B3A', marginTop: '2px' }}>
                      <div>Principal: <strong>{formatCurrency(amount)}</strong></div>
                      <div>Total Interest: <strong>{formatCurrency(emiData.totalInterest)}</strong></div>
                    </div>
                  </div>
                </div>

                {/* KPI Summary Quad */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="cl-card-flat" style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '700' }}>
                      Total Repayment
                    </span>
                    <strong style={{ fontSize: '18px', color: '#172B3A', display: 'block', margin: '4px 0 2px' }}>
                      {formatCurrency(emiData.totalPayment)}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>Term summation</span>
                  </div>

                  <div className="cl-card-flat" style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '700' }}>
                      Estimated Payoff
                    </span>
                    <strong style={{ fontSize: '18px', color: '#172B3A', display: 'block', margin: '4px 0 2px' }}>
                      {getPayoffDate(emiData.totalMonths)}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>{emiData.totalMonths} cycles</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => setScheduleModalOpen(true)}
                >
                  <Table size={15} />
                  <span>View Full Amortization Schedule</span>
                </button>
              </div>
            </div>

            {/* Scenario Trade-off Comparison Quad */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #DCE3EA' }}>
                <div>
                  <h2 className="cl-section-title">Tenure Trade-Off Analysis</h2>
                  <p className="cl-helper-text">
                    Compare 24, 36, and 48 month amortization against your monthly cash cushion.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* 24 Mo */}
                <div className="cl-card-flat" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#748391' }}>24 Months (Accelerated)</span>
                    <span className="cl-badge cl-badge-neutral">2 Years</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#172B3A' }}>
                    {formatCurrency(scenarioA.monthlyEmi)}/mo
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B79' }}>
                    Total Interest: <strong>{formatCurrency(scenarioA.totalInterest)}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F766E' }}>
                    Remaining Surplus: <strong>{formatCurrency(verifiedBuffer - scenarioA.monthlyEmi)}/mo</strong>
                  </div>
                </div>

                {/* 36 Mo */}
                <div className="cl-card-flat" style={{ padding: '16px', border: '2px solid #0F766E', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F766E' }}>36 Months (Optimal Fit)</span>
                    <span className="cl-badge cl-badge-teal">Recommended</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F766E' }}>
                    {formatCurrency(scenarioB.monthlyEmi)}/mo
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B79' }}>
                    Total Interest: <strong>{formatCurrency(scenarioB.totalInterest)}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F766E' }}>
                    Remaining Surplus: <strong>{formatCurrency(verifiedBuffer - scenarioB.monthlyEmi)}/mo</strong>
                  </div>
                </div>

                {/* 48 Mo */}
                <div className="cl-card-flat" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#748391' }}>48 Months (Low Payment)</span>
                    <span className="cl-badge cl-badge-neutral">4 Years</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#172B3A' }}>
                    {formatCurrency(scenarioC.monthlyEmi)}/mo
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B79' }}>
                    Total Interest: <strong>{formatCurrency(scenarioC.totalInterest)}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F766E' }}>
                    Remaining Surplus: <strong>{formatCurrency(verifiedBuffer - scenarioC.monthlyEmi)}/mo</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: ACTUAL VS HYPOTHETICAL COMPARISON (MODULE 6) */}
        {activeTab === 'hypothetical' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Explanatory Banner */}
            <div
              style={{
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '13px',
                color: '#0369A1'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={18} color="#0284C7" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Isolated Scenario Testing:</strong> Test changes to loan amount, interest rate, or income without modifying your actual recorded application. Your saved baseline remains completely safe.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary cl-btn-sm"
                  onClick={handleLoadRecommendedPreset}
                >
                  <Sparkles size={13} color="#0F766E" />
                  <span>Load $18k Safe Preset</span>
                </button>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary cl-btn-sm"
                  onClick={handleResetHypothetical}
                >
                  <RotateCcw size={13} />
                  <span>Reset to Actual</span>
                </button>
              </div>
            </div>

            {/* 3-Column Side-by-Side Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'stretch' }}>
              {/* Column 1: Actual Profile (Baseline) */}
              <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #173B57' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
                      Profile 1 • Actual Application
                    </span>
                    <span className="cl-badge cl-badge-neutral">Current Saved</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#172B3A', margin: '4px 0' }}>
                    {formatCurrencyShort(actualAmount)} Requested
                  </h3>
                  <span style={{ fontSize: '12px', color: '#748391' }}>
                    {actualApr}% APR • {actualTerm} Months
                  </span>

                  <div style={{ margin: '16px 0', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                      Monthly Payment (EMI)
                    </span>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: '#172B3A' }}>
                      {formatCurrency(actualEmiData.monthlyEmi)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                      Total Interest: {formatCurrency(actualEmiData.totalInterest)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Total Repayment:</span>
                      <strong>{formatCurrency(actualEmiData.totalPayment)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Average Monthly Surplus:</span>
                      <strong style={{ color: '#0F766E' }}>{formatCurrency(actualSurplusRemaining)}/mo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>July Off-Season Cash:</span>
                      <strong style={{ color: '#B91C1C' }}>-$730.00 (Deficit)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Seasonal Deficit Risk:</span>
                      <strong style={{ color: '#B91C1C' }}>3 Deficit Months</strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <span className="cl-badge cl-badge-warning" style={{ width: '100%', justifyContent: 'center' }}>
                    Requires Seasonal Structuring
                  </span>
                </div>
              </div>

              {/* Column 2: Hypothetical Scenario (Live Slider Controller) */}
              <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #0F766E', background: '#F8FAFC' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase' }}>
                      Profile 2 • Hypothetical Workbench
                    </span>
                    <span className="cl-badge cl-badge-teal">Real-Time Testing</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F766E', margin: '4px 0' }}>
                    {formatCurrencyShort(hypoAmount)} Simulated
                  </h3>
                  <span style={{ fontSize: '12px', color: '#748391' }}>
                    {hypoApr}% APR • {hypoTerm} Months
                  </span>

                  {/* Sliders to modify hypothetical */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0', background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #DCE3EA' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span>Hypothetical Amount:</span>
                        <strong>{formatCurrencyShort(hypoAmount)}</strong>
                      </div>
                      <input
                        type="range"
                        className="cl-slider"
                        min={5000}
                        max={50000}
                        step={500}
                        value={hypoAmount}
                        onChange={(e) => setHypoAmount(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span>Repayment Tenure:</span>
                        <strong>{hypoTerm} Months</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[24, 36, 48].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setHypoTerm(t)}
                            style={{
                              flex: 1,
                              padding: '4px 0',
                              fontSize: '11px',
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: hypoTerm === t ? '#0F766E' : '#DCE3EA',
                              background: hypoTerm === t ? '#0F766E' : '#FFFFFF',
                              color: hypoTerm === t ? '#FFFFFF' : '#172B3A',
                              cursor: 'pointer'
                            }}
                          >
                            {t} Mo
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Calculated Result */}
                  <div style={{ margin: '10px 0', padding: '12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #DCE3EA' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                      Simulated Monthly Payment
                    </span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F766E' }}>
                      {formatCurrency(hypoEmiData.monthlyEmi)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                      Total Interest: {formatCurrency(hypoEmiData.totalInterest)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Total Repayment:</span>
                      <strong>{formatCurrency(hypoEmiData.totalPayment)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Surplus Remaining:</span>
                      <strong style={{ color: '#0F766E' }}>{formatCurrency(hypoSurplusRemaining)}/mo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>July Off-Season Cash:</span>
                      <strong style={{ color: hypoJulySurplus >= 0 ? '#0F766E' : '#B91C1C' }}>
                        {formatCurrency(hypoJulySurplus)}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Seasonal Deficits:</span>
                      <strong style={{ color: hypoDeficitCount === 0 ? '#0F766E' : '#B91C1C' }}>
                        {hypoDeficitCount === 0 ? '0 Months (Safe!)' : `${hypoDeficitCount} Months`}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className="cl-btn cl-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleApplyHypotheticalToApplication}
                  >
                    <span>Apply to My Application</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Column 3: Recommended Right-Sized Scenario */}
              <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #245EA8' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#245EA8', textTransform: 'uppercase' }}>
                      Profile 3 • Copilot Preset
                    </span>
                    <span className="cl-badge cl-badge-teal">Optimal Fit</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#172B3A', margin: '4px 0' }}>
                    $18,000 Right-Sized
                  </h3>
                  <span style={{ fontSize: '12px', color: '#748391' }}>
                    {actualApr}% APR • 36 Months
                  </span>

                  <div style={{ margin: '16px 0', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                      Monthly Payment (EMI)
                    </span>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: '#172B3A' }}>
                      {formatCurrency(recEmiData.monthlyEmi)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: '600' }}>
                      Saves $809 in Total Interest
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Total Repayment:</span>
                      <strong>{formatCurrency(recEmiData.totalPayment)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Average Monthly Surplus:</span>
                      <strong style={{ color: '#0F766E' }}>{formatCurrency(recSurplusRemaining)}/mo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>July Off-Season Cash:</span>
                      <strong style={{ color: '#0F766E' }}>+$45.00 (Solvent)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Seasonal Deficits:</span>
                      <strong style={{ color: '#0F766E' }}>0 Months (Safe Year-Round!)</strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className="cl-btn cl-btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleLoadRecommendedPreset}
                  >
                    <span>Load This Preset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Diffs & Financial Results Impact Table (Prompt Requirement) */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #DCE3EA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#0F766E" />
                  <h3 className="cl-card-title" style={{ fontSize: '16px' }}>
                    Input &amp; Financial Result Diffs: Actual vs. Hypothetical
                  </h3>
                </div>
                <span style={{ fontSize: '12px', color: '#748391' }}>
                  Quantified variances between Profile 1 (Actual) and Profile 2 (Hypothetical)
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="cl-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #DCE3EA', textAlign: 'left', color: '#5B6B79' }}>
                      <th style={{ padding: '10px 14px' }}>Parameter</th>
                      <th style={{ padding: '10px 14px' }}>Actual Saved Value</th>
                      <th style={{ padding: '10px 14px' }}>Hypothetical Value</th>
                      <th style={{ padding: '10px 14px' }}>Net Diff</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Financial Implication</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>Loan Amount</td>
                      <td style={{ padding: '12px 14px' }}>{formatCurrency(actualAmount)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0F766E' }}>{formatCurrency(hypoAmount)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`cl-badge ${amountDiff < 0 ? 'cl-badge-teal' : amountDiff > 0 ? 'cl-badge-warning' : 'cl-badge-neutral'}`}>
                          {amountDiff > 0 ? `+${formatCurrency(amountDiff)}` : formatCurrency(amountDiff)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#5B6B79' }}>
                        {amountDiff < 0 ? 'Reduces overall debt principal' : amountDiff > 0 ? 'Increases total borrowing' : 'Identical principal'}
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>Monthly Payment (EMI)</td>
                      <td style={{ padding: '12px 14px' }}>{formatCurrency(actualEmiData.monthlyEmi)}/mo</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0F766E' }}>{formatCurrency(hypoEmiData.monthlyEmi)}/mo</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`cl-badge ${emiDiff < 0 ? 'cl-badge-teal' : emiDiff > 0 ? 'cl-badge-warning' : 'cl-badge-neutral'}`}>
                          {emiDiff > 0 ? `+${formatCurrency(emiDiff)}/mo` : `${formatCurrency(emiDiff)}/mo`}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#5B6B79' }}>
                        {emiDiff < 0 ? `Frees up ${formatCurrency(Math.abs(emiDiff))}/mo monthly cash` : 'Higher monthly obligation'}
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>Total Interest Paid</td>
                      <td style={{ padding: '12px 14px' }}>{formatCurrency(actualEmiData.totalInterest)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0F766E' }}>{formatCurrency(hypoEmiData.totalInterest)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`cl-badge ${interestDiff < 0 ? 'cl-badge-teal' : interestDiff > 0 ? 'cl-badge-warning' : 'cl-badge-neutral'}`}>
                          {interestDiff < 0 ? `Saves ${formatCurrency(Math.abs(interestDiff))}` : `+${formatCurrency(interestDiff)}`}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#5B6B79' }}>
                        {interestDiff < 0 ? 'Cumulative finance charge reduction' : 'Higher lifetime interest expense'}
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>Monthly Surplus Cushion</td>
                      <td style={{ padding: '12px 14px' }}>{formatCurrency(actualSurplusRemaining)}/mo</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0F766E' }}>{formatCurrency(hypoSurplusRemaining)}/mo</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`cl-badge ${surplusDiff >= 0 ? 'cl-badge-teal' : 'cl-badge-warning'}`}>
                          {surplusDiff >= 0 ? `+${formatCurrency(surplusDiff)}/mo` : `${formatCurrency(surplusDiff)}/mo`}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#5B6B79' }}>
                        {surplusDiff >= 0 ? 'Expands unallocated monthly cash buffer' : 'Tighter monthly buffer'}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>Lean Season Deficit Risk</td>
                      <td style={{ padding: '12px 14px', color: '#B91C1C', fontWeight: '700' }}>{actualDeficitCount} Months Deficit</td>
                      <td style={{ padding: '12px 14px', color: hypoDeficitCount === 0 ? '#0F766E' : '#B91C1C', fontWeight: '700' }}>
                        {hypoDeficitCount} Months Deficit
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`cl-badge ${deficitDiff <= 0 ? 'cl-badge-teal' : 'cl-badge-warning'}`}>
                          {deficitDiff < 0 ? `${Math.abs(deficitDiff)} Deficits Eliminated` : 'Identical Risk'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0F766E', fontWeight: '600' }}>
                        {hypoDeficitCount === 0 ? '✓ 100% Cashflow Positive Year-Round' : 'Requires summer reserve buffer'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Amortization Schedule Drawer / Modal */}
      {scheduleModalOpen && (
        <div className="cl-modal-overlay">
          <div className="cl-modal-card" style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Full Amortization Schedule
                </h3>
                <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
                  {formatCurrency(amount)} at {apr}% APR for {tenureMonths} months
                </p>
              </div>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setScheduleModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '50vh', border: '1px solid #DCE3EA', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0, borderBottom: '1px solid #DCE3EA' }}>
                  <tr>
                    <th style={{ padding: '8px 12px', color: '#173B57' }}>#</th>
                    <th style={{ padding: '8px 12px', color: '#173B57' }}>Beginning</th>
                    <th style={{ padding: '8px 12px', color: '#173B57' }}>Payment</th>
                    <th style={{ padding: '8px 12px', color: '#173B57' }}>Principal</th>
                    <th style={{ padding: '8px 12px', color: '#173B57' }}>Interest</th>
                    <th style={{ padding: '8px 12px', color: '#173B57' }}>Ending</th>
                  </tr>
                </thead>
                <tbody>
                  {generateAmortizationRows().map((row) => (
                    <tr key={row.month} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '600' }}>{row.month}</td>
                      <td style={{ padding: '8px 12px' }}>{formatCurrency(row.startBalance)}</td>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#173B57' }}>{formatCurrency(row.payment)}</td>
                      <td style={{ padding: '8px 12px', color: '#0F766E' }}>{formatCurrency(row.principal)}</td>
                      <td style={{ padding: '8px 12px', color: '#925D00' }}>{formatCurrency(row.interest)}</td>
                      <td style={{ padding: '8px 12px' }}>{formatCurrency(row.endBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="cl-btn cl-btn-secondary"
                onClick={() => setScheduleModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmResetOpen}
        title="Reset Simulator Variables?"
        message="Are you sure you want to reset all loan calculator parameters back to your saved application baseline ($25,000 at 6.84% APR for 36 months)?"
        confirmLabel="Reset Variables"
        cancelLabel="Keep Values"
        onConfirm={() => {
          setConfirmResetOpen(false);
          handleResetDefaults();
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </UserPortalLayout>
  );
}

export default LoanSimulator;
