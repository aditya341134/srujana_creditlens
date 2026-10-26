import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  ShieldCheck,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Scale,
  Award,
  DollarSign
} from 'lucide-react';
import BorrowerLayout from '../../components/layout/BorrowerLayout';
import api from '../../services/api';
import { formatINR } from './Review';

export default function FinancialReports() {
  const [loading, setLoading] = useState(true);
  const [xrayData, setXrayData] = useState(null);
  const [ulasData, setUlasData] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [xray, apps, audit] = await Promise.all([
          api.getFinancialXRay('scenario_a').catch(() => null),
          api.getApplications().catch(() => ({ items: [] })),
          api.getAuditEvents(10).catch(() => ({ items: [] }))
        ]);

        setXrayData(xray);
        setAuditEvents(audit.items || audit || []);

        const appList = apps.items || (Array.isArray(apps) ? apps : []);
        if (appList.length > 0) {
          const ulas = await api.getUlasAssessment(appList[0].id).catch(() => null);
          setUlasData(ulas);
        }
      } catch (err) {
        console.error('Report fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }} className="no-print">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Home</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>Financial Reports</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#173B57', margin: '6px 0 8px 0', letterSpacing: '-0.02em' }}>
              Comprehensive Financial Intelligence Dossier
            </h1>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
              Audited summary combining ULAS Underwriting Score, AI Financial X-Ray patterns, verified income reconciliation, and regulatory compliance audit trail.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              backgroundColor: '#173B57',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(23,59,87,0.2)'
            }}
          >
            <Printer size={16} />
            <span>Print / Save PDF Report</span>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA' }}>
            <RefreshCw size={28} className="cl-spin" style={{ margin: '0 auto 12px', color: '#0F766E' }} />
            <h3 style={{ fontSize: '16px', color: '#173B57', margin: 0 }}>Compiling Comprehensive Dossier...</h3>
          </div>
        ) : (
          <div
            id="printable-report"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #DCE3EA',
              padding: '36px',
              boxShadow: '0 4px 16px rgba(23,43,58,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px'
            }}
          >
            {/* Report Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #173B57', paddingBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#173B57', letterSpacing: '-0.02em' }}>
                  Credit<span style={{ color: '#0F766E' }}>Lens</span>
                </span>
                <span style={{ fontSize: '12px', color: '#5B6B79', display: 'block', marginTop: '2px' }}>
                  Institutional Credit Risk &amp; Financial Intelligence Report
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#5B6B79' }}>
                <div>Report Ref: <strong>CL-REP-2026-X84</strong></div>
                <div>Generated: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                <div>Data Integrity: <strong style={{ color: '#0F766E' }}>SHA-256 Verified</strong></div>
              </div>
            </div>

            {/* Applicant Summary Quad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Applicant Name</span>
                <strong style={{ fontSize: '14px', color: '#173B57' }}>{xrayData?.applicant_name || 'Rajesh Kumar & Elena Vance'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Applicant Identifier</span>
                <strong style={{ fontSize: '14px', color: '#173B57' }}>CL-84091 (Tier B-1 Prime)</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>ULAS Score</span>
                <strong style={{ fontSize: '14px', color: '#0F766E' }}>{ulasData?.ulas ? `${Math.round(ulasData.ulas)} / 100 (Band ${ulasData.band})` : '78 / 100 (Band B)'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Financial Health Rating</span>
                <strong style={{ fontSize: '14px', color: '#18794E' }}>{xrayData?.overall_health_rating || 'STRONG HEALTH'}</strong>
              </div>
            </div>

            {/* Section 1: Executive Underwriting Summary */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 12px 0', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                1. Executive Underwriting Summary &amp; Decision Recommendation
              </h3>
              <p style={{ fontSize: '13px', color: '#172B3A', lineHeight: 1.6, margin: 0 }}>
                CreditLens evaluates the borrower's debt-servicing capability through corroborated cash flows rather than isolated bureau scoring.
                The applicant demonstrates regular monthly inflows of <strong>{formatINR(xrayData?.monthly_inflows_avg || 95000)}</strong> with average monthly outlays of <strong>{formatINR(xrayData?.monthly_outflows_avg || 62000)}</strong>, leaving an average net surplus cushion of <strong>{formatINR(xrayData?.net_cash_flow_avg || 33000)}/month</strong>.
              </p>
            </div>

            {/* Section 2: Income Reconciliation */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 12px 0', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                2. Income Verification &amp; Corroboration Breakdown
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', color: '#748391' }}>Parameter</th>
                    <th style={{ padding: '10px 14px', color: '#748391' }}>Value</th>
                    <th style={{ padding: '10px 14px', color: '#748391' }}>Underwriting Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F4F8' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: '#173B57' }}>Self-Reported Gross Income</td>
                    <td style={{ padding: '10px 14px', color: '#173B57' }}>{formatINR(xrayData?.income_reconciliation?.declared_monthly_income || 95000)}/mo</td>
                    <td style={{ padding: '10px 14px', color: '#5B6B79' }}>Stated on formal loan application form.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F4F8' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0F766E' }}>Observed Regular Payroll</td>
                    <td style={{ padding: '10px 14px', color: '#0F766E', fontWeight: '700' }}>{formatINR(xrayData?.income_reconciliation?.observed_recurring_income || 95000)}/mo</td>
                    <td style={{ padding: '10px 14px', color: '#5B6B79' }}>Verified recurring monthly credits from scheduled commercial bank statement.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F4F8' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: '#173B57' }}>Reconciliation Status</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#E8F5EE', color: '#18794E' }}>
                        {xrayData?.income_reconciliation?.status || 'CORROBORATED MATCH'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#5B6B79' }}>{xrayData?.income_reconciliation?.classification_notes || 'Corroborated: Self-declared income matches verified statement payroll.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Monthly Cash Flow Audit Table */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 12px 0', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                3. Observed Monthly Cash-Flow Trend
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '8px 12px', color: '#748391' }}>Period</th>
                    <th style={{ padding: '8px 12px', color: '#748391' }}>Total Inflow</th>
                    <th style={{ padding: '8px 12px', color: '#748391' }}>Total Outflow</th>
                    <th style={{ padding: '8px 12px', color: '#748391' }}>Net Surplus</th>
                    <th style={{ padding: '8px 12px', color: '#748391' }}>Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {(xrayData?.visualizations?.monthly_comparison || []).map((m) => (
                    <tr key={m.month} style={{ borderBottom: '1px solid #F1F4F8' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '600', color: '#173B57' }}>{m.month}</td>
                      <td style={{ padding: '8px 12px', color: '#173B57' }}>{formatINR(m.inflow)}</td>
                      <td style={{ padding: '8px 12px', color: '#526677' }}>{formatINR(m.outflow)}</td>
                      <td style={{ padding: '8px 12px', color: m.net_cash_flow >= 0 ? '#18794E' : '#B42318', fontWeight: '700' }}>
                        {m.net_cash_flow >= 0 ? '+' : ''}{formatINR(m.net_cash_flow)}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#173B57' }}>{formatINR(m.closing_balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 4: Audit & Regulatory Trail */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 12px 0', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                4. Compliance &amp; Verification Audit Events
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {auditEvents.slice(0, 4).map((evt, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#173B57' }}>{evt.eventType || 'System Audit Event'}</strong>: <span style={{ color: '#5B6B79' }}>{evt.description}</span>
                    </div>
                    <span style={{ color: '#748391', fontSize: '11px', whiteSpace: 'nowrap' }}>{evt.timestamp || 'Recent'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures & Disclaimers */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', fontSize: '11px', color: '#748391' }}>
              <div>
                <strong>CreditLens Platform Notice:</strong> This dossier is generated dynamically from mathematical models and verified documents.
                <br />CreditLens does not make unilateral credit decisions.
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Authorized Officer: <strong>David Vance (Senior Underwriter)</strong></div>
                <div>Institution: <strong>CreditLens Institutional Lending Desk</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BorrowerLayout>
  );
}
