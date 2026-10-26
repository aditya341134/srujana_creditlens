import React, { useState, useEffect } from 'react';
import BankerLayout from '../../components/banker/BankerLayout';
import { colors, radii, shadows, typography } from '../../components/banker/bankerTheme';
import {
  IconClipboardCheck,
  IconCheckCircle,
  IconAlertTriangle,
  IconAlertCircle,
  IconClose,
  IconSearch,
  IconRefresh,
  IconInfo,
} from '../../components/banker/BankerIcons';
import { getVerificationTasks, updateVerificationTask, getApplications } from '../../components/banker/bankerData';
import { useBankerRoute } from '../../components/banker/navigation';
import { formatCurrencyINR } from '../../utils/financialCalculations';

export default function EvidenceVerification() {
  const { navigate } = useBankerRoute();

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Action State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('Verified'); // 'Verified' | 'Clarification Required' | 'Inconsistent'
  const [actionNotes, setActionNotes] = useState('');
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const data = getVerificationTasks();
    setTasks(data);
  };

  const handleOpenActionModal = (task, defaultType) => {
    setSelectedTask(task);
    setActionType(defaultType || 'Verified');
    setActionNotes(task.notes || '');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleSaveAction = (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      updateVerificationTask(selectedTask.id, {
        status: actionType,
        notes: actionNotes + (actionReason ? ` [Underwriter Note: ${actionReason}]` : ''),
      });

      loadTasks();
      setActionModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.applicantName?.toLowerCase().includes(q);
      const matchClaim = t.claim?.toLowerCase().includes(q);
      const matchApp = t.applicationId?.toLowerCase().includes(q);
      if (!matchName && !matchClaim && !matchApp) return false;
    }
    return true;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Verified':
        return { bg: colors.successBg, color: colors.success, border: '#BBF7D0' };
      case 'Clarification Required':
        return { bg: colors.warningBg, color: colors.warning, border: '#FDE68A' };
      case 'Inconsistent':
        return { bg: colors.dangerBg, color: colors.danger, border: '#FECACA' };
      case 'Cross-Check Required':
        return { bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF' };
      case 'Document Uploaded':
        return { bg: colors.infoBg, color: colors.info, border: '#BFDBFE' };
      default:
        return { bg: colors.surfaceSubtle, color: colors.textSecondary, border: colors.border };
    }
  };

  return (
    <BankerLayout
      activeScreen="verification"
      pageTitle="Financial Evidence Verification Workspace"
      pageSubtitle="Cross-examine declared borrower figures against bank statements, GST filings, and tax returns with full audit tracking."
    >
      {/* Fair Lending Investigation Guidance */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: radii.card,
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <IconInfo size={20} color={colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#1E3A8A', fontSize: '14px' }}>
            Fair Lending Evidence Verification Protocol:
          </strong>
          <div style={{ color: '#1E40AF', fontSize: '13px', marginTop: '2px', lineHeight: '18px' }}>
            Financial discrepancies (e.g. variance between self-reported salary and bank deposit credits) must prompt formal investigation or clarification requests, rather than automatic fraud accusations or arbitrary score deductions.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <section
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          border: `1px solid ${colors.border}`,
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: shadows.subtle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px', maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by applicant, claim or APP ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 30px',
                borderRadius: radii.input,
                border: `1px solid ${colors.border}`,
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="verif-status-filter" style={{ fontSize: '13px', fontWeight: '500', color: colors.textSecondary }}>
            Status:
          </label>
          <select
            id="verif-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: radii.input,
              border: `1px solid ${colors.border}`,
              fontSize: '13px',
              backgroundColor: colors.surface,
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Clarification Required">Clarification Required</option>
            <option value="Inconsistent">Inconsistent</option>
            <option value="Cross-Check Required">Cross-Check Required</option>
            <option value="Document Uploaded">Document Uploaded</option>
          </select>

          <button
            onClick={loadTasks}
            style={{
              backgroundColor: colors.surfaceSubtle,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.button,
              padding: '8px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconRefresh size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* Verification Data Table */}
      <section
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.subtle,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: colors.surfaceSubtle, borderBottom: `2px solid ${colors.border}`, color: colors.textSecondary }}>
                <th style={{ padding: '12px 14px', fontWeight: '600' }}>Applicant & Claim</th>
                <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right' }}>Declared Value</th>
                <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right' }}>Evidence Value</th>
                <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right' }}>Variance / Diff</th>
                <th style={{ padding: '12px 14px', fontWeight: '600' }}>Evidence Source & Period</th>
                <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right' }}>Reviewer Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: colors.textMuted }}>
                    No verification claims match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const badgeStyle = getStatusBadgeStyle(t.status);
                  const hasDiscrepancy = t.difference !== 0;

                  return (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        transition: 'background-color 140ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.surfaceSubtle)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '600', color: colors.text }}>{t.claim}</div>
                        <div style={{ fontSize: '11px', color: colors.textMuted }}>
                          {t.applicantName} ({t.applicationId})
                        </div>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right', fontWeight: '600', color: colors.brand, fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrencyINR(t.declaredValue)}
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right', fontWeight: '600', color: colors.brand, fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrencyINR(t.evidenceValue)}
                      </td>

                      <td
                        style={{
                          padding: '14px',
                          textAlign: 'right',
                          fontWeight: '700',
                          fontVariantNumeric: 'tabular-nums',
                          color: t.difference < 0 ? colors.danger : t.difference > 0 ? colors.warning : colors.success,
                        }}
                      >
                        {t.difference === 0 ? '0' : formatCurrencyINR(t.difference)}
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '500', color: colors.text }}>{t.evidenceSource}</div>
                        <div style={{ fontSize: '11px', color: colors.textSecondary }}>{t.coveragePeriod}</div>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: radii.pill,
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: `1px solid ${badgeStyle.border}`,
                          }}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenActionModal(t, t.status === 'Verified' ? 'Clarification Required' : 'Verified')}
                            style={{
                              backgroundColor: colors.surfaceSubtle,
                              color: colors.brand,
                              border: `1px solid ${colors.border}`,
                              borderRadius: radii.small,
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Update
                          </button>
                          <button
                            onClick={() => navigate('applicant', t.applicationId)}
                            style={{
                              backgroundColor: colors.brand,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: radii.small,
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Action / Reviewer Modal */}
      {actionModalOpen && selectedTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 43, 58, 0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.dialog,
              padding: '28px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: shadows.dialog,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textMuted, fontWeight: '700' }}>
                  Evidence Verification Action
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.brand, margin: '2px 0 0 0' }}>
                  {selectedTask.claim}
                </h3>
              </div>
              <button
                onClick={() => setActionModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}
              >
                <IconClose size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: colors.surfaceSubtle, padding: '12px', borderRadius: radii.small, marginBottom: '16px', fontSize: '13px' }}>
              <div>Applicant: <strong>{selectedTask.applicantName}</strong> ({selectedTask.applicationId})</div>
              <div style={{ marginTop: '4px' }}>Declared: <strong>{formatCurrencyINR(selectedTask.declaredValue)}</strong> | Evidence: <strong>{formatCurrencyINR(selectedTask.evidenceValue)}</strong> | Variance: <strong style={{ color: selectedTask.difference < 0 ? colors.danger : colors.brand }}>{formatCurrencyINR(selectedTask.difference)}</strong></div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: colors.textSecondary }}>Source: {selectedTask.evidenceSource} ({selectedTask.coveragePeriod})</div>
            </div>

            <form onSubmit={handleSaveAction}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.text, marginBottom: '6px' }}>
                  Verification Outcome:
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.input,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Verified">Verified — Document Substantiated</option>
                  <option value="Clarification Required">Clarification Required — Investigation Needed</option>
                  <option value="Inconsistent">Inconsistent — Variance Documented</option>
                  <option value="Cross-Check Required">Cross-Check Required — Secondary Verification</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.text, marginBottom: '6px' }}>
                  Underwriter Notes & Rationale:
                </label>
                <textarea
                  rows="3"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Record specific rationale for verification outcome (e.g., payroll credits confirmed via SBI statement)..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: radii.input,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: typography.fontFamily,
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.button,
                    padding: '8px 16px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: colors.brand,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: radii.button,
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Save Verification Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BankerLayout>
  );
}
