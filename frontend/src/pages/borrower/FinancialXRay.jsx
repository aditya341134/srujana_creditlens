import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Layers,
  Search,
  RefreshCw,
  Eye,
  X,
  Copy,
  ChevronRight,
  Info,
  Sliders,
  Scale,
  FileCheck2,
  Send,
  HelpCircle
} from 'lucide-react';
import BorrowerLayout from '../../components/layout/BorrowerLayout';
import api from '../../services/api';
import { formatINR } from './Review';

export default function FinancialXRay() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [activeScenario, setActiveScenario] = useState('scenario_a'); // 'scenario_a' | 'scenario_b'
  const [activeTab, setActiveTab] = useState('visualizations'); // 'visualizations' | 'stress' | 'reconciliation' | 'anomalies' | 'bureau'
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedTradeline, setSelectedTradeline] = useState(null);
  const [disputeDraft, setDisputeDraft] = useState(null);
  const [generatingDispute, setGeneratingDispute] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Load Financial X-Ray data from backend
  const fetchReport = async (scenario = activeScenario) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getFinancialXRay(scenario);
      setReport(data);
      if (data.visualizations?.monthly_comparison?.length > 0) {
        setSelectedMonth(data.visualizations.monthly_comparison[data.visualizations.monthly_comparison.length - 1]);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load AI Financial X-Ray analysis.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeScenario);
  }, [activeScenario]);

  const handleScenarioChange = (scenarioId) => {
    setActiveScenario(scenarioId);
  };

  const handleOpenDisputeModal = async (tradeline) => {
    setSelectedTradeline(tradeline);
    setDisputeModalOpen(true);
    setGeneratingDispute(true);
    try {
      const res = await api.generateDisputeLetter({
        borrower_name: report?.applicant_name || 'Borrower',
        borrower_pan: 'XXXXX4091X',
        bureau_name: 'TransUnion CIBIL',
        tradeline: tradeline
      });
      setDisputeDraft(res);
      setGeneratingDispute(false);
    } catch (err) {
      console.error('Failed to generate dispute draft:', err);
      setGeneratingDispute(false);
    }
  };

  const handleCopyDispute = () => {
    if (disputeDraft?.body) {
      navigator.clipboard.writeText(disputeDraft.body);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    }
  };

  // Helper metrics
  const monthlyList = report?.visualizations?.monthly_comparison || [];
  const maxInflow = Math.max(...monthlyList.map((m) => Math.max(m.inflow, m.outflow, 10000)), 120000);
  const expenseCategories = report?.visualizations?.spending_breakdown || [];
  const totalExpenses = expenseCategories.reduce((acc, c) => acc + c.amount, 0) || 1;

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Breadcrumb & Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Home</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>AI Financial X-Ray</span>
              <span style={{ fontSize: '10px', backgroundColor: '#E6F4F1', color: '#0F766E', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                Flagship Feature
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#173B57', margin: '6px 0 8px 0', letterSpacing: '-0.02em' }}>
              AI Financial X-Ray
            </h1>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
              Comprehensive cash-flow pattern discovery, income consistency, balance trajectories, financial stress indicators, and bureau reconciliation grounded in verifiable statement evidence.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchReport(activeScenario)}
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
            <span>{loading ? 'Re-analyzing...' : 'Refresh Analysis'}</span>
          </button>
        </div>

        {/* Hackathon Demo Mode Banner & Scenario Switcher */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #DCE3EA',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 2px 6px rgba(23, 43, 58, 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#E6F4F1',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>
                  Live Demonstration Scenarios (Section 8)
                </span>
                <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#FFF4D6', color: '#925D00', padding: '2px 8px', borderRadius: '10px' }}>
                  Isolated Synthetic Data
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#5B6B79', margin: '2px 0 0' }}>
                Toggle between stable cash flow and a case requiring review to observe real engine calculations and visualizations.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleScenarioChange('scenario_a')}
              style={{
                backgroundColor: activeScenario === 'scenario_a' ? '#173B57' : '#FFFFFF',
                color: activeScenario === 'scenario_a' ? '#FFFFFF' : '#173B57',
                border: `1px solid ${activeScenario === 'scenario_a' ? '#173B57' : '#DCE3EA'}`,
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} color={activeScenario === 'scenario_a' ? '#68D391' : '#18794E'} />
              <span>Scenario A: Stable Pattern</span>
            </button>

            <button
              type="button"
              onClick={() => handleScenarioChange('scenario_b')}
              style={{
                backgroundColor: activeScenario === 'scenario_b' ? '#173B57' : '#FFFFFF',
                color: activeScenario === 'scenario_b' ? '#FFFFFF' : '#173B57',
                border: `1px solid ${activeScenario === 'scenario_b' ? '#173B57' : '#DCE3EA'}`,
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={14} color={activeScenario === 'scenario_b' ? '#FBD38D' : '#925D00'} />
              <span>Scenario B: Review Required</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA' }}>
            <RefreshCw size={28} className="cl-spin" style={{ margin: '0 auto 12px', color: '#0F766E' }} />
            <h3 style={{ fontSize: '16px', color: '#173B57', margin: 0 }}>Executing AI Financial X-Ray Pipeline...</h3>
            <p style={{ fontSize: '13px', color: '#5B6B79', margin: '6px 0 0' }}>
              Calculating cash flows, detecting stress indicators, reconciling declared income, and inspecting bureau tradelines.
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: '16px 20px', backgroundColor: '#FEF3F2', border: '1px solid #FECDCA', borderRadius: '8px', color: '#B42318', fontSize: '13px' }}>
            <strong>Analysis Error:</strong> {error}
          </div>
        )}

        {!loading && report && (
          <>
            {/* Top 4 KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {/* Card 1: Verified Monthly Salary */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '18px 20px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Observed Recurring Salary
                </span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', marginTop: '4px' }}>
                  {formatINR(report.income_reconciliation?.observed_recurring_income || 0)}
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#5B6B79' }}> / mo</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#0F766E' }}>
                  <ShieldCheck size={14} />
                  <span>Corroborated payroll credits</span>
                </div>
              </div>

              {/* Card 2: Average Monthly Outflows */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '18px 20px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Average Monthly Outflow
                </span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', marginTop: '4px' }}>
                  {formatINR(report.monthly_outflows_avg)}
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#5B6B79' }}> / mo</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#5B6B79' }}>
                  <span>Consumes </span>
                  <strong>{Math.round((report.monthly_outflows_avg / (report.monthly_inflows_avg || 1)) * 100)}%</strong>
                  <span> of gross inflows</span>
                </div>
              </div>

              {/* Card 3: Net Cash Flow Surplus */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '18px 20px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Net Monthly Cash Flow
                </span>
                <div style={{ fontSize: '24px', fontWeight: '800', color: report.net_cash_flow_avg >= 0 ? '#18794E' : '#B42318', marginTop: '4px' }}>
                  {report.net_cash_flow_avg >= 0 ? '+' : ''}{formatINR(report.net_cash_flow_avg)}
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#5B6B79' }}> / mo</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: report.net_cash_flow_avg >= 0 ? '#18794E' : '#B42318' }}>
                  {report.net_cash_flow_avg >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{report.net_cash_flow_avg >= 0 ? 'Surplus buffer available' : 'Cash-flow deficit detected'}</span>
                </div>
              </div>

              {/* Card 4: Health Rating & Anomalies */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '18px 20px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Financial Health &amp; Stress
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: report.overall_health_rating === 'STRONG' ? '#E8F5EE' : '#FFF4D6',
                      color: report.overall_health_rating === 'STRONG' ? '#18794E' : '#925D00'
                    }}
                  >
                    {report.overall_health_rating === 'STRONG' ? 'STRONG HEALTH' : 'NEEDS UNDERWRITER REVIEW'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: '#5B6B79' }}>
                  <span>{report.stress_indicators?.length || 0} Stress Factor{report.stress_indicators?.length === 1 ? '' : 's'} • {report.anomalies?.length || 0} Anomaly Flag{report.anomalies?.length === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>

            {/* Feature Section Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #DCE3EA', gap: '8px', overflowX: 'auto' }}>
              {[
                { id: 'visualizations', label: 'Interactive Visualizations', icon: Activity, count: null },
                { id: 'reconciliation', label: 'Declared vs. Observed Income', icon: Scale, count: report.income_reconciliation?.status !== 'MATCHED' ? 'Mismatch' : null },
                { id: 'stress', label: 'Financial Stress Indicators', icon: AlertTriangle, count: report.stress_indicators?.length },
                { id: 'anomalies', label: 'Financial Anomalies', icon: Search, count: report.anomalies?.length },
                { id: 'bureau', label: 'Bureau Reconciliation & Dispute', icon: FileCheck2, count: report.bureau_reconciliation?.length }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 18px',
                      border: 'none',
                      borderBottom: `2px solid ${isActive ? '#0F766E' : 'transparent'}`,
                      backgroundColor: 'transparent',
                      color: isActive ? '#0F766E' : '#5B6B79',
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.count !== null && tab.count !== undefined && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          backgroundColor: isActive ? '#E6F4F1' : '#F1F4F8',
                          color: isActive ? '#0F766E' : '#748391'
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: INTERACTIVE FINANCIAL VISUALIZATIONS */}
            {activeTab === 'visualizations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Visual A: Monthly Inflow vs Outflow & Net Cash Flow */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                        Monthly Income Versus Expenses
                      </h2>
                      <p style={{ fontSize: '13px', color: '#5B6B79', margin: '2px 0 0' }}>
                        Interactive monthly comparison displaying actual inflows, outflows, and net surplus cushion.
                      </p>
                    </div>

                    {/* Chart Legends */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#5B6B79' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#173B57' }} />
                        <span>Inflow (Income)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#526677' }} />
                        <span>Outflow (Expenses)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0F766E' }} />
                        <span>Net Cash Flow</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Bar & Net Flow Chart */}
                  <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
                    <div style={{ minWidth: '600px', height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
                      {/* Grid Lines */}
                      {[0.75, 0.5, 0.25, 0].map((ratio) => (
                        <div
                          key={ratio}
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: `${ratio * 200 + 40}px`,
                            borderTop: '1px dashed #E2E8F0',
                            zIndex: 1
                          }}
                        >
                          <span style={{ fontSize: '10px', color: '#748391', position: 'absolute', top: '-14px', left: '0' }}>
                            {formatINR(maxInflow * ratio)}
                          </span>
                        </div>
                      ))}

                      {/* Bars Container */}
                      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', zIndex: 2, paddingLeft: '40px' }}>
                        {monthlyList.map((m, idx) => {
                          const inflowH = (m.inflow / maxInflow) * 190;
                          const outflowH = (m.outflow / maxInflow) * 190;
                          const isSelected = selectedMonth?.month === m.month;

                          return (
                            <div
                              key={m.month}
                              onClick={() => setSelectedMonth(m)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                backgroundColor: isSelected ? '#F1F4F8' : 'transparent',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '190px' }}>
                                {/* Inflow Bar */}
                                <div
                                  title={`Inflow: ${formatINR(m.inflow)}`}
                                  style={{
                                    width: '24px',
                                    height: `${Math.max(inflowH, 4)}px`,
                                    backgroundColor: '#173B57',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease'
                                  }}
                                />
                                {/* Outflow Bar */}
                                <div
                                  title={`Outflow: ${formatINR(m.outflow)}`}
                                  style={{
                                    width: '24px',
                                    height: `${Math.max(outflowH, 4)}px`,
                                    backgroundColor: '#526677',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease'
                                  }}
                                />
                                {/* Net Cash Flow Indicator Pillar */}
                                <div
                                  title={`Net: ${formatINR(m.net_cash_flow)}`}
                                  style={{
                                    width: '12px',
                                    height: `${Math.max((Math.abs(m.net_cash_flow) / maxInflow) * 190, 4)}px`,
                                    backgroundColor: m.net_cash_flow >= 0 ? '#0F766E' : '#B42318',
                                    borderRadius: '2px 2px 0 0',
                                    transition: 'height 0.3s ease'
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#173B57' : '#5B6B79', marginTop: '8px' }}>
                                {m.month}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Selected Month Interactive Detail Pill */}
                  {selectedMonth && (
                    <div style={{ marginTop: '16px', padding: '12px 18px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #DCE3EA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#0F766E" />
                        <strong>Selected Cycle: {selectedMonth.month}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <span>Total Inflow: <strong style={{ color: '#173B57' }}>{formatINR(selectedMonth.inflow)}</strong></span>
                        <span>Total Outflow: <strong style={{ color: '#526677' }}>{formatINR(selectedMonth.outflow)}</strong></span>
                        <span>Net Surplus: <strong style={{ color: selectedMonth.net_cash_flow >= 0 ? '#18794E' : '#B42318' }}>{selectedMonth.net_cash_flow >= 0 ? '+' : ''}{formatINR(selectedMonth.net_cash_flow)}</strong></span>
                        <span>Closing Balance: <strong style={{ color: '#173B57' }}>{formatINR(selectedMonth.closing_balance)}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visual B & C in Two-Column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                  {/* Visual B: Cash-Flow Trend */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                          Cash-Flow Trend
                        </h3>
                        <p style={{ fontSize: '12px', color: '#5B6B79', margin: '2px 0 0' }}>
                          Distinguishing positive surplus vs. deficit periods.
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: report.balance_trajectory === 'GROWING' ? '#E8F5EE' : report.balance_trajectory === 'DECLINING' ? '#FEF3F2' : '#F1F4F8', color: report.balance_trajectory === 'GROWING' ? '#18794E' : report.balance_trajectory === 'DECLINING' ? '#B42318' : '#173B57' }}>
                        Trajectory: {report.balance_trajectory}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {monthlyList.map((m) => {
                        const isPositive = m.net_cash_flow >= 0;
                        const pct = Math.min((Math.abs(m.net_cash_flow) / 40000) * 100, 100);

                        return (
                          <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                            <span style={{ width: '70px', color: '#5B6B79', fontWeight: '500' }}>{m.month}</span>
                            <div style={{ flex: 1, backgroundColor: '#F1F4F8', height: '14px', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  backgroundColor: isPositive ? '#0F766E' : '#B42318',
                                  borderRadius: '7px',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                            <span style={{ width: '85px', textAlign: 'right', fontWeight: '700', color: isPositive ? '#18794E' : '#B42318' }}>
                              {isPositive ? '+' : ''}{formatINR(m.net_cash_flow)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visual C: Spending Breakdown */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                          Spending Breakdown
                        </h3>
                        <p style={{ fontSize: '12px', color: '#5B6B79', margin: '2px 0 0' }}>
                          Identifiable recurring obligations vs. discretionary outflows.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {expenseCategories.map((c) => (
                        <div
                          key={c.category}
                          onClick={() => setSelectedCategory(selectedCategory?.category === c.category ? null : c)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${selectedCategory?.category === c.category ? '#0F766E' : '#E2E8F0'}`,
                            backgroundColor: selectedCategory?.category === c.category ? '#E6F4F1' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>{c.category}</span>
                              {c.is_recurring && (
                                <span style={{ fontSize: '10px', backgroundColor: '#F1F4F8', color: '#5B6B79', padding: '1px 6px', borderRadius: '4px' }}>
                                  Recurring Mandate
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>
                              {formatINR(c.amount)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: '#F1F4F8', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${c.percentage_of_total}%`, height: '100%', backgroundColor: '#173B57' }} />
                            </div>
                            <span style={{ fontSize: '11px', color: '#748391', width: '38px', textAlign: 'right' }}>
                              {c.percentage_of_total}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual D: Income Consistency Timeline */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                        Income Consistency Track Record
                      </h3>
                      <p style={{ fontSize: '12px', color: '#5B6B79', margin: '2px 0 0' }}>
                        Verifying recurring salary credits across time to detect missing periods or volatility.
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Volatility Coeff</span>
                      <strong style={{ fontSize: '14px', color: '#0F766E' }}>{report.inflow_volatility_cv} (Low Variance)</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                    {monthlyList.map((m) => (
                      <div
                        key={m.month}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          textAlign: 'center'
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#748391', display: 'block' }}>{m.month}</span>
                        <strong style={{ fontSize: '14px', color: '#173B57', display: 'block', margin: '4px 0' }}>
                          {formatINR(m.salary_credit)}
                        </strong>
                        <span style={{ fontSize: '10px', color: '#18794E', fontWeight: '700' }}>
                          Verified Payroll
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DECLARED VS OBSERVED INCOME RECONCILIATION */}
            {activeTab === 'reconciliation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                        Declared Versus Observed Income Reconciliation
                      </h2>
                      <p style={{ fontSize: '13px', color: '#5B6B79', margin: '2px 0 0' }}>
                        Rigorous comparison between applicant-reported salary and verifiable recurring bank statement credits.
                      </p>
                    </div>

                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: report.income_reconciliation?.status === 'MATCHED' ? '#E8F5EE' : '#FFF4D6',
                        color: report.income_reconciliation?.status === 'MATCHED' ? '#18794E' : '#925D00'
                      }}
                    >
                      {report.income_reconciliation?.status === 'MATCHED' ? 'Corroborated Match' : 'Discrepancy Requiring Review'}
                    </span>
                  </div>

                  {/* Comparison Side-by-Side Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #DCE3EA' }}>
                      <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '700' }}>
                        Self-Reported Gross Income
                      </span>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', marginTop: '6px' }}>
                        {formatINR(report.income_reconciliation?.declared_monthly_income)}
                        <span style={{ fontSize: '12px', fontWeight: '400', color: '#5B6B79' }}> / mo</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#5B6B79', marginTop: '6px', display: 'block' }}>
                        Source: Loan Application Form
                      </span>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#E6F4F1', borderRadius: '10px', border: '1px solid #99EFE5' }}>
                      <span style={{ fontSize: '11px', color: '#0F766E', textTransform: 'uppercase', fontWeight: '700' }}>
                        Identifiable Recurring Payroll
                      </span>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F766E', marginTop: '6px' }}>
                        {formatINR(report.income_reconciliation?.observed_recurring_income)}
                        <span style={{ fontSize: '12px', fontWeight: '400', color: '#5B6B79' }}> / mo</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#0F766E', marginTop: '6px', display: 'block' }}>
                        Source: Bank Statement Analysis (Excluding Non-Recurring Credits)
                      </span>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #DCE3EA' }}>
                      <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '700' }}>
                        Divergence / Variance
                      </span>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: report.income_reconciliation?.variance_percentage > 20 ? '#B42318' : '#18794E', marginTop: '6px' }}>
                        {report.income_reconciliation?.variance_percentage}%
                        <span style={{ fontSize: '12px', fontWeight: '400', color: '#5B6B79' }}> ({formatINR(report.income_reconciliation?.variance_amount)})</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#5B6B79', marginTop: '6px', display: 'block' }}>
                        Confidence Level: {Math.round((report.income_reconciliation?.confidence || 0.9) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Engine Explanation Box */}
                  <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #0F766E', fontSize: '13px', lineHeight: 1.5, color: '#172B3A' }}>
                    <strong>Classification Rationale &amp; Objective Evaluation:</strong>
                    <p style={{ margin: '4px 0 0', color: '#5B6B79' }}>
                      {report.income_reconciliation?.classification_notes}
                    </p>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#748391' }}>
                      <em>Note: A mismatch is a discrepancy requiring documentary investigation (such as Form 16 or secondary account verification), not proof of fraud.</em>
                    </div>
                  </div>

                  {/* Non-Income Credits Breakdown if present */}
                  {report.income_reconciliation?.non_income_deposits_total > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#173B57', margin: '0 0 10px 0' }}>
                        Identified Non-Income Credits (Excluded from Recurring Salary)
                      </h4>
                      <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                          <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                              <th style={{ padding: '10px 14px', color: '#748391' }}>Credit Type</th>
                              <th style={{ padding: '10px 14px', color: '#748391' }}>Amount</th>
                              <th style={{ padding: '10px 14px', color: '#748391' }}>Period</th>
                              <th style={{ padding: '10px 14px', color: '#748391' }}>Underwriting Classification</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.income_reconciliation.non_income_deposits_breakdown.map((item, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #F1F4F8' }}>
                                <td style={{ padding: '10px 14px', fontWeight: '600', color: '#173B57' }}>{item.type}</td>
                                <td style={{ padding: '10px 14px', color: '#0F766E', fontWeight: '700' }}>{formatINR(item.amount)}</td>
                                <td style={{ padding: '10px 14px', color: '#5B6B79' }}>{item.period}</td>
                                <td style={{ padding: '10px 14px', color: '#748391' }}>{item.classification}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: FINANCIAL STRESS INDICATORS */}
            {activeTab === 'stress' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 6px 0' }}>
                    Financial Stress &amp; Solvency Indicators
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: '0 0 20px 0' }}>
                    Automated rule-based checks scanning for sustained negative cash flows, declining balances, high debt absorption, and payment mandate returns.
                  </p>

                  {report.stress_indicators?.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#E8F5EE', borderRadius: '8px', color: '#18794E' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Zero Critical Stress Indicators Detected</h4>
                      <p style={{ fontSize: '13px', color: '#18794E', margin: '4px 0 0' }}>
                        Positive cash-flow buffers observed across all evaluated periods with zero return events.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {report.stress_indicators.map((ind) => (
                        <div
                          key={ind.id}
                          style={{
                            padding: '16px 20px',
                            borderRadius: '10px',
                            border: `1px solid ${ind.severity === 'CRITICAL' ? '#FECDCA' : ind.severity === 'HIGH' ? '#FECDCA' : '#FEDF89'}`,
                            backgroundColor: ind.severity === 'CRITICAL' || ind.severity === 'HIGH' ? '#FEF3F2' : '#FFFDF5'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertTriangle size={18} color={ind.severity === 'CRITICAL' || ind.severity === 'HIGH' ? '#B42318' : '#925D00'} />
                              <strong style={{ fontSize: '15px', color: ind.severity === 'CRITICAL' || ind.severity === 'HIGH' ? '#B42318' : '#925D00' }}>
                                {ind.title}
                              </strong>
                            </div>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: ind.severity === 'CRITICAL' || ind.severity === 'HIGH' ? '#B42318' : '#925D00',
                                color: '#FFFFFF'
                              }}
                            >
                              Severity: {ind.severity}
                            </span>
                          </div>

                          <p style={{ fontSize: '13px', color: '#172B3A', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                            {ind.description}
                          </p>

                          <div style={{ fontSize: '12px', color: '#5B6B79', backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
                            <strong>Evidence from Bank Records:</strong> {ind.evidence}
                          </div>

                          <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>
                            <strong>Recommended Next Step:</strong> {ind.recommended_action}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: FINANCIAL ANOMALIES */}
            {activeTab === 'anomalies' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: '0 0 6px 0' }}>
                    Financial Anomalies &amp; Verification Items
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: '0 0 20px 0' }}>
                    Itemized transaction anomalies with detection rules, confidence ratings, uncertainty limitations, and suggested verification steps.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {report.anomalies?.map((anom) => (
                      <div
                        key={anom.id}
                        style={{
                          padding: '18px',
                          borderRadius: '10px',
                          border: '1px solid #DCE3EA',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 2px 6px rgba(23,43,58,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: '#173B57' }}>
                            {anom.title}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: anom.priority === 'HIGH' ? '#FEF3F2' : anom.priority === 'MEDIUM' ? '#FFF4D6' : '#E8F5EE',
                              color: anom.priority === 'HIGH' ? '#B42318' : anom.priority === 'MEDIUM' ? '#925D00' : '#18794E'
                            }}
                          >
                            Priority: {anom.priority}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '12px', color: '#5B6B79', margin: '12px 0' }}>
                          <div>
                            <span style={{ color: '#748391', display: 'block' }}>Supporting Evidence:</span>
                            <strong style={{ color: '#172B3A' }}>{anom.supporting_evidence}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#748391', display: 'block' }}>Detection Rule:</span>
                            <span>{anom.detection_rule}</span>
                          </div>
                          <div>
                            <span style={{ color: '#748391', display: 'block' }}>Confidence / Certainty:</span>
                            <strong style={{ color: '#0F766E' }}>{Math.round(anom.confidence * 100)}%</strong>
                          </div>
                        </div>

                        <div style={{ fontSize: '12px', color: '#5B6B79', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
                          <strong>Uncertainty &amp; Limitations:</strong> {anom.uncertainty_factors}
                        </div>

                        <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>
                          <strong>Suggested Verification Step:</strong> {anom.suggested_verification_step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BUREAU RECONCILIATION & DISPUTE GENERATOR */}
            {activeTab === 'bureau' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                        Credit Bureau Versus Bank Records Reconciliation
                      </h2>
                      <p style={{ fontSize: '13px', color: '#5B6B79', margin: '2px 0 0' }}>
                        Cross-checking formal bureau records against verifiable bank debits to detect reporting lags, outdated tradelines, or disputable late payments.
                      </p>
                    </div>

                    <div style={{ fontSize: '12px', color: '#5B6B79' }}>
                      CIR Source: <strong>TransUnion CIBIL CIR</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {report.bureau_reconciliation?.map((tr) => (
                      <div
                        key={tr.tradeline_id}
                        style={{
                          padding: '18px',
                          borderRadius: '10px',
                          border: `1px solid ${tr.reconciliation_finding !== 'CONCORDANT' ? '#FEDF89' : '#DCE3EA'}`,
                          backgroundColor: tr.reconciliation_finding !== 'CONCORDANT' ? '#FFFDF5' : '#FFFFFF'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '15px', color: '#173B57' }}>{tr.lender_name}</strong>
                              <span style={{ fontSize: '11px', color: '#5B6B79' }}>({tr.loan_type})</span>
                              <span style={{ fontSize: '11px', color: '#748391' }}>Ref: {tr.tradeline_id}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#5B6B79', marginTop: '2px', display: 'block' }}>
                              Reported Bureau Status: <strong>{tr.bureau_status}</strong> • Balance: <strong>{formatINR(tr.bureau_balance)}</strong>
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: tr.reconciliation_finding === 'CONCORDANT' ? '#E8F5EE' : '#FFF4D6',
                                color: tr.reconciliation_finding === 'CONCORDANT' ? '#18794E' : '#925D00'
                              }}
                            >
                              {tr.reconciliation_finding.replace(/_/g, ' ')}
                            </span>

                            {tr.reconciliation_finding !== 'CONCORDANT' && (
                              <button
                                type="button"
                                onClick={() => handleOpenDisputeModal(tr)}
                                style={{
                                  backgroundColor: '#173B57',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <FileText size={13} />
                                <span>Generate Dispute Draft</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ fontSize: '12px', color: '#172B3A', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
                          <strong>Statement Evidence:</strong> {tr.bank_statement_evidence}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#5B6B79' }}>
                          <span><strong>Recommended Step:</strong> {tr.recommended_step}</span>
                          <span>Matching Confidence: <strong>{Math.round(tr.matching_confidence * 100)}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Dispute Letter Draft Modal */}
        {disputeModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(23, 43, 58, 0.5)',
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
                maxWidth: '720px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                    Credit Bureau Dispute Representation Draft
                  </h3>
                  <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                    Section 7: Editable draft based on verified banking evidence (Never auto-submitted).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#748391' }}
                >
                  <X size={20} />
                </button>
              </div>

              {generatingDispute ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#5B6B79' }}>
                  <RefreshCw size={24} className="cl-spin" style={{ margin: '0 auto 8px', color: '#0F766E' }} />
                  <span>Drafting formal representation letter citing banking records...</span>
                </div>
              ) : disputeDraft ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '10px 14px', backgroundColor: '#FFF4D6', borderRadius: '6px', fontSize: '12px', color: '#925D00' }}>
                    <strong>Notice:</strong> {disputeDraft.disclaimer}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#173B57' }}>
                      Editable Representation Letter Body
                    </label>
                    <textarea
                      rows={14}
                      value={disputeDraft.body}
                      onChange={(e) => setDisputeDraft({ ...disputeDraft, body: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #DCE3EA',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        color: '#172B3A',
                        backgroundColor: '#F8FAFC'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#18794E' }}>
                      {copiedNotification && <span>✓ Copied to clipboard!</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleCopyDispute}
                        style={{
                          backgroundColor: '#0F766E',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 18px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Copy size={14} />
                        <span>Copy Letter Text</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDisputeModalOpen(false)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#173B57',
                          border: '1px solid #DCE3EA',
                          borderRadius: '8px',
                          padding: '10px 18px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </BorrowerLayout>
  );
}
