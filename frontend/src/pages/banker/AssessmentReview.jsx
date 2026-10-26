import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  DollarSign,
  FileText,
  TrendingUp,
  ArrowLeft,
  ChevronDown,
  Check,
  Copy,
  Info,
  Calendar,
  Layers,
  Send,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import BankerLayout from '../../components/layout/BankerLayout';
import BankerStatusBadge from '../../components/banker/BankerStatusBadge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function calculateEMI(principal, annualRate, tenureMonths) {
  const p = Number(principal) || 0;
  const rate = Number(annualRate) || 0;
  const n = Number(tenureMonths) || 1;

  if (p <= 0 || n <= 0) return 0;
  if (rate <= 0) return Math.round(p / n);

  const monthlyRate = (rate / 100) / 12;
  const factor = Math.pow(1 + monthlyRate, n);
  return Math.round(p * monthlyRate * factor / (factor - 1));
}

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export default function AssessmentReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Extract ID from query param (?id=...) or path
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get('id');

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Active Underwriting Sub-tab
  const [activeTab, setActiveTab] = useState('DECISION'); // 'FINANCIALS' | 'DOCUMENTS' | 'DECISION'

  // Underwriter Decision Form State
  const [decision, setDecision] = useState('Approved'); // 'Approved' | 'Rejected' | 'Needs Information'
  const [approvedAmount, setApprovedAmount] = useState('');
  const [approvedTenure, setApprovedTenure] = useState('');
  const [approvedRate, setApprovedRate] = useState('');
  const [adverseReason, setAdverseReason] = useState('DTI ratio exceeds policy ceiling');
  const [notes, setNotes] = useState('');

  // KYC Verification Checklist State
  const [verificationChecklist, setVerificationChecklist] = useState({
    identityDoc: 'Verified',
    panCard: 'Verified',
    bankStatement: 'Verified',
    creditReport: 'Verified'
  });

  // Authoritative ULAS Engine & Document Verification Report State
  const [ulasAssessment, setUlasAssessment] = useState(null);
  const [verificationReport, setVerificationReport] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  useEffect(() => {
    if (selectedApp) {
      setLoadingAssessment(true);
      Promise.all([
        api.getUlasAssessment(selectedApp.id).catch(() => null),
        api.getVerificationReport(selectedApp.id).catch(() => null)
      ]).then(([ulasRes, vReportRes]) => {
        setUlasAssessment(ulasRes);
        setVerificationReport(vReportRes);
        setLoadingAssessment(false);
      });
    }
  }, [selectedApp]);

  // Load applications
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getApplications();
        const items = res.items || (Array.isArray(res) ? res : []);
        if (!isMounted) return;
        setApplications(items);

        let target = null;
        if (queryId) {
          target = items.find((a) => a.id === queryId);
        }
        if (!target && items.length > 0) {
          target = items[0];
        }
        setSelectedApp(target);

        if (target) {
          setApprovedAmount(target.requestedAmount || 500000);
          setApprovedTenure(target.tenureMonths || 36);
          setApprovedRate(target.annualInterestRate || 10.5);
          setNotes(target.reviewerNotes || 'Borrower exhibits stable debt service capacity adhering to credit guidelines.');
        }
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setErrorMessage('Failed to load applications from API.');
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [queryId]);

  const handleSelectApp = (appId) => {
    const found = applications.find((a) => a.id === appId);
    if (found) {
      setSelectedApp(found);
      setApprovedAmount(found.requestedAmount || 500000);
      setApprovedTenure(found.tenureMonths || 36);
      setApprovedRate(found.annualInterestRate || 10.5);
      setSuccessMessage('');
      setErrorMessage('');
      navigate(`/banker/review?id=${found.id}`, { replace: true });
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleDocVerification = (docKey) => {
    setVerificationChecklist((prev) => {
      const current = prev[docKey];
      const next = current === 'Verified' ? 'Pending' : current === 'Pending' ? 'Discrepancy' : 'Verified';
      return { ...prev, [docKey]: next };
    });
  };

  // Submit Decision to Backend
  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      let finalStatus = 'Approved';
      let decisionSummary = notes;

      if (decision === 'Approved') {
        finalStatus = 'Approved';
        decisionSummary = `Loan Sanctioned for ₹${Number(approvedAmount).toLocaleString('en-IN')} @ ${approvedRate}% for ${approvedTenure} months. Underwriter conditions: ${notes}`;
      } else if (decision === 'Rejected') {
        finalStatus = 'Rejected';
        decisionSummary = `Adverse Credit Decision: ${adverseReason}. Rationale: ${notes}`;
      } else {
        finalStatus = 'Needs Information';
        decisionSummary = `Request for Additional Information: ${notes}`;
      }

      await api.updateApplicationStatus(selectedApp.id, {
        status: finalStatus,
        notes: decisionSummary,
        reviewer: user?.name || 'David Vance (Senior Underwriter)'
      });

      // Update local state
      const updatedApp = {
        ...selectedApp,
        status: finalStatus,
        reviewStatus: finalStatus,
        reviewerNotes: decisionSummary,
        lastUpdated: new Date().toLocaleString()
      };
      setSelectedApp(updatedApp);
      setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));

      setSubmitting(false);
      setSuccessMessage(`Underwriting decision recorded successfully! Status updated to "${finalStatus}".`);
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit decision to backend.');
    }
  };

  if (loading) {
    return (
      <BankerLayout>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#5B6B79' }}>
          <ShieldCheck size={32} color="#0F766E" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div>Loading credit underwriting assessment desk...</div>
        </div>
      </BankerLayout>
    );
  }

  if (!selectedApp) {
    return (
      <BankerLayout>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#5B6B79' }}>
          <FileText size={32} color="#CBD5E1" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', marginBottom: '8px' }}>
            No Application Selected
          </div>
          <Link
            to="/banker/applications"
            style={{ color: '#0F766E', textDecoration: 'none', fontWeight: '600' }}
          >
            &larr; Return to Applications Queue
          </Link>
        </div>
      </BankerLayout>
    );
  }

  // Underwriting ratio calculations (Deterministic rule-based, NO ML)
  const grossIncome = selectedApp.financials?.grossMonthlyIncome || 75000;
  const netInflow = selectedApp.financials?.netMonthlyInflow || Math.round(grossIncome * 0.85);
  const livingCosts = selectedApp.financials?.monthlyLivingExpenses || Math.round(grossIncome * 0.35);
  const existingDebt = selectedApp.financials?.existingDebtObligations || 0;
  const proposedEmi = calculateEMI(selectedApp.requestedAmount, selectedApp.annualInterestRate, selectedApp.tenureMonths);
  const totalDebtObligations = existingDebt + proposedEmi;
  const calculatedDti = grossIncome > 0 ? Math.round((totalDebtObligations / grossIncome) * 1000) / 10 : 0;
  const netSurplus = netInflow - livingCosts - existingDebt;
  const dscr = proposedEmi > 0 ? Math.round((netSurplus / proposedEmi) * 100) / 100 : 1.5;

  const isDtiOptimal = calculatedDti <= 40;
  const isDtiCaution = calculatedDti > 40 && calculatedDti <= 50;
  const isDtiDanger = calculatedDti > 50;

  return (
    <BankerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Header & Applicant Dossier Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Link to="/banker/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Banker Portal</Link>
              <span>/</span>
              <Link to="/banker/applications" style={{ color: 'inherit', textDecoration: 'none' }}>Applications</Link>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>Case Dossier</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: '#173B57',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}
              >
                Underwriting Dossier: {selectedApp.applicantName}
              </h1>
              <BankerStatusBadge status={selectedApp.status || selectedApp.reviewStatus} />
            </div>
            <div style={{ fontSize: '13px', color: '#5B6B79', marginTop: '4px' }}>
              Facility: <strong>{selectedApp.purpose || 'Personal Loan'}</strong> &bull; Requested: <strong>{formatINR(selectedApp.requestedAmount)}</strong> for {selectedApp.tenureMonths || 36}m @ {selectedApp.annualInterestRate || 10.5}%
            </div>
          </div>

          {/* Dossier Switcher Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#5B6B79', fontWeight: '500' }}>Switch Dossier:</span>
            <select
              value={selectedApp.id}
              onChange={(e) => handleSelectApp(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #DCE3EA',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#172B3A',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.id} — {app.applicantName} ({app.status || 'Pending'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Success or Error Alerts */}
        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#E8F5EE',
              border: '1px solid #A6F4C5',
              borderRadius: '8px',
              color: '#18794E',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FEF3F2',
              border: '1px solid #FECDCA',
              borderRadius: '8px',
              color: '#B42318',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 4 Summary Highlight Metric Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}
        >
          {/* Metric 1: DTI Ratio */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #DCE3EA',
              padding: '14px 18px',
              boxShadow: '0 1px 4px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Debt-to-Income (DTI)
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: isDtiOptimal ? '#18794E' : isDtiCaution ? '#B54708' : '#B42318', marginTop: '4px' }}>
              {calculatedDti}%
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
              Benchmark: &le; 50.0% max limit
            </div>
          </div>

          {/* Metric 2: DSCR Repayment Buffer */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #DCE3EA',
              padding: '14px 18px',
              boxShadow: '0 1px 4px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Repayment Buffer (DSCR)
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: dscr >= 1.5 ? '#18794E' : dscr >= 1.0 ? '#B54708' : '#B42318', marginTop: '4px' }}>
              {dscr}x Surplus
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
              Surplus covers proposed EMI {dscr}x
            </div>
          </div>

          {/* Metric 3: Credit Bureau Score */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #DCE3EA',
              padding: '14px 18px',
              boxShadow: '0 1px 4px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Bureau Rating &amp; Delinquencies
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#173B57', marginTop: '4px' }}>
              {selectedApp.creditHistory?.bureauBand || '740 (Standard)'}
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
              {selectedApp.creditHistory?.delinquencies24m ?? 0} late payments in 24m
            </div>
          </div>

          {/* Metric 4: Proposed Monthly EMI */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #DCE3EA',
              padding: '14px 18px',
              boxShadow: '0 1px 4px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Estimated Monthly Installment
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', marginTop: '4px' }}>
              {formatINR(proposedEmi)}
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
              Principal: {formatINR(selectedApp.requestedAmount)} &bull; {selectedApp.tenureMonths || 36}m
            </div>
          </div>
        </div>

        {/* Underwriting Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #DCE3EA',
            paddingBottom: '2px'
          }}
        >
          {[
            { id: 'DECISION', label: '1. Underwriting Decision Desk', icon: ShieldCheck },
            { id: 'FINANCIALS', label: '2. Financial & Ratio Analysis', icon: TrendingUp },
            { id: 'DOCUMENTS', label: '3. KYC & Document Verification', icon: FileCheck },
            { id: 'ULAS_ENGINE', label: '4. ULAS Scoring & Policy Gates', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  border: 'none',
                  borderBottom: active ? '3px solid #0F766E' : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: active ? '#0F766E' : '#5B6B79',
                  fontSize: '14px',
                  fontWeight: active ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Underwriting Decision Desk */}
        {activeTab === 'DECISION' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DCE3EA',
              padding: '28px',
              boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 6px 0' }}>
                Officer Sanction &amp; Decision Console
              </h2>
              <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0 }}>
                Formal underwriting assessment based on deterministic debt-service ratios, borrower disclosures, and verified documents.
              </p>
            </div>

            <form onSubmit={handleSubmitDecision} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Decision Type Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#173B57', marginBottom: '8px' }}>
                  Select Underwriting Decision:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {/* Approve */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: decision === 'Approved' ? '2px solid #18794E' : '1px solid #DCE3EA',
                      backgroundColor: decision === 'Approved' ? '#E8F5EE' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="Approved"
                      checked={decision === 'Approved'}
                      onChange={() => setDecision('Approved')}
                      style={{ accentColor: '#18794E' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#18794E' }}>
                        Approve &amp; Sanction
                      </div>
                      <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                        Meets DTI and repayment criteria
                      </div>
                    </div>
                  </label>

                  {/* Reject */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: decision === 'Rejected' ? '2px solid #B42318' : '1px solid #DCE3EA',
                      backgroundColor: decision === 'Rejected' ? '#FEF3F2' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="Rejected"
                      checked={decision === 'Rejected'}
                      onChange={() => setDecision('Rejected')}
                      style={{ accentColor: '#B42318' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#B42318' }}>
                        Decline / Reject
                      </div>
                      <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                        Breaches debt-service standards
                      </div>
                    </div>
                  </label>

                  {/* Needs Information */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: decision === 'Needs Information' ? '2px solid #B54708' : '1px solid #DCE3EA',
                      backgroundColor: decision === 'Needs Information' ? '#FFFAEB' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="Needs Information"
                      checked={decision === 'Needs Information'}
                      onChange={() => setDecision('Needs Information')}
                      style={{ accentColor: '#B54708' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#B54708' }}>
                        Request Information
                      </div>
                      <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                        Requires updated proofs or ITR
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Conditional Approval Parameters */}
              {decision === 'Approved' && (
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '18px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#173B57', marginBottom: '6px' }}>
                      Sanctioned Principal (₹)
                    </label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #DCE3EA',
                        fontSize: '13px',
                        color: '#172B3A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#173B57', marginBottom: '6px' }}>
                      Sanctioned Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={approvedTenure}
                      onChange={(e) => setApprovedTenure(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #DCE3EA',
                        fontSize: '13px',
                        color: '#172B3A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#173B57', marginBottom: '6px' }}>
                      Interest Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={approvedRate}
                      onChange={(e) => setApprovedRate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #DCE3EA',
                        fontSize: '13px',
                        color: '#172B3A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Conditional Adverse Action Reason */}
              {decision === 'Rejected' && (
                <div
                  style={{
                    backgroundColor: '#FEF3F2',
                    borderRadius: '8px',
                    border: '1px solid #FECDCA',
                    padding: '16px'
                  }}
                >
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#B42318', marginBottom: '6px' }}>
                    Primary Regulatory Adverse Action Reason:
                  </label>
                  <select
                    value={adverseReason}
                    onChange={(e) => setAdverseReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #FECDCA',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      color: '#B42318',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="DTI ratio exceeds 50% regulatory policy ceiling">
                      DTI ratio exceeds 50% regulatory policy ceiling
                    </option>
                    <option value="Insufficient debt-service cash surplus (DSCR < 1.0x)">
                      Insufficient debt-service cash surplus (DSCR &lt; 1.0x)
                    </option>
                    <option value="Unverified payroll credits / income discrepancy">
                      Unverified payroll credits / income discrepancy
                    </option>
                    <option value="Delinquencies recorded on existing tradelines">
                      Delinquencies recorded on existing tradelines
                    </option>
                    <option value="Inadequate employment or business vintage (< 2 years)">
                      Inadequate employment or business vintage (&lt; 2 years)
                    </option>
                  </select>
                </div>
              )}

              {/* Underwriter Rationale & Pre-Conditions */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#173B57', marginBottom: '6px' }}>
                  Underwriter Notes &amp; Sanction Conditions:
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record formal underwriting rationale, disbursement conditions, or requested documents..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #DCE3EA',
                    fontSize: '13px',
                    color: '#172B3A',
                    fontFamily: 'inherit',
                    outline: 'none',
                    lineHeight: 1.5,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    backgroundColor: decision === 'Approved' ? '#18794E' : decision === 'Rejected' ? '#B42318' : '#B54708',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  <Send size={16} />
                  <span>{submitting ? 'Recording Decision...' : 'Record Formal Underwriting Decision'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Financial & Ratio Analysis (Strictly NO ML) */}
        {activeTab === 'FINANCIALS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* DTI Breakdown Section */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #DCE3EA',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 6px 0' }}>
                1. Debt-to-Income (DTI / FOIR) Mathematical Evaluation
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', margin: '0 0 16px 0' }}>
                Measures total monthly fixed obligations (existing debt + proposed EMI) divided by gross monthly income.
              </p>

              {/* Ratio Gauge Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  <span>Calculated DTI: {calculatedDti}%</span>
                  <span>Regulatory Ceiling: 50.0%</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(calculatedDti, 100)}%`,
                      height: '100%',
                      backgroundColor: isDtiOptimal ? '#18794E' : isDtiCaution ? '#B54708' : '#B42318',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8C9BA8', marginTop: '4px' }}>
                  <span>0% (Debt Free)</span>
                  <span>40% (Optimal)</span>
                  <span>50% (Max Limit)</span>
                  <span>100% (Insolvent)</span>
                </div>
              </div>

              {/* Exact Formula Table */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#5B6B79', display: 'block', fontSize: '11px' }}>Gross Monthly Income</span>
                    <strong style={{ color: '#173B57', fontSize: '15px' }}>{formatINR(grossIncome)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#5B6B79', display: 'block', fontSize: '11px' }}>Existing Monthly EMIs</span>
                    <strong style={{ color: '#173B57', fontSize: '15px' }}>{formatINR(existingDebt)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#5B6B79', display: 'block', fontSize: '11px' }}>Proposed Loan EMI</span>
                    <strong style={{ color: '#0F766E', fontSize: '15px' }}>{formatINR(proposedEmi)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#5B6B79', display: 'block', fontSize: '11px' }}>Total Monthly Outflow</span>
                    <strong style={{ color: isDtiOptimal ? '#18794E' : '#B42318', fontSize: '15px' }}>{formatINR(totalDebtObligations)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* DSCR Repayment Capacity Section */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #DCE3EA',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 6px 0' }}>
                2. Debt Service Coverage Ratio (DSCR) &amp; Cash Cushion
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', margin: '0 0 16px 0' }}>
                Evaluates net disposable cash surplus against the required loan installment. A ratio &ge; 1.5x represents strong debt servicing cushion.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#5B6B79' }}>Net Monthly Inflow</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#173B57' }}>{formatINR(netInflow)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5B6B79' }}>Monthly Living Expenses</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#173B57' }}>{formatINR(livingCosts)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5B6B79' }}>Net Disposable Surplus</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: netSurplus > 0 ? '#18794E' : '#B42318' }}>
                    {formatINR(netSurplus)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5B6B79' }}>Surplus Multiple (DSCR)</span>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: dscr >= 1.5 ? '#18794E' : '#B42318' }}>
                    {dscr}x Coverage
                  </div>
                </div>
              </div>
            </div>

            {/* Bureau Tradelines & Employment Profile */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #DCE3EA',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 16px 0' }}>
                3. Credit Bureau Tradelines &amp; Employment History
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#5B6B79', marginBottom: '4px' }}>Employer / Enterprise:</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#173B57' }}>
                    {selectedApp.employment?.employerOrBusiness || 'Direct Corporate Payroll'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B79', marginTop: '2px' }}>
                    Sector: {selectedApp.employment?.industrySector || 'Technology & Services'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#5B6B79', marginBottom: '4px' }}>Employment Vintage:</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#173B57' }}>
                    {selectedApp.employment?.vintageYears ? `${selectedApp.employment.vintageYears} Years` : '5+ Years'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#18794E', marginTop: '2px' }}>
                    &ge; 2.0 Year Minimum Policy Met
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#5B6B79', marginBottom: '4px' }}>On-Time Repayment Record:</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#18794E' }}>
                    {selectedApp.creditHistory?.onTimePaymentPct || 99.4}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B79', marginTop: '2px' }}>
                    {selectedApp.creditHistory?.activeCreditLines || 4} Active Tradelines
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: KYC & Document Verification Checklist */}
        {activeTab === 'DOCUMENTS' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DCE3EA',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 6px 0' }}>
                Borrower Document &amp; KYC Verification Register
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0 }}>
                Click on any document row to update underwriter verification state.
              </p>
            </div>

            {/* Section 13 Authoritative Verification Audit Register */}
            {verificationReport && verificationReport.document_reports && verificationReport.document_reports.length > 0 && (
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#173B57', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Authoritative Evidence Audit Matrix (Section 13 Contract)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {verificationReport.document_reports.map((rep, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '8px',
                        border: '1px solid #DCE3EA',
                        backgroundColor: rep.review_status === 'PENDING' ? '#FFFDF7' : '#FFFFFF',
                        boxShadow: '0 1px 4px rgba(23, 43, 58, 0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#173B57' }}>{rep.document_type}</strong>
                          <span style={{ fontSize: '11px', color: '#5B6B79', marginLeft: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F4F8' }}>
                            {rep.required_status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', backgroundColor: rep.file_processing === 'READABLE' ? '#E8F5EE' : '#FEF3F2', color: rep.file_processing === 'READABLE' ? '#18794E' : '#B42318' }}>
                            File: {rep.file_processing}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', backgroundColor: rep.digital_signature_status === 'PRESENT_VALID' || rep.digital_signature_status === 'PRESENT_UNVERIFIED_TRUST' ? '#E6F4F1' : '#F1F4F8', color: rep.digital_signature_status.includes('PRESENT') ? '#0F766E' : '#5B6B79' }}>
                            Signature: {rep.digital_signature_status.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', backgroundColor: rep.consistency_status === 'CONSISTENT' ? '#E8F5EE' : '#FFF4D6', color: rep.consistency_status === 'CONSISTENT' ? '#18794E' : '#925D00' }}>
                            Consistency: {rep.consistency_status}
                          </span>
                        </div>
                      </div>

                      {/* Findings & Limitations */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', fontSize: '12px', marginTop: '8px' }}>
                        <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '6px' }}>
                          <span style={{ fontWeight: '700', color: '#173B57', display: 'block', marginBottom: '4px' }}>Extracted Findings:</span>
                          <ul style={{ margin: 0, paddingLeft: '16px', color: '#334155', lineHeight: 1.4 }}>
                            {rep.findings.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '6px' }}>
                          <span style={{ fontWeight: '700', color: '#5B6B79', display: 'block', marginBottom: '4px' }}>Verified Limitations:</span>
                          <ul style={{ margin: 0, paddingLeft: '16px', color: '#5B6B79', lineHeight: 1.4 }}>
                            {rep.limitations.map((l, i) => (
                              <li key={i}>{l}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {rep.review_actions && rep.review_actions.length > 0 && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#FFF4D6', border: '1px solid #FFE58F', fontSize: '12px', color: '#925D00' }}>
                          <strong>Review Action Required:</strong> {rep.review_actions.join('; ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Underwriter Override Register */}
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#5B6B79', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Manual Underwriter KYC Overrides
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  key: 'identityDoc',
                  title: 'Primary Identity Proof (Aadhaar / Passport)',
                  desc: 'Verified against national identity authority with matching full name and date of birth.'
                },
                {
                  key: 'panCard',
                  title: 'Permanent Account Number (PAN) Card',
                  desc: 'Verified with Income Tax Department database. Valid tax filing status.'
                },
                {
                  key: 'bankStatement',
                  title: '6-Month Comprehensive Bank Account Statement',
                  desc: 'Automated payroll deposit check confirms recurrent monthly salary credits.'
                },
                {
                  key: 'creditReport',
                  title: 'Credit Information Bureau Report (CIR)',
                  desc: 'Zero 30+ day delinquencies recorded across all active credit accounts in previous 24 months.'
                }
              ].map((doc) => {
                const status = verificationChecklist[doc.key] || 'Verified';
                return (
                  <div
                    key={doc.key}
                    onClick={() => handleToggleDocVerification(doc.key)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: status === 'Verified' ? '#FBFDFF' : '#FFFDF7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                        {doc.desc}
                      </div>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: status === 'Verified' ? '#E8F5EE' : status === 'Pending' ? '#FFF4D6' : '#FEF3F2',
                          color: status === 'Verified' ? '#18794E' : status === 'Pending' ? '#B54708' : '#B42318',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {status === 'Verified' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        <span>{status}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: ULAS Scoring & Policy Gates (Deterministic v0.2 Engine) */}
        {activeTab === 'ULAS_ENGINE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loadingAssessment ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '60px', textAlign: 'center', color: '#5B6B79' }}>
                <Clock size={28} className="cl-spin" style={{ margin: '0 auto 12px', color: '#0F766E' }} />
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Evaluating authoritative ULAS policy gates and sub-scores...</div>
              </div>
            ) : ulasAssessment ? (
              <>
                {/* Score Summary Quad */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #DCE3EA',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0F766E', fontWeight: '700', letterSpacing: '0.04em' }}>
                        Universal Loan Acceptance Score (ULAS v0.2)
                      </span>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', margin: '4px 0 2px' }}>
                        Deterministic Creditworthiness Engine
                      </h2>
                      <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                        Auditable multi-dimensional risk index derived from verified evidence.
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', display: 'block' }}>Engine Output</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '32px', fontWeight: '800', color: '#173B57' }}>{ulasAssessment.ulas}</span>
                          <span style={{ fontSize: '14px', color: '#5B6B79' }}>/ 100</span>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          backgroundColor: ulasAssessment.band === 'A+' || ulasAssessment.band === 'A' ? '#E8F5EE' : ulasAssessment.band === 'B' || ulasAssessment.band === 'C' ? '#FFF4D6' : '#FEF3F2',
                          color: ulasAssessment.band === 'A+' || ulasAssessment.band === 'A' ? '#18794E' : ulasAssessment.band === 'B' || ulasAssessment.band === 'C' ? '#925D00' : '#B42318',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Band Tier</div>
                        <div style={{ fontSize: '24px', fontWeight: '900' }}>{ulasAssessment.band}</div>
                      </div>
                    </div>
                  </div>

                  {/* Calibration & Integrity Meta */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#5B6B79', display: 'block' }}>Base ULAS (Pre-Adjustment):</span>
                      <strong style={{ color: '#173B57' }}>{ulasAssessment.ulas_base}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5B6B79', display: 'block' }}>Policy Adjusted ULAS:</span>
                      <strong style={{ color: '#173B57' }}>{ulasAssessment.ulas_policy_adjusted}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5B6B79', display: 'block' }}>Confidence Factor:</span>
                      <strong style={{ color: '#0F766E' }}>{Math.round(ulasAssessment.confidence * 100)}%</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5B6B79', display: 'block' }}>Calibration Status:</span>
                      <strong style={{ color: '#5B6B79' }}>{ulasAssessment.calibration_status}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5B6B79', display: 'block' }}>12M Default Prob (PD):</span>
                      <strong style={{ color: '#5B6B79' }}>{ulasAssessment.pd_model_status}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5B6B79', display: 'block' }}>Decision Path:</span>
                      <strong style={{ color: ulasAssessment.decision_recommendation.includes('DECLINE') ? '#B42318' : '#18794E' }}>
                        {ulasAssessment.decision_recommendation.replace('_', ' ')}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 7 Policy Gates Evaluation Matrix */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #DCE3EA',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 4px' }}>
                    1. Underwriting Policy Gates Evaluation (Ordered Priority G1 &rarr; G7)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#5B6B79', margin: '0 0 16px' }}>
                    Gates are evaluated sequentially. A definitive FAIL halts decisioning immediately regardless of composite score.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ulasAssessment.gates &&
                      Object.entries(ulasAssessment.gates).map(([gKey, gVal]) => {
                        const isPass = gVal.status === 'PASS';
                        const isFail = gVal.status === 'FAIL';
                        return (
                          <div
                            key={gKey}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: `1px solid ${isPass ? '#D1FAE5' : isFail ? '#FECACA' : '#E2E8F0'}`,
                              backgroundColor: isPass ? '#F0FDF4' : isFail ? '#FEF2F2' : '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '13px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: '800', color: '#173B57', width: '32px' }}>{gKey.split('_')[0]}</span>
                              <span style={{ fontWeight: '600', color: '#172B3A' }}>
                                {gKey.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {gVal.reason_codes && gVal.reason_codes.length > 0 && (
                                <span style={{ fontSize: '11px', color: '#B42318' }}>
                                  [{gVal.reason_codes.join(', ')}]
                                </span>
                              )}
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: isPass ? '#18794E' : isFail ? '#B42318' : '#925D00',
                                  color: '#FFFFFF'
                                }}
                              >
                                {gVal.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 5 ULAS Sub-Scores Breakdown */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #DCE3EA',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 4px' }}>
                    2. Five-Dimension Sub-Score Architecture &amp; Contributions
                  </h3>
                  <p style={{ fontSize: '12px', color: '#5B6B79', margin: '0 0 16px' }}>
                    Sub-scores are scaled 0–100 and weighted deterministically according to product policy.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    {ulasAssessment.subscores &&
                      Object.entries(ulasAssessment.subscores).map(([sKey, sVal]) => (
                        <div
                          key={sKey}
                          style={{
                            backgroundColor: '#F8FAFC',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase' }}>
                              Weight: {sVal.weight}%
                            </span>
                            <span style={{ fontSize: '10px', color: '#5B6B79' }}>{sVal.status}</span>
                          </div>
                          <strong style={{ fontSize: '13px', color: '#173B57' }}>
                            {sKey.replace(/_/g, ' ').toUpperCase()}
                          </strong>
                          <div style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', margin: '4px 0' }}>
                            {sVal.score !== null ? `${Math.round(sVal.score)}` : 'N/A'}
                          </div>
                          <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                            {sVal.explanation || 'Calculated from verified evidence.'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Score Drivers & Cross-Document Discrepancies */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {/* Drivers */}
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #DCE3EA',
                      padding: '20px',
                      boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
                    }}
                  >
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#173B57', margin: '0 0 12px' }}>
                      Key Model Drivers &amp; Point Contributions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                      <div>
                        <span style={{ fontWeight: '700', color: '#18794E', display: 'block', marginBottom: '4px' }}>
                          Positive Readiness Factors:
                        </span>
                        {ulasAssessment.drivers_positive && ulasAssessment.drivers_positive.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '16px', color: '#18794E' }}>
                            {ulasAssessment.drivers_positive.map((d, i) => {
                              const name = d.feature || d.driver || 'Factor';
                              const pts = d.contribution_points ?? d.points ?? 0;
                              return (
                                <li key={i}>{name} ({pts > 0 ? `+${pts}` : pts} pts)</li>
                              );
                            })}
                          </ul>
                        ) : (
                          <span style={{ color: '#5B6B79' }}>No major positive drivers</span>
                        )}
                      </div>
                      <div>
                        <span style={{ fontWeight: '700', color: '#B42318', display: 'block', marginBottom: '4px' }}>
                          Adverse Risk Signals:
                        </span>
                        {ulasAssessment.drivers_negative && ulasAssessment.drivers_negative.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '16px', color: '#B42318' }}>
                            {ulasAssessment.drivers_negative.map((d, i) => {
                              const name = d.feature || d.driver || 'Risk Signal';
                              const pts = d.contribution_points ?? d.points ?? 0;
                              return (
                                <li key={i}>{name} ({pts} pts)</li>
                              );
                            })}
                          </ul>
                        ) : (
                          <span style={{ color: '#5B6B79' }}>Zero adverse risk drivers</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Discrepancies */}
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #DCE3EA',
                      padding: '20px',
                      boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
                    }}
                  >
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#173B57', margin: '0 0 12px' }}>
                      Cross-Document Reconciliation Audit
                    </h3>
                    {verificationReport && verificationReport.discrepancies && verificationReport.discrepancies.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                        {verificationReport.discrepancies.map((disc, idx) => (
                          <div key={idx} style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B42318' }}>
                            <strong>{disc.field}:</strong> {disc.details} (Tolerance: {disc.rule_applied})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #D1FAE5', color: '#18794E', fontSize: '13px' }}>
                        ✓ Cross-document reconciliation passed: No name mismatches, bounce spikes, or claimed salary contradictions detected.
                      </div>
                    )}
                  </div>
                </div>

                {/* Provenance Audit Footer */}
                <div style={{ padding: '12px 16px', backgroundColor: '#F1F5F9', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', color: '#475569', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <span>Engine: <strong>{ulasAssessment.model_version}</strong></span>
                  <span>Policy Version: <strong>{ulasAssessment.policy_version}</strong></span>
                  <span>Assessed At: <strong>{ulasAssessment.assessed_at}</strong></span>
                  <span>Assessment ID: <strong>{ulasAssessment.assessment_id}</strong></span>
                </div>
              </>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '40px', textAlign: 'center', color: '#5B6B79' }}>
                No ULAS assessment run has been logged for this application yet.
              </div>
            )}
          </div>
        )}
      </div>
    </BankerLayout>
  );
}
