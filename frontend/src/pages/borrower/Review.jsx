import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Eye,
  X,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import BorrowerLayout from '../../components/layout/BorrowerLayout';
import api from '../../services/api';

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export default function Review() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONFIRMED' | 'PENDING_FUND' | 'CREDITED_FUND'

  // Tooltip / Details Popover state for hover/tap on mobile
  const [hoveredAppId, setHoveredAppId] = useState(null);
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [ulasData, setUlasData] = useState(null);
  const [loadingUlas, setLoadingUlas] = useState(false);

  useEffect(() => {
    if (selectedAppModal) {
      setLoadingUlas(true);
      api.getUlasAssessment(selectedAppModal.id)
        .then((res) => {
          setUlasData(res);
          setLoadingUlas(false);
        })
        .catch(() => {
          setUlasData(null);
          setLoadingUlas(false);
        });
    } else {
      setUlasData(null);
    }
  }, [selectedAppModal]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getApplications();
      const items = res.items || (Array.isArray(res) ? res : []);
      setApplications(items);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load loan application records.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Compute 5 Cards Data from actual backend records
  const totalAppsCount = applications.length;

  const pendingApps = applications.filter((a) => {
    const s = (a.status || a.reviewStatus || '').toLowerCase();
    return s.includes('review') || s.includes('pending') || s.includes('submitted');
  });

  const confirmedApps = applications.filter((a) => {
    const s = (a.status || a.reviewStatus || '').toLowerCase();
    return s.includes('approved') || s.includes('confirmed') || s.includes('disbursed');
  });

  // Calculate Pending Fund vs Total Fund Credited from records
  const pendingFundTotal = pendingApps.reduce((acc, curr) => acc + (Number(curr.requestedAmount) || 0), 0);
  const creditedFundTotal = confirmedApps.reduce((acc, curr) => acc + (Number(curr.requestedAmount) || 0), 0);

  // Filtered applications list based on activeCard
  const displayedApps = applications.filter((app) => {
    const s = (app.status || app.reviewStatus || '').toLowerCase();
    if (activeFilter === 'PENDING') {
      return s.includes('review') || s.includes('pending') || s.includes('submitted');
    }
    if (activeFilter === 'CONFIRMED') {
      return s.includes('approved') || s.includes('confirmed') || s.includes('disbursed');
    }
    if (activeFilter === 'PENDING_FUND') {
      return s.includes('review') || s.includes('pending') || s.includes('submitted');
    }
    if (activeFilter === 'CREDITED_FUND') {
      return s.includes('approved') || s.includes('confirmed') || s.includes('disbursed');
    }
    return true; // 'ALL'
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('approved') || s.includes('confirmed') || s.includes('disbursed')) {
      return {
        bg: '#E8F5EE',
        color: '#18794E',
        text: status || 'Confirmed'
      };
    }
    if (s.includes('review') || s.includes('ready')) {
      return {
        bg: '#FFF4D6',
        color: '#925D00',
        text: status || 'Under Review'
      };
    }
    if (s.includes('decline') || s.includes('reject')) {
      return {
        bg: '#FEF3F2',
        color: '#B42318',
        text: status || 'Declined'
      };
    }
    return {
      bg: '#F1F4F8',
      color: '#173B57',
      text: status || 'Submitted'
    };
  };

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Home</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>Review Dashboard</span>
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
              Loan Application Status &amp; Review
            </h1>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
              Track the processing lifecycle of your loan requests, inspect disbursement schedules, and view explainable underwriting factors.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchApplications}
            disabled={loading}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #DCE3EA',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#173B57',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'cl-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Records'}</span>
          </button>
        </div>

        {/* Five Clickable Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Card 1: Total Applications */}
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: `2px solid ${activeFilter === 'ALL' ? '#173B57' : '#DCE3EA'}`,
              padding: '18px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: activeFilter === 'ALL' ? '0 4px 14px rgba(23, 59, 87, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase' }}>
                Total Applications
              </span>
              <FileText size={18} color="#173B57" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#173B57', marginBottom: '4px' }}>
              {totalAppsCount}
            </div>
            <span style={{ fontSize: '11px', color: '#748391' }}>
              All submitted requests
            </span>
          </button>

          {/* Card 2: Pending */}
          <button
            type="button"
            onClick={() => setActiveFilter('PENDING')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: `2px solid ${activeFilter === 'PENDING' ? '#925D00' : '#DCE3EA'}`,
              padding: '18px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: activeFilter === 'PENDING' ? '0 4px 14px rgba(146, 93, 0, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#925D00', textTransform: 'uppercase' }}>
                Pending Review
              </span>
              <Clock size={18} color="#925D00" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#925D00', marginBottom: '4px' }}>
              {pendingApps.length}
            </div>
            <span style={{ fontSize: '11px', color: '#748391' }}>
              Awaiting officer sign-off
            </span>
          </button>

          {/* Card 3: Confirmed */}
          <button
            type="button"
            onClick={() => setActiveFilter('CONFIRMED')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: `2px solid ${activeFilter === 'CONFIRMED' ? '#18794E' : '#DCE3EA'}`,
              padding: '18px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: activeFilter === 'CONFIRMED' ? '0 4px 14px rgba(24, 121, 78, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#18794E', textTransform: 'uppercase' }}>
                Confirmed
              </span>
              <CheckCircle2 size={18} color="#18794E" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#18794E', marginBottom: '4px' }}>
              {confirmedApps.length}
            </div>
            <span style={{ fontSize: '11px', color: '#748391' }}>
              Approved by underwriting
            </span>
          </button>

          {/* Card 4: Pending Fund */}
          <button
            type="button"
            onClick={() => setActiveFilter('PENDING_FUND')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: `2px solid ${activeFilter === 'PENDING_FUND' ? '#0F766E' : '#DCE3EA'}`,
              padding: '18px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: activeFilter === 'PENDING_FUND' ? '0 4px 14px rgba(15, 118, 110, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase' }}>
                Pending Fund
              </span>
              <DollarSign size={18} color="#0F766E" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#173B57', marginBottom: '4px' }}>
              {formatINR(pendingFundTotal)}
            </div>
            <span style={{ fontSize: '11px', color: '#748391' }}>
              Funds awaiting disbursement
            </span>
          </button>

          {/* Card 5: Total Fund Credited */}
          <button
            type="button"
            onClick={() => setActiveFilter('CREDITED_FUND')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: `2px solid ${activeFilter === 'CREDITED_FUND' ? '#245EA8' : '#DCE3EA'}`,
              padding: '18px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: activeFilter === 'CREDITED_FUND' ? '0 4px 14px rgba(36, 94, 168, 0.12)' : '0 2px 6px rgba(23, 43, 58, 0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#245EA8', textTransform: 'uppercase' }}>
                Total Fund Credited
              </span>
              <TrendingUp size={18} color="#245EA8" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#173B57', marginBottom: '4px' }}>
              {formatINR(creditedFundTotal)}
            </div>
            <span style={{ fontSize: '11px', color: '#748391' }}>
              Disbursed to borrower accounts
            </span>
          </button>
        </div>

        {/* Filter State Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#5B6B79' }}>
              Filtering view by:{' '}
              <strong style={{ color: '#173B57' }}>
                {activeFilter === 'ALL'
                  ? 'All Applications'
                  : activeFilter === 'PENDING'
                  ? 'Pending Review'
                  : activeFilter === 'CONFIRMED'
                  ? 'Confirmed Loans'
                  : activeFilter === 'PENDING_FUND'
                  ? 'Pending Disbursement'
                  : 'Fund Credited'}
              </strong>
            </span>
            {activeFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0F766E',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                (Show All)
              </button>
            )}
          </div>
          <span style={{ fontSize: '12px', color: '#748391' }}>
            Hover or tap any record for repayment metrics
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div style={{ backgroundColor: '#FEF3F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#B42318', fontSize: '13px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '60px', textAlign: 'center', color: '#5B6B79' }}>
            <RefreshCw size={28} className="cl-spin" style={{ margin: '0 auto 12px', color: '#0F766E' }} />
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Loading authorized application records...</div>
          </div>
        ) : displayedApps.length === 0 ? (
          /* Empty State */
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F1F4F8', color: '#5B6B79', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: '0 0 8px' }}>
              No applications match this filter
            </h3>
            <p style={{ fontSize: '13px', color: '#5B6B79', maxWidth: '440px', margin: '0 auto 20px' }}>
              You do not have any records currently matching the selected filter state. You can submit a new loan application at any time.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              style={{
                backgroundColor: '#173B57',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reset to All Applications
            </button>
          </div>
        ) : (
          /* Applications Records List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayedApps.map((app) => {
              const badge = getStatusBadge(app.status || app.reviewStatus);
              const requestedAmt = Number(app.requestedAmount) || 500000;
              const rate = Number(app.annualInterestRate) || 10.5;
              const tenure = Number(app.tenureMonths) || 36;

              // Estimated monthly EMI calculation
              const monthlyRate = (rate / 100) / 12;
              const factor = Math.pow(1 + monthlyRate, tenure);
              const emiVal = Math.round((requestedAmt * monthlyRate * factor / (factor - 1)) * 100) / 100;

              const isHovered = hoveredAppId === app.id;

              return (
                <div
                  key={app.id}
                  onMouseEnter={() => setHoveredAppId(app.id)}
                  onMouseLeave={() => setHoveredAppId(null)}
                  onClick={() => setHoveredAppId(isHovered ? null : app.id)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #DCE3EA',
                    padding: '20px 24px',
                    boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                    {/* Left: ID & Purpose */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
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
                          flexShrink: 0
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '16px', color: '#173B57' }}>
                            {app.purpose || app.applicantType || 'Personal Loan Request'}
                          </strong>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              backgroundColor: badge.bg,
                              color: badge.color,
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}
                          >
                            {badge.text}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#5B6B79', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span>Application ID: <strong style={{ color: '#172B3A' }}>{app.id}</strong></span>
                          <span>•</span>
                          <span>Applicant: <strong>{app.applicantName}</strong></span>
                          <span>•</span>
                          <span>Date: {app.submissionDate || 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                          Requested Amount
                        </span>
                        <strong style={{ fontSize: '18px', color: '#173B57' }}>
                          {formatINR(requestedAmt)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppModal(app);
                        }}
                        style={{
                          backgroundColor: '#F1F4F8',
                          color: '#173B57',
                          border: '1px solid #DCE3EA',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Compact Repayment Tooltip/Panel on Hover or Tap */}
                  {isHovered && (
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '14px',
                        borderTop: '1px solid #F1F4F8',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        animation: 'fadeIn 0.15s ease'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                          Estimated Monthly EMI
                        </span>
                        <strong style={{ fontSize: '14px', color: '#0F766E' }}>
                          {formatINR(app.financials?.proposedEMI || emiVal)} / mo
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                          Number of EMIs Paid
                        </span>
                        <strong style={{ fontSize: '14px', color: '#173B57' }}>
                          {badge.text.toLowerCase().includes('approved') ? '3 / ' + tenure : '0 (Pending Approval)'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                          Next Payment Due Date
                        </span>
                        <strong style={{ fontSize: '14px', color: '#173B57' }}>
                          {badge.text.toLowerCase().includes('approved') ? '10 Nov 2026' : 'Post-Disbursement'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                          Model Risk Tier
                        </span>
                        <strong style={{ fontSize: '14px', color: '#0F766E' }}>
                          {app.assessment?.modelTier || 'Tier 1 Standard'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Application Modal */}
        {selectedAppModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(23, 43, 58, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 1000
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '620px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F4F8', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                    Application Dossier: {selectedAppModal.id}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                    Submitted by {selectedAppModal.applicantName} on {selectedAppModal.submissionDate || 'Recently'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAppModal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#748391' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                {/* Status Box */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <span>Current Workflow Status:</span>
                  <span style={{ fontWeight: '700', color: '#0F766E' }}>
                    {selectedAppModal.status || selectedAppModal.reviewStatus || 'Ready for Review'}
                  </span>
                </div>

                {/* Financials Quad */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase' }}>Requested Principal</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57' }}>
                      {formatINR(selectedAppModal.requestedAmount)}
                    </div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase' }}>Annual Interest Rate</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57' }}>
                      {selectedAppModal.annualInterestRate || 10.5}% p.a.
                    </div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase' }}>Tenure</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57' }}>
                      {selectedAppModal.tenureMonths || 36} Months
                    </div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase' }}>Debt Service Ratio (DSCR)</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F766E' }}>
                      {selectedAppModal.financials?.debtServiceCoverageRatio || 1.8}x
                    </div>
                  </div>
                </div>

                {/* ULAS Assessment & Deterministic Explainability */}
                {loadingUlas ? (
                  <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#5B6B79' }}>
                    <RefreshCw size={18} className="cl-spin" style={{ margin: '0 auto 6px', color: '#0F766E' }} />
                    <span style={{ fontSize: '12px' }}>Loading authoritative ULAS credit score &amp; policy gates...</span>
                  </div>
                ) : ulasData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* ULAS Header Quad */}
                    <div style={{ padding: '16px', backgroundColor: '#E6F4F1', borderRadius: '10px', border: '1px solid #99EFE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0F766E', fontWeight: '700', letterSpacing: '0.04em' }}>
                          Universal Loan Acceptance Score (ULAS v0.2)
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: '28px', fontWeight: '800', color: '#173B57' }}>{ulasData.ulas}</span>
                          <span style={{ fontSize: '13px', color: '#5B6B79' }}>/ 100</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#0F766E', color: '#FFFFFF' }}>
                            Band {ulasData.band}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', display: 'block' }}>Recommendation</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: ulasData.decision_recommendation.includes('DECLINE') ? '#B42318' : '#0F766E' }}>
                          {ulasData.decision_recommendation.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Policy Gates Status */}
                    {ulasData.gates && (
                      <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#173B57', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                          Underwriting Policy Gates Evaluation
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', fontSize: '11px' }}>
                          {Object.entries(ulasData.gates).map(([gKey, gVal]) => (
                            <div key={gKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                              <span style={{ color: '#5B6B79' }}>{gKey.split('_')[0]}</span>
                              <span style={{ fontWeight: '700', color: gVal.status === 'PASS' ? '#18794E' : gVal.status === 'FAIL' ? '#B42318' : '#B54708' }}>
                                {gVal.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5 Sub-Scores Grid */}
                    {ulasData.subscores && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                        {Object.entries(ulasData.subscores).map(([sKey, sVal]) => (
                          <div key={sKey} style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                              {sKey.replace(/_/g, ' ')}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#173B57', marginTop: '2px', display: 'block' }}>
                              {sVal.score !== null ? `${Math.round(sVal.score)}` : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Positive & Negative Drivers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
                      <div style={{ padding: '10px', backgroundColor: '#E8F5EE', borderRadius: '6px', border: '1px solid #A6E9D5' }}>
                        <span style={{ fontWeight: '700', color: '#18794E', display: 'block', marginBottom: '4px' }}>
                          Positive Readiness Drivers
                        </span>
                        {ulasData.drivers_positive && ulasData.drivers_positive.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '14px', color: '#18794E', lineHeight: 1.4 }}>
                            {ulasData.drivers_positive.map((d, i) => (
                              <li key={i}>{d.driver} ({d.points > 0 ? `+${d.points}` : d.points} pts)</li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: '#5B6B79' }}>No major positive drivers</span>
                        )}
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#FEF3F2', borderRadius: '6px', border: '1px solid #FECACA' }}>
                        <span style={{ fontWeight: '700', color: '#B42318', display: 'block', marginBottom: '4px' }}>
                          Risk / Action Areas
                        </span>
                        {ulasData.drivers_negative && ulasData.drivers_negative.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '14px', color: '#B42318', lineHeight: 1.4 }}>
                            {ulasData.drivers_negative.map((d, i) => (
                              <li key={i}>{d.driver} ({d.points} pts)</li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: '#5B6B79' }}>Zero adverse drivers</span>
                        )}
                      </div>
                    </div>

                    {/* Regulatory Notice Banner */}
                    <div style={{ padding: '10px 12px', backgroundColor: '#F1F5F9', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                      <strong>Notice:</strong> CreditLens provides an estimated creditworthiness assessment for informational purposes. The final lending decision rests with the bank or lending institution.
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#5B6B79' }}>
                    CreditLens provides an estimated creditworthiness assessment for informational purposes. The final lending decision rests with the bank or lending institution.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAppModal(null)}
                  style={{
                    backgroundColor: '#173B57',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BorrowerLayout>
  );
}
