import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Edit3,
  Home,
  CreditCard,
  Zap,
  ShoppingBag,
  Coffee,
  Car,
  GraduationCap,
  Activity,
  X
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import { CopyButton } from '../../components/CopyButton';
import { useUserPortalState, formatCurrency, formatCurrencyShort } from './userPortalState';

export function FinancialProfile({ onNavigate }) {
  const {
    state,
    setState,
    toastMessage,
    showToast,
    upload1099Document,
    syncBankData
  } = useUserPortalState();

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  const primaryEmp = state.financials?.primaryEmployer || {
    company: state.user?.businessName || 'Artisan Oven Bakery & Seasonal Events',
    position: 'Principal Baker & General Manager',
    tenureYears: 4,
    tenureMonths: 6,
    netMonthly: state.financials?.monthlyNetIncome || 4883,
    grossAnnual: state.financials?.annualGrossRevenue || 82400,
    type: 'Small-Business Owner / Director',
    integration: 'Plaid Business Depository + IRS Transcript'
  };

  const secondaryInc = state.financials?.secondaryIncome || {
    confirmed: Boolean(state.documents?.hasUploaded1099),
    source: 'Catering & Event Retainers',
    statusLabel: state.documents?.hasUploaded1099 ? 'Verified' : 'Self-Reported',
    declaredMonthly: 1800,
    creditedMonthly: state.documents?.hasUploaded1099 ? 1800 : 900
  };

  const docs = state.documents || {
    hasUploaded1099: false,
    readinessPercent: 83,
    milestonesPassed: 5,
    totalMilestones: 6
  };

  const living = state.financials?.livingBreakdown || {
    housing: 1400,
    utilities: 350,
    subsistence: 600,
    discretionary: 350
  };

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Edit Profile modal state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    position: primaryEmp.position || 'Business Owner',
    grossAnnual: primaryEmp.grossAnnual || state.financials?.annualGrossRevenue || 82400,
    housingCost: living.housing || 1400,
    utilitiesCost: living.utilities || 350,
    subsistenceCost: living.subsistence || 600,
    discretionaryCost: living.discretionary || 350
  });

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      upload1099Document(selectedFile ? selectedFile.name : '1099_NEC_ScheduleC_Verified.pdf');
      setUploading(false);
      setUploadModalOpen(false);
      setSelectedFile(null);
    }, 1200);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const newTotalLiving =
      Number(editForm.housingCost) +
      Number(editForm.utilitiesCost) +
      Number(editForm.subsistenceCost) +
      Number(editForm.discretionaryCost);

    const newSurplus = state.financials.monthlyNetIncome - newTotalLiving - state.financials.monthlyDebtObligations;

    setState((prev) => ({
      ...prev,
      financials: {
        ...prev.financials,
        monthlyLivingExpenses: newTotalLiving,
        freeRepaymentSurplus: Math.max(0, newSurplus),
        livingBreakdown: {
          housing: Number(editForm.housingCost),
          utilities: Number(editForm.utilitiesCost),
          subsistence: Number(editForm.subsistenceCost),
          discretionary: Number(editForm.discretionaryCost)
        },
        primaryEmployer: {
          ...prev.financials.primaryEmployer,
          position: editForm.position,
          grossAnnual: Number(editForm.grossAnnual)
        }
      }
    }));

    setEditProfileOpen(false);
    showToast('✓ Financial profile records updated successfully.');
  };

  return (
    <UserPortalLayout
      activePage="financial-profile"
      onNavigate={handleNavigate}
      user={state.user}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Breadcrumbs & Screen Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #DCE3EA' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Dashboard</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>Financial Profile</span>
            </div>
            <h1 className="cl-page-title" style={{ marginTop: '4px' }}>Your Financial Profile</h1>
            <p className="cl-page-subtitle">
              View and update your verified income, living expenses, and payment history.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="cl-btn cl-btn-secondary"
              onClick={() => setEditProfileOpen(true)}
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              className="cl-btn cl-btn-secondary"
              onClick={syncBankData}
              title="Resynchronize bank accounts"
            >
              <RefreshCw size={15} color="#0F766E" />
              <span>Sync Bank Data</span>
            </button>
          </div>
        </div>

        {/* Quality Assurance & Readiness Banner */}
        <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#173B57', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#172B3A', margin: 0 }}>
                    Profile Completion: {docs.readinessPercent}%
                  </h3>
                  <span className="cl-badge cl-badge-teal">
                    {docs.milestonesPassed}/{docs.totalMilestones} Completed
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#5B6B79', margin: '2px 0 0' }}>
                  Verification requirement (80%) exceeded.
                </p>
              </div>
            </div>

            {!docs.hasUploaded1099 && (
              <div className="cl-badge cl-badge-warning" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <AlertTriangle size={15} />
                <span>1 Document Needed (Freelance 1099 Form)</span>
              </div>
            )}
          </div>

          {/* Stepped Checkpoint Tracker with Progress Line */}
          <div>
            <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${docs.readinessPercent}%`, height: '100%', background: '#0F766E', transition: 'width 0.4s ease' }}></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', paddingTop: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F766E', fontWeight: '600' }}>
                <CheckCircle2 size={14} />
                <span>Plaid Bank Sync</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F766E', fontWeight: '600' }}>
                <CheckCircle2 size={14} />
                <span>W-2 Primary Payroll</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F766E', fontWeight: '600' }}>
                <CheckCircle2 size={14} />
                <span>Residence Verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F766E', fontWeight: '600' }}>
                <CheckCircle2 size={14} />
                <span>Tri-Bureau Tradelines</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F766E', fontWeight: '600' }}>
                <CheckCircle2 size={14} />
                <span>Identity Cryptocheck</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: docs.hasUploaded1099 ? '#0F766E' : '#925D00', fontWeight: '600' }}>
                {docs.hasUploaded1099 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>1099 Schedule C</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Verified Income Streams & Stability Ledger */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '20px', background: '#173B57', borderRadius: '2px' }}></div>
              <h2 className="cl-section-title">Verified Income Streams &amp; Stability Ledger</h2>
            </div>
            <span style={{ fontSize: '12px', color: '#748391' }}>
              Model Calibration: Bi-Weekly Cashflow Affirmation
            </span>
          </div>

          {/* Income Bento Grid (3-column layout) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
            {/* Card 1: Primary Employment */}
            <div className="cl-card" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #0F766E' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#F1F5F9', color: '#173B57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800' }}>
                      {(primaryEmp.company || 'B')[0]}
                    </div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#172B3A' }}>{primaryEmp.company}</strong>
                      <span style={{ fontSize: '12px', color: '#748391', display: 'block' }}>
                        {primaryEmp.position} • {primaryEmp.type}
                      </span>
                    </div>
                  </div>
                  <span className="cl-badge cl-badge-teal">
                    <CheckCircle2 size={13} />
                    <span>Affirmed</span>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="cl-card-flat" style={{ padding: '8px 10px' }}>
                    <span style={{ fontSize: '11px', color: '#748391' }}>Monthly Net Take-Home</span>
                    <strong style={{ fontSize: '16px', color: '#172B3A', display: 'block', marginTop: '2px' }}>
                      {formatCurrency(primaryEmp.netMonthly)}
                    </strong>
                    <span style={{ fontSize: '10px', color: '#0F766E', fontWeight: '600' }}>Direct Deposit Affirmed</span>
                  </div>
                  <div className="cl-card-flat" style={{ padding: '8px 10px' }}>
                    <span style={{ fontSize: '11px', color: '#748391' }}>Annual Gross</span>
                    <strong style={{ fontSize: '16px', color: '#172B3A', display: 'block', marginTop: '2px' }}>
                      {formatCurrency(primaryEmp.grossAnnual)}
                    </strong>
                    <span style={{ fontSize: '10px', color: '#748391' }}>Verified Transcript</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5B6B79' }}>
                  <span>Tenure Security: <strong style={{ color: '#172B3A' }}>{primaryEmp.tenureYears} Yrs ({primaryEmp.tenureMonths} Mo)</strong></span>
                  <span style={{ color: '#0F766E', fontWeight: '600' }}>0 Payroll Gaps</span>
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#748391', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>Employer EIN: <strong>84-3910482</strong></span>
                  <CopyButton text="84-3910482" label="Copy EIN" title="Copy Employer Tax ID" />
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>IRS Ref: <strong>TX-2023-88219</strong></span>
                  <CopyButton text="TX-2023-88219" label="Copy Ref" title="Copy IRS Transcript Ref" />
                </div>
              </div>
            </div>

            {/* Card 2: Secondary Income */}
            <div className="cl-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: secondaryInc.confirmed ? '4px solid #0F766E' : '4px solid #925D00' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#172B3A' }}>{secondaryInc.source}</strong>
                    <span style={{ fontSize: '12px', color: '#748391', display: 'block' }}>Contract &amp; Retainers</span>
                  </div>
                  <span className={`cl-badge ${secondaryInc.confirmed ? 'cl-badge-teal' : 'cl-badge-warning'}`}>
                    {secondaryInc.confirmed ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    <span>{secondaryInc.statusLabel}</span>
                  </span>
                </div>

                <div className="cl-card-flat" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#748391' }}>Declared Monthly Net</span>
                    <strong style={{ fontSize: '16px', color: '#172B3A', display: 'block' }}>
                      {formatCurrency(secondaryInc.declaredMonthly)}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: secondaryInc.confirmed ? '#0F766E' : '#B42318', fontWeight: '600' }}>
                      {secondaryInc.confirmed ? '100% Credited' : '-50% Haircut Applied'}
                    </span>
                    <strong style={{ fontSize: '13px', color: '#173B57', display: 'block' }}>
                      {formatCurrency(secondaryInc.creditedMonthly)} Model Credit
                    </strong>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#5B6B79', margin: 0, lineHeight: 1.4 }}>
                  {secondaryInc.confirmed
                    ? '1099 verification complete! Full capacity is integrated into underwriter model.'
                    : 'Upload your Schedule C or 1099-NEC statements to eliminate algorithmic discount and unlock full underwriting valuation.'}
                </p>
              </div>

              {!secondaryInc.confirmed && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button
                    type="button"
                    className="cl-btn cl-btn-primary cl-btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <Upload size={13} />
                    <span>Upload 1099</span>
                  </button>
                  <button
                    type="button"
                    className="cl-btn cl-btn-secondary cl-btn-sm"
                    onClick={() => showToast('Plaid depository alternative initiated. Checking freelance invoices.')}
                  >
                    <span>Bank Alt</span>
                  </button>
                </div>
              )}
            </div>

            {/* Card 3: Income Stability Index & Rhythm Chart */}
            <div className="cl-card" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
                    Stability Index
                  </span>
                  <Activity size={16} color="#0F766E" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '800', color: '#173B57', lineHeight: 1 }}>92</span>
                  <span style={{ fontSize: '14px', color: '#748391' }}>/ 100</span>
                  <span className="cl-badge cl-badge-teal" style={{ marginLeft: 'auto', fontSize: '11px' }}>Tier A+</span>
                </div>
                <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                  Top decile cadence stability across 52 cycles.
                </span>

                {/* Inline SVG Wave Visual */}
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#748391', display: 'block', marginBottom: '4px' }}>
                    24-Mo Bi-Weekly Direct Deposit Rhythm
                  </span>
                  <div style={{ width: '100%', height: '40px', background: '#F8FAFC', borderRadius: '6px', padding: '4px', display: 'flex', alignItems: 'center' }}>
                    <svg viewBox="0 0 200 30" style={{ width: '100%', height: '100%' }}>
                      <path
                        d="M 0,20 Q 15,5 30,20 T 60,20 T 90,20 T 120,20 T 150,20 T 180,20 L 200,20"
                        fill="none"
                        stroke="#0F766E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="30" cy="20" r="3" fill="#0F766E" />
                      <circle cx="90" cy="20" r="3" fill="#0F766E" />
                      <circle cx="150" cy="20" r="3" fill="#0F766E" />
                    </svg>
                  </div>
                </div>
              </div>

              <div style={{ background: '#F1F5F9', borderRadius: '6px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '11px', color: '#5B6B79', fontWeight: '600' }}>Aggregate Net:</span>
                <strong style={{ fontSize: '14px', color: '#173B57' }}>{formatCurrency(state.financials.monthlyNetIncome)} / mo</strong>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 & 3: Living Expenses vs Liabilities Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
          {/* Monthly Living Expenses (5 Columns) */}
          <div className="cl-card" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '18px', background: '#173B57', borderRadius: '2px' }}></div>
                  <h3 className="cl-card-title">Monthly Living Expenses</h3>
                </div>
                <strong style={{ fontSize: '16px', color: '#172B3A' }}>
                  {formatCurrency(state.financials.monthlyLivingExpenses)} / mo
                </strong>
              </div>

              <p style={{ fontSize: '12px', color: '#748391', margin: 0 }}>
                Plaid transaction categorization normalized over the last 180 billing cycles.
              </p>

              {/* Itemized Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="cl-card-flat" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Home size={16} color="#173B57" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#172B3A', display: 'block' }}>Housing &amp; Rent</strong>
                      <span style={{ fontSize: '11px', color: '#748391' }}>Primary Residence Escrow</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '14px', color: '#172B3A', display: 'block' }}>
                      {formatCurrency(living.housing)}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>55.0% of living</span>
                  </div>
                </div>

                <div className="cl-card-flat" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} color="#173B57" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#172B3A', display: 'block' }}>Utilities &amp; Telecom</strong>
                      <span style={{ fontSize: '11px', color: '#748391' }}>Power, Water, Mobile</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '14px', color: '#172B3A', display: 'block' }}>
                      {formatCurrency(living.utilities)}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>11.0% of living</span>
                  </div>
                </div>

                <div className="cl-card-flat" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={16} color="#173B57" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#172B3A', display: 'block' }}>Essential Subsistence</strong>
                      <span style={{ fontSize: '11px', color: '#748391' }}>Groceries &amp; Healthcare</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '14px', color: '#172B3A', display: 'block' }}>
                      {formatCurrency(living.subsistence)}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>20.9% of living</span>
                  </div>
                </div>

                <div className="cl-card-flat" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Coffee size={16} color="#173B57" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#172B3A', display: 'block' }}>Discretionary Living</strong>
                      <span style={{ fontSize: '11px', color: '#748391' }}>Dining &amp; Leisure</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '14px', color: '#172B3A', display: 'block' }}>
                      {formatCurrency(living.discretionary)}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>13.1% of living</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gauge bar */}
            <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', display: 'flex', marginTop: '12px' }}>
              <div style={{ width: '55%', height: '100%', background: '#173B57' }} title="Housing 55%"></div>
              <div style={{ width: '11%', height: '100%', background: '#245EA8' }} title="Utilities 11%"></div>
              <div style={{ width: '21%', height: '100%', background: '#0F766E' }} title="Groceries 21%"></div>
              <div style={{ width: '13%', height: '100%', background: '#748391' }} title="Discretionary 13%"></div>
            </div>
          </div>

          {/* Existing Liabilities & Repayment History (7 Columns) */}
          <div className="cl-card" style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '18px', background: '#0F766E', borderRadius: '2px' }}></div>
                  <h3 className="cl-card-title">Existing Liabilities &amp; Repayment History</h3>
                </div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: '#748391' }}>Aggregate Obligations: </span>
                  <strong style={{ color: '#172B3A' }}>{formatCurrency(state.financials?.monthlyDebtObligations || 380)} / mo</strong>
                </div>
              </div>

              {/* Tradeline Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {(state.financials?.tradelines || []).map((tl) => (
                  <div key={tl.id} className="cl-card-flat" style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#E6F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F766E' }}>
                        {tl.type.includes('Auto') ? <Car size={15} /> : tl.type.includes('Student') ? <GraduationCap size={15} /> : <CreditCard size={15} />}
                      </div>
                      <span className="cl-badge cl-badge-teal" style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {tl.status}
                      </span>
                    </div>

                    <div>
                      <strong style={{ fontSize: '13px', color: '#172B3A', display: 'block' }}>{tl.creditor}</strong>
                      <span style={{ fontSize: '11px', color: '#748391' }}>{tl.type}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px', fontSize: '12px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#748391', display: 'block' }}>Monthly</span>
                        <strong>{formatCurrency(tl.monthly)}</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: '#748391', display: 'block' }}>Balance</span>
                        <span style={{ color: '#5B6B79', fontWeight: '600' }}>{formatCurrencyShort(tl.balance)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continuous Repayment Integrity Heat Strip */}
              <div className="cl-card-flat" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#172B3A' }}>
                    Payment History Timeline
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    <span>{state.financials.onTimeEntriesCount} Consecutive On-Time Payments</span>
                  </span>
                </div>

                {/* 36 blocks heat strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(36, 1fr)', gap: '3px', paddingTop: '4px' }}>
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ height: '14px', borderRadius: '2px', background: '#0F766E' }}
                      title={`Month ${i + 1}: On-time payment`}
                    ></div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#748391', marginTop: '2px' }}>
                  <span>Oct 2021</span>
                  <span style={{ color: '#0F766E', fontWeight: '600' }}>0 Late Payments (36 Months)</span>
                  <span>Present</span>
                </div>
              </div>
            </div>

            {/* DTI & Cash Surplus Metric Callout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
              <div className="cl-card-flat" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '700' }}>Debt-to-Income (DTI)</span>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#172B3A' }}>{state.financials.dti}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="cl-badge cl-badge-teal">Healthy (&lt;36%)</span>
                  <span style={{ fontSize: '11px', color: '#748391', display: 'block', marginTop: '2px' }}>$780 debts / $6,450 income</span>
                </div>
              </div>

              <div className="cl-card-flat" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '700' }}>Monthly Surplus</span>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F766E' }}>{formatCurrency(state.financials.freeRepaymentSurplus)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="cl-badge cl-badge-teal">28.7% Free</span>
                  <span style={{ fontSize: '11px', color: '#748391', display: 'block', marginTop: '2px' }}>After living &amp; debts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload 1099 Modal */}
      {uploadModalOpen && (
        <div className="cl-modal-overlay">
          <div className="cl-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Upload Freelance 1099 Statement
                </h3>
                <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
                  Affirm secondary consulting revenue to eliminate the 50% prudence discount.
                </p>
              </div>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setUploadModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSimulateUpload}>
              <div
                style={{
                  border: '2px dashed #DCE3EA',
                  borderRadius: '10px',
                  padding: '32px 16px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
                onClick={() => document.getElementById('profile-file-input').click()}
              >
                <Upload size={36} color="#0F766E" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#172B3A', margin: 0 }}>
                  {selectedFile ? selectedFile.name : 'Select 1099-NEC or Schedule C PDF'}
                </p>
                <span style={{ fontSize: '12px', color: '#748391', marginTop: '4px', display: 'block' }}>
                  Supports encrypted PDF/Images up to 15MB
                </span>
                <input
                  id="profile-file-input"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cl-btn cl-btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Verifying File...' : 'Upload & Affirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="cl-modal-overlay">
          <div className="cl-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Edit Financial Profile Records
                </h3>
                <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
                  Update living expense allocations or employment details.
                </p>
              </div>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setEditProfileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="cl-form-group">
                  <label className="cl-label">Position / Job Title</label>
                  <input
                    type="text"
                    className="cl-input"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="cl-form-group">
                    <label className="cl-label">Annual Gross Salary ($)</label>
                    <input
                      type="number"
                      className="cl-input"
                      value={editForm.grossAnnual}
                      onChange={(e) => setEditForm({ ...editForm, grossAnnual: Number(e.target.value) })}
                    />
                  </div>
                  <div className="cl-form-group">
                    <label className="cl-label">Monthly Rent / Housing ($)</label>
                    <input
                      type="number"
                      className="cl-input"
                      value={editForm.housingCost}
                      onChange={(e) => setEditForm({ ...editForm, housingCost: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="cl-form-group">
                    <label className="cl-label">Utilities ($)</label>
                    <input
                      type="number"
                      className="cl-input"
                      value={editForm.utilitiesCost}
                      onChange={(e) => setEditForm({ ...editForm, utilitiesCost: Number(e.target.value) })}
                    />
                  </div>
                  <div className="cl-form-group">
                    <label className="cl-label">Subsistence ($)</label>
                    <input
                      type="number"
                      className="cl-input"
                      value={editForm.subsistenceCost}
                      onChange={(e) => setEditForm({ ...editForm, subsistenceCost: Number(e.target.value) })}
                    />
                  </div>
                  <div className="cl-form-group">
                    <label className="cl-label">Discretionary ($)</label>
                    <input
                      type="number"
                      className="cl-input"
                      value={editForm.discretionaryCost}
                      onChange={(e) => setEditForm({ ...editForm, discretionaryCost: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  onClick={() => setEditProfileOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cl-btn cl-btn-primary"
                >
                  Save Profile Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserPortalLayout>
  );
}

export default FinancialProfile;
