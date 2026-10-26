import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Lock,
  FileText,
  Info,
  Printer,
  X,
  AlertCircle
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { CopyButton } from '../../components/CopyButton';
import { useUserPortalState, formatCurrency, formatCurrencyShort } from './userPortalState';

const defaultModelWeights = [
  { name: 'Income Stability & Cadence', score: 94, weight: 35, label: '35% Impact' },
  { name: 'Debt-to-Income & Free Cashflow', score: 88, weight: 30, label: '30% Impact' },
  { name: 'Repayment Consistency Ledger', score: 96, weight: 20, label: '20% Impact' },
  { name: 'Liquid Reserves & Emergency Buffer', score: 78, weight: 15, label: '15% Impact' }
];

const defaultVerifiedSources = [
  { name: 'Plaid Core Depository', detail: '180-Day Cashflow Stream', badge: 'Verified Real-time' },
  { name: 'Tri-Bureau Metro2 Feed', detail: '0 Late Payments / 36 Mo', badge: 'Audited Bureau' },
  { name: 'IRS / Payroll Integration', detail: 'Automated 1040 & W-2 Verification', badge: 'Affirmed' }
];

export function MyAssessment({ onNavigate }) {
  const {
    state,
    toastMessage,
    showToast,
    upload1099Document
  } = useUserPortalState();

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  // What-if simulation interactive state
  const [sim1099Checked, setSim1099Checked] = useState(Boolean(state.documents?.hasUploaded1099));
  const [simAutoChecked, setSimAutoChecked] = useState(false);

  // Factor dispute modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeFactor, setDisputeFactor] = useState('Unverified Secondary Income');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [confirmDisputeOpen, setConfirmDisputeOpen] = useState(false);

  // Calculate dynamic capacity based on What-If checks
  let simulatedCapacity = state.assessment?.recommendedCapacity || 25000;
  let simulatedRepaymentCap = state.assessment?.safeRepaymentCap || 1100;
  let simulatedDti = state.financials?.dti || 14.8;
  let capacityDelta = 0;

  if (sim1099Checked && !state.documents?.hasUploaded1099) {
    simulatedCapacity += 11000;
    simulatedRepaymentCap += 150;
    capacityDelta += 11000;
  }

  if (simAutoChecked) {
    simulatedCapacity += 14500;
    simulatedRepaymentCap += 380;
    simulatedDti = 6.2;
    capacityDelta += 14500;
  }

  const handleDisputeFormSubmit = (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    setConfirmDisputeOpen(true);
  };

  const handleConfirmDispute = () => {
    setConfirmDisputeOpen(false);
    setDisputeSubmitting(true);
    setTimeout(() => {
      setDisputeSubmitting(false);
      setDisputeModalOpen(false);
      setDisputeReason('');
      showToast('✓ Formal Factor Dispute registered under FCRA 15 U.S.C. § 1681i. Compliance review initiated.');
    }, 1200);
  };

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <UserPortalLayout
      activePage="my-assessment"
      onNavigate={handleNavigate}
      user={state.user}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Assessment Context Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #DCE3EA' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px' }}>
              <span className="cl-badge cl-badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Fair Lending Checked • Model v3.2</span>
                <CopyButton text="CreditLens-Fair-Solvency-v3.2" label="Copy Model" title="Copy Model Version" />
              </span>
              <span style={{ color: '#DCE3EA' }}>•</span>
              <span style={{ color: '#5B6B79', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} color="#0F766E" />
                Fair Credit Reporting Act (FCRA) Compliant
              </span>
            </div>
            <h1 className="cl-page-title" style={{ marginTop: '6px' }}>Your Credit Assessment</h1>
            <p className="cl-page-subtitle">
              Clear breakdown of your credit score, borrowing power, and key financial drivers.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="cl-btn cl-btn-secondary"
              onClick={handlePrintAudit}
              title="Generate printable audit report"
            >
              <Printer size={15} />
              <span>Download Report (PDF)</span>
            </button>
            <button
              type="button"
              className="cl-btn cl-btn-secondary"
              onClick={() => {
                const el = document.getElementById('capacity-optimizer-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sliders size={15} color="#0F766E" />
              <span>What-If Calculator</span>
            </button>
            <button
              type="button"
              className="cl-btn cl-btn-primary"
              onClick={() => handleNavigate('loan-application')}
            >
              <span>Apply for Loan</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Hero Solvency Banner */}
        <div className="cl-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #DCE3EA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#173B57', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="cl-badge cl-badge-teal" style={{ fontWeight: '700' }}>
                    {state.user.tier}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#172B3A' }}>
                    Prime High (Audited Score Rank)
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#5B6B79', marginTop: '2px', display: 'block' }}>
                  Borrower Profile ID: {state.user.id}-EV • Evaluated: Current Cycle
                </span>
              </div>
            </div>

            <div className="cl-badge cl-badge-neutral" style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600' }}>
              <ShieldCheck size={14} color="#0F766E" />
              <span>100% Explainable • Zero Black-Box Decisions • ECOA Protected</span>
            </div>
          </div>

          {/* Core Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
            <div className="cl-card-flat" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
                Recommended Capacity
              </span>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#172B3A', margin: '4px 0 2px' }}>
                {formatCurrencyShort(state.assessment?.recommendedCapacity || 25000)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5B6B79' }}>
                <span>Unsecured prime ceiling</span>
                <span style={{ color: '#0F766E', fontWeight: '600' }}>+18.5% vs peer avg</span>
              </div>
            </div>

            <div className="cl-card-flat" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
                Safe Repayment Cap
              </span>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#172B3A', margin: '4px 0 2px' }}>
                {formatCurrency(state.assessment?.safeRepaymentCap || 1100)}
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#748391' }}>/mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5B6B79' }}>
                <span>Max 25% gross discretionary</span>
                <span style={{ color: '#0F766E', fontWeight: '600' }}>Safe Buffer: $600</span>
              </div>
            </div>

            <div className="cl-card-flat" style={{ padding: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
                Debt-to-Income (DTI)
              </span>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#172B3A', margin: '4px 0 2px' }}>
                {state.financials?.dti || 14.8}%
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5B6B79' }}>
                <span>Prime band benchmark</span>
                <span style={{ color: '#0F766E', fontWeight: '600' }}>&lt;36% Statutory Limit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Asymmetric Workspace (8 Cols / 4 Cols on Desktop) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'start' }}>
          {/* LEFT COLUMN: Deep Explanations & Evidentiary Audit (8 Columns) */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Income vs. Obligations Cash-Flow Analysis */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Audited Cash Dynamics
                  </span>
                  <h2 className="cl-card-title" style={{ fontSize: '16px' }}>Income vs. Obligations Cash-Flow</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '16px', color: '#172B3A' }}>
                    {formatCurrency(state.financials?.monthlyNetIncome || 4883)}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#748391', display: 'block' }}>Total Gross Monthly Inflow</span>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#5B6B79', margin: '0 0 16px', lineHeight: 1.5 }}>
                Rather than relying solely on lagging bureau scores, CreditLens determines capacity via your real-time verified monthly liquidity breakdown:
              </p>

              {/* Stacked Cash-flow visual bar */}
              <div style={{ width: '100%', height: '22px', background: '#E2E8F0', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '39%', height: '100%', background: '#173B57' }} title="Essential Living: $2,520 (39%)"></div>
                <div style={{ width: '12%', height: '100%', background: '#245EA8' }} title="Debt Obligations: $780 (12%)"></div>
                <div style={{ width: '20%', height: '100%', background: '#CBD5E1' }} title="Unverified Hold: $1,300 (20%)"></div>
                <div style={{ width: '29%', height: '100%', background: '#0F766E' }} title="Free Discretionary Surplus: $1,850 (29%)"></div>
              </div>

              {/* Bar Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '12px' }}>
                <div className="cl-card-flat" style={{ padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#173B57' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#172B3A' }}>Essential Living</span>
                  </div>
                  <strong style={{ fontSize: '15px', color: '#172B3A', display: 'block', marginTop: '2px' }}>$2,520</strong>
                  <span style={{ fontSize: '10px', color: '#748391' }}>39.0% (Rent, Util)</span>
                </div>

                <div className="cl-card-flat" style={{ padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#245EA8' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#172B3A' }}>Debt Obligations</span>
                  </div>
                  <strong style={{ fontSize: '15px', color: '#172B3A', display: 'block', marginTop: '2px' }}>$780</strong>
                  <span style={{ fontSize: '10px', color: '#748391' }}>12.1% (Auto, Cards)</span>
                </div>

                <div className="cl-card-flat" style={{ padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E1' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#172B3A' }}>Unverified Hold</span>
                  </div>
                  <strong style={{ fontSize: '15px', color: '#172B3A', display: 'block', marginTop: '2px' }}>$1,300</strong>
                  <span style={{ fontSize: '10px', color: '#748391' }}>20.2% (Freelance hold)</span>
                </div>

                <div className="cl-card-flat" style={{ padding: '8px 10px', background: '#E6F4F1', borderColor: 'rgba(15,118,110,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0F766E' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F766E' }}>Free Surplus</span>
                  </div>
                  <strong style={{ fontSize: '15px', color: '#0F766E', display: 'block', marginTop: '2px' }}>
                    {formatCurrency(state.financials?.freeRepaymentSurplus || 1303)}
                  </strong>
                  <span style={{ fontSize: '10px', color: '#0F766E', fontWeight: '600' }}>28.7% (Safe to lend)</span>
                </div>
              </div>

              <div style={{ marginTop: '14px', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#5B6B79', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color="#0F766E" />
                  Prudence Engine buffer applies standard 1.48x safety margin above living overhead.
                </span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#173B57', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  onClick={() => handleNavigate('financial-profile')}
                >
                  View Source Ledger ↗
                </button>
              </div>
            </div>

            {/* 2. Positive Contributing Factors (Evidence-Based) */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#E6F4F1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h2 className="cl-card-title">Positive Contributing Factors</h2>
                    <span style={{ fontSize: '12px', color: '#748391' }}>Verified positive signals helping your credit approval</span>
                  </div>
                </div>
                <span className="cl-badge cl-badge-teal">
                  4 Positive Drivers
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {(state.assessment?.positiveFactors || []).map((factor) => (
                  <div
                    key={factor.id}
                    className="cl-card-flat"
                    style={{ borderLeft: '3px solid #0F766E', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: '#172B3A' }}>{factor.title}</strong>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F766E' }}>{factor.scoreBadge}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0', lineHeight: 1.4 }}>
                        {factor.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '6px', fontSize: '11px', color: '#748391' }}>
                      <span>Source: {factor.source}</span>
                      <strong style={{ color: '#0F766E' }}>{factor.metric}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Areas for Improvement & Actionable Steps */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FDECEA', color: '#B42318', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h2 className="cl-card-title">Areas for Improvement &amp; How to Fix Them</h2>
                    <span style={{ fontSize: '12px', color: '#748391' }}>Items currently limiting your borrowing power and easy steps to fix them</span>
                  </div>
                </div>
                <span className="cl-badge cl-badge-warning">
                  1 Action Available
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(state.assessment?.limitingFactors || []).map((factor) => {
                  const isSuccess = factor.severity === 'success';
                  const isNeutral = factor.severity === 'neutral';

                  return (
                    <div
                      key={factor.id}
                      className="cl-card-flat"
                      style={{
                        borderLeft: isSuccess ? '3px solid #0F766E' : isNeutral ? '3px solid #748391' : '3px solid #B42318',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '14px', color: '#172B3A' }}>{factor.title}</strong>
                            <span className={`cl-badge ${isSuccess ? 'cl-badge-teal' : isNeutral ? 'cl-badge-neutral' : 'cl-badge-danger'}`} style={{ fontSize: '10px' }}>
                              {isNeutral ? 'Neutral Attribution' : isSuccess ? 'Affirmed' : 'Capacity Limiter'}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0', lineHeight: 1.4, maxWidth: '520px' }}>
                            {factor.description}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '14px', color: isSuccess ? '#0F766E' : isNeutral ? '#748391' : '#B42318' }}>
                            {factor.impact}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#748391', display: 'block' }}>
                            {isNeutral ? 'Statutory Safe Harbor' : factor.isActionable ? 'Capacity Foregone' : 'Certified'}
                          </span>
                        </div>
                      </div>

                      {factor.isActionable && !state.documents?.hasUploaded1099 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '6px', padding: '8px 12px', marginTop: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#172B3A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} color="#0F766E" />
                            <span>Resolution: Upload 1099-NEC / Schedule C to unlock this income stream</span>
                          </span>
                          <button
                            type="button"
                            className="cl-btn cl-btn-primary cl-btn-sm"
                            onClick={() => upload1099Document('1099_NEC_Verified.pdf')}
                          >
                            <span>Upload 1099 Form</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Interactive Capacity Optimizer (What-If Simulation) */}
            <div id="capacity-optimizer-section" className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F1F5F9', color: '#173B57', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sliders size={16} />
                  </div>
                  <div>
                    <h2 className="cl-card-title">Interactive Capacity Optimizer</h2>
                    <span style={{ fontSize: '12px', color: '#748391' }}>Mathematical what-if projections calculated live</span>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#748391', fontWeight: '600' }}>
                  Real-Time Recalculation
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#5B6B79', margin: '0 0 16px', lineHeight: 1.5 }}>
                Select prospective borrower actions below to preview exact algorithmic capacity expansion before taking legal steps:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Option 1: 1099 */}
                <label className="cl-card-flat cl-checkbox-label" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input
                      type="checkbox"
                      className="cl-checkbox"
                      checked={sim1099Checked}
                      onChange={(e) => setSim1099Checked(e.target.checked)}
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#172B3A' }}>Verify Freelance 1099 Form</strong>
                      <p style={{ fontSize: '12px', color: '#5B6B79', margin: '2px 0 0' }}>
                        Eliminates 50% prudence discount on $1,200/mo freelance revenue.
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '13px', color: '#0F766E', display: 'block' }}>+ $11,000 Capacity</strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>+ $150/mo safe repayment cap</span>
                  </div>
                </label>

                {/* Option 2: Pay off Auto Loan */}
                <label className="cl-card-flat cl-checkbox-label" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input
                      type="checkbox"
                      className="cl-checkbox"
                      checked={simAutoChecked}
                      onChange={(e) => setSimAutoChecked(e.target.checked)}
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#172B3A' }}>Pay Off Auto Loan Early ($8,240 balance)</strong>
                      <p style={{ fontSize: '12px', color: '#5B6B79', margin: '2px 0 0' }}>
                        Removes $380/mo obligation, lowering debt-to-income (DTI) ratio.
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '13px', color: '#0F766E', display: 'block' }}>+ $14,500 Capacity</strong>
                    <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: '600' }}>DTI drops to 6.2%</span>
                  </div>
                </label>
              </div>

              {/* Simulation Result Footer */}
              <div
                className="cl-card-primary"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginTop: '16px',
                  padding: '16px 20px',
                  background: '#173B57'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={22} color="#99EFE5" />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#C6F0E7', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
                      Simulated Maximum Pre-Approval
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF' }}>
                        {formatCurrencyShort(simulatedCapacity)}
                      </span>
                      {capacityDelta > 0 && (
                        <span className="cl-badge cl-badge-teal" style={{ background: '#0F766E', color: '#FFFFFF', fontSize: '11px' }}>
                          + {formatCurrencyShort(capacityDelta)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#C6F0E7', marginTop: '2px' }}>
                      Safe Cap: <strong>{formatCurrency(simulatedRepaymentCap)}/mo</strong> • DTI: <strong>{simulatedDti}%</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  onClick={() => handleNavigate('loan-application')}
                >
                  <Lock size={14} />
                  <span>Lock Simulated Pre-Approval</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Algorithmic Rigor, Statutory Shield, Sources (4 Columns) */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Algorithmic Transparency Breakdown */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Model Weights
                  </span>
                  <h3 className="cl-card-title">Mathematical Weights</h3>
                </div>
                <div title="Weights are statically auditable and mandated by CreditLens Fair-Scoring Charter">
                  <Info size={16} color="#748391" />
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#748391', margin: '0 0 14px' }}>
                Every point of your score derives from transparent statutory categories. No proprietary obfuscation.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(state.assessment?.modelWeights || defaultModelWeights).map((mw, idx) => (
                  <div key={mw.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: '600', color: '#172B3A' }}>{mw.name}</span>
                      <strong style={{ color: '#0F766E' }}>{mw.score} / 100</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${mw.score}%`, height: '100%', background: idx === 0 ? '#0F766E' : '#173B57', borderRadius: '999px' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#748391' }}>
                      <span>Weight: {mw.weight}% of assessment</span>
                      <span>{mw.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Fair Lending Statutory Shield */}
            <div className="cl-card-flat" style={{ background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#173B57', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '13px', color: '#172B3A', display: 'block' }}>Fair Lending Statutory Shield</strong>
                  <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: '700' }}>12 CFR Part 1002 Compliant</span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#5B6B79', margin: '0 0 12px', lineHeight: 1.4 }}>
                CreditLens models are programmatically prohibited from ingesting non-financial demographic factors. Our model weights are audited bi-monthly by independent compliance examiners.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div className="cl-card-flat" style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', color: '#172B3A', background: '#FFFFFF' }}>
                  ✕ No Zip Codes
                </div>
                <div className="cl-card-flat" style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', color: '#172B3A', background: '#FFFFFF' }}>
                  ✕ No Demographics
                </div>
                <div className="cl-card-flat" style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', color: '#172B3A', background: '#FFFFFF' }}>
                  ✕ No Social Media
                </div>
                <div className="cl-card-flat" style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', color: '#172B3A', background: '#FFFFFF' }}>
                  ✕ No Marital Status
                </div>
              </div>
            </div>

            {/* 3. Underlying Verified Data Sources */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="cl-card-title">Verified Data Sources</span>
                <span className="cl-badge cl-badge-teal" style={{ fontSize: '11px' }}>
                  3 Synced
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(state.assessment?.verifiedSources || defaultVerifiedSources).map((source) => (
                  <div key={source.name} className="cl-card-flat" style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#172B3A', display: 'block' }}>{source.name}</strong>
                      <span style={{ fontSize: '11px', color: '#748391' }}>{source.detail}</span>
                    </div>
                    <span className="cl-badge cl-badge-neutral" style={{ fontSize: '10px' }}>
                      {source.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Borrower Legal Rights Notice */}
            <div className="cl-card-flat">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Info size={16} color="#173B57" />
                <strong style={{ fontSize: '13px', color: '#172B3A' }}>Borrower Legal Rights</strong>
              </div>
              <p style={{ fontSize: '12px', color: '#5B6B79', margin: '0 0 10px', lineHeight: 1.4 }}>
                Under the Fair Credit Reporting Act (15 U.S.C. § 1681i), you have the right to inspect all contributing variables and initiate a formal challenge to any inaccurate data driver without negative rating impact.
              </p>
              <button
                type="button"
                className="cl-btn cl-btn-secondary cl-btn-sm"
                onClick={() => setDisputeModalOpen(true)}
              >
                <span>Initiate Formal Factor Dispute</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Crucial Distinguishing Disclaimer Card */}
            <div style={{ padding: '12px', background: '#F1F5F9', border: '1px solid #DCE3EA', borderRadius: '10px', fontSize: '12px', color: '#5B6B79', lineHeight: 1.4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#173B57', marginBottom: '4px' }}>
                <AlertCircle size={15} color="#173B57" />
                <span>Statutory Model Disclaimer</span>
              </div>
              This algorithmic assessment is an explainable creditworthiness model and pre-qualification evaluation. It does not constitute a final binding commitment to lend. Final underwriting decisions are executed by certified loan officers.
            </div>
          </div>
        </div>
      </div>

      {/* Factor Dispute Modal */}
      {disputeModalOpen && (
        <div className="cl-modal-overlay">
          <div className="cl-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Initiate Formal Factor Challenge
                </h3>
                <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
                  Under FCRA 15 U.S.C. § 1681i, applicants may challenge unverified records.
                </p>
              </div>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setDisputeModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDisputeFormSubmit}>
              <div className="cl-form-group">
                <label className="cl-label">Target Driver / Factor</label>
                <select
                  className="cl-select"
                  value={disputeFactor}
                  onChange={(e) => setDisputeFactor(e.target.value)}
                >
                  <option value="Unverified Secondary Income">Unverified Secondary Income (50% Haircut)</option>
                  <option value="Cascade Auto Finance Note">Cascade Auto Finance Note Balance ($8,240)</option>
                  <option value="Student Loan Calculation">Federal Direct Student Loan Calculation</option>
                  <option value="Other Inaccuracy">Other Depository / Bureau Discrepancy</option>
                </select>
              </div>

              <div className="cl-form-group">
                <label className="cl-label">Explanation &amp; Corroborating Evidence</label>
                <textarea
                  className="cl-textarea"
                  rows={4}
                  placeholder="Detail the discrepancy and provide reference document details..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  onClick={() => setDisputeModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cl-btn cl-btn-primary"
                  disabled={disputeSubmitting}
                >
                  {disputeSubmitting ? 'Registering Dispute...' : 'Submit Formal Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Regulatory Factor Dispute */}
      <ConfirmationModal
        isOpen={confirmDisputeOpen}
        title="Confirm Regulatory Factor Challenge"
        message={`Are you sure you want to register a formal regulatory dispute on "${disputeFactor}" under FCRA 15 U.S.C. § 1681i? An official compliance audit will be registered.`}
        confirmLabel="Yes, File Dispute"
        cancelLabel="Return to Edit"
        onConfirm={handleConfirmDispute}
        onCancel={() => setConfirmDisputeOpen(false)}
      />
    </UserPortalLayout>
  );
}

export default MyAssessment;
