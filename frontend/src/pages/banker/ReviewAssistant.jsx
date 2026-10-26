import React, { useState, useEffect } from 'react';
import BankerLayout from '../../components/banker/BankerLayout';
import { colors, radii, shadows, typography } from '../../components/banker/bankerTheme';
import {
  IconAssistant,
  IconCheckCircle,
  IconAlertTriangle,
  IconClock,
  IconRefresh,
  IconChevronRight,
  IconClose,
} from '../../components/banker/BankerIcons';
import { getReviewActions, updateReviewAction, getApplications } from '../../components/banker/bankerData';
import { useBankerRoute } from '../../components/banker/navigation';

export default function ReviewAssistant() {
  const { navigate } = useBankerRoute();

  const [actions, setActions] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingAction, setEditingAction] = useState(null);
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = () => {
    const data = getReviewActions();
    setActions(data);
  };

  const handleUpdateStatus = (actionId, newStatus) => {
    try {
      updateReviewAction(actionId, { status: newStatus });
      loadActions();
    } catch (e) {
      alert(`Error updating action: ${e.message}`);
    }
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    if (!editingAction) return;

    try {
      updateReviewAction(editingAction.id, { notes: notesInput });
      loadActions();
      setEditingAction(null);
    } catch (e) {
      alert(`Error updating notes: ${e.message}`);
    }
  };

  const filteredActions = actions.filter((a) => {
    if (priorityFilter !== 'ALL' && a.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: colors.dangerBg, color: colors.danger, border: '#FECACA' };
      case 'Medium':
        return { bg: colors.warningBg, color: colors.warning, border: '#FDE68A' };
      default:
        return { bg: colors.infoBg, color: colors.info, border: '#BFDBFE' };
    }
  };

  return (
    <BankerLayout
      activeScreen="assistant"
      pageTitle="Banker Review Assistant"
      pageSubtitle="Rule-driven underwriter decision recommendations generated from verified cashflows, missing evidence, and credit findings."
    >
      {/* Overview Banner */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          border: `1px solid ${colors.border}`,
          padding: '18px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: shadows.subtle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: radii.small,
              backgroundColor: colors.accentLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.accent,
            }}
          >
            <IconAssistant size={22} color={colors.accent} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: colors.brand }}>
              Underwriter Guidance Engine
            </div>
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>
              Transparent rules automatically identify required follow-up actions without generating opaque synthetic decisions.
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: radii.input,
              border: `1px solid ${colors.border}`,
              fontSize: '12px',
              backgroundColor: colors.surface,
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: radii.input,
              border: `1px solid ${colors.border}`,
              fontSize: '12px',
              backgroundColor: colors.surface,
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Awaiting Information">Awaiting Information</option>
            <option value="Completed">Completed</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Suggested Actions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredActions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: colors.surface, borderRadius: radii.card, border: `1px solid ${colors.border}`, color: colors.textMuted }}>
            No recommendations match selected filters.
          </div>
        ) : (
          filteredActions.map((action) => {
            const pStyle = getPriorityStyle(action.priority);
            const isCompleted = action.status === 'Completed';
            const isDismissed = action.status === 'Dismissed';

            return (
              <div
                key={action.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.card,
                  border: `1px solid ${isCompleted ? '#BBF7D0' : colors.border}`,
                  padding: '20px',
                  boxShadow: shadows.subtle,
                  opacity: isDismissed ? 0.6 : 1,
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: radii.pill,
                        backgroundColor: pStyle.bg,
                        color: pStyle.color,
                        border: `1px solid ${pStyle.border}`,
                        textTransform: 'uppercase',
                      }}
                    >
                      {action.priority} Priority
                    </span>
                    <strong style={{ fontSize: '14px', color: colors.brand }}>
                      {action.applicantName} ({action.applicationId})
                    </strong>
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: isCompleted ? colors.success : colors.textSecondary,
                    }}
                  >
                    Status: {action.status}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '600', marginBottom: '4px' }}>
                  Recommended Action: {action.suggestedAction}
                </div>

                <div style={{ fontSize: '12px', color: colors.textSecondary, lineHeight: '18px', marginBottom: '12px' }}>
                  <strong>Trigger Finding:</strong> {action.relatedFinding} — {action.reason}
                </div>

                {action.notes && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#0F766E',
                      backgroundColor: colors.accentLight,
                      padding: '8px 12px',
                      borderRadius: radii.small,
                      marginBottom: '14px',
                    }}
                  >
                    <strong>Officer Note:</strong> {action.notes}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: `1px solid ${colors.surfaceSubtle}`, paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleUpdateStatus(action.id, 'Completed')}
                      style={{
                        backgroundColor: isCompleted ? colors.successBg : colors.surfaceSubtle,
                        color: isCompleted ? colors.success : colors.text,
                        border: `1px solid ${isCompleted ? '#BBF7D0' : colors.border}`,
                        borderRadius: radii.small,
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <IconCheckCircle size={13} color={isCompleted ? colors.success : colors.textSecondary} />
                      <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(action.id, 'Awaiting Information')}
                      style={{
                        backgroundColor: action.status === 'Awaiting Information' ? colors.warningBg : colors.surfaceSubtle,
                        color: action.status === 'Awaiting Information' ? colors.warning : colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: radii.small,
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Awaiting Info
                    </button>

                    <button
                      onClick={() => {
                        setEditingAction(action);
                        setNotesInput(action.notes || '');
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: colors.brand,
                        border: `1px solid ${colors.border}`,
                        borderRadius: radii.small,
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Add Note
                    </button>

                    {!isDismissed && (
                      <button
                        onClick={() => handleUpdateStatus(action.id, 'Dismissed')}
                        style={{
                          backgroundColor: 'transparent',
                          color: colors.textMuted,
                          border: 'none',
                          padding: '5px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('applicant', action.applicationId)}
                    style={{
                      backgroundColor: colors.brand,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: radii.small,
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Open Application</span>
                    <IconChevronRight size={13} color="#FFFFFF" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Note Editor Modal */}
      {editingAction && (
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
        >
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.dialog,
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: shadows.dialog,
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.brand, margin: '0 0 12px 0' }}>
              Add Reviewer Note for {editingAction.applicantName}
            </h3>
            <form onSubmit={handleSaveNotes}>
              <textarea
                rows="4"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Document follow-up call, client response, or underwriter observation..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: radii.input,
                  border: `1px solid ${colors.border}`,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  fontFamily: typography.fontFamily,
                  marginBottom: '16px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingAction(null)}
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.button,
                    padding: '6px 14px',
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
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BankerLayout>
  );
}
