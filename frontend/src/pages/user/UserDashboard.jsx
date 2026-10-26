import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  Upload,
  ArrowRight,
  PlusCircle,
  Sliders,
  FileText,
  DollarSign,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  RefreshCw,
  X
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import { CopyButton } from '../../components/CopyButton';
import { useUserPortalState, formatCurrency, formatCurrencyShort } from './userPortalState';

export function UserDashboard({ onNavigate }) {
  const {
    state,
    toastMessage,
    upload1099Document,
    syncBankData
  } = useUserPortalState();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(11); // October (Active)

  const handleSyncBankData = () => {
    setIsSyncing(true);
    syncBankData();
    setTimeout(() => {
      setIsSyncing(false);
    }, 900);
  };

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  // 12-month synthetic cash flow telemetry
  const cashFlowMonths = [
    { month: 'Nov', inflow: 6100, outflow: 4400, buffer: 1700 },
    { month: 'Dec', inflow: 6500, outflow: 4700, buffer: 1800 },
    { month: 'Jan', inflow: 6300, outflow: 4500, buffer: 1800 },
    { month: 'Feb', inflow: 6300, outflow: 4450, buffer: 1850 },
    { month: 'Mar', inflow: 6400, outflow: 4500, buffer: 1900 },
    { month: 'Apr', inflow: 6350, outflow: 4520, buffer: 1830 },
    { month: 'May', inflow: 6400, outflow: 4550, buffer: 1850 },
    { month: 'Jun', inflow: 6450, outflow: 4600, buffer: 1850 },
    { month: 'Jul', inflow: 6500, outflow: 4620, buffer: 1880 },
    { month: 'Aug', inflow: 6400, outflow: 4580, buffer: 1820 },
    { month: 'Sep', inflow: 6600, outflow: 4680, buffer: 1920 },
    { month: 'Oct', inflow: state.financials?.monthlyNetIncome || 4883, outflow: 4600, buffer: state.financials?.freeRepaymentSurplus || 1303 }
  ];

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      upload1099Document(selectedFile ? selectedFile.name : '1099_NEC_ScheduleC_Verified.pdf');
      setUploading(false);
      setUploadModalOpen(false);
      setSelectedFile(null);
    }, 1200);
  };

  return (
    <UserPortalLayout
      activePage="dashboard"
      onNavigate={handleNavigate}
      user={state.user}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Greeting & Real-Time Sync Utility Bar */}
        {/* Top Greeting & Bank Sync Bar */}
        <div className="cl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="cl-page-title">Welcome back, {state.user.name}</h1>
                <span className="cl-badge cl-badge-teal">
                  <ShieldCheck size={14} />
                  <span>Verified Identity</span>
                </span>
                <span className="cl-badge cl-badge-neutral">
                  <RefreshCw size={12} color="#0F766E" />
                  <span>Updated {state.user.lastSyncTime}</span>
                </span>
              </div>
              <p className="cl-page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Personal Credit &amp; Solvency Overview • Account ID: <strong style={{ color: '#172B3A' }}>{state.user.id}</strong></span>
                <CopyButton text={state.user.id} label="Copy ID" title="Copy Account ID" />
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div className="cl-card-flat" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#E6F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F766E' }}>
                  <ShieldCheck size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
                    Fair Lending Score
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F766E' }}>
                    99.4% Verified Fair
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="cl-btn cl-btn-secondary cl-btn-sm"
                onClick={handleSyncBankData}
                disabled={isSyncing}
                title="Synchronize bank feeds"
              >
                <RefreshCw size={13} className={isSyncing ? 'cl-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Bank Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars of Financial Health */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          {/* Pillar 1: Monthly Income */}
          <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monthly Income
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#E6F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F766E' }}>
                <DollarSign size={16} />
              </div>
            </div>
            <div style={{ margin: '14px 0 10px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#172B3A', letterSpacing: '-0.02em' }}>
                {formatCurrency(state.financials.monthlyNetIncome)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>
                <TrendingUp size={14} />
                <span>{state.financials.incomeChangeYoY}</span>
                <span style={{ color: '#748391', fontWeight: '400', marginLeft: '4px' }}>• Verified W-2 + Freelance</span>
              </div>
            </div>
            <div>
              <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '82%', height: '100%', background: '#0F766E', borderRadius: '999px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#5B6B79' }}>
                <span>Income Stability</span>
                <strong style={{ color: '#172B3A' }}>{state.financials.stabilityScore} / 100 (Strong)</strong>
              </div>
            </div>
          </div>

          {/* Pillar 2: Monthly Living Expenses */}
          <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monthly Expenses
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#173B57' }}>
                <Activity size={16} />
              </div>
            </div>
            <div style={{ margin: '14px 0 10px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#172B3A', letterSpacing: '-0.02em' }}>
                {formatCurrency(state.financials.monthlyLivingExpenses)}
              </div>
              <div style={{ fontSize: '12px', color: '#748391', marginTop: '4px' }}>
                Rent $2.1k • Utilities $420 • Living $800
              </div>
            </div>
            <div>
              <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '55%', height: '100%', background: '#173B57' }} title="Rent"></div>
                <div style={{ width: '11%', height: '100%', background: '#748391' }} title="Utilities"></div>
                <div style={{ width: '34%', height: '100%', background: '#245EA8' }} title="Other Living"></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#5B6B79' }}>
                <span>Income Used</span>
                <strong style={{ color: '#172B3A' }}>{state.financials.incomeConsumedPercent}% of Income</strong>
              </div>
            </div>
          </div>

          {/* Pillar 3: Debt Payments (DTI) */}
          <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monthly Debt Payments
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#173B57' }}>
                <Layers size={16} />
              </div>
            </div>
            <div style={{ margin: '14px 0 10px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#172B3A', letterSpacing: '-0.02em' }}>
                {formatCurrency(state.financials.monthlyDebtObligations)}
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#748391' }}>/mo</span>
              </div>
              <div style={{ fontSize: '12px', color: '#0F766E', marginTop: '4px', fontWeight: '600' }}>
                DTI: {state.financials.dti}% <span style={{ color: '#748391', fontWeight: '400' }}>• Auto $380, Student $400</span>
              </div>
            </div>
            <div>
              <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(state.financials.dti / 36) * 100}%`, height: '100%', background: '#0F766E', borderRadius: '999px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#5B6B79' }}>
                <span>Safe Limit</span>
                <strong style={{ color: '#0F766E' }}>36% (Healthy Range)</strong>
              </div>
            </div>
          </div>

          {/* Pillar 4: Monthly Cushion */}
          <div
            className="cl-card-primary"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #173B57 0%, #0F2E45 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#C6F0E7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monthly Cushion
              </span>
              <span className="cl-badge cl-badge-teal" style={{ background: '#0F766E', color: '#FFFFFF', fontSize: '11px' }}>
                Prime Tier
              </span>
            </div>
            <div style={{ margin: '14px 0 10px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {formatCurrency(state.financials.freeRepaymentSurplus)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: '#99EFE5', fontWeight: '600' }}>
                <CheckCircle2 size={14} />
                <span>{state.financials.surplusPercentage}% Free Monthly Cushion</span>
              </div>
            </div>
            <div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '74%', height: '100%', background: '#0F766E', borderRadius: '999px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#C6F0E7' }}>
                <span>Borrowing Class</span>
                <strong>{state.financials.capacityClass}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Inline Application Status Bar */}
        <div className="cl-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', color: '#173B57', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck2 size={18} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#172B3A' }}>
                  {formatCurrencyShort(state.application.requestedAmount)} {state.application.loanPurpose}
                </span>
                <span style={{ fontSize: '12px', color: '#748391', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  • App #{state.application.id} ({state.application.termMonths} Mo)
                  <CopyButton text={state.application.id} label="Copy App ID" title="Copy Application ID" />
                </span>
                {state.application.dossierProtocol && (
                  <span style={{ fontSize: '12px', color: '#748391', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    • Protocol: {state.application.dossierProtocol}
                    <CopyButton text={state.application.dossierProtocol} label="Copy Protocol" title="Copy Dossier Protocol" />
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`cl-badge ${state.application.currentStage === 4 ? 'cl-badge-success' : 'cl-badge-warning'}`}>
                <span className="cl-pulse-dot" style={{ background: state.application.currentStage === 4 ? '#18794E' : '#925D00' }}></span>
                <span>Stage 3 of 4: Verification Review</span>
              </span>
              <button
                type="button"
                className="cl-btn cl-btn-secondary cl-btn-sm"
                onClick={() => handleNavigate('my-assessment')}
              >
                View Assessment
              </button>
            </div>
          </div>

          {/* Inline Single-Line Pipeline Steps */}
          <div className="cl-pipeline-inline-track">
            {(state.application?.stages || []).map((stage, idx) => {
              const isCompleted = stage.status === 'completed';
              const isInProgress = stage.status === 'in_progress';
              const isLast = idx === (state.application?.stages?.length || 4) - 1;

              const simpleTitle = stage.id === 1 ? 'Submitted'
                : stage.id === 2 ? 'AI Check'
                : stage.id === 3 ? 'Review'
                : 'Final Offer';

              const statusText = isCompleted ? (stage.completedDate || 'Done')
                : isInProgress ? 'In Review'
                : 'Pending';

              return (
                <React.Fragment key={stage.id}>
                  <div className={`cl-pipeline-inline-step ${isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'pending'}`}>
                    <div className="cl-pipeline-step-icon">
                      {isCompleted ? (
                        <CheckCircle2 size={15} />
                      ) : isInProgress ? (
                        <AlertTriangle size={15} />
                      ) : (
                        <Clock size={15} />
                      )}
                    </div>
                    <div className="cl-pipeline-step-info">
                      <span className="cl-pipeline-step-title">{stage.id}. {simpleTitle}</span>
                      <span className="cl-pipeline-step-status">{statusText}</span>
                    </div>
                  </div>
                  {!isLast && (
                    <div className={`cl-pipeline-step-connector ${isCompleted ? 'completed' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Action Required Banner: Simplified English */}
        {!state.documents?.hasUploaded1099 && (
          <div className="cl-alert-banner warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#925D00', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '14px', color: '#7A4D00' }}>
                  Boost Your Borrowing Power
                </strong>
                <span style={{ fontSize: '13px', color: '#5B6B79' }}>
                  Upload your freelance 1099 tax form to qualify for up to <strong style={{ color: '#172B3A' }}>+$11,000 more borrowing capacity</strong>.
                </span>
              </div>
            </div>
            <button
              type="button"
              className="cl-btn cl-btn-primary cl-btn-sm"
              style={{ flexShrink: 0 }}
              onClick={() => setUploadModalOpen(true)}
            >
              <Upload size={14} />
              <span>Upload 1099</span>
            </button>
          </div>
        )}

        {/* Main 2-Column Responsive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'start' }}>
          {/* Left Column (8 Columns: Telemetry, Cash Flow & Explainability) */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 12-Month Net Cash Flow Cushion Card */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#173B57" />
                    <h2 className="cl-card-title" style={{ fontSize: '16px' }}>12-Month Cash Flow &amp; Savings Cushion</h2>
                  </div>
                  <p className="cl-helper-text" style={{ marginTop: '4px' }}>
                    Monthly breakdown: Income (Navy), Living &amp; Debt (Blue), and Free Savings Cushion (Teal).
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#5B6B79' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#173B57', borderRadius: '2px' }}></span>
                    <span>Income</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#85B6DD', borderRadius: '2px' }}></span>
                    <span>Expenses</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#0F766E', borderRadius: '2px' }}></span>
                    <span>Savings Cushion</span>
                  </div>
                </div>
              </div>

              {/* Responsive Visual Bar Chart */}
              <div style={{ background: '#F8FAFC', border: '1px solid #DCE3EA', borderRadius: '10px', padding: '16px' }}>
                <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                  {cashFlowMonths.map((item, idx) => {
                    const isSelected = idx === selectedMonthIndex;
                    const maxVal = 7000;
                    const inflowH = (item.inflow / maxVal) * 100;
                    const outflowH = (item.outflow / maxVal) * 100;
                    const bufferH = (item.buffer / maxVal) * 100;

                    return (
                      <button
                        key={item.month}
                        type="button"
                        onClick={() => setSelectedMonthIndex(idx)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          height: '100%',
                          justifyContent: 'flex-end',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '100%' }}>
                          <div
                            style={{
                              width: '30%',
                              maxWidth: '12px',
                              height: `${inflowH}%`,
                              background: '#173B57',
                              borderRadius: '2px 2px 0 0',
                              opacity: isSelected ? 1 : 0.75
                            }}
                            title={`Inflow: ${formatCurrency(item.inflow)}`}
                          ></div>
                          <div
                            style={{
                              width: '30%',
                              maxWidth: '12px',
                              height: `${outflowH}%`,
                              background: '#85B6DD',
                              borderRadius: '2px 2px 0 0',
                              opacity: isSelected ? 1 : 0.75
                            }}
                            title={`Outflow: ${formatCurrency(item.outflow)}`}
                          ></div>
                          <div
                            style={{
                              width: '26%',
                              maxWidth: '10px',
                              height: `${bufferH}%`,
                              background: '#0F766E',
                              borderRadius: '2px 2px 0 0',
                              opacity: isSelected ? 1 : 0.75
                            }}
                            title={`Buffer: ${formatCurrency(item.buffer)}`}
                          ></div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#173B57' : '#748391' }}>
                          {item.month}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', marginTop: '10px', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#5B6B79' }}>
                  <span>
                    Selected ({cashFlowMonths[selectedMonthIndex].month}): Inflow <strong>{formatCurrency(cashFlowMonths[selectedMonthIndex].inflow)}</strong> • Buffer <strong>{formatCurrency(cashFlowMonths[selectedMonthIndex].buffer)}</strong>
                  </span>
                  <span>Average Net Margin: <strong style={{ color: '#0F766E' }}>+$1,784/mo</strong> (Volatility: 0.04 Low)</span>
                </div>
              </div>
            </div>

            {/* Credit Assessment Summary Card with Radial Solvency Gauge */}
            <div className="cl-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  {/* Circular Solvency Graphic */}
                  <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#0F766E"
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * (state.assessment.solvencyScore / 850))}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: '#172B3A', lineHeight: 1 }}>
                        {state.assessment.solvencyScore}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase', marginTop: '2px' }}>
                        Prime A-2
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Solvency Score
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#172B3A', margin: 0 }}>
                      {state.assessment.solvencyGrade}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#5B6B79', margin: '2px 0 0', maxWidth: '380px', lineHeight: 1.4 }}>
                      Steady payment history with <strong style={{ color: '#172B3A' }}>{state.assessment.revolvingUtilization}% card usage</strong> and <strong style={{ color: '#172B3A' }}>{state.assessment.liquidBufferMonths} months savings buffer</strong>.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '180px' }}>
                  <span className="cl-badge cl-badge-teal">
                    <ShieldCheck size={14} />
                    <span>0 Late Payments (3 Years)</span>
                  </span>
                  <button
                    type="button"
                    className="cl-btn cl-btn-primary"
                    onClick={() => handleNavigate('my-assessment')}
                  >
                    <span>View Full Assessment</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 Columns: Quick Actions, Ingestion Feed) */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Actions Panel */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="cl-card-title">Quick Actions</span>
                <span style={{ fontSize: '11px', color: '#748391' }}>Shortcuts</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-primary"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
                  onClick={() => handleNavigate('loan-application')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <PlusCircle size={18} />
                    <span>Apply for a Loan</span>
                  </div>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
                  onClick={() => handleNavigate('loan-simulator')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sliders size={18} color="#0F766E" />
                    <span>Loan Simulator</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#748391' }}>Calculator</span>
                </button>

                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
                  onClick={() => setUploadModalOpen(true)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Upload size={18} color="#925D00" />
                    <span>Upload Documents</span>
                  </div>
                  {!state.documents?.hasUploaded1099 && (
                    <span className="cl-badge cl-badge-warning" style={{ fontSize: '11px' }}>
                      1 Pending
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="cl-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={16} color="#0F766E" />
                  <span className="cl-card-title">Recent Activity</span>
                </div>
                <span className="cl-badge cl-badge-teal" style={{ fontSize: '11px' }}>
                  Bank Synced
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(state.telemetryLogs || []).map((log) => (
                  <div
                    key={log.id}
                    className="cl-card-flat"
                    style={{ padding: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: log.type === 'credit' ? '#E6F4F1' : '#F1F5F9',
                        color: log.type === 'credit' ? '#0F766E' : '#173B57',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {log.type === 'credit' ? <DollarSign size={13} /> : <Activity size={13} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#172B3A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.title}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: log.type === 'credit' ? '#0F766E' : '#172B3A' }}>
                          {log.amount}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#5B6B79', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.description}
                      </p>
                      <span style={{ fontSize: '10px', color: '#748391', marginTop: '2px', display: 'block' }}>
                        {log.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload 1099 / Document Modal */}
      {uploadModalOpen && (
        <div className="cl-modal-overlay">
          <div className="cl-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Upload Supplemental 1099 Form
                </h3>
                <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
                  Affirm secondary freelance consulting revenue to unlock up to +$11,000 borrowing capacity.
                </p>
              </div>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setUploadModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSimulateUpload}>
              <div
                style={{
                  border: '2px dashed #DCE3EA',
                  borderRadius: '10px',
                  padding: '32px 16px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <Upload size={36} color="#0F766E" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#172B3A', margin: 0 }}>
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop 1099 / Schedule C'}
                </p>
                <span style={{ fontSize: '12px', color: '#748391', marginTop: '4px', display: 'block' }}>
                  Supported formats: PDF, PNG, JPG (Max 15MB) • 256-Bit Encrypted Upload
                </span>
                <input
                  id="file-upload-input"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cl-btn cl-btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Cryptographically Verifying...' : 'Affirm Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserPortalLayout>
  );
}

export default UserDashboard;
