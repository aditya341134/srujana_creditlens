import React, { useState, useEffect, useRef } from 'react';
import { colors, radii, shadows } from './bankerTheme';
import {
  IconSearch,
  IconClose,
  IconApplications,
  IconClipboardCheck,
  IconCalculator,
  IconCompare,
  IconAssistant,
  IconHistory,
  IconPrinter,
  IconSettings,
  IconDashboard,
  IconChevronRight,
} from './BankerIcons';
import { getApplications, getVerificationTasks } from './bankerData';
import { useBankerRoute } from './navigation';
import { formatCurrencyINR } from '../../utils/financialCalculations';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const { navigate } = useBankerRoute();

  const applications = getApplications();
  const tasks = getVerificationTasks();

  const routes = [
    { id: 'dashboard', title: 'Dashboard Overview', desc: 'Lending review workload and KPI metrics', icon: IconDashboard },
    { id: 'applications', title: 'Loan Applications Queue', desc: 'Browse, filter, and sort active credit dossiers', icon: IconApplications },
    { id: 'verification', title: 'Evidence Verification', desc: 'Audit declared claims against submitted documents', icon: IconClipboardCheck },
    { id: 'simulator', title: 'Loan Structuring Simulator', desc: 'Interactive reducing-balance EMI & cashflow calculator', icon: IconCalculator },
    { id: 'scenarios', title: 'Scenario Comparison', desc: 'Side-by-side counterfactual loan sensitivity analysis', icon: IconCompare },
    { id: 'assistant', title: 'Review Assistant', desc: 'Rule-based underwriter action recommendations', icon: IconAssistant },
    { id: 'audit', title: 'Decision Audit Trail', desc: 'Regulatory immutable ledger & fairness checks', icon: IconHistory },
    { id: 'reports', title: 'Assessment Reports', desc: 'Printable creditworthiness evaluation reports', icon: IconPrinter },
    { id: 'settings', title: 'Settings & Policy Controls', desc: 'Underwriter profile limits and fair lending thresholds', icon: IconSettings },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search matches
  const matchedRoutes = trimmed
    ? routes.filter((r) => r.title.toLowerCase().includes(trimmed) || r.desc.toLowerCase().includes(trimmed))
    : routes.slice(0, 4);

  const matchedApps = trimmed
    ? applications.filter(
        (a) =>
          a.applicantName.toLowerCase().includes(trimmed) ||
          a.id.toLowerCase().includes(trimmed) ||
          a.applicantType?.toLowerCase().includes(trimmed) ||
          a.purpose?.toLowerCase().includes(trimmed)
      )
    : applications.slice(0, 3);

  const matchedTasks = trimmed
    ? tasks.filter(
        (t) =>
          t.claim.toLowerCase().includes(trimmed) ||
          t.applicationId.toLowerCase().includes(trimmed) ||
          t.source.toLowerCase().includes(trimmed)
      )
    : [];

  const handleSelectRoute = (screenId) => {
    navigate(screenId);
    onClose();
  };

  const handleSelectApp = (appId) => {
    navigate('applicant', appId);
    onClose();
  };

  const handleSelectTask = (appId) => {
    navigate('verification', appId);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 43, 58, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 24px 16px',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global search dialog"
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.dialog,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.dialog,
          maxWidth: '620px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: `1px solid ${colors.border}`,
            gap: '12px',
          }}
        >
          <IconSearch size={18} color={colors.accent} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search applications, routes, verification items... (Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: colors.text,
              backgroundColor: 'transparent',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: '4px' }}
            >
              <IconClose size={16} />
            </button>
          )}
        </div>

        {/* Search Results Area */}
        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Matched Applications */}
          {matchedApps.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted, letterSpacing: '0.5px', marginBottom: '8px' }}>
                Loan Applications ({matchedApps.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchedApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleSelectApp(app.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: radii.small,
                      backgroundColor: colors.surfaceSubtle,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.accentLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.surfaceSubtle)}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: colors.text, fontSize: '13px' }}>
                        {app.applicantName} <span style={{ color: colors.textMuted, fontSize: '11px' }}>({app.id})</span>
                      </div>
                      <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '2px' }}>
                        {app.applicantType} • Requested: {formatCurrencyINR(app.requestedAmount)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: radii.pill,
                          backgroundColor: '#EAF2FE',
                          color: '#245EA8',
                        }}
                      >
                        {app.status}
                      </span>
                      <IconChevronRight size={14} color={colors.textSecondary} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Workspace Routes */}
          {matchedRoutes.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted, letterSpacing: '0.5px', marginBottom: '8px' }}>
                Navigation & Workspace ({matchedRoutes.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchedRoutes.map((r) => {
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleSelectRoute(r.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: radii.small,
                        backgroundColor: colors.surfaceSubtle,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.accentLight)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.surfaceSubtle)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: radii.small,
                            backgroundColor: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.brand,
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: colors.text, fontSize: '13px' }}>{r.title}</div>
                          <div style={{ fontSize: '11px', color: colors.textSecondary }}>{r.desc}</div>
                        </div>
                      </div>
                      <IconChevronRight size={14} color={colors.textSecondary} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Verification Tasks */}
          {matchedTasks.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted, letterSpacing: '0.5px', marginBottom: '8px' }}>
                Evidence Verification Tasks ({matchedTasks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchedTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTask(t.applicationId)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: radii.small,
                      backgroundColor: colors.surfaceSubtle,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: colors.text, fontSize: '13px' }}>{t.claim}</div>
                      <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                        {t.applicationId} • Source: {t.source}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: colors.accent }}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trimmed && matchedApps.length === 0 && matchedRoutes.length === 0 && matchedTasks.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
              No results found for "{query}". Try searching an applicant name, application ID (e.g. APP-2026-0891), or workspace page.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: colors.surfaceSubtle,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: colors.textMuted,
          }}
        >
          <span>Use <strong>Esc</strong> to close</span>
          <span>Tip: Press <strong>Ctrl + K</strong> or <strong>Cmd + K</strong> anywhere to search</span>
        </div>
      </div>
    </div>
  );
}
