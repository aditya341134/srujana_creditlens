import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  User,
  FileText
} from 'lucide-react';
import BankerLayout from '../../components/layout/BankerLayout';
import { api } from '../../services/api';

export default function DecisionAudit() {
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const fetchAuditEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditEvents(50);
      const items = Array.isArray(res) ? res : (res.items || []);
      setAuditEvents(items);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvents = useMemo(() => {
    return auditEvents.filter((evt) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchApp = (evt.applicationId || '').toLowerCase().includes(q);
        const matchUser = (evt.user || '').toLowerCase().includes(q);
        const matchDesc = (evt.description || '').toLowerCase().includes(q);
        const matchType = (evt.eventType || '').toLowerCase().includes(q);
        if (!matchApp && !matchUser && !matchDesc && !matchType) return false;
      }

      if (eventTypeFilter !== 'ALL') {
        const type = (evt.eventType || '').toLowerCase();
        if (eventTypeFilter === 'DECISION' && !type.includes('decision') && !type.includes('approved') && !type.includes('rejected')) {
          return false;
        }
        if (eventTypeFilter === 'SUBMISSION' && !type.includes('submitted') && !type.includes('application')) {
          return false;
        }
      }
      return true;
    });
  }, [auditEvents, searchQuery, eventTypeFilter]);

  return (
    <BankerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Banker Portal</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>Compliance &amp; Governance</span>
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
              Regulatory Underwriting Audit Trail
            </h1>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
              Chronological, immutable audit register of all creditworthiness reviews, underwriter approvals, adverse action reasons, and KYC verification records.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={fetchAuditEvents}
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
              <span>Refresh Log</span>
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
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(23, 43, 58, 0.04)'
          }}
        >
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
              maxWidth: '400px',
              minWidth: '220px'
            }}
          >
            <Search size={16} color="#5B6B79" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, officer, or event details..."
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

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Events' },
              { id: 'DECISION', label: 'Underwriter Decisions' },
              { id: 'SUBMISSION', label: 'Borrower Submissions' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setEventTypeFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: eventTypeFilter === tab.id ? '700' : '500',
                  color: eventTypeFilter === tab.id ? '#0F766E' : '#5B6B79',
                  backgroundColor: eventTypeFilter === tab.id ? '#E6F4F1' : '#F6F8FB',
                  border: eventTypeFilter === tab.id ? '1px solid #0F766E' : '1px solid #DCE3EA',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Trail List */}
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
              <span>Loading audit trail from compliance log...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#5B6B79' }}>
              <History size={32} color="#CBD5E1" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#173B57', marginBottom: '4px' }}>
                No audit entries match filter
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredEvents.map((evt, idx) => {
                const isDecision = (evt.eventType || '').toLowerCase().includes('decision');
                const isApproved = (evt.eventType || '').toLowerCase().includes('approved');
                const isRejected = (evt.eventType || '').toLowerCase().includes('rejected');

                return (
                  <div
                    key={evt.id || idx}
                    style={{
                      padding: '18px 22px',
                      borderBottom: idx < filteredEvents.length - 1 ? '1px solid #F0F4F8' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: isApproved ? '#E8F5EE' : isRejected ? '#FEF3F2' : '#E6F4F1',
                          color: isApproved ? '#18794E' : isRejected ? '#B42318' : '#0F766E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isApproved ? <CheckCircle2 size={18} /> : isRejected ? <AlertCircle size={18} /> : <History size={18} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#173B57' }}>
                            {evt.eventType}
                          </span>
                          <span
                            onClick={() => handleCopyId(evt.applicationId)}
                            style={{
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              fontWeight: '600',
                              color: '#5B6B79',
                              backgroundColor: '#F0F4F8',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="Click to copy Application ID"
                          >
                            {evt.applicationId}
                            {copiedId === evt.applicationId ? <Check size={11} color="#18794E" /> : <Copy size={11} />}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#172B3A', marginTop: '4px', lineHeight: 1.4 }}>
                          {evt.description}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#8C9BA8', marginTop: '6px' }}>
                          <span>Officer: <strong>{evt.user || 'Senior Underwriter'}</strong></span>
                          <span>&bull;</span>
                          <span>Timestamp: {evt.timestamp || 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <Link
                        to={`/banker/review?id=${evt.applicationId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#0F766E',
                          textDecoration: 'none'
                        }}
                      >
                        <span>View Dossier</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BankerLayout>
  );
}
