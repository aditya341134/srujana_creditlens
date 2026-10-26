import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Calculator,
  RefreshCw,
  ArrowRight,
  User,
  DollarSign,
  Copy,
  Check,
  Layers,
  ChevronRight,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import BankerLayout from '../../components/layout/BankerLayout';
import BankerStatusBadge from '../../components/banker/BankerStatusBadge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export default function BankerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeQueueTab, setActiveQueueTab] = useState('PENDING'); // 'PENDING' | 'ALL' | 'APPROVED' | 'FLAGGED'
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appsRes, auditRes] = await Promise.allSettled([
        api.getApplications(),
        api.getAuditEvents(10)
      ]);

      if (appsRes.status === 'fulfilled') {
        const items = appsRes.value.items || (Array.isArray(appsRes.value) ? appsRes.value : []);
        setApplications(items);
      }
      if (auditRes.status === 'fulfilled') {
        const events = Array.isArray(auditRes.value) ? auditRes.value : [];
        setAuditEvents(events);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch underwriting data from server.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics computation (Deterministic rule-based metrics, NO ML)
  const totalAppsCount = applications.length;

  const pendingApps = applications.filter((a) => {
    const s = (a.status || a.reviewStatus || '').toLowerCase();
    return s.includes('review') || s.includes('pending') || s.includes('verification') || s.includes('ready');
  });

  const approvedApps = applications.filter((a) => {
    const s = (a.status || a.reviewStatus || '').toLowerCase();
    return s.includes('approved') || s.includes('sanction') || s.includes('confirmed') || s.includes('disbursed');
  });

  const flaggedApps = applications.filter((a) => {
    const dti = a.financials?.calculatedDti || 0;
    const dscr = a.financials?.debtServiceCoverageRatio || 1.5;
    const s = (a.status || a.reviewStatus || '').toLowerCase();
    return dti > 50 || dscr < 1.0 || s.includes('need') || s.includes('missing') || s.includes('discrepancy');
  });

  const totalSanctionedAmount = approvedApps.reduce((acc, curr) => acc + (Number(curr.requestedAmount) || 0), 0);

  // Average DTI across portfolio
  const avgDti = applications.length > 0
    ? Math.round((applications.reduce((acc, a) => acc + (a.financials?.calculatedDti || 30), 0) / applications.length) * 10) / 10
    : 28.4;

  // Filter queue based on active tab
  const displayedQueue = applications.filter((a) => {
    const s = (a.status || a.reviewStatus || '').toLowerCase();
    const dti = a.financials?.calculatedDti || 0;
    const dscr = a.financials?.debtServiceCoverageRatio || 1.5;

    if (activeQueueTab === 'PENDING') {
      return s.includes('review') || s.includes('pending') || s.includes('verification') || s.includes('ready');
    }
    if (activeQueueTab === 'APPROVED') {
      return s.includes('approved') || s.includes('sanction') || s.includes('confirmed') || s.includes('disbursed');
    }
    if (activeQueueTab === 'FLAGGED') {
      return dti > 50 || dscr < 1.0 || s.includes('need') || s.includes('missing') || s.includes('discrepancy');
    }
    return true; // 'ALL'
  });

  return (
    <BankerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header Breadcrumb & Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#5B6B79',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <span>Banker Portal</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>Desk Dashboard</span>
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#173B57',
                margin: '6px 0 6px 0',
                letterSpacing: '-0.02em'
              }}
            >
              Underwriting &amp; Credit Risk Desk
            </h1>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
              Institutional credit assessment console. Conduct rule-based debt service evaluations, verify borrower dossiers, and sanction loans without black-box ML.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DCE3EA',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#173B57',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F6F8FB')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <RefreshCw size={15} className={loading ? 'cl-spin' : ''} />
              <span>Refresh Desk</span>
            </button>

            <Link
              to="/banker/simulator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                backgroundColor: '#173B57',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#FFFFFF',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(23, 59, 87, 0.2)'
              }}
            >
              <Calculator size={15} />
              <span>Loan Simulator</span>
            </Link>
          </div>
        </div>

        {/* 5 KPI Metric Cards (Matching Borrower Review Page Style) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Card 1: Total Queue */}
          <div
            onClick={() => setActiveQueueTab('ALL')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: activeQueueTab === 'ALL' ? '2px solid #0F766E' : '1px solid #DCE3EA',
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: activeQueueTab === 'ALL' ? '0 4px 12px rgba(15, 118, 110, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#5B6B79' }}>Total Inflow Queue</span>
              <FileText size={18} color="#0F766E" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#173B57' }}>
              {totalAppsCount}
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '4px' }}>
              Active loan dossiers in desk
            </div>
          </div>

          {/* Card 2: Awaiting Decision */}
          <div
            onClick={() => setActiveQueueTab('PENDING')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: activeQueueTab === 'PENDING' ? '2px solid #B54708' : '1px solid #DCE3EA',
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: activeQueueTab === 'PENDING' ? '0 4px 12px rgba(181, 71, 8, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#5B6B79' }}>Awaiting Decision</span>
              <Clock size={18} color="#B54708" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#B54708' }}>
              {pendingApps.length}
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '4px' }}>
              Pending underwriter sanction
            </div>
          </div>

          {/* Card 3: Sanctioned Portfolio */}
          <div
            onClick={() => setActiveQueueTab('APPROVED')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: activeQueueTab === 'APPROVED' ? '2px solid #18794E' : '1px solid #DCE3EA',
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: activeQueueTab === 'APPROVED' ? '0 4px 12px rgba(24, 121, 78, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#5B6B79' }}>Approved Sanctions</span>
              <CheckCircle2 size={18} color="#18794E" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#18794E' }}>
              {formatINR(totalSanctionedAmount)}
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '4px' }}>
              {approvedApps.length} Sanctioned facilities
            </div>
          </div>

          {/* Card 4: High Risk / Exceptions */}
          <div
            onClick={() => setActiveQueueTab('FLAGGED')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: activeQueueTab === 'FLAGGED' ? '2px solid #B42318' : '1px solid #DCE3EA',
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: activeQueueTab === 'FLAGGED' ? '0 4px 12px rgba(180, 35, 24, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#5B6B79' }}>Policy Exceptions</span>
              <AlertTriangle size={18} color="#B42318" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#B42318' }}>
              {flaggedApps.length}
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '4px' }}>
              DTI &gt; 50% or DSCR deficit
            </div>
          </div>

          {/* Card 5: Portfolio Health DTI */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DCE3EA',
              padding: '18px 20px',
              boxShadow: '0 2px 6px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#5B6B79' }}>Avg. Debt Burden</span>
              <TrendingUp size={18} color="#0F766E" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#173B57' }}>
              {avgDti}% <span style={{ fontSize: '14px', fontWeight: '600', color: '#18794E' }}>Optimal</span>
            </div>
            <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '4px' }}>
              Prudential benchmark &le; 50.0%
            </div>
          </div>
        </div>

        {/* Main Content Layout (Queue on Left, Policy Benchmark & Audits on Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '24px',
            alignItems: 'start'
          }}
          className="cl-banker-main-grid"
        >
          {/* Left: Priority Underwriting Queue */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DCE3EA',
              boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)',
              overflow: 'hidden'
            }}
          >
            {/* Queue Header & Tabs */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Active Underwriting Queue
                </h2>
                <div style={{ fontSize: '12px', color: '#5B6B79', marginTop: '3px' }}>
                  Click any applicant dossier to open rule-based credit analysis and record sanction decision.
                </div>
              </div>

              {/* Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  backgroundColor: '#F6F8FB',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                {[
                  { id: 'PENDING', label: `Pending (${pendingApps.length})` },
                  { id: 'ALL', label: `All (${totalAppsCount})` },
                  { id: 'APPROVED', label: `Approved (${approvedApps.length})` },
                  { id: 'FLAGGED', label: `Flagged (${flaggedApps.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveQueueTab(tab.id)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: activeQueueTab === tab.id ? '700' : '500',
                      color: activeQueueTab === tab.id ? '#173B57' : '#5B6B79',
                      backgroundColor: activeQueueTab === tab.id ? '#FFFFFF' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: activeQueueTab === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List */}
            {loading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#5B6B79' }}>
                <RefreshCw size={24} className="cl-spin" style={{ margin: '0 auto 12px', display: 'block', color: '#0F766E' }} />
                <span>Synchronizing live loan applications queue...</span>
              </div>
            ) : displayedQueue.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#5B6B79' }}>
                <FileText size={32} color="#CBD5E1" style={{ margin: '0 auto 12px', display: 'block' }} />
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#173B57', marginBottom: '4px' }}>
                  No applications in this filter
                </div>
                <div style={{ fontSize: '13px' }}>
                  Change the active filter tab to view other applications.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayedQueue.map((app, index) => {
                  const dti = app.financials?.calculatedDti || 0;
                  const dscr = app.financials?.debtServiceCoverageRatio || 1.0;
                  const bureauScore = app.creditHistory?.bureauBand || '740 (Standard)';
                  const isDtiOptimal = dti <= 40;
                  const isDtiCaution = dti > 40 && dti <= 50;
                  const isDtiDanger = dti > 50;

                  return (
                    <div
                      key={app.id || index}
                      style={{
                        padding: '18px 22px',
                        borderBottom: index < displayedQueue.length - 1 ? '1px solid #F0F4F8' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="cl-queue-row"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FBFDFF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Left: Applicant & Loan info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: '#E6F4F1',
                            color: '#0F766E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '700',
                            flexShrink: 0
                          }}
                        >
                          {app.applicantInitials || (app.applicantName ? app.applicantName.slice(0, 2).toUpperCase() : 'APP')}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '15px', fontWeight: '700', color: '#173B57' }}>
                              {app.applicantName}
                            </span>
                            <span
                              onClick={(e) => handleCopyId(app.id, e)}
                              style={{
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                color: '#5B6B79',
                                backgroundColor: '#F0F4F8',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              title="Click to copy application ID"
                            >
                              {app.id}
                              {copiedId === app.id ? <Check size={11} color="#18794E" /> : <Copy size={11} />}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: '#5B6B79', marginTop: '3px' }}>
                            {app.purpose || 'Personal Facility'} &bull; Applied: {app.submissionDate || 'Recent'} &bull; {app.applicantType || 'Salaried'}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Underwriting Ratios (No ML - pure DTI, DSCR, Amount) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }} className="cl-ratios-block">
                        {/* Amount */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#173B57' }}>
                            {formatINR(app.requestedAmount)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5B6B79' }}>
                            {app.tenureMonths || 36} Months &bull; {app.annualInterestRate || 10.5}%
                          </div>
                        </div>

                        {/* DTI Ratio Indicator */}
                        <div style={{ textAlign: 'center', minWidth: '85px' }}>
                          <div
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              display: 'inline-block',
                              backgroundColor: isDtiOptimal ? '#E8F5EE' : isDtiCaution ? '#FFF4D6' : '#FEF3F2',
                              color: isDtiOptimal ? '#18794E' : isDtiCaution ? '#B54708' : '#B42318'
                            }}
                          >
                            DTI: {dti}%
                          </div>
                          <div style={{ fontSize: '10px', color: '#5B6B79', marginTop: '2px' }}>
                            {isDtiOptimal ? 'Within Limits' : isDtiCaution ? 'Moderate' : 'Exceeds Cap'}
                          </div>
                        </div>

                        {/* DSCR Surplus Indicator */}
                        <div style={{ textAlign: 'center', minWidth: '70px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: dscr >= 1.5 ? '#18794E' : dscr >= 1.0 ? '#B54708' : '#B42318' }}>
                            {dscr}x DSCR
                          </div>
                          <div style={{ fontSize: '10px', color: '#5B6B79' }}>
                            Cash Buffer
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ minWidth: '130px', textAlign: 'right' }}>
                          <BankerStatusBadge status={app.status || app.reviewStatus} size="sm" />
                        </div>
                      </div>

                      {/* Right: Action button */}
                      <div style={{ flexShrink: 0 }}>
                        <Link
                          to={`/banker/review?id=${app.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '7px 14px',
                            backgroundColor: '#E6F4F1',
                            color: '#0F766E',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0F766E';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E6F4F1';
                            e.currentTarget.style.color = '#0F766E';
                          }}
                        >
                          <span>Underwrite</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer with link to full applications view */}
            <div
              style={{
                padding: '14px 22px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                Showing {displayedQueue.length} of {applications.length} loan applications in desk
              </span>
              <Link
                to="/banker/applications"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0F766E',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View Full Applications Register</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Underwriting Policy Benchmarks & Recent Decision Audits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Rule-Based Underwriting Policy Reference Card (Explicitly NO ML) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #DCE3EA',
                padding: '20px',
                boxShadow: '0 2px 6px rgba(23, 43, 58, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ShieldCheck size={18} color="#0F766E" />
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Prudential Policy Benchmarks
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: '#5B6B79', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                Credit decisions adhere strictly to established banking rule thresholds (No Black-Box ML):
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#172B3A', fontWeight: '500' }}>Max Permissible DTI</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#18794E' }}>&le; 50.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#172B3A', fontWeight: '500' }}>Min DSCR Buffer</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#18794E' }}>&ge; 1.25x</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#172B3A', fontWeight: '500' }}>Bureau Score Floor</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#18794E' }}>&ge; 680 Score</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#172B3A', fontWeight: '500' }}>Employment Vintage</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#18794E' }}>&ge; 2.0 Years</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#172B3A', fontWeight: '500' }}>KYC Verification</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F766E' }}>Mandatory 100%</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  padding: '10px 12px',
                  backgroundColor: '#E6F4F1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#0F766E',
                  lineHeight: 1.4
                }}
              >
                <strong>Audit Compliance:</strong> All sanctions must have transparent rationale recorded in the decision log.
              </div>
            </div>

            {/* Recent Decisions & Audit Stream */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #DCE3EA',
                padding: '20px',
                boxShadow: '0 2px 6px rgba(23, 43, 58, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Recent Desk Decisions
                </h3>
                <Link
                  to="/banker/audit"
                  style={{ fontSize: '11px', fontWeight: '600', color: '#0F766E', textDecoration: 'none' }}
                >
                  View All &rarr;
                </Link>
              </div>

              {auditEvents.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#5B6B79', textAlign: 'center', padding: '20px 0' }}>
                  No recent audit events logged yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {auditEvents.slice(0, 4).map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      style={{
                        paddingBottom: idx < 3 ? '12px' : '0',
                        borderBottom: idx < 3 ? '1px solid #F0F4F8' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: '#173B57' }}>
                          {evt.applicationId}
                        </span>
                        <span style={{ fontSize: '10px', color: '#8C9BA8' }}>
                          {evt.timestamp ? evt.timestamp.split(' ')[0] : 'Today'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#172B3A' }}>
                        {evt.eventType}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px', lineHeight: 1.3 }}>
                        {evt.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BankerLayout>
  );
}
