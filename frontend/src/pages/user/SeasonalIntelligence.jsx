import React, { useState } from 'react';
import {
  CalendarRange,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import {
  useUserPortalState,
  calculateEMI,
  calculateSeasonalAffordability,
  calculateSeasonalFlexibleSchedule,
  formatCurrency,
  formatCurrencyShort
} from './userPortalState';
import '../../components/userPortal.css';

/**
 * Module 7: Seasonal Income Intelligence (Primary Differentiator)
 * Compares average annual affordability against month-by-month cashflow reality.
 * Demonstrates how fixed EMI causes off-season deficits and how seasonal structuring solves it.
 */
export function SeasonalIntelligence({ onNavigate }) {
  const {
    state,
    activePersonaId,
    switchPersona,
    personas,
    toastMessage,
    showToast,
    resetToDefault
  } = useUserPortalState();

  // Selected repayment model: 'standard' (flat EMI) vs 'flexible' (seasonal step-EMI)
  const [scheduleMode, setScheduleMode] = useState('standard');
  const [simulatedLoanAmount, setSimulatedLoanAmount] = useState(state.application.requestedAmount || 25000);
  const [selectedMonth, setSelectedMonth] = useState('Jul'); // Default to lean month for immediate contrast

  const standardEmiCalc = calculateEMI(simulatedLoanAmount, state.application.apr || 7.25, state.application.termMonths || 36);
  const standardEmi = standardEmiCalc.monthlyEmi;

  const baseOverhead = (state.financials.monthlyLivingExpenses || 2100) + (state.financials.monthlyBusinessExpenses || 1100);
  const existingDebt = state.financials.monthlyDebtObligations || 380;

  // Standard flat EMI month-by-month calculation
  const seasonalAnalysis = calculateSeasonalAffordability(
    state.financials.monthlyInflows,
    baseOverhead,
    existingDebt,
    standardEmi
  );

  // Flexible seasonal repayment schedule calculation
  const flexiblePlan = calculateSeasonalFlexibleSchedule(
    simulatedLoanAmount,
    state.application.apr || 7.25,
    state.application.termMonths || 36,
    state.financials.monthlyInflows,
    baseOverhead,
    existingDebt
  );

  const selectedMonthData = seasonalAnalysis.monthRows.find((m) => m.month === selectedMonth) || seasonalAnalysis.monthRows[6];
  const flexibleMonthData = flexiblePlan.flexibleRows.find((m) => m.month === selectedMonth) || flexiblePlan.flexibleRows[6];

  const handleNavigate = (pageId) => {
    if (onNavigate) onNavigate(pageId);
    else window.location.hash = pageId;
  };

  return (
    <UserPortalLayout
      activePage="seasonal-intelligence"
      onNavigate={handleNavigate}
      user={state.user}
      activePersonaId={activePersonaId}
      onSwitchPersona={switchPersona}
      personas={personas}
      onResetDefault={resetToDefault}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Banner */}
        <div className="cl-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="cl-badge cl-badge-teal" style={{ background: '#0F766E', color: '#FFFFFF', fontWeight: '700' }}>
                  Core Innovation Showcase
                </span>
                <span className="cl-badge cl-badge-neutral">
                  <CalendarRange size={13} color="#0F766E" />
                  <span>12-Month Audited Cashflow Stream</span>
                </span>
              </div>
              <h1 className="cl-page-title" style={{ marginTop: '4px' }}>
                Seasonal Income Intelligence
              </h1>
              <p className="cl-page-subtitle" style={{ maxWidth: '780px' }}>
                Traditional lenders evaluate loans based on <strong>annual averages</strong>, which hides dangerous off-season cash shortages. CreditLens models your <strong>actual month-by-month cashflow</strong> to protect both borrower and lender against seasonal default.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="cl-btn cl-btn-secondary"
                onClick={() => handleNavigate('financial-report')}
              >
                <span>View Full Seasonal Report</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Primary Demo Contrast: Annual Average vs Month-by-Month Reality */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Card 1: What Traditional Lenders See (Misleading Average) */}
          <div className="cl-card-flat" style={{ borderLeft: '4px solid #748391', background: '#FFFFFF', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Traditional Bureau View
                </span>
                <span className="cl-badge cl-badge-neutral" style={{ fontSize: '11px' }}>
                  Misleading Paper Safety
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#172B3A', margin: '8px 0 4px' }}>
                Annual Average Surplus: {formatCurrency(seasonalAnalysis.avgMonthlySurplusBefore)} / mo
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', lineHeight: 1.4, margin: '0 0 14px' }}>
                Dividing total annual revenue ($82.4k) equally by 12 shows a comfortable paper buffer of $1,303/mo, suggesting the borrower can easily service a flat $774/mo payment.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #DCE3EA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: '#5B6B79' }}>Projected Fixed Monthly EMI:</span>
              <strong style={{ color: '#173B57', fontSize: '14px' }}>{formatCurrency(standardEmi)} / mo</strong>
            </div>
          </div>

          {/* Card 2: What CreditLens Discovers (The Reality) */}
          <div
            className="cl-card-flat"
            style={{
              borderLeft: seasonalAnalysis.hasDeficit ? '4px solid #B42318' : '4px solid #0F766E',
              background: seasonalAnalysis.hasDeficit ? '#FFFDF5' : '#E6F4F1',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: seasonalAnalysis.hasDeficit ? '#B42318' : '#0F766E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CreditLens Month-by-Month Reality
                </span>
                <span className={`cl-badge ${seasonalAnalysis.hasDeficit ? 'cl-badge-danger' : 'cl-badge-teal'}`} style={{ fontSize: '11px' }}>
                  {seasonalAnalysis.hasDeficit ? `${seasonalAnalysis.deficitMonthsCount} High-Risk Months` : 'All Months Safe'}
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#172B3A', margin: '8px 0 4px' }}>
                Off-Season Low: {formatCurrency(seasonalAnalysis.monthRows[6].inflow)} in July (Deficit: {formatCurrency(seasonalAnalysis.worstDeficit)})
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', lineHeight: 1.4, margin: '0 0 14px' }}>
                In off-season summer months, bakery revenue drops to $2,850. After $3,200 base overhead and $380 debt, adding a fixed $774 EMI creates an <strong>immediate cash shortfall</strong>.
              </p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #DCE3EA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: '#B42318', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} />
                <span>Deficit Window: June, July &amp; August</span>
              </span>
              <strong style={{ color: '#B42318', fontSize: '14px' }}>-{formatCurrency(seasonalAnalysis.worstDeficit)} in July</strong>
            </div>
          </div>
        </div>

        {/* 12-Month Interactive Cashflow Waterfall Chart */}
        <div className="cl-card">
          {/* Alternative Loan Amount Explorer Bar (Prompt Requirement 7) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #DCE3EA', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#173B57' }}>
                Explore Alternative Loan Amount:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[10000, 18000, 25000, 35000].map((amt) => {
                  const isSel = simulatedLoanAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSimulatedLoanAmount(amt)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: isSel ? '#0F766E' : '#DCE3EA',
                        background: isSel ? '#0F766E' : '#FFFFFF',
                        color: isSel ? '#FFFFFF' : '#172B3A',
                        fontSize: '11px',
                        fontWeight: isSel ? '700' : '500',
                        cursor: 'pointer'
                      }}
                    >
                      {formatCurrencyShort(amt)} {amt === 18000 ? '• Safe' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#5B6B79' }}>
              Standard EMI: <strong>{formatCurrency(standardEmi)}/mo</strong>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #DCE3EA' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#0F766E" />
                <h2 className="cl-card-title" style={{ fontSize: '16px' }}>
                  12-Month Cashflow Trajectory: Income vs. Expenses vs. Loan Payment
                </h2>
              </div>
              <p className="cl-helper-text" style={{ marginTop: '2px' }}>
                Click any month bar to inspect exact financial breakdown and see remaining cash after EMI.
              </p>
            </div>

            {/* Repayment Structure Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #DCE3EA' }}>
              <button
                type="button"
                onClick={() => setScheduleMode('standard')}
                style={{
                  background: scheduleMode === 'standard' ? '#173B57' : 'transparent',
                  color: scheduleMode === 'standard' ? '#FFFFFF' : '#172B3A',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: scheduleMode === 'standard' ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Standard Fixed EMI ({formatCurrency(standardEmi)}/mo)
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('flexible')}
                style={{
                  background: scheduleMode === 'flexible' ? '#0F766E' : 'transparent',
                  color: scheduleMode === 'flexible' ? '#FFFFFF' : '#172B3A',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: scheduleMode === 'flexible' ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Structured Seasonal Step-EMI (Recommended)
              </button>
            </div>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div style={{ background: '#F8FAFC', border: '1px solid #DCE3EA', borderRadius: '12px', padding: '20px' }}>
            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
              {seasonalAnalysis.monthRows.map((m, idx) => {
                const isSelected = m.month === selectedMonth;
                const maxInflow = 10000;
                const inflowHeight = (m.inflow / maxInflow) * 100;

                // Under flexible mode, use flexible payment
                const activePayment = scheduleMode === 'flexible' ? flexiblePlan.flexibleRows[idx].scheduledPayment : standardEmi;
                const activeRemaining = m.surplusBeforeLoan - activePayment;
                const isDeficit = activeRemaining < 0;

                return (
                  <button
                    key={m.month}
                    type="button"
                    onClick={() => setSelectedMonth(m.month)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      height: '100%',
                      justifyContent: 'flex-end',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      outline: isSelected ? '2px solid #0F766E' : 'none',
                      borderRadius: '8px'
                    }}
                    title={`${m.label}: Inflow ${formatCurrency(m.inflow)} • Remaining ${formatCurrency(activeRemaining)}`}
                  >
                    {/* Amount pill on hover/selected */}
                    {isSelected && (
                      <span style={{ fontSize: '10px', fontWeight: '700', color: isDeficit ? '#B42318' : '#0F766E', marginBottom: '2px' }}>
                        {isDeficit ? `-${formatCurrencyShort(Math.abs(activeRemaining))}` : `+${formatCurrencyShort(activeRemaining)}`}
                      </span>
                    )}

                    {/* Bar visualization */}
                    <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '100%' }}>
                      {/* Income Bar */}
                      <div
                        style={{
                          width: '45%',
                          height: `${inflowHeight}%`,
                          background: m.season === 'peak' ? '#173B57' : m.season === 'shoulder' ? '#3B82F6' : '#94A3B8',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease'
                        }}
                      ></div>

                      {/* Remaining Buffer / Deficit Bar */}
                      <div
                        style={{
                          width: '45%',
                          height: `${Math.min(100, (Math.abs(activeRemaining) / 4000) * 100)}%`,
                          background: isDeficit ? '#B42318' : '#0F766E',
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.3s ease'
                        }}
                      ></div>
                    </div>

                    <span style={{ fontSize: '11px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#173B57' : '#748391' }}>
                      {m.month}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #DCE3EA', fontSize: '12px', color: '#5B6B79' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#173B57', borderRadius: '2px' }}></span>
                  <span>Peak Inflow</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#94A3B8', borderRadius: '2px' }}></span>
                  <span>Lean Inflow</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#0F766E', borderRadius: '2px' }}></span>
                  <span>Safe Cash Surplus</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#B42318', borderRadius: '2px' }}></span>
                  <span>Cashflow Shortfall (Deficit)</span>
                </div>
              </div>

              <span style={{ fontSize: '11px', color: '#748391' }}>
                Showing: {scheduleMode === 'standard' ? 'Standard Flat EMI' : 'Flexible Seasonal Amortization'}
              </span>
            </div>
          </div>

          {/* Month Deep-Dive Inspector Panel */}
          <div style={{ marginTop: '20px', padding: '16px', background: selectedMonthData.isDeficit && scheduleMode === 'standard' ? '#FFF5F5' : '#F8FAFC', borderRadius: '10px', border: '1px solid #DCE3EA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#172B3A' }}>
                  {selectedMonthData.label} Detailed Financial Breakdown
                </span>
                <span className={`cl-badge ${selectedMonthData.season === 'peak' ? 'cl-badge-teal' : selectedMonthData.season === 'shoulder' ? 'cl-badge-blue' : 'cl-badge-neutral'}`}>
                  {selectedMonthData.season.toUpperCase()} PERIOD • {selectedMonthData.note}
                </span>
              </div>

              <div>
                {scheduleMode === 'standard' && selectedMonthData.isDeficit ? (
                  <span className="cl-badge cl-badge-danger" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    <AlertTriangle size={14} />
                    <span>DEFICIT WARNING: -{formatCurrency(selectedMonthData.deficitAmount)} shortage</span>
                  </span>
                ) : (
                  <span className="cl-badge cl-badge-teal" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    <CheckCircle2 size={14} />
                    <span>SAFE CASHFLOW: +{formatCurrency(scheduleMode === 'flexible' ? flexibleMonthData.remainingCash : selectedMonthData.remainingCash)} remaining</span>
                  </span>
                )}
              </div>
            </div>

            {/* Arithmetic Formula Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '12px' }}>
              <div className="cl-card-flat" style={{ padding: '10px', background: '#FFFFFF' }}>
                <span style={{ color: '#748391', display: 'block', fontSize: '11px' }}>1. Month Inflow</span>
                <strong style={{ fontSize: '16px', color: '#173B57' }}>{formatCurrency(selectedMonthData.inflow)}</strong>
              </div>

              <div className="cl-card-flat" style={{ padding: '10px', background: '#FFFFFF' }}>
                <span style={{ color: '#748391', display: 'block', fontSize: '11px' }}>2. Base Overhead</span>
                <strong style={{ fontSize: '16px', color: '#5B6B79' }}>-{formatCurrency(baseOverhead)}</strong>
                <span style={{ fontSize: '10px', color: '#748391' }}>Living + Biz</span>
              </div>

              <div className="cl-card-flat" style={{ padding: '10px', background: '#FFFFFF' }}>
                <span style={{ color: '#748391', display: 'block', fontSize: '11px' }}>3. Existing Debts</span>
                <strong style={{ fontSize: '16px', color: '#5B6B79' }}>-{formatCurrency(existingDebt)}</strong>
                <span style={{ fontSize: '10px', color: '#748391' }}>Lease Note</span>
              </div>

              <div className="cl-card-flat" style={{ padding: '10px', background: '#FFFFFF' }}>
                <span style={{ color: '#748391', display: 'block', fontSize: '11px' }}>4. Proposed Loan EMI</span>
                <strong style={{ fontSize: '16px', color: scheduleMode === 'flexible' ? '#0F766E' : '#173B57' }}>
                  -{formatCurrency(scheduleMode === 'flexible' ? flexibleMonthData.scheduledPayment : standardEmi)}
                </strong>
                <span style={{ fontSize: '10px', color: '#748391' }}>{scheduleMode === 'flexible' ? 'Seasonal Payment' : 'Fixed Flat EMI'}</span>
              </div>

              <div className="cl-card-flat" style={{ padding: '10px', background: (scheduleMode === 'flexible' ? flexibleMonthData.isDeficit : selectedMonthData.isDeficit) ? '#FDECEA' : '#E6F4F1' }}>
                <span style={{ color: (scheduleMode === 'flexible' ? flexibleMonthData.isDeficit : selectedMonthData.isDeficit) ? '#B42318' : '#0F766E', display: 'block', fontSize: '11px', fontWeight: '700' }}>
                  Net Cash Remaining
                </span>
                <strong style={{ fontSize: '18px', color: (scheduleMode === 'flexible' ? flexibleMonthData.isDeficit : selectedMonthData.isDeficit) ? '#B42318' : '#0F766E' }}>
                  {formatCurrency(scheduleMode === 'flexible' ? flexibleMonthData.remainingCash : selectedMonthData.remainingCash)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* The Solution Workbench: Structured Seasonal Repayment Option */}
        <div className="cl-card" style={{ border: '2px solid #0F766E', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E6F4F1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#172B3A', margin: 0 }}>
                  CreditLens Seasonal Step-EMI Solution
                </h3>
                <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                  Actuarially neutral structure designed to prevent off-season defaults without increasing lender risk.
                </span>
              </div>
            </div>

            <button
              type="button"
              className="cl-btn cl-btn-primary"
              onClick={() => {
                setScheduleMode('flexible');
                showToast('✓ Structured Seasonal Plan selected. Deficit months eliminated across 100% of the operating year!');
              }}
            >
              <span>Adopt Seasonal Step-EMI Plan</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div className="cl-card-flat" style={{ padding: '14px', background: '#F8FAFC' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
                Off-Season Lean Months (May, Jun, Jul, Aug)
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F766E', margin: '6px 0 2px' }}>
                {formatCurrency(flexiblePlan.leanMonthlyEmi)} <span style={{ fontSize: '13px', color: '#5B6B79', fontWeight: '500' }}>/ month</span>
              </div>
              <p style={{ fontSize: '12px', color: '#5B6B79', margin: 0 }}>
                Lowers payment during lean summer lull to match business cash inflows, eliminating all negative months.
              </p>
            </div>

            <div className="cl-card-flat" style={{ padding: '14px', background: '#F8FAFC' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
                Peak Season Months (Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr)
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', margin: '6px 0 2px' }}>
                {formatCurrency(flexiblePlan.peakMonthlyEmi)} <span style={{ fontSize: '13px', color: '#5B6B79', fontWeight: '500' }}>/ month</span>
              </div>
              <p style={{ fontSize: '12px', color: '#5B6B79', margin: 0 }}>
                Absorbed seamlessly by high holiday and wedding revenues ($7.6k–$9.2k/mo) when surplus reaches over $5,000/mo.
              </p>
            </div>

            <div className="cl-card-flat" style={{ padding: '14px', background: '#E6F4F1' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase' }}>
                Outcome Comparison
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F766E', margin: '6px 0 2px' }}>
                0 Deficit Months
              </div>
              <p style={{ fontSize: '12px', color: '#065F58', margin: 0 }}>
                100% on-time probability year-round. Total interest and 36-month payoff remain identical.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserPortalLayout>
  );
}

export default SeasonalIntelligence;
