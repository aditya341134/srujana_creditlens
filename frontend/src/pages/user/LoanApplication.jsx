import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import { CopyButton } from '../../components/CopyButton';
import { useUserPortalState, calculateEMI, formatCurrency } from './userPortalState';

export function LoanApplication({ onNavigate }) {
  const {
    state,
    toastMessage,
    submitLoanApplication
  } = useUserPortalState();

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  // Step state (1: Personal, 2: Employment, 3: Income, 4: Liabilities, 5: Proposed Loan, 6: Review & Submit)
  const [activeStep, setActiveStep] = useState(5); // Default to Step 5 (Proposed Loan) as in stitch reference

  // Security PIN visibility state
  const [showSecurityPin, setShowSecurityPin] = useState(false);
  const [securityPin, setSecurityPin] = useState('8492');

  // Form State
  const [loanPurpose, setLoanPurpose] = useState('Home Improvement & Renovation');
  const [requestedAmount, setRequestedAmount] = useState(25000);
  const [termMonths, setTermMonths] = useState(36);
  const [apr, setApr] = useState(6.84);

  // Applicant info state
  const [applicantInfo, setApplicantInfo] = useState({
    fullName: state.user?.name || 'Borrower',
    email: state.user?.email || 'borrower@creditlens.io',
    phone: state.user?.phone || '(555) 000-0000',
    address: '742 Evergreen Terrace, San Francisco, CA 94107',
    employer: state.financials?.primaryEmployer?.company || state.user?.businessName || 'Artisan Bakery',
    jobTitle: state.financials?.primaryEmployer?.position || 'Manager',
    tenureYears: state.financials?.primaryEmployer?.tenureYears || 4,
    grossMonthly: state.financials?.monthlyNetIncome || 4883,
    housingCost: state.financials?.livingBreakdown?.housing || 1400,
    debtObligations: state.financials?.monthlyDebtObligations || 380
  });

  // Disclosures agreement checkboxes
  const [disclosures, setDisclosures] = useState({
    fcraConsent: true,
    algorithmicConsent: true,
    electronicSignature: true
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [submittedDossier, setSubmittedDossier] = useState(null);

  // Purpose options with specific APR rates
  const loanPurposes = [
    { label: 'Home Improvement & Renovation — Tier-1 Fixed Rate (6.84% APR)', value: 'Home Improvement & Renovation', rate: 6.84 },
    { label: 'Debt Consolidation & Rate Compression (7.15% APR)', value: 'Debt Consolidation', rate: 7.15 },
    { label: 'Green Energy & Solar Installation — Subsidized (6.25% APR)', value: 'Green Energy & Solar', rate: 6.25 },
    { label: 'Major Medical or Transitional Bridge (7.45% APR)', value: 'Medical & Transitional', rate: 7.45 },
    { label: 'Small Enterprise Equipment Financing (8.10% APR)', value: 'Small Enterprise Equipment', rate: 8.10 }
  ];

  // Tenure options
  const termOptions = [
    { term: 24, label: '24 Months', subtitle: 'Accelerated Payoff', apr: 7.10, isLowestCost: false },
    { term: 36, label: '36 Months', subtitle: 'Optimal Index', apr: 6.84, isOptimal: true, isLowestCost: true },
    { term: 48, label: '48 Months', subtitle: 'Balanced Cashflow', apr: 7.22, isLowestCost: false },
    { term: 60, label: '60 Months', subtitle: 'Minimum Installment', apr: 7.65, isLowestCost: false }
  ];

  const handlePurposeChange = (e) => {
    const selected = loanPurposes.find((p) => p.value === e.target.value);
    setLoanPurpose(e.target.value);
    if (selected) {
      setApr(selected.rate);
    }
  };

  const handleTermChange = (option) => {
    setTermMonths(option.term);
    setApr(option.apr);
  };

  // Live calculation of EMI
  const emiCalculation = calculateEMI(requestedAmount, apr, termMonths);

  // Real-time DTI calculation: (Existing Debts + New EMI) / Gross Income
  const newTotalMonthlyDebt = (state.financials?.monthlyDebtObligations || 780) + emiCalculation.monthlyEmi;
  const projectedDti = Math.round((newTotalMonthlyDebt / (applicantInfo.grossMonthly || 6450)) * 1000) / 10;
  const livingExpSum =
    (state.financials?.livingBreakdown?.utilities || 350) +
    (state.financials?.livingBreakdown?.subsistence || 600) +
    (state.financials?.livingBreakdown?.discretionary || 350);
  const surplusAfterNewLoan =
    (applicantInfo.grossMonthly || 6450) -
    (applicantInfo.housingCost || 2100) -
    livingExpSum -
    newTotalMonthlyDebt;

  const validateForm = () => {
    const errors = {};
    if (!requestedAmount || requestedAmount < 1000) {
      errors.requestedAmount = 'Minimum principal is $1,000';
    } else if (requestedAmount > 100000) {
      errors.requestedAmount = 'Maximum institutional underwriting cap is $100,000';
    }

    if (!disclosures.fcraConsent) {
      errors.fcraConsent = 'You must authorize the soft credit inquiry to proceed';
    }
    if (!disclosures.algorithmicConsent) {
      errors.algorithmicConsent = 'Consent to algorithmic anti-bias underwriting is required';
    }
    if (!disclosures.electronicSignature) {
      errors.electronicSignature = 'Electronic signature confirmation is required';
    }

    if (!applicantInfo.fullName.trim()) {
      errors.fullName = 'Full legal name is required';
    }
    if (!applicantInfo.email.trim()) {
      errors.email = 'Email address is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const generatedDossierId = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}E`;
      submitLoanApplication({
        loanPurpose,
        requestedAmount,
        termMonths,
        apr
      });

      setSubmittedDossier(generatedDossierId);
      setSubmitting(false);
      setSubmittedSuccessfully(true);
    }, 1500);
  };

  return (
    <UserPortalLayout
      activePage="loan-application"
      onNavigate={handleNavigate}
      user={state.user}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Breadcrumb & Screen Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Dashboard</span>
              <span>/</span>
              <span>Applications</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>Apply</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
              <h1 className="cl-page-title">New Loan Application</h1>
              <span className="cl-badge cl-badge-teal">
                <ShieldCheck size={14} />
                <span>No Credit Score Impact (Soft Pull)</span>
              </span>
            </div>
            <p className="cl-page-subtitle">
              Choose your loan amount and terms, review your monthly payment, and submit your application.
            </p>
          </div>

          <div className="cl-card-flat" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E6F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F766E' }}>
              <FileCheck2 size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '600' }}>
                Dossier Protocol
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '13px', color: '#172B3A' }}>
                  {submittedDossier || state.application.dossierProtocol}
                </strong>
                <CopyButton textToCopy={submittedDossier || state.application.dossierProtocol} label="Copy" />
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator Bar (6 Clear Phases) */}
        <div className="cl-card" style={{ padding: '16px 20px', overflowX: 'auto' }}>
          <div style={{ minWidth: '700px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
            {[
              { id: 1, name: 'Personal Info', isComplete: true },
              { id: 2, name: 'Employment & Ed.', isComplete: true },
              { id: 3, name: 'Income & Outflows', isComplete: true },
              { id: 4, name: 'Existing Liabilities', isComplete: true },
              { id: 5, name: 'Proposed Loan', isActive: true },
              { id: 6, name: 'Review & Submit', isFuture: true }
            ].map((step) => {
              const isSelected = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: step.isComplete ? '#0F766E' : isSelected ? '#173B57' : '#F1F5F9',
                        color: step.isComplete || isSelected ? '#ffffff' : '#748391',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}
                    >
                      {step.isComplete ? <Check size={12} /> : step.id}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: step.isComplete ? '#0F766E' : isSelected ? '#173B57' : '#748391' }}>
                      Step {step.id}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#172B3A' : '#5B6B79', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {step.name}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: '3px',
                      borderRadius: '999px',
                      background: step.isComplete ? '#0F766E' : isSelected ? '#173B57' : '#E2E8F0',
                      marginTop: '2px'
                    }}
                  ></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Successful Submission View */}
        {submittedSuccessfully ? (
          <div className="cl-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E8F5EE', color: '#18794E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#172B3A', margin: '0 0 8px' }}>
              Application Successfully Submitted
            </h2>
            <p style={{ fontSize: '14px', color: '#5B6B79', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Your loan application for <strong style={{ color: '#172B3A' }}>{formatCurrency(requestedAmount)}</strong> has been registered under Dossier Protocol <strong style={{ color: '#0F766E' }}>#{submittedDossier}</strong>. The autonomous fairness engine has audited your verified cash-flow metrics.
            </p>

            <div className="cl-card-flat" style={{ maxWidth: '440px', margin: '0 auto 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                <span style={{ color: '#5B6B79' }}>Dossier Protocol:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ color: '#0F766E' }}>#{submittedDossier}</strong>
                  <CopyButton textToCopy={submittedDossier} label="Copy" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#5B6B79' }}>Application Status:</span>
                <strong style={{ color: '#0F766E' }}>Under Institutional Review</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#5B6B79' }}>Estimated Monthly Payment:</span>
                <strong style={{ color: '#172B3A' }}>{formatCurrency(emiCalculation.monthlyEmi)} / mo</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#5B6B79' }}>Underwritten APR:</span>
                <strong style={{ color: '#172B3A' }}>{apr}% Fixed Rate</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#5B6B79' }}>Underwriter Timeline:</span>
                <span style={{ color: '#5B6B79' }}>24–48 hours for final disbursement offer</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="cl-btn cl-btn-primary"
                onClick={() => handleNavigate('dashboard')}
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                className="cl-btn cl-btn-secondary"
                onClick={() => handleNavigate('my-assessment')}
              >
                View Explainable Assessment
              </button>
            </div>
          </div>
        ) : (
          /* Main Workspace Form Grid */
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'start' }}>
              {/* Left Column (8 Columns: Primary Underwriting Form & Projections) */}
              <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* STEP 1: Personal Info */}
                {activeStep === 1 && (
                  <div className="cl-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #DCE3EA' }}>
                      <h2 className="cl-section-title">Step 1: Personal Information</h2>
                      <span className="cl-badge cl-badge-teal">KYC Verified</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="cl-form-group">
                        <label className="cl-label">Full Legal Name</label>
                        <input
                          type="text"
                          className="cl-input"
                          value={applicantInfo.fullName}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, fullName: e.target.value })}
                        />
                        {validationErrors.fullName && <span className="cl-error-text">{validationErrors.fullName}</span>}
                      </div>
                      <div className="cl-form-group">
                        <label className="cl-label">Email Address</label>
                        <input
                          type="email"
                          className="cl-input"
                          value={applicantInfo.email}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, email: e.target.value })}
                        />
                        {validationErrors.email && <span className="cl-error-text">{validationErrors.email}</span>}
                      </div>
                      <div className="cl-form-group">
                        <label className="cl-label">Phone Number</label>
                        <input
                          type="text"
                          className="cl-input"
                          value={applicantInfo.phone}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, phone: e.target.value })}
                        />
                      </div>
                      <div className="cl-form-group">
                        <label className="cl-label">Residential Address</label>
                        <input
                          type="text"
                          className="cl-input"
                          value={applicantInfo.address}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, address: e.target.value })}
                        />
                      </div>
                      <div className="cl-form-group">
                        <label className="cl-label">Applicant Digital Security PIN (4-digit)</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showSecurityPin ? 'text' : 'password'}
                            className="cl-input"
                            value={securityPin}
                            onChange={(e) => setSecurityPin(e.target.value)}
                            maxLength={6}
                            style={{ paddingRight: '38px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecurityPin(!showSecurityPin)}
                            aria-label={showSecurityPin ? 'Hide PIN' : 'Show PIN'}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: '#748391',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {showSecurityPin ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button type="button" className="cl-btn cl-btn-primary" onClick={() => setActiveStep(2)}>
                        Proceed to Employment &amp; Ed. →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Employment & Education */}
                {activeStep === 2 && (
                  <div className="cl-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #DCE3EA' }}>
                      <h2 className="cl-section-title">Step 2: Employment &amp; Education</h2>
                      <span className="cl-badge cl-badge-teal">Payroll Connected</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="cl-form-group">
                        <label className="cl-label">Primary Employer</label>
                        <input
                          type="text"
                          className="cl-input"
                          value={applicantInfo.employer}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, employer: e.target.value })}
                        />
                      </div>
                      <div className="cl-form-group">
                        <label className="cl-label">Job Title / Role</label>
                        <input
                          type="text"
                          className="cl-input"
                          value={applicantInfo.jobTitle}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, jobTitle: e.target.value })}
                        />
                      </div>
                      <div className="cl-form-group">
                        <label className="cl-label">Tenure at Current Employer (Years)</label>
                        <input
                          type="number"
                          step={0.5}
                          className="cl-input"
                          value={applicantInfo.tenureYears}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, tenureYears: Number(e.target.value) })}
                        />
                      </div>
                      <div className="cl-form-group">
                        <label className="cl-label">Highest Education Attained</label>
                        <select className="cl-select" defaultValue="bachelors">
                          <option value="bachelors">Bachelor of Science / Arts</option>
                          <option value="masters">Master of Science / MBA</option>
                          <option value="doctorate">Doctorate / Ph.D.</option>
                          <option value="associate">Associate Degree</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                      <button type="button" className="cl-btn cl-btn-secondary" onClick={() => setActiveStep(1)}>
                        ← Back to Personal
                      </button>
                      <button type="button" className="cl-btn cl-btn-primary" onClick={() => setActiveStep(3)}>
                        Proceed to Income &amp; Outflows →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Income & Outflows */}
                {activeStep === 3 && (
                  <div className="cl-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #DCE3EA' }}>
                      <h2 className="cl-section-title">Step 3: Income &amp; Outflows</h2>
                      <span className="cl-badge cl-badge-teal">Plaid Automated Sync</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="cl-form-group">
                        <label className="cl-label">Gross Monthly Inflow ($)</label>
                        <input
                          type="number"
                          className="cl-input"
                          value={applicantInfo.grossMonthly}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, grossMonthly: Number(e.target.value) })}
                        />
                      </div>
                      <div className="cl-form-group">
                        <label className="cl-label">Primary Housing Outflow / Rent ($)</label>
                        <input
                          type="number"
                          className="cl-input"
                          value={applicantInfo.housingCost}
                          onChange={(e) => setApplicantInfo({ ...applicantInfo, housingCost: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                      <button type="button" className="cl-btn cl-btn-secondary" onClick={() => setActiveStep(2)}>
                        ← Back to Employment
                      </button>
                      <button type="button" className="cl-btn cl-btn-primary" onClick={() => setActiveStep(4)}>
                        Proceed to Liabilities →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Existing Liabilities */}
                {activeStep === 4 && (
                  <div className="cl-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #DCE3EA' }}>
                      <h2 className="cl-section-title">Step 4: Existing Liabilities</h2>
                      <span className="cl-badge cl-badge-teal">Tri-Bureau Checked</span>
                    </div>
                    <div className="cl-form-group">
                      <label className="cl-label">Total Monthly Recurring Debt Obligations ($)</label>
                      <input
                        type="number"
                        className="cl-input"
                        value={applicantInfo.debtObligations}
                        onChange={(e) => setApplicantInfo({ ...applicantInfo, debtObligations: Number(e.target.value) })}
                      />
                      <span className="cl-helper-text">
                        Auto Loan ($380) + Student Loan ($400) = $780.00 / month.
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                      <button type="button" className="cl-btn cl-btn-secondary" onClick={() => setActiveStep(3)}>
                        ← Back to Income
                      </button>
                      <button type="button" className="cl-btn cl-btn-primary" onClick={() => setActiveStep(5)}>
                        Proceed to Proposed Loan Configuration →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5 or ALL: Proposed Loan & Underwriting Form */}
                {(activeStep === 5 || activeStep === 6) && (
                <>
                {/* Section 1: Loan Purpose & Requested Principal */}
                <div className="cl-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #DCE3EA', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F1F5F9', color: '#173B57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                        1
                      </div>
                      <div>
                        <h2 className="cl-section-title">Loan Purpose &amp; Requested Principal</h2>
                        <p className="cl-helper-text">
                          Specify the asset allocation and amortization timeline for real-time risk calibration.
                        </p>
                      </div>
                    </div>
                    <span className="cl-badge cl-badge-teal">
                      Tier-1 Prime Rates Active
                    </span>
                  </div>

                  {/* Purpose Selector */}
                  <div className="cl-form-group">
                    <label className="cl-label" htmlFor="loan-purpose-select">
                      Primary Loan Purpose
                    </label>
                    <select
                      id="loan-purpose-select"
                      className="cl-select"
                      value={loanPurpose}
                      onChange={handlePurposeChange}
                    >
                      {loanPurposes.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Principal Slider & Card */}
                  <div className="cl-card-flat" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Requested Principal Amount
                        </span>
                        <span style={{ fontSize: '12px', color: '#748391', display: 'block', marginTop: '2px' }}>
                          Adjust slider or type directly to calculate dynamic liquidity
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #DCE3EA', borderRadius: '8px', padding: '4px 12px' }}>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#173B57', marginRight: '4px' }}>$</span>
                        <input
                          type="number"
                          value={requestedAmount}
                          min={1000}
                          max={100000}
                          step={500}
                          onChange={(e) => setRequestedAmount(Number(e.target.value))}
                          style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#173B57',
                            width: '110px'
                          }}
                        />
                      </div>
                    </div>

                    <input
                      type="range"
                      className="cl-slider"
                      min={1000}
                      max={100000}
                      step={500}
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#748391', marginTop: '6px' }}>
                      <span>$1,000 (Min)</span>
                      <span>$50,000</span>
                      <span>$100,000 (Max Underwritten Limit)</span>
                    </div>

                    {validationErrors.requestedAmount && (
                      <span className="cl-error-text">{validationErrors.requestedAmount}</span>
                    )}
                  </div>

                  {/* Amortization Term Selector (4 Cards) */}
                  <div className="cl-form-group">
                    <label className="cl-label">Preferred Amortization Term</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                      {termOptions.map((opt) => {
                        const isSelected = termMonths === opt.term;
                        return (
                          <button
                            key={opt.term}
                            type="button"
                            onClick={() => handleTermChange(opt)}
                            className="cl-card-flat"
                            style={{
                              border: isSelected ? '2px solid #173B57' : '1px solid #DCE3EA',
                              background: isSelected ? '#173B57' : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : '#172B3A',
                              padding: '12px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '14px', color: isSelected ? '#FFFFFF' : '#172B3A' }}>
                                {opt.label}
                              </strong>
                              {isSelected && <Check size={14} color="#99EFE5" />}
                            </div>
                            <span style={{ fontSize: '11px', color: isSelected ? '#C6F0E7' : '#748391' }}>
                              {opt.subtitle}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#99EFE5' : '#0F766E' }}>
                              {opt.apr}% APR
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Installment Callout Box */}
                  <div className="cl-card-flat" style={{ background: '#E6F4F1', borderColor: 'rgba(15,118,110,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFFFFF', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DollarSign size={22} />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase' }}>
                          Simulated Monthly Payment
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '26px', fontWeight: '800', color: '#172B3A' }}>
                            {formatCurrency(emiCalculation.monthlyEmi)}
                          </span>
                          <span style={{ fontSize: '12px', color: '#5B6B79' }}>/ month</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F766E', fontSize: '12px', fontWeight: '600' }}>
                        <Check size={14} />
                        <span>Zero Prepayment Penalty</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                        Calculated at {apr}% APR (Fixed Rate)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Synced Financial Snapshot (Auto-populated from Verified Profile) */}
                <div className="cl-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #DCE3EA', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F1F5F9', color: '#173B57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                        2
                      </div>
                      <div>
                        <h2 className="cl-section-title">Verified Profile Telemetry &amp; DTI Projection</h2>
                        <p className="cl-helper-text">
                          Continuously reconciled through encrypted Plaid payroll and depository feeds.
                        </p>
                      </div>
                    </div>
                    <span className="cl-badge cl-badge-teal">
                      <ShieldCheck size={13} />
                      <span>Synced 12m ago</span>
                    </span>
                  </div>

                  {/* 3 Verified Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div className="cl-card-flat" style={{ padding: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase' }}>
                        Gross Monthly Income
                      </span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#172B3A', margin: '4px 0 2px' }}>
                        {formatCurrency(applicantInfo.grossMonthly)}
                      </div>
                      <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: '600' }}>
                        Direct Deposit Verified
                      </span>
                    </div>

                    <div className="cl-card-flat" style={{ padding: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase' }}>
                        Primary Housing Outflow
                      </span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#172B3A', margin: '4px 0 2px' }}>
                        {formatCurrency(applicantInfo.housingCost)}
                      </div>
                      <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                        Verified Lease Escrow
                      </span>
                    </div>

                    <div className="cl-card-flat" style={{ padding: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase' }}>
                        Active Debt Obligations
                      </span>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#172B3A', margin: '4px 0 2px' }}>
                        {formatCurrency(applicantInfo.debtObligations)}
                      </div>
                      <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                        3 Accounts Active • Zero Arrears
                      </span>
                    </div>
                  </div>

                  {/* Real-Time DTI Underwriting Projection Bar */}
                  <div className="cl-card-flat" style={{ background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#172B3A' }}>
                        Algorithmic Debt-to-Income (DTI) Trajectory
                      </span>
                      <div style={{ fontSize: '13px' }}>
                        <span style={{ color: '#5B6B79' }}>Current DTI: <strong>{state.financials.dti}%</strong></span>
                        <span style={{ margin: '0 6px', color: '#748391' }}>→</span>
                        <strong style={{ color: '#173B57' }}>Projected DTI: {projectedDti}%</strong>
                      </div>
                    </div>

                    {/* Progression Track */}
                    <div style={{ position: 'relative', width: '100%', height: '12px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${state.financials.dti}%`, height: '100%', background: '#0F766E' }} title="Existing Base DTI"></div>
                      <div style={{ width: `${Math.max(0, projectedDti - state.financials.dti)}%`, height: '100%', background: '#173B57' }} title="New Loan Added"></div>
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '36%', width: '2px', background: '#925D00' }} title="36% Statutory Threshold"></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#748391', marginTop: '6px' }}>
                      <span>0%</span>
                      <span style={{ color: '#0F766E', fontWeight: '600' }}>{state.financials.dti}% (Base Existing)</span>
                      <span style={{ color: '#173B57', fontWeight: '700' }}>{projectedDti}% (Post-Funding)</span>
                      <span style={{ color: '#925D00', fontWeight: '600' }}>36.0% Statutory Max Threshold</span>
                      <span>50%</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', fontSize: '12px' }}>
                      <span style={{ color: '#0F766E', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} />
                        <span>Well within conservative statutory guideline (&lt;36%)</span>
                      </span>
                      <span style={{ color: '#172B3A' }}>
                        Surplus Free Cashflow: <strong style={{ color: '#0F766E' }}>{formatCurrency(surplusAfterNewLoan)}/mo</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Statutory Compliance & Regulatory Disclosures */}
                <div className="cl-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid #DCE3EA', marginBottom: '16px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#F1F5F9', color: '#173B57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                      3
                    </div>
                    <div>
                      <h2 className="cl-section-title">Statutory Compliance &amp; Regulatory Disclosures</h2>
                      <p className="cl-helper-text">
                        Mandatory legal declarations protecting borrower rights under federal fair lending statutes.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Checkbox 1: Soft Credit Inquiry */}
                    <label className="cl-card-flat cl-checkbox-label" style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        className="cl-checkbox"
                        checked={disclosures.fcraConsent}
                        onChange={(e) => setDisclosures({ ...disclosures, fcraConsent: e.target.checked })}
                      />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#172B3A' }}>
                          Soft Credit Inquiry Authorization (FCRA 15 U.S.C. § 1681)
                        </strong>
                        <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0', lineHeight: 1.4 }}>
                          I authorize CreditLens Technologies to conduct a non-impacting soft bureau pull to verify consumer credit performance and trade-line velocity. This inquiry does not affect bureau scoring.
                        </p>
                        {validationErrors.fcraConsent && (
                          <span className="cl-error-text">{validationErrors.fcraConsent}</span>
                        )}
                      </div>
                    </label>

                    {/* Checkbox 2: Algorithmic Anti-Bias */}
                    <label className="cl-card-flat cl-checkbox-label" style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        className="cl-checkbox"
                        checked={disclosures.algorithmicConsent}
                        onChange={(e) => setDisclosures({ ...disclosures, algorithmicConsent: e.target.checked })}
                      />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#172B3A' }}>
                          Algorithmic Underwriting &amp; Anti-Bias Consent Protocol
                        </strong>
                        <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0', lineHeight: 1.4 }}>
                          I consent to automated cash-flow capacity modeling. CreditLens guarantees transparent factor attribution with zero prohibited demographic variables pursuant to the Equal Credit Opportunity Act (12 CFR Part 1002).
                        </p>
                        {validationErrors.algorithmicConsent && (
                          <span className="cl-error-text">{validationErrors.algorithmicConsent}</span>
                        )}
                      </div>
                    </label>

                    {/* Checkbox 3: Electronic Signature */}
                    <label className="cl-card-flat cl-checkbox-label" style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        className="cl-checkbox"
                        checked={disclosures.electronicSignature}
                        onChange={(e) => setDisclosures({ ...disclosures, electronicSignature: e.target.checked })}
                      />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#172B3A' }}>
                          Truth in Lending &amp; Electronic Signature Affirmation
                        </strong>
                        <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0', lineHeight: 1.4 }}>
                          I attest that all provided financial records represent true and verified data. I agree to receive statutory disclosures and pre-qualification notices electronically.
                        </p>
                        {validationErrors.electronicSignature && (
                          <span className="cl-error-text">{validationErrors.electronicSignature}</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                </>
                )}
              </div>

              {/* Right Column (4 Columns: Application Summary & Submission Box) */}
              <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="cl-card" style={{ position: 'sticky', top: '80px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span className="cl-card-title">Pre-Approval Summary</span>
                    <span className="cl-badge cl-badge-teal">Live Preview</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Requested Principal:</span>
                      <strong style={{ color: '#172B3A' }}>{formatCurrency(requestedAmount)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Amortization Term:</span>
                      <strong style={{ color: '#172B3A' }}>{termMonths} Months</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Underwritten APR:</span>
                      <strong style={{ color: '#0F766E' }}>{apr}% (Fixed)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Total Estimated Interest:</span>
                      <strong style={{ color: '#172B3A' }}>{formatCurrency(emiCalculation.totalInterest)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5B6B79' }}>Total Repayment:</span>
                      <strong style={{ color: '#172B3A' }}>{formatCurrency(emiCalculation.totalPayment)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #DCE3EA' }}>
                      <span style={{ fontWeight: '600', color: '#173B57' }}>Estimated Monthly EMI:</span>
                      <strong style={{ fontSize: '16px', color: '#173B57' }}>{formatCurrency(emiCalculation.monthlyEmi)}</strong>
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: '#F1F5F9', borderRadius: '8px', fontSize: '12px', color: '#5B6B79', marginBottom: '20px' }}>
                    <ShieldCheck size={14} color="#0F766E" style={{ display: 'inline', marginRight: '6px' }} />
                    Submitting performs a <strong>soft pull only</strong>. Final loan approval and terms are subject to partner underwriter verification.
                  </div>

                  <button
                    type="submit"
                    className="cl-btn cl-btn-primary cl-btn-lg"
                    style={{ width: '100%' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Auditing & Submitting...' : 'Submit Loan Application'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </UserPortalLayout>
  );
}

export default LoanApplication;
