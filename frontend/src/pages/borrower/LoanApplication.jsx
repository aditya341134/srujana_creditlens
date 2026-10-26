import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  User,
  CreditCard,
  Sliders,
  FileText,
  UploadCloud,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import BorrowerLayout from '../../components/layout/BorrowerLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Standard reducing-balance EMI calculation
export function calculateEMI(principal, annualRate, tenureMonths) {
  const p = Number(principal) || 0;
  const rate = Number(annualRate) || 0;
  const n = Number(tenureMonths) || 1;

  if (p <= 0 || n <= 0) {
    return { emi: 0, totalRepayment: 0, totalInterest: 0 };
  }

  // Handle zero-interest loan
  if (rate <= 0) {
    const emi = Math.round((p / n) * 100) / 100;
    const totalRepayment = Math.round(p * 100) / 100;
    return { emi, totalRepayment, totalInterest: 0 };
  }

  const monthlyRate = (rate / 100) / 12;
  const factor = Math.pow(1 + monthlyRate, n);
  const emi = Math.round((p * monthlyRate * factor / (factor - 1)) * 100) / 100;
  const totalRepayment = Math.round((emi * n) * 100) / 100;
  const totalInterest = Math.round((totalRepayment - p) * 100) / 100;

  return { emi, totalRepayment, totalInterest };
}

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export default function LoanApplication() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Query parameter prefill for loan category
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'Personal Loan';

  // Wizard active step: 1: Personal, 2: Financial, 3: Simulator, 4: Documents, 5: Review & Submit
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);

  // Step 1: Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: ''
  });
  const [personalErrors, setPersonalErrors] = useState({});

  // Step 2: Financial Details
  const [financialDetails, setFinancialDetails] = useState({
    monthlySalary: '',
    workExperienceYears: '',
    currentMonthlyEMI: '0'
  });
  const [financialErrors, setFinancialErrors] = useState({});

  // Step 3: Loan Simulator Parameters
  const [loanParams, setLoanParams] = useState({
    loanType: initialCategory,
    loanAmount: 500000,
    interestRate: 10.5,
    tenureMonths: 36
  });

  // Multi-scenario comparison state
  const [scenarios, setScenarios] = useState([
    {
      id: 'scenario-base',
      name: 'Baseline Plan',
      loanType: initialCategory,
      loanAmount: 500000,
      interestRate: 10.5,
      tenureMonths: 36
    }
  ]);

  // Step 4: Document Submission
  const [hasPreviousLoan, setHasPreviousLoan] = useState('no'); // 'yes' | 'no'
  const [documents, setDocuments] = useState({
    identityDoc: null, // Aadhaar OR Passport
    panCard: null,
    bankStatement: null,
    conditionalDoc: null // CIR if yes, No Dues Affidavit if no
  });
  const [docErrors, setDocErrors] = useState({});

  // Final Review & Submission state
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Update profile prefill if user object loads
  useEffect(() => {
    if (user) {
      setPersonalInfo((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Sync loan type if query param changes
  useEffect(() => {
    if (initialCategory) {
      setLoanParams((prev) => ({ ...prev, loanType: initialCategory }));
    }
  }, [initialCategory]);

  // Live EMI calculations
  const emiMetrics = calculateEMI(
    loanParams.loanAmount,
    loanParams.interestRate,
    loanParams.tenureMonths
  );

  // Affordability metrics
  const monthlyIncome = Number(financialDetails.monthlySalary) || 0;
  const existingEMI = Number(financialDetails.currentMonthlyEMI) || 0;
  const totalProjectedEMI = existingEMI + emiMetrics.emi;
  const dtiPercent = monthlyIncome > 0
    ? Math.round((totalProjectedEMI / monthlyIncome) * 1000) / 10
    : 0;
  const netSurplus = monthlyIncome - totalProjectedEMI;

  // ==========================================================================
  // Validation Handlers
  // ==========================================================================

  const validateStep1 = () => {
    const errs = {};
    if (!personalInfo.fullName.trim()) {
      errs.fullName = 'Full legal name is required';
    }
    if (!personalInfo.phone.trim()) {
      errs.phone = 'Contact phone number is required';
    } else if (!/^[+0-9\s\-()]{8,20}$/.test(personalInfo.phone)) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!personalInfo.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!personalInfo.address.trim()) {
      errs.address = 'Residential address is required';
    }

    setPersonalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    const salary = Number(financialDetails.monthlySalary);
    if (!financialDetails.monthlySalary || isNaN(salary) || salary < 0) {
      errs.monthlySalary = 'Monthly salary must be a valid nonnegative financial amount';
    } else if (salary < 1000) {
      errs.monthlySalary = 'Minimum monthly income must be at least ₹1,000';
    }

    const exp = Number(financialDetails.workExperienceYears);
    if (financialDetails.workExperienceYears === '' || isNaN(exp) || exp < 0) {
      errs.workExperienceYears = 'Work experience must be a valid nonnegative number of years';
    }

    const emi = Number(financialDetails.currentMonthlyEMI);
    if (financialDetails.currentMonthlyEMI === '' || isNaN(emi) || emi < 0) {
      errs.currentMonthlyEMI = 'Current monthly EMI must be a valid nonnegative amount (enter 0 if none)';
    }

    setFinancialErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    // Simulator values are numeric inputs with bounds
    if (loanParams.loanAmount <= 0) return false;
    if (loanParams.tenureMonths <= 0) return false;
    return true;
  };

  const validateStep4 = () => {
    const errs = {};
    if (!documents.identityDoc) {
      errs.identityDoc = 'Aadhaar Card or Passport is mandatory';
    }
    if (!documents.panCard) {
      errs.panCard = 'PAN Card is mandatory';
    }
    if (!documents.bankStatement) {
      errs.bankStatement = 'Bank Statement is mandatory';
    }
    if (!documents.conditionalDoc) {
      errs.conditionalDoc =
        hasPreviousLoan === 'yes'
          ? 'Credit Information Report (CIR) is mandatory for applicants with previous loans'
          : 'No Dues Affidavit is mandatory for first-time borrowers';
    }

    setDocErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step Navigation
  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      setHighestStepReached((prev) => Math.max(prev, 2));
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
      setHighestStepReached((prev) => Math.max(prev, 3));
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
      setCurrentStep(4);
      setHighestStepReached((prev) => Math.max(prev, 4));
    } else if (currentStep === 4) {
      if (!validateStep4()) return;
      setCurrentStep(5);
      setHighestStepReached((prev) => Math.max(prev, 5));
    }
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepNum) => {
    // Only allow navigating to steps already unlocked
    if (stepNum <= highestStepReached) {
      setCurrentStep(stepNum);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // ==========================================================================
  // Document Upload Validation (PDF Only, Max 15 MB)
  // ==========================================================================
  const handleFileChange = (docKey, file) => {
    if (!file) return;

    // Validate PDF
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setDocErrors((prev) => ({
        ...prev,
        [docKey]: 'Only PDF documents are accepted. Please select a valid .pdf file.'
      }));
      return;
    }

    // Validate 15 MB limit (15 * 1024 * 1024 bytes)
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setDocErrors((prev) => ({
        ...prev,
        [docKey]: `File size exceeds the 15 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
      }));
      return;
    }

    // Clear error & store metadata and actual File object for upload
    setDocErrors((prev) => ({ ...prev, [docKey]: null }));
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        file: file,
        name: file.name,
        size: file.size,
        sizeFormatted: `${(file.size / 1024).toFixed(0)} KB`,
        lastModified: file.lastModified
      }
    }));
  };

  const handleRemoveDoc = (docKey) => {
    setDocuments((prev) => ({ ...prev, [docKey]: null }));
  };

  // ==========================================================================
  // Scenario Comparison Handlers
  // ==========================================================================
  const handleAddScenario = () => {
    if (scenarios.length >= 4) return;
    const newId = `scenario-${Date.now()}`;
    const newName = `Option ${scenarios.length + 1} (${loanParams.tenureMonths} Mo)`;
    setScenarios((prev) => [
      ...prev,
      {
        id: newId,
        name: newName,
        loanType: loanParams.loanType,
        loanAmount: loanParams.loanAmount,
        interestRate: loanParams.interestRate,
        tenureMonths: loanParams.tenureMonths
      }
    ]);
  };

  const handleRemoveScenario = (id) => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // ==========================================================================
  // Final Submission to FastAPI Backend & Pipeline Execution
  // ==========================================================================
  const handleSubmitApplication = async () => {
    if (!consentChecked) return;
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const payload = {
        applicantName: personalInfo.fullName,
        applicantType: `${financialDetails.workExperienceYears} Yrs Experience`,
        requestedAmount: Number(loanParams.loanAmount),
        tenureMonths: Number(loanParams.tenureMonths),
        purpose: loanParams.loanType,
        annualInterestRate: Number(loanParams.interestRate),
        grossMonthlyIncome: Number(financialDetails.monthlySalary),
        monthlyLivingExpenses: Math.round(Number(financialDetails.monthlySalary) * 0.35),
        existingDebtObligations: Number(financialDetails.currentMonthlyEMI),
        hasPreviousLoan: hasPreviousLoan
      };

      const result = await api.createApplication(payload);
      const appId = result.id;

      // Upload genuine PDF documents to secure storage & trigger parsing
      try {
        if (documents.identityDoc?.file) {
          await api.uploadDocument(appId, documents.identityDoc.file, 'Aadhaar');
        }
        if (documents.panCard?.file) {
          await api.uploadDocument(appId, documents.panCard.file, 'PAN');
        }
        if (documents.bankStatement?.file) {
          await api.uploadDocument(appId, documents.bankStatement.file, 'Bank Statement');
        }
        if (documents.conditionalDoc?.file) {
          const cat = hasPreviousLoan === 'yes' ? 'Credit Information Report' : 'No-Dues Affidavit';
          await api.uploadDocument(appId, documents.conditionalDoc.file, cat);
        }
        // Run deterministic ULAS assessment pipeline
        await api.runUlasAssessment(appId);
      } catch (pipeErr) {
        console.warn('Document processing pipeline execution note:', pipeErr);
      }

      setIsSubmitting(false);
      setSubmissionSuccess(result);
    } catch (err) {
      setIsSubmitting(false);
      setSubmissionError(err.message || 'Application submission failed. Please try again.');
    }
  };

  const stepsList = [
    { num: 1, title: 'Personal Information', icon: User },
    { num: 2, title: 'Financial Details', icon: CreditCard },
    { num: 3, title: 'Loan Simulator', icon: Sliders },
    { num: 4, title: 'Document Submission', icon: UploadCloud },
    { num: 5, title: 'Review & Submit', icon: FileText }
  ];

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header Breadcrumb */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: '#173B57', fontWeight: '700' }}>Loan Application</span>
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#173B57',
              margin: '6px 0 8px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Creditworthiness Assessment Application
          </h1>
          <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
            Complete the guided steps to calibrate your eligibility, simulate repayment schedules, and receive an explainable assessment.
          </p>
        </div>

        {/* Multi-Step Horizontal Progress Indicator */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #DCE3EA',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)',
            overflowX: 'auto'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '680px',
              position: 'relative'
            }}
          >
            {stepsList.map((step, idx) => {
              const isCompleted = step.num < currentStep;
              const isCurrent = step.num === currentStep;
              const isAccessible = step.num <= highestStepReached;
              const Icon = step.icon;

              return (
                <div
                  key={step.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: idx < stepsList.length - 1 ? 1 : 'none'
                  }}
                >
                  {/* Step Item */}
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.num)}
                    disabled={!isAccessible}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: isAccessible ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      opacity: isAccessible ? 1 : 0.5
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted
                          ? '#0F766E'
                          : isCurrent
                          ? '#173B57'
                          : '#F1F4F8',
                        color: isCompleted || isCurrent ? '#FFFFFF' : '#748391',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '700',
                        boxShadow: isCurrent ? '0 0 0 3px #E6F4F1' : 'none'
                      }}
                    >
                      {isCompleted ? <Check size={16} /> : step.num}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: isCurrent ? '#0F766E' : '#748391',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          display: 'block'
                        }}
                      >
                        Step {step.num}
                      </span>
                      <strong
                        style={{
                          fontSize: '13px',
                          color: isCurrent ? '#173B57' : isCompleted ? '#0F766E' : '#5B6B79',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {step.title}
                      </strong>
                    </div>
                  </button>

                  {/* Connecting Line */}
                  {idx < stepsList.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        backgroundColor: step.num < currentStep ? '#0F766E' : '#E2E8F0',
                        margin: '0 12px'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Success View when Application is Submitted */}
        {submissionSuccess ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #DCE3EA',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(23, 43, 58, 0.06)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#E8F5EE',
                color: '#18794E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', margin: '0 0 8px' }}>
              Application Submitted Successfully!
            </h2>
            <p style={{ fontSize: '14px', color: '#5B6B79', maxWidth: '520px', margin: '0 auto 24px' }}>
              Your loan application has been registered with Reference ID{' '}
              <strong style={{ color: '#0F766E' }}>{submissionSuccess.id}</strong>.
            </p>

            {/* Assessment Result Summary Card */}
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto 28px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase' }}>
                  Model Assessment Result
                </span>
                <span style={{ fontSize: '12px', backgroundColor: '#E6F4F1', color: '#0F766E', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                  {submissionSuccess.assessment?.modelTier || 'Tier 1 - High Capacity'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase' }}>Requested Principal</span>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57' }}>
                    {formatINR(submissionSuccess.requestedAmount)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase' }}>Estimated Monthly EMI</span>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F766E' }}>
                    {formatINR(submissionSuccess.financials?.proposedEMI || emiMetrics.emi)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase' }}>Debt Service Ratio (DSCR)</span>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57' }}>
                    {submissionSuccess.financials?.debtServiceCoverageRatio || 1.8}x
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase' }}>Debt-To-Income (DTI)</span>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57' }}>
                    {submissionSuccess.financials?.calculatedDti || dtiPercent}%
                  </div>
                </div>
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #DCE3EA', fontSize: '13px', color: '#172B3A' }}>
                <strong>Recommendation: </strong>
                <span>{submissionSuccess.assessment?.repaymentCapacity}</span>
              </div>
            </div>

            {/* Regulatory Disclaimer Notice */}
            <div
              style={{
                maxWidth: '600px',
                margin: '0 auto 28px',
                padding: '12px 16px',
                backgroundColor: '#EAF2FE',
                borderRadius: '8px',
                border: '1px solid #BFDBFE',
                fontSize: '12px',
                color: '#245EA8',
                textAlign: 'left'
              }}
            >
              <strong>Responsible Notice:</strong> CreditLens provides an estimated creditworthiness assessment for informational purposes. The final decision rests with the bank or lending institution.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/review')}
                style={{
                  backgroundColor: '#173B57',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px 24px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                View in Applications Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccess(null);
                  setCurrentStep(1);
                  setHighestStepReached(1);
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#173B57',
                  border: '1px solid #DCE3EA',
                  borderRadius: '8px',
                  padding: '11px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Start Another Application
              </button>
            </div>
          </div>
        ) : (
          /* Step-By-Step Workflow Container */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #DCE3EA',
              padding: '32px',
              boxShadow: '0 2px 12px rgba(23, 43, 58, 0.04)'
            }}
          >
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid #F1F4F8', paddingBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 4px' }}>
                    Step 1 — Personal Information
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0 }}>
                    Please verify your legal contact and residential details. Information from your authenticated account is prefilled where available.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                      Full Legal Name <span style={{ color: '#B42318' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${personalErrors.fullName ? '#B42318' : '#DCE3EA'}`,
                        fontSize: '14px',
                        color: '#172B3A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {personalErrors.fullName && (
                      <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                        {personalErrors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                      Phone Number <span style={{ color: '#B42318' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${personalErrors.phone ? '#B42318' : '#DCE3EA'}`,
                        fontSize: '14px',
                        color: '#172B3A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {personalErrors.phone && (
                      <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                        {personalErrors.phone}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                      Email Address <span style={{ color: '#B42318' }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      placeholder="name@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${personalErrors.email ? '#B42318' : '#DCE3EA'}`,
                        fontSize: '14px',
                        color: '#172B3A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {personalErrors.email && (
                      <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                        {personalErrors.email}
                      </span>
                    )}
                  </div>

                  {/* Home Address */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                      Home / Residential Address <span style={{ color: '#B42318' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                      placeholder="Flat/House No., Street, City, State, PIN"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${personalErrors.address ? '#B42318' : '#DCE3EA'}`,
                        fontSize: '14px',
                        color: '#172B3A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {personalErrors.address && (
                      <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                        {personalErrors.address}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      backgroundColor: '#173B57',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Proceed to Financial Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Financial Details */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid #F1F4F8', paddingBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 4px' }}>
                    Step 2 — Financial Details
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0 }}>
                    Enter your verified monthly income, years of experience, and existing debt obligations. If you currently have no EMIs, you may enter 0.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                  {/* Monthly Income */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                      Monthly Salary or Net Income (₹) <span style={{ color: '#B42318' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#5B6B79' }}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={financialDetails.monthlySalary}
                        onChange={(e) => setFinancialDetails({ ...financialDetails, monthlySalary: e.target.value })}
                        placeholder="e.g. 75000"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 28px',
                          borderRadius: '8px',
                          border: `1px solid ${financialErrors.monthlySalary ? '#B42318' : '#DCE3EA'}`,
                          fontSize: '14px',
                          color: '#172B3A',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    {financialErrors.monthlySalary ? (
                      <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                        {financialErrors.monthlySalary}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#748391', marginTop: '4px', display: 'block' }}>
                        Net take-home salary or monthly business turnover
                      </span>
                    )}
                  </div>

                  {/* Work Experience */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                      Work / Business Experience (Years) <span style={{ color: '#B42318' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={financialDetails.workExperienceYears}
                      onChange={(e) => setFinancialDetails({ ...financialDetails, workExperienceYears: e.target.value })}
                      placeholder="e.g. 4.5"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${financialErrors.workExperienceYears ? '#B42318' : '#DCE3EA'}`,
                        fontSize: '14px',
                        color: '#172B3A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {financialErrors.workExperienceYears ? (
                      <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                        {financialErrors.workExperienceYears}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#748391', marginTop: '4px', display: 'block' }}>
                        Total cumulative professional or operational vintage
                      </span>
                    )}
                  </div>

                  {/* Current Monthly EMI */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                      Current Monthly EMI Amount (₹) <span style={{ color: '#B42318' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#5B6B79' }}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={financialDetails.currentMonthlyEMI}
                        onChange={(e) => setFinancialDetails({ ...financialDetails, currentMonthlyEMI: e.target.value })}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 28px',
                          borderRadius: '8px',
                          border: `1px solid ${financialErrors.currentMonthlyEMI ? '#B42318' : '#DCE3EA'}`,
                          fontSize: '14px',
                          color: '#172B3A',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    {financialErrors.currentMonthlyEMI ? (
                      <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                        {financialErrors.currentMonthlyEMI}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#748391', marginTop: '4px', display: 'block' }}>
                        Zero (0) is fully accepted if you have no active loan obligations
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#173B57',
                      border: '1px solid #DCE3EA',
                      borderRadius: '8px',
                      padding: '11px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Personal</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      backgroundColor: '#173B57',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Proceed to Loan Simulator</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Loan Simulator */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ borderBottom: '1px solid #F1F4F8', paddingBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 4px' }}>
                    Step 3 — Interactive Loan Simulator &amp; Scenario Comparison
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0 }}>
                    Adjust loan amount, interest rate, and tenure using direct numeric inputs or sliders. Compare multiple borrowing scenarios side-by-side to find your optimal repayment plan.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                  {/* Left Column: Direct Inputs & Sliders (7 Cols) */}
                  <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '18px' }} className="cl-grid-col-resp">
                    {/* Loan Type Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                        Selected Loan Category
                      </label>
                      <select
                        value={loanParams.loanType}
                        onChange={(e) => setLoanParams({ ...loanParams, loanType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #DCE3EA',
                          fontSize: '14px',
                          color: '#172B3A',
                          backgroundColor: '#FFFFFF',
                          outline: 'none'
                        }}
                      >
                        <option value="Personal Loan">Personal Loan (10.5% p.a. prime)</option>
                        <option value="Home Loan">Home Loan (8.4% p.a. prime)</option>
                        <option value="Business Loan">Business Growth Loan (11.25% p.a.)</option>
                        <option value="Education Loan">Higher Education Loan (9.15% p.a.)</option>
                        <option value="Vehicle Loan">Vehicle &amp; Green Auto Loan (8.9% p.a.)</option>
                        <option value="Gold Loan">Gold &amp; Asset Backed Loan (7.95% p.a.)</option>
                        <option value="Promotional Zero-Interest">Promotional Zero-Interest (0.0% p.a.)</option>
                      </select>
                    </div>

                    {/* Loan Amount Input & Slider */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#172B3A' }}>
                          Loan Principal Amount (₹)
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '6px', padding: '4px 10px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#5B6B79', marginRight: '4px' }}>₹</span>
                          <input
                            type="number"
                            min="25000"
                            max="10000000"
                            step="10000"
                            value={loanParams.loanAmount}
                            onChange={(e) => setLoanParams({ ...loanParams, loanAmount: Number(e.target.value) })}
                            style={{
                              border: 'none',
                              outline: 'none',
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#173B57',
                              width: '110px'
                            }}
                          />
                        </div>
                      </div>

                      <input
                        type="range"
                        min="50000"
                        max="5000000"
                        step="25000"
                        value={loanParams.loanAmount}
                        onChange={(e) => setLoanParams({ ...loanParams, loanAmount: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#748391', marginTop: '4px' }}>
                        <span>₹50,000 (Min)</span>
                        <span>₹25,00,000</span>
                        <span>₹50,00,000 (Max Limit)</span>
                      </div>
                    </div>

                    {/* Annual Interest Rate Input & Slider */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>
                            Annual Interest Rate (% p.a.)
                          </span>
                          {loanParams.interestRate === 0 && (
                            <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#E6F4F1', color: '#0F766E', padding: '2px 6px', borderRadius: '4px' }}>
                              0% Mode
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '6px', padding: '4px 10px' }}>
                          <input
                            type="number"
                            min="0"
                            max="25"
                            step="0.1"
                            value={loanParams.interestRate}
                            onChange={(e) => setLoanParams({ ...loanParams, interestRate: Number(e.target.value) })}
                            style={{
                              border: 'none',
                              outline: 'none',
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#173B57',
                              width: '60px'
                            }}
                          />
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#5B6B79' }}>%</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.25"
                        value={loanParams.interestRate}
                        onChange={(e) => setLoanParams({ ...loanParams, interestRate: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#748391', marginTop: '4px' }}>
                        <span>0.0% (Zero Interest)</span>
                        <span>10.5% (Prime)</span>
                        <span>20.0%</span>
                      </div>
                    </div>

                    {/* Tenure Input & Slider */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>
                          Repayment Tenure (Months)
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '6px', padding: '4px 10px' }}>
                          <input
                            type="number"
                            min="6"
                            max="360"
                            step="6"
                            value={loanParams.tenureMonths}
                            onChange={(e) => setLoanParams({ ...loanParams, tenureMonths: Number(e.target.value) })}
                            style={{
                              border: 'none',
                              outline: 'none',
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#173B57',
                              width: '60px'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: '#748391', marginLeft: '4px' }}>
                            ({(loanParams.tenureMonths / 12).toFixed(1)} Yrs)
                          </span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="12"
                        max="120"
                        step="6"
                        value={loanParams.tenureMonths}
                        onChange={(e) => setLoanParams({ ...loanParams, tenureMonths: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#748391', marginTop: '4px' }}>
                        <span>12 Mo (1 Yr)</span>
                        <span>60 Mo (5 Yrs)</span>
                        <span>120 Mo (10 Yrs)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live EMI Display & Affordability (5 Cols) */}
                  <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '16px' }} className="cl-grid-col-resp">
                    {/* Big EMI Card */}
                    <div
                      style={{
                        backgroundColor: '#173B57',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 4px 16px rgba(23, 59, 87, 0.2)'
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#99EFE5', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                        Calculated Monthly EMI
                      </span>
                      <div style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0', letterSpacing: '-0.02em' }}>
                        {formatINR(emiMetrics.emi)}
                      </div>
                      <span style={{ fontSize: '12px', color: '#DCE3EA' }}>
                        {loanParams.interestRate === 0
                          ? 'Zero-interest calculation (Principal / Months)'
                          : 'Reducing-balance monthly instalment formula'}
                      </span>

                      <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#DCE3EA', textTransform: 'uppercase' }}>Total Interest</span>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#99EFE5' }}>
                            {formatINR(emiMetrics.totalInterest)}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#DCE3EA', textTransform: 'uppercase' }}>Total Repayment</span>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>
                            {formatINR(emiMetrics.totalRepayment)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Income Affordability Indicator */}
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#173B57', textTransform: 'uppercase' }}>
                          Debt-To-Income (DTI) Impact
                        </span>
                        <strong
                          style={{
                            fontSize: '13px',
                            color: dtiPercent <= 40 ? '#18794E' : dtiPercent <= 50 ? '#925D00' : '#B42318'
                          }}
                        >
                          {dtiPercent}%
                        </strong>
                      </div>

                      {/* DTI Progress Bar */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, dtiPercent)}%`,
                            height: '100%',
                            backgroundColor: dtiPercent <= 40 ? '#18794E' : dtiPercent <= 50 ? '#925D00' : '#B42318',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5B6B79', marginTop: '8px' }}>
                        <span>Existing EMI: {formatINR(existingEMI)}</span>
                        <span>Projected Surplus: <strong style={{ color: netSurplus >= 0 ? '#18794E' : '#B42318' }}>{formatINR(netSurplus)}</strong></span>
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#5B6B79', lineHeight: 1.4 }}>
                        {dtiPercent <= 40 ? (
                          <span style={{ color: '#18794E', fontWeight: '600' }}>✓ Favorable Debt Ratio: Your debt obligations are within healthy banking benchmarks.</span>
                        ) : (
                          <span style={{ color: '#925D00', fontWeight: '600' }}>! Elevated Debt Ratio: Consider extending tenure or adjusting amount to reduce monthly burden.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Comparison Workbench */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#173B57', margin: '0 0 2px' }}>
                        Compare Loan Scenarios
                      </h3>
                      <p style={{ fontSize: '12px', color: '#5B6B79', margin: 0 }}>
                        Save and contrast different tenure and principal combinations side-by-side.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddScenario}
                      disabled={scenarios.length >= 4}
                      style={{
                        backgroundColor: '#E6F4F1',
                        color: '#0F766E',
                        border: '1px solid #99EFE5',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: scenarios.length >= 4 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} />
                      <span>Save Current as Scenario ({scenarios.length}/4)</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, gap: '14px' }}>
                    {scenarios.map((sc, scIdx) => {
                      const scMetrics = calculateEMI(sc.loanAmount, sc.interestRate, sc.tenureMonths);
                      return (
                        <div
                          key={sc.id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            border: '1px solid #DCE3EA',
                            padding: '14px',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#173B57' }}>{sc.name}</strong>
                            {scenarios.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveScenario(sc.id)}
                                aria-label="Remove scenario"
                                style={{ background: 'none', border: 'none', color: '#748391', cursor: 'pointer', padding: '2px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F766E', marginBottom: '4px' }}>
                            {formatINR(scMetrics.emi)} <span style={{ fontSize: '12px', fontWeight: '400', color: '#5B6B79' }}>/mo</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#5B6B79' }}>
                            <div>Principal: <strong>{formatINR(sc.loanAmount)}</strong></div>
                            <div>Rate: <strong>{sc.interestRate}%</strong> • Tenure: <strong>{sc.tenureMonths} Mo</strong></div>
                            <div>Total Interest: <strong>{formatINR(scMetrics.totalInterest)}</strong></div>
                            <div>Total Repayment: <strong>{formatINR(scMetrics.totalRepayment)}</strong></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#173B57',
                      border: '1px solid #DCE3EA',
                      borderRadius: '8px',
                      padding: '11px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Financial Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      backgroundColor: '#173B57',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Proceed to Document Submission</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Document Submission */}
            {currentStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ borderBottom: '1px solid #F1F4F8', paddingBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 4px' }}>
                    Step 4 — Document Submission
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0 }}>
                    Please upload the mandatory documents for identity and banking verification. Strict restrictions: <strong>PDF format only</strong>, maximum <strong>15 MB per file</strong>.
                  </p>
                </div>

                {/* 3 Always Mandatory Documents */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Doc 1: Aadhaar or Passport */}
                  <div
                    style={{
                      border: `1.5px dashed ${docErrors.identityDoc ? '#B42318' : documents.identityDoc ? '#0F766E' : '#DCE3EA'}`,
                      borderRadius: '10px',
                      padding: '20px',
                      backgroundColor: documents.identityDoc ? '#E8F5EE' : '#F8FAFC',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: documents.identityDoc ? '#0F766E' : '#E2E8F0', color: documents.identityDoc ? '#FFFFFF' : '#5B6B79', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {documents.identityDoc ? <Check size={20} /> : <FileText size={20} />}
                    </div>
                    <strong style={{ fontSize: '14px', color: '#172B3A' }}>
                      1. Aadhaar Card or Passport <span style={{ color: '#B42318' }}>*</span>
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>
                      Either document is acceptable (PDF, max 15MB)
                    </span>

                    {documents.identityDoc ? (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{documents.identityDoc.name} ({documents.identityDoc.sizeFormatted})</span>
                        <button type="button" onClick={() => handleRemoveDoc('identityDoc')} style={{ background: 'none', border: 'none', color: '#B42318', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ marginTop: '8px', cursor: 'pointer', backgroundColor: '#173B57', color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        Choose PDF
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileChange('identityDoc', e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                    {docErrors.identityDoc && <span style={{ fontSize: '11px', color: '#B42318', marginTop: '4px' }}>{docErrors.identityDoc}</span>}
                  </div>

                  {/* Doc 2: PAN Card */}
                  <div
                    style={{
                      border: `1.5px dashed ${docErrors.panCard ? '#B42318' : documents.panCard ? '#0F766E' : '#DCE3EA'}`,
                      borderRadius: '10px',
                      padding: '20px',
                      backgroundColor: documents.panCard ? '#E8F5EE' : '#F8FAFC',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: documents.panCard ? '#0F766E' : '#E2E8F0', color: documents.panCard ? '#FFFFFF' : '#5B6B79', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {documents.panCard ? <Check size={20} /> : <FileText size={20} />}
                    </div>
                    <strong style={{ fontSize: '14px', color: '#172B3A' }}>
                      2. Permanent Account Number (PAN) <span style={{ color: '#B42318' }}>*</span>
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>
                      Mandatory tax identification proof (PDF, max 15MB)
                    </span>

                    {documents.panCard ? (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{documents.panCard.name} ({documents.panCard.sizeFormatted})</span>
                        <button type="button" onClick={() => handleRemoveDoc('panCard')} style={{ background: 'none', border: 'none', color: '#B42318', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ marginTop: '8px', cursor: 'pointer', backgroundColor: '#173B57', color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        Choose PDF
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileChange('panCard', e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                    {docErrors.panCard && <span style={{ fontSize: '11px', color: '#B42318', marginTop: '4px' }}>{docErrors.panCard}</span>}
                  </div>

                  {/* Doc 3: Bank Statement */}
                  <div
                    style={{
                      border: `1.5px dashed ${docErrors.bankStatement ? '#B42318' : documents.bankStatement ? '#0F766E' : '#DCE3EA'}`,
                      borderRadius: '10px',
                      padding: '20px',
                      backgroundColor: documents.bankStatement ? '#E8F5EE' : '#F8FAFC',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: documents.bankStatement ? '#0F766E' : '#E2E8F0', color: documents.bankStatement ? '#FFFFFF' : '#5B6B79', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {documents.bankStatement ? <Check size={20} /> : <FileText size={20} />}
                    </div>
                    <strong style={{ fontSize: '14px', color: '#172B3A' }}>
                      3. Bank Statement (Last 6 Months) <span style={{ color: '#B42318' }}>*</span>
                    </strong>
                    <span style={{ fontSize: '11px', color: '#748391' }}>
                      Primary salary or business operating account (PDF, max 15MB)
                    </span>

                    {documents.bankStatement ? (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{documents.bankStatement.name} ({documents.bankStatement.sizeFormatted})</span>
                        <button type="button" onClick={() => handleRemoveDoc('bankStatement')} style={{ background: 'none', border: 'none', color: '#B42318', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ marginTop: '8px', cursor: 'pointer', backgroundColor: '#173B57', color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        Choose PDF
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileChange('bankStatement', e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                    {docErrors.bankStatement && <span style={{ fontSize: '11px', color: '#B42318', marginTop: '4px' }}>{docErrors.bankStatement}</span>}
                  </div>
                </div>

                {/* Conditional Question & Conditional Document */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #DCE3EA' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#173B57', display: 'block', marginBottom: '4px' }}>
                      Have you taken any previous loan? <span style={{ color: '#B42318' }}>*</span>
                    </span>
                    <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                      This determines whether you must submit a Credit Information Report (CIR) or a No Dues Affidavit.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#172B3A' }}>
                      <input
                        type="radio"
                        name="prevLoan"
                        value="yes"
                        checked={hasPreviousLoan === 'yes'}
                        onChange={() => {
                          setHasPreviousLoan('yes');
                          setDocuments((prev) => ({ ...prev, conditionalDoc: null }));
                        }}
                        style={{ accentColor: '#0F766E' }}
                      />
                      <span>Yes, I have existing or past loans</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#172B3A' }}>
                      <input
                        type="radio"
                        name="prevLoan"
                        value="no"
                        checked={hasPreviousLoan === 'no'}
                        onChange={() => {
                          setHasPreviousLoan('no');
                          setDocuments((prev) => ({ ...prev, conditionalDoc: null }));
                        }}
                        style={{ accentColor: '#0F766E' }}
                      />
                      <span>No, this is my first formal bank loan</span>
                    </label>
                  </div>

                  {/* Conditional Upload Box */}
                  <div
                    style={{
                      border: `1.5px dashed ${docErrors.conditionalDoc ? '#B42318' : documents.conditionalDoc ? '#0F766E' : '#DCE3EA'}`,
                      borderRadius: '10px',
                      padding: '20px',
                      backgroundColor: documents.conditionalDoc ? '#E8F5EE' : '#FFFFFF',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <strong style={{ fontSize: '14px', color: '#172B3A' }}>
                      {hasPreviousLoan === 'yes'
                        ? '4. Credit Information Report (CIR) *'
                        : '4. No Dues Affidavit *'}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                      {hasPreviousLoan === 'yes'
                        ? 'Required because you selected YES: Upload your latest bureau credit report (CIBIL/Experian/CRIF in PDF, max 15MB)'
                        : 'Required because you selected NO: Upload a signed No Dues declaration / affidavit (PDF, max 15MB)'}
                    </span>

                    {documents.conditionalDoc ? (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{documents.conditionalDoc.name} ({documents.conditionalDoc.sizeFormatted})</span>
                        <button type="button" onClick={() => handleRemoveDoc('conditionalDoc')} style={{ background: 'none', border: 'none', color: '#B42318', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ marginTop: '8px', cursor: 'pointer', backgroundColor: '#173B57', color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        Choose PDF
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileChange('conditionalDoc', e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                    {docErrors.conditionalDoc && <span style={{ fontSize: '11px', color: '#B42318', marginTop: '4px' }}>{docErrors.conditionalDoc}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#173B57',
                      border: '1px solid #DCE3EA',
                      borderRadius: '8px',
                      padding: '11px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Simulator</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      backgroundColor: '#173B57',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Proceed to Final Review</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Final Review & Submit Section */}
            {currentStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ borderBottom: '1px solid #F1F4F8', paddingBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 4px' }}>
                    Step 5 — Final Application Review &amp; Confirmation
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0 }}>
                    Confirm your loan category and review all entered parameters before submitting for fair algorithmic assessment.
                  </p>
                </div>

                {submissionError && (
                  <div style={{ backgroundColor: '#FEF3F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#B42318' }}>
                    <AlertCircle size={18} />
                    <span>{submissionError}</span>
                  </div>
                )}

                {/* Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  {/* Card 1: Personal Info Summary */}
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '14px', color: '#173B57' }}>1. Personal Information</strong>
                      <button type="button" onClick={() => setCurrentStep(1)} style={{ background: 'none', border: 'none', color: '#0F766E', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Edit
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#5B6B79' }}>
                      <div>Name: <strong style={{ color: '#172B3A' }}>{personalInfo.fullName}</strong></div>
                      <div>Phone: <strong style={{ color: '#172B3A' }}>{personalInfo.phone}</strong></div>
                      <div>Email: <strong style={{ color: '#172B3A' }}>{personalInfo.email}</strong></div>
                      <div>Address: <strong style={{ color: '#172B3A' }}>{personalInfo.address}</strong></div>
                    </div>
                  </div>

                  {/* Card 2: Financial Details Summary */}
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '14px', color: '#173B57' }}>2. Financial Details</strong>
                      <button type="button" onClick={() => setCurrentStep(2)} style={{ background: 'none', border: 'none', color: '#0F766E', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Edit
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#5B6B79' }}>
                      <div>Monthly Income: <strong style={{ color: '#172B3A' }}>{formatINR(financialDetails.monthlySalary)}</strong></div>
                      <div>Experience: <strong style={{ color: '#172B3A' }}>{financialDetails.workExperienceYears} Years</strong></div>
                      <div>Current EMI: <strong style={{ color: '#172B3A' }}>{formatINR(financialDetails.currentMonthlyEMI)}</strong></div>
                      <div>Projected DTI: <strong style={{ color: dtiPercent <= 40 ? '#18794E' : '#B42318' }}>{dtiPercent}%</strong></div>
                    </div>
                  </div>

                  {/* Card 3: Loan Parameters Summary */}
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '14px', color: '#173B57' }}>3. Loan Configuration</strong>
                      <button type="button" onClick={() => setCurrentStep(3)} style={{ background: 'none', border: 'none', color: '#0F766E', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Edit
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#5B6B79' }}>
                      <div>Loan Category: <strong style={{ color: '#0F766E' }}>{loanParams.loanType}</strong></div>
                      <div>Principal: <strong style={{ color: '#172B3A' }}>{formatINR(loanParams.loanAmount)}</strong></div>
                      <div>Rate: <strong style={{ color: '#172B3A' }}>{loanParams.interestRate}% p.a.</strong></div>
                      <div>Tenure: <strong style={{ color: '#172B3A' }}>{loanParams.tenureMonths} Months</strong></div>
                      <div>Calculated Monthly EMI: <strong style={{ color: '#0F766E', fontSize: '14px' }}>{formatINR(emiMetrics.emi)}</strong></div>
                    </div>
                  </div>

                  {/* Card 4: Documents Summary */}
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '14px', color: '#173B57' }}>4. Uploaded Documents</strong>
                      <button type="button" onClick={() => setCurrentStep(4)} style={{ background: 'none', border: 'none', color: '#0F766E', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Edit
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#5B6B79' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#0F766E" />
                        <span>Identity: {documents.identityDoc?.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#0F766E" />
                        <span>PAN Card: {documents.panCard?.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#0F766E" />
                        <span>Bank Statement: {documents.bankStatement?.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#0F766E" />
                        <span>{hasPreviousLoan === 'yes' ? 'CIR' : 'No Dues'}: {documents.conditionalDoc?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div style={{ backgroundColor: '#F1F5F9', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    id="consent"
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    style={{ accentColor: '#0F766E', marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="consent" style={{ fontSize: '13px', color: '#172B3A', lineHeight: 1.5, cursor: 'pointer' }}>
                    I hereby consent to CreditLens evaluating my submitted personal, financial, and document details for fair creditworthiness analysis. I acknowledge that CreditLens provides an estimated assessment for informational guidance and that formal disbursement decisions rest solely with authorized lending institutions.
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#173B57',
                      border: '1px solid #DCE3EA',
                      borderRadius: '8px',
                      padding: '11px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Documents</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={!consentChecked || isSubmitting}
                    style={{
                      backgroundColor: '#173B57',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 32px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: !consentChecked || isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: !consentChecked || isSubmitting ? 0.6 : 1,
                      boxShadow: '0 2px 10px rgba(23, 59, 87, 0.25)'
                    }}
                  >
                    {isSubmitting ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <span>Submit Application for Assessment</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 800px) {
          .cl-grid-col-resp {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </BorrowerLayout>
  );
}
