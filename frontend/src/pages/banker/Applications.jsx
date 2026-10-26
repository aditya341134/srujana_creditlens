import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Sliders,
  DollarSign,
  User,
  ShieldCheck,
  Layers
} from 'lucide-react';
import BankerLayout from '../../components/layout/BankerLayout';
import BankerStatusBadge from '../../components/banker/BankerStatusBadge';
import { api } from '../../services/api';

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'READY' | 'APPROVED' | 'NEEDS_INFO' | 'REJECTED'
  const [sortBy, setSortBy] = useState('DATE_DESC'); // 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'DTI_ASC'

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getApplications();
      const items = res.items || (Array.isArray(res) ? res : []);
      setApplications(items);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch applications. Showing offline baseline.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Sort Applications
  const filteredAndSortedApps = useMemo(() => {
    return applications
      .filter((app) => {
        // Search text matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = (app.applicantName || '').toLowerCase().includes(q);
          const matchId = (app.id || '').toLowerCase().includes(q);
          const matchPurpose = (app.purpose || '').toLowerCase().includes(q);
          const matchType = (app.applicantType || '').toLowerCase().includes(q);
          if (!matchName && !matchId && !matchPurpose && !matchType) return false;
        }

        // Status Filtering
        const s = (app.status || app.reviewStatus || '').toLowerCase();
        if (statusFilter === 'READY') {
          return s.includes('ready') || s.includes('pending') || s.includes('review');
        }
        if (statusFilter === 'APPROVED') {
          return s.includes('approved') || s.includes('sanction') || s.includes('confirmed') || s.includes('disbursed');
        }
        if (statusFilter === 'NEEDS_INFO') {
          return s.includes('need') || s.includes('info') || s.includes('missing') || s.includes('discrepancy');
        }
        if (statusFilter === 'REJECTED') {
          return s.includes('reject') || s.includes('decline');
        }
        return true; // 'ALL'
      })
      .sort((a, b) => {
        if (sortBy === 'DATE_DESC') {
          return new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0);
        }
        if (sortBy === 'DATE_ASC') {
          return new Date(a.submissionDate || 0) - new Date(b.submissionDate || 0);
        }
        if (sortBy === 'AMOUNT_DESC') {
          return (Number(b.requestedAmount) || 0) - (Number(a.requestedAmount) || 0);
        }
        if (sortBy === 'DTI_ASC') {
          return (a.financials?.calculatedDti || 0) - (b.financials?.calculatedDti || 0);
        }
        return 0;
      });
  }, [applications, searchQuery, statusFilter, sortBy]);

  // Counts for tabs
  const counts = {
    all: applications.length,
    ready: applications.filter((a) => {
      const s = (a.status || a.reviewStatus || '').toLowerCase();
      return s.includes('ready') || s.includes('pending') || s.includes('review');
    }).length,
    approved: applications.filter((a) => {
      const s = (a.status || a.reviewStatus || '').toLowerCase();
      return s.includes('approved') || s.includes('sanction') || s.includes('confirmed') || s.includes('disbursed');
    }).length,
    needsInfo: applications.filter((a) => {
      const s = (a.status || a.reviewStatus || '').toLowerCase();
      return s.includes('need') || s.includes('info') || s.includes('missing') || s.includes('discrepancy');
    }).length,
    rejected: applications.filter((a) => {
      const s = (a.status || a.reviewStatus || '').toLowerCase();
      return s.includes('reject') || s.includes('decline');
    }).length
  };

  return (
    <BankerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Banker Portal</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>Applications Register</span>
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
              Loan Applications Register &amp; Dossiers
            </h1>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
              Institutional credit assessment register. Examine borrower debt-to-income profiles, verification statuses, and execute sanction decisions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={fetchApplications}
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
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} className={loading ? 'cl-spin' : ''} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #DCE3EA',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 2px 6px rgba(23, 43, 58, 0.04)'
          }}
        >
          {/* Top Row: Search Input & Sort Dropdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#F6F8FB',
                border: '1px solid #DCE3EA',
                borderRadius: '8px',
                padding: '8px 12px',
                flex: 1,
                maxWidth: '420px',
                minWidth: '240px'
              }}
            >
              <Search size={16} color="#5B6B79" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applicant name, ID, purpose..."
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#172B3A',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#5B6B79', fontWeight: '500' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #DCE3EA',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#172B3A',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="DATE_DESC">Submission Date (Newest first)</option>
                <option value="DATE_ASC">Submission Date (Oldest first)</option>
                <option value="AMOUNT_DESC">Loan Amount (High to Low)</option>
                <option value="DTI_ASC">DTI Ratio (Lowest / Healthiest)</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Status Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              borderTop: '1px solid #F0F4F8',
              paddingTop: '12px'
            }}
          >
            {[
              { id: 'ALL', label: `All Dossiers (${counts.all})` },
              { id: 'READY', label: `Ready for Review (${counts.ready})` },
              { id: 'APPROVED', label: `Approved / Sanctioned (${counts.approved})` },
              { id: 'NEEDS_INFO', label: `Needs Info (${counts.needsInfo})` },
              { id: 'REJECTED', label: `Rejected (${counts.rejected})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: statusFilter === tab.id ? '700' : '500',
                  color: statusFilter === tab.id ? '#0F766E' : '#5B6B79',
                  backgroundColor: statusFilter === tab.id ? '#E6F4F1' : '#F6F8FB',
                  border: statusFilter === tab.id ? '1px solid #0F766E' : '1px solid #DCE3EA',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Register Table Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #DCE3EA',
            boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#5B6B79' }}>
              <RefreshCw size={24} className="cl-spin" style={{ margin: '0 auto 12px', display: 'block', color: '#0F766E' }} />
              <span>Loading applications register from backend...</span>
            </div>
          ) : filteredAndSortedApps.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#5B6B79' }}>
              <FileText size={36} color="#CBD5E1" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57', marginBottom: '4px' }}>
                No applications match your criteria
              </div>
              <div style={{ fontSize: '13px' }}>
                Try adjusting your search terms or filter selection.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #DCE3EA', color: '#5B6B79', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 18px' }}>Application ID</th>
                    <th style={{ padding: '12px 18px' }}>Applicant</th>
                    <th style={{ padding: '12px 18px' }}>Facility &amp; Amount</th>
                    <th style={{ padding: '12px 18px' }}>DTI Ratio</th>
                    <th style={{ padding: '12px 18px' }}>DSCR Buffer</th>
                    <th style={{ padding: '12px 18px' }}>Bureau Score</th>
                    <th style={{ padding: '12px 18px' }}>Status</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedApps.map((app, idx) => {
                    const dti = app.financials?.calculatedDti || 0;
                    const dscr = app.financials?.debtServiceCoverageRatio || 1.0;
                    const isOptimal = dti <= 40;
                    const isCaution = dti > 40 && dti <= 50;

                    return (
                      <tr
                        key={app.id || idx}
                        style={{
                          borderBottom: idx < filteredAndSortedApps.length - 1 ? '1px solid #F0F4F8' : 'none',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FBFDFF')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* ID Column */}
                        <td style={{ padding: '16px 18px' }}>
                          <span
                            onClick={(e) => handleCopyId(app.id, e)}
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: '700',
                              color: '#173B57',
                              backgroundColor: '#F0F4F8',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                            title="Click to copy ID"
                          >
                            {app.id}
                            {copiedId === app.id ? <Check size={12} color="#18794E" /> : <Copy size={12} />}
                          </span>
                          <div style={{ fontSize: '11px', color: '#8C9BA8', marginTop: '4px' }}>
                            {app.submissionDate || 'Recent'}
                          </div>
                        </td>

                        {/* Applicant Column */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: '700', color: '#173B57' }}>
                            {app.applicantName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#5B6B79', marginTop: '2px' }}>
                            {app.applicantType || 'Salaried Borrower'}
                          </div>
                        </td>

                        {/* Facility & Amount */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: '700', color: '#173B57' }}>
                            {formatINR(app.requestedAmount)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#5B6B79', marginTop: '2px' }}>
                            {app.purpose || 'Personal'} &bull; {app.tenureMonths || 36}m
                          </div>
                        </td>

                        {/* DTI Ratio */}
                        <td style={{ padding: '16px 18px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              display: 'inline-block',
                              backgroundColor: isOptimal ? '#E8F5EE' : isCaution ? '#FFF4D6' : '#FEF3F2',
                              color: isOptimal ? '#18794E' : isCaution ? '#B54708' : '#B42318'
                            }}
                          >
                            {dti}%
                          </span>
                          <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                            {isOptimal ? 'Optimal' : isCaution ? 'Moderate' : 'High Risk'}
                          </div>
                        </td>

                        {/* DSCR Buffer */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: '700', color: dscr >= 1.5 ? '#18794E' : dscr >= 1.0 ? '#B54708' : '#B42318' }}>
                            {dscr}x
                          </div>
                          <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                            Surplus Multiple
                          </div>
                        </td>

                        {/* Bureau Score */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: '600', color: '#172B3A' }}>
                            {app.creditHistory?.bureauBand || 'Standard'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                            {app.creditHistory?.delinquencies24m ?? 0} Delinquencies
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 18px' }}>
                          <BankerStatusBadge status={app.status || app.reviewStatus} size="sm" />
                        </td>

                        {/* Action */}
                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <Link
                            to={`/banker/review?id=${app.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: '#173B57',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              textDecoration: 'none',
                              boxShadow: '0 1px 3px rgba(23, 59, 87, 0.15)'
                            }}
                          >
                            <span>Underwrite</span>
                            <ChevronRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #DCE3EA',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#5B6B79'
            }}
          >
            <span>Showing {filteredAndSortedApps.length} of {applications.length} applications</span>
            <span>Prudential Underwriting Standard Rules v2.0 (No ML)</span>
          </div>
        </div>
      </div>
    </BankerLayout>
  );
}
