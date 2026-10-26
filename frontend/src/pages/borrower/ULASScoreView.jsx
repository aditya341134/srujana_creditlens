import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sliders,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BorrowerLayout from '../../components/layout/BorrowerLayout';
import ULASSpeedometerGauge from '../../components/ULASSpeedometerGauge';
import { getInterpolatedColor } from '../../utils/ulasColors';
import ULASScoreHistoryChart from '../../components/ULASScoreHistoryChart';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from './Review';

export default function ULASScoreView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasNoAssessment, setHasNoAssessment] = useState(false);
  const [ulasData, setUlasData] = useState(null);
  const [activeAppId, setActiveAppId] = useState('APP-2026-1001');
  const [error, setError] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  
  // Simulation State
  const [principal, setPrincipal] = useState(500000);
  const [tenure, setTenure] = useState(36);
  const [rate, setRate] = useState(10.5);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchAssessment = async () => {
    setLoading(true);
    setError('');
    setHasNoAssessment(false);
    try {
      const appsRes = await api.getApplications();
      const apps = appsRes.items || (Array.isArray(appsRes) ? appsRes : []);
      
      // Isolate to authenticated user's application
      let userApp = null;
      if (user?.id) {
        userApp = apps.find(a => a.borrower_id === user.id || a.user_id === user.id);
      }
      if (!userApp && user?.name) {
        userApp = apps.find(a => (a.applicantName || a.applicant_name || '').toLowerCase() === user.name.toLowerCase());
      }
      if (!userApp && apps.length > 0) {
        // Fallback for default demo borrower Rajesh Kumar
        userApp = apps.find(a => a.id === 'APP-2026-1001') || apps[0];
      }

      if (!userApp) {
        setHasNoAssessment(true);
        setUlasData(null);
        setLoading(false);
        return;
      }

      setActiveAppId(userApp.id);
      const assessment = await api.getUlasAssessment(userApp.id);
      setUlasData(assessment);
      setHasNoAssessment(false);
      setLoading(false);
    } catch (err) {
      if (err.status === 404 || err.message?.includes('404') || err.message?.includes('not found')) {
        setHasNoAssessment(true);
        setUlasData(null);
      } else {
        setError(err.message || 'Failed to retrieve authoritative ULAS score.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  // Re-run evaluation (persists new historical score record to MySQL/DB)
  const handleReRunEvaluation = async () => {
    setEvaluating(true);
    setError('');
    try {
      const freshAssessment = await api.runUlasAssessment(activeAppId);
      setUlasData(freshAssessment);
      setHistoryRefreshKey((prev) => prev + 1);
      setEvaluating(false);
    } catch (err) {
      console.error('Re-run evaluation error:', err);
      setError(err.message || 'Failed to re-run assessment pipeline.');
      setEvaluating(false);
    }
  };

  // Run Simulation
  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.simulateLoan({
        principal: Number(principal),
        tenure_months: Number(tenure),
        annual_interest_rate: Number(rate),
        monthly_income: 95000.0,
        existing_emi: 14000.0
      });
      setSimulationResult(res);
      setSimulating(false);
    } catch (err) {
      console.error('Simulation error:', err);
      setSimulating(false);
    }
  };

  useEffect(() => {
    handleSimulate();
  }, [principal, tenure, rate]);

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Breadcrumb Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Home</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>ULAS Assessment</span>
              <span style={{ fontSize: '10px', backgroundColor: '#E6F4F1', color: '#0F766E', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                Flagship Underwriting Score
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#173B57', margin: '6px 0 8px 0', letterSpacing: '-0.02em' }}>
              Universal Loan Acceptance Score (ULAS v0.2)
            </h1>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
              Transparent, multi-dimensional credit evaluation combining hard prudential policy gates, dimension sub-scores, population calibration, and point-level driver explainability.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReRunEvaluation}
            disabled={loading || evaluating}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #DCE3EA',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#173B57',
              cursor: loading || evaluating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <RefreshCw size={14} className={loading || evaluating ? 'cl-spin' : ''} />
            <span>{evaluating ? 'Re-evaluating & Saving...' : loading ? 'Evaluating...' : 'Re-run Evaluation'}</span>
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA' }}>
            <RefreshCw size={28} className="cl-spin" style={{ margin: '0 auto 12px', color: '#0F766E' }} />
            <h3 style={{ fontSize: '16px', color: '#173B57', margin: 0 }}>Evaluating ULAS v0.2 Underwriting Pipeline...</h3>
            <p style={{ fontSize: '13px', color: '#5B6B79', margin: '6px 0 0' }}>
              Computing policy gates, dimension weights, population calibration, and point drivers.
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: '16px 20px', backgroundColor: '#FEF3F2', border: '1px solid #FECDCA', borderRadius: '8px', color: '#B42318', fontSize: '13px' }}>
            <strong>Assessment Error:</strong> {error}
          </div>
        )}

        {!loading && hasNoAssessment && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #DCE3EA',
              padding: '48px 24px',
              textAlign: 'center',
              maxWidth: '620px',
              margin: '30px auto',
              boxShadow: '0 4px 16px rgba(23,43,58,0.04)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FFF4D6',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Award size={32} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#173B57', margin: '0 0 10px 0' }}>
              ULAS Score Not Available Yet
            </h2>
            <p style={{ fontSize: '14px', color: '#5B6B79', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              There is currently no active loan assessment on file for your account ({user?.email || 'Current Borrower'}). Submit a loan application or upload your financial documents to generate your verified Universal Loan Acceptance Score.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/loan"
                style={{
                  backgroundColor: '#0F766E',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Start Loan Application</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={fetchAssessment}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#173B57',
                  border: '1px solid #DCE3EA',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Check for Updates
              </button>
            </div>
          </div>
        )}

        {!loading && ulasData && (
          <>
            {/* Master Hero Score Card with Speedometer Gauge */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #DCE3EA',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(23,43,58,0.04)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '28px',
                alignItems: 'center'
              }}
            >
              {/* Left Column: Interactive Speedometer Gauge (0–100 with Red-to-Green Progression) */}
              <div>
                <ULASSpeedometerGauge
                  score={ulasData.ulas}
                  band={ulasData.band}
                  decision={ulasData.decision_recommendation}
                  calibratedPd={ulasData.calibrated_pd}
                  confidence={ulasData.confidence}
                  isLoading={evaluating}
                />
              </div>

              {/* Right Column: Authoritative Outcome & Key Decision Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Authoritative Underwriting Recommendation
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', margin: '4px 0 6px 0' }}>
                    {ulasData.decision_recommendation.replace(/_/g, ' ')}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0, lineHeight: 1.5 }}>
                    Evaluated under RBI and Fair Lending compliance. Calibrated probability of default is <strong>{Math.round(ulasData.calibrated_pd * 100)}%</strong> with statistical confidence shrinkage of <strong>{Math.round(ulasData.confidence * 100)}%</strong>.
                  </p>
                </div>

                {/* Verification Pillars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #DCE3EA' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Policy Gates</span>
                    <strong style={{ fontSize: '18px', color: Object.values(ulasData.gates || {}).some(g => g.status === 'FAIL') ? '#B42318' : '#18794E', marginTop: '4px', display: 'block' }}>
                      {Object.values(ulasData.gates || {}).filter(g => g.status === 'PASS').length} / {Object.keys(ulasData.gates || {}).length}
                    </strong>
                    <span style={{ fontSize: '11px', color: Object.values(ulasData.gates || {}).some(g => g.status === 'FAIL') ? '#B42318' : '#5B6B79' }}>
                      {Object.values(ulasData.gates || {}).some(g => g.status === 'FAIL') ? 'Fatal gate breach detected' : 'Zero fatal gates breached'}
                    </span>
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #DCE3EA' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Composite Base R</span>
                    <strong style={{ fontSize: '18px', color: '#173B57', marginTop: '4px', display: 'block' }}>
                      {Math.round(ulasData.composite_r || ulasData.ulas)} / 100
                    </strong>
                    <span style={{ fontSize: '11px', color: '#5B6B79' }}>Pre-calibration composite</span>
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #DCE3EA' }}>
                    <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>Engine Version</span>
                    <strong style={{ fontSize: '16px', color: '#0F766E', marginTop: '4px', display: 'block' }}>
                      ULAS v0.2.0
                    </strong>
                    <span style={{ fontSize: '11px', color: '#5B6B79' }}>Deterministic model</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Score Trend Chart (Persisted in Database) */}
            <ULASScoreHistoryChart
              applicationId={activeAppId}
              refreshTrigger={historyRefreshKey}
            />

            {/* 7 Underwriting Policy Gates (G1 to G7) */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                    Underwriting Policy Gates Evaluation (G1 to G7)
                  </h3>
                  <p style={{ fontSize: '13px', color: '#5B6B79', margin: '2px 0 0' }}>
                    Prudential baseline criteria that must be satisfied before score weighting takes effect.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {Object.entries(ulasData.gates || {}).map(([gKey, gVal]) => {
                  const isPass = gVal.status === 'PASS';
                  const isFail = gVal.status === 'FAIL';
                  return (
                    <div
                      key={gKey}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${isPass ? '#DCE3EA' : isFail ? '#FECDCA' : '#FEDF89'}`,
                        backgroundColor: isPass ? '#FFFFFF' : isFail ? '#FEF3F2' : '#FFFDF5'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#173B57' }}>
                          {gKey.replace(/_/g, ' ')}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isPass ? '#E8F5EE' : isFail ? '#B42318' : '#FFF4D6',
                            color: isPass ? '#18794E' : '#FFFFFF'
                          }}
                        >
                          {gVal.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#5B6B79', margin: 0, lineHeight: 1.4 }}>
                        {gVal.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5 Dimension Sub-Scores */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#173B57', margin: '0 0 6px 0' }}>
                5 Dimension Sub-Scores vs. Population Benchmark
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', margin: '0 0 20px 0' }}>
                Comparing applicant sub-scores against reference population means across all weighted underwriting pillars.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(ulasData.subscores || {}).map(([sKey, sVal]) => {
                  const scoreVal = sVal.score !== null ? Math.round(sVal.score) : 60;
                  const subscoreColor = getInterpolatedColor(scoreVal);
                  return (
                    <div key={sKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#173B57' }}>{sKey.replace(/_/g, ' ')}</strong>
                          <span style={{ fontSize: '11px', color: '#748391' }}>
                            Weight: {sKey.includes('conduct') ? '35%' : sKey.includes('capacity') ? '25%' : sKey.includes('behaviour') ? '20%' : sKey.includes('debt') ? '12%' : '8%'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                            {sVal.confidence_penalty ? 'Penalty Applied' : 'Optimal Confidence'}
                          </span>
                          <strong style={{ color: subscoreColor, fontSize: '15px' }}>{scoreVal} / 100</strong>
                        </div>
                      </div>

                      <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F4F8', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${scoreVal}%`,
                            height: '100%',
                            backgroundColor: subscoreColor,
                            borderRadius: '4px',
                            transition: 'width 0.4s ease, background-color 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explainable Underwriting Reason Codes */}
            {ulasData.reason_codes && ulasData.reason_codes.length > 0 && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 14px 0' }}>
                  Authoritative Reason Codes &amp; Explainability
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {ulasData.reason_codes.map((rc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#E6F4F1', color: '#0F766E' }}>
                          {rc.code}
                        </span>
                        <strong style={{ fontSize: '12px', color: '#172B3A' }}>{rc.title || rc.name || rc.code}</strong>
                      </div>
                      <p style={{ fontSize: '12px', color: '#5B6B79', margin: 0, lineHeight: 1.4 }}>
                        {rc.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Driver Contributions & Actionable Next Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* Positive & Negative Drivers */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 16px 0' }}>
                  Point-Level Driver Contributions
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ulasData.drivers?.slice(0, 4).map((d, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#172B3A', fontWeight: '500' }}>
                        {d.description}
                      </span>
                      <strong style={{ fontSize: '13px', color: d.contribution_points >= 0 ? '#18794E' : '#B42318' }}>
                        {d.contribution_points >= 0 ? '+' : ''}{d.contribution_points.toFixed(1)} pts
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Next Steps */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: '0 0 16px 0' }}>
                  Transparent Recommendations for Score Optimization
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ulasData.next_actions?.slice(0, 4).map((act, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#E6F4F1',
                        borderLeft: '4px solid #0F766E',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        color: '#172B3A'
                      }}
                    >
                      <strong>{act.action}</strong>
                      <span style={{ display: 'block', color: '#5B6B79', marginTop: '2px' }}>
                        Potential Impact: <strong style={{ color: '#0F766E' }}>{act.expected_impact}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Counterfactual Loan Simulator Tool */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #DCE3EA', padding: '24px', boxShadow: '0 2px 6px rgba(23,43,58,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sliders size={20} color="#0F766E" />
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                  Counterfactual Loan Simulator
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#5B6B79', margin: '0 0 20px 0' }}>
                Adjust principal amount and repayment tenure to observe real-time impact on monthly installment (EMI), FOIR ratio, and affordability tier.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                {/* Sliders Control */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      <span>Requested Principal</span>
                      <span style={{ color: '#0F766E' }}>{formatINR(principal)}</span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={2500000}
                      step={50000}
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      style={{ width: '100%', accentColor: '#0F766E' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      <span>Repayment Tenure</span>
                      <span style={{ color: '#0F766E' }}>{tenure} Months ({Math.round(tenure/12)} Years)</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={84}
                      step={6}
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      style={{ width: '100%', accentColor: '#0F766E' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      <span>Indicative Interest Rate</span>
                      <span style={{ color: '#0F766E' }}>{rate}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min={8.0}
                      max={18.0}
                      step={0.25}
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      style={{ width: '100%', accentColor: '#0F766E' }}
                    />
                  </div>
                </div>

                {/* Simulation Output Card */}
                {simulationResult && (
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #DCE3EA', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#748391', textTransform: 'uppercase', fontWeight: '700' }}>
                        Simulated Monthly Commitment
                      </span>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#173B57' }}>
                        {formatINR(simulationResult.simulation?.monthlyEMI)}
                        <span style={{ fontSize: '13px', fontWeight: '400', color: '#5B6B79' }}> / month</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#5B6B79', marginTop: '4px' }}>
                        <span>Total Repayment: <strong>{formatINR(simulationResult.simulation?.totalRepayment)}</strong></span>
                        <span>Total Interest: <strong>{formatINR(simulationResult.simulation?.totalInterest)}</strong></span>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#5B6B79' }}>Affordability Rating:</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', backgroundColor: '#E8F5EE', color: '#18794E' }}>
                        {simulationResult.simulation?.affordabilityStatus || 'Optimal Affordability'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </BorrowerLayout>
  );
}
