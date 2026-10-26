import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Upload,
  Calendar,
  Layers,
  Info,
  DollarSign,
  FileText
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import { useUserPortalState, formatCurrency, formatCurrencyShort, calculateEMI } from './userPortalState';

/**
 * Module 8: Credit Readiness Copilot
 * Actionable recommendations based on financial calculations and missing information.
 * Explains why each recommendation matters, connects to hypothetical simulations,
 * and maintains statutory compliance (no approval guarantee).
 */
export function ReadinessCopilot({ onNavigate }) {
  const {
    state,
    toastMessage,
    showToast,
    updateHypotheticalScenario
  } = useUserPortalState();

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  // Interactive sandbox state for testing multiple recommendations simultaneously
  const [testSeasonalRepayment, setTestSeasonalRepayment] = useState(false);
  const [testUpload1099, setTestUpload1099] = useState(false);
  const [testRightSizedLoan, setTestRightSizedLoan] = useState(false);
  const [testPayoffDebt, setTestPayoffDebt] = useState(false);

  // Base values
  const baseAmount = state.application.requestedAmount;
  const baseTerm = state.application.termMonths;
  const baseApr = state.application.apr;
  const baseEmi = state.application.monthlyPayment;
  const baseSurplus = state.financials.freeRepaymentSurplus;
  const baseDebt = state.financials.monthlyDebtObligations;

  // Compute sandbox outcomes
  const simAmount = testRightSizedLoan ? 18000 : baseAmount;
  const simExtraCapacity = testUpload1099 ? 6500 : 0;
  const simEmiData = calculateEMI(simAmount, baseApr, baseTerm);

  const effectiveSimSurplus = (baseSurplus + (testPayoffDebt ? baseDebt : 0)) - simEmiData.monthlyEmi;
  const deficitMonths = testSeasonalRepayment || testRightSizedLoan ? 0 : (state.financials.isSeasonal ? 3 : 0);
  const totalInterestSaved = (calculateEMI(baseAmount, baseApr, baseTerm).totalInterest - simEmiData.totalInterest) + (testPayoffDebt ? 480 : 0);

  const handleApplyToSimulator = () => {
    updateHypotheticalScenario({
      amount: simAmount,
      termMonths: baseTerm,
      apr: baseApr,
      extraMonthlyIncome: testUpload1099 ? 540 : 0,
      reducedExpense: testPayoffDebt ? baseDebt : 0,
      label: testRightSizedLoan ? 'Right-Sized Loan ($18k)' : 'Copilot Optimized Scenario'
    });
    handleNavigate('loan-simulator');
  };

  return (
    <UserPortalLayout
      activePage="readiness-copilot"
      onNavigate={handleNavigate}
      user={state.user}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Banner */}
        <div className="cl-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Dashboard</span>
                <span>/</span>
                <span style={{ color: '#173B57', fontWeight: '700' }}>Readiness Copilot</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <Sparkles size={22} color="#0F766E" />
                <h1 className="cl-page-title">Credit Readiness Copilot</h1>
              </div>
              <p className="cl-page-subtitle">
                Algorithmic guidance to maximize your repayment resilience, remove documentation bottlenecks, and right-size your loan.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="cl-badge cl-badge-teal" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <ShieldCheck size={14} />
                <span>Explainable Fair AI Engine v4.2</span>
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory & Educational Disclaimer (Prompt Requirement) */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #DCE3EA',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#5B6B79'
          }}
        >
          <Info size={18} color="#173B57" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#172B3A' }}>Important Consumer Disclosure:</strong> CreditLens Copilot provides educational guidance and mathematical simulations based on self-reported and linked accounts. Copilot recommendations do not guarantee loan approval or bind any participating lender.
          </div>
        </div>

        {/* Overview Quad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          <div className="cl-card">
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
              Readiness Score
            </span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F766E', margin: '8px 0 4px' }}>
              88 / 100
            </div>
            <span style={{ fontSize: '12px', color: '#5B6B79' }}>
              High Solvency • Documentation Pending
            </span>
          </div>

          <div className="cl-card">
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
              Current Qualified Capacity
            </span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#172B3A', margin: '8px 0 4px' }}>
              {formatCurrencyShort(state.assessment?.recommendedCapacity || 25000)}
            </div>
            <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>
              +{formatCurrencyShort(6500)} with Schedule C verified
            </span>
          </div>

          <div className="cl-card">
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
              Affordability Risk Factor
            </span>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#925D00', margin: '8px 0 4px' }}>
              {state.financials.isSeasonal ? 'Summer Off-Season Dip' : 'High DTI Concentration'}
            </div>
            <span style={{ fontSize: '12px', color: '#5B6B79' }}>
              {state.financials.isSeasonal ? 'July deficit under flat EMI' : 'Revolving card interest'}
            </span>
          </div>

          <div className="cl-card" style={{ background: '#F1F5F9' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
              Actionable Recommendations
            </span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#173B57', margin: '8px 0 4px' }}>
              3 Key Steps
            </div>
            <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>
              Ready for immediate simulation
            </span>
          </div>
        </div>

        {/* 4 Detailed Actionable Recommendation Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="cl-section-title" style={{ fontSize: '18px' }}>
            Priority Recommendations for Your Profile
          </h2>

          {/* Recommendation 1: Seasonal Structured Repayment */}
          {state.financials.isSeasonal && (
            <div className="cl-card" style={{ borderLeft: '4px solid #0F766E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E6F4F1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#172B3A', margin: 0 }}>
                      1. Adopt Structured Seasonal Step-EMI Repayment
                    </h3>
                    <span style={{ fontSize: '12px', color: '#748391' }}>
                      Category: Loan Structuring • Risk: Seasonal Volatility
                    </span>
                  </div>
                </div>

                <span className="cl-badge cl-badge-teal" style={{ padding: '6px 12px' }}>
                  Eliminates 3 Deficit Months
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
                <strong style={{ color: '#0F766E', display: 'block', marginBottom: '4px' }}>
                  Why This Recommendation Matters:
                </strong>
                Your bakery generates $9,200 in peak December but dips to $2,850 in off-season July. Under a conventional flat EMI of $774/mo, you experience consecutive cash deficits in June (-$680), July (-$730), and August (-$230).
                <br /><br />
                Selecting the <strong>Seasonal Step-EMI Plan</strong> reduces your payments to <strong>$320/mo</strong> during the 4 summer lean months and amortizes the remainder during busy festival months (<strong>$1,150/mo</strong>). Your total interest paid remains identical, but default risk is completely eliminated.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#748391' }}>Financial Impact:</span>
                  <strong style={{ color: '#0F766E' }}>$0 Extra Interest Cost • 100% Solvency Year-Round</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="cl-btn cl-btn-secondary cl-btn-sm"
                    onClick={() => handleNavigate('seasonal-intelligence')}
                  >
                    <span>View Seasonal Curve</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    className="cl-btn cl-btn-primary cl-btn-sm"
                    onClick={() => {
                      setTestSeasonalRepayment(!testSeasonalRepayment);
                      showToast(testSeasonalRepayment ? 'Reset seasonal repayment in sandbox.' : '✓ Applied Seasonal Step-EMI to sandbox below!');
                    }}
                  >
                    {testSeasonalRepayment ? 'Remove from Sandbox' : 'Test in Sandbox'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation 2: Missing Income Records (Schedule C) */}
          <div className="cl-card" style={{ borderLeft: '4px solid #925D00' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFF4D6', color: '#925D00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#172B3A', margin: 0 }}>
                    2. Provide Missing Income Records (Form 1099 / Schedule C)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#748391' }}>
                    Category: Documentation &amp; Evidence • Status: Pending Verification
                  </span>
                </div>
              </div>

              <span className="cl-badge cl-badge-warning" style={{ padding: '6px 12px' }}>
                +$6,500 Borrowing Capacity
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
              <strong style={{ color: '#925D00', display: 'block', marginBottom: '4px' }}>
                Why This Recommendation Matters:
              </strong>
              Lenders require official tax filings to substantiate secondary income streams. Your catering business revenue is currently subject to a 50% underwriting hold until affirmed.
              <br /><br />
              Uploading your signed 2025 Schedule C or Form 1099-NEC validates your total verified revenue and immediately unlocks an additional <strong>+$6,500 in borrowing capacity</strong> while boosting your Solvency Score by <strong>+15 points</strong>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#748391' }}>Financial Impact:</span>
                <strong style={{ color: '#0F766E' }}>+$6,500 Max Loan • +15 Solvency Score</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary cl-btn-sm"
                  onClick={() => handleNavigate('document-evidence')}
                >
                  <Upload size={13} />
                  <span>Go to Evidence Center</span>
                </button>
                <button
                  type="button"
                  className="cl-btn cl-btn-primary cl-btn-sm"
                  onClick={() => {
                    setTestUpload1099(!testUpload1099);
                    showToast(testUpload1099 ? 'Reset document simulation in sandbox.' : '✓ Applied Schedule C capacity gain to sandbox below!');
                  }}
                >
                  {testUpload1099 ? 'Remove from Sandbox' : 'Test in Sandbox'}
                </button>
              </div>
            </div>
          </div>

          {/* Recommendation 3: Explore a Smaller Right-Sized Loan */}
          <div className="cl-card" style={{ borderLeft: '4px solid #173B57' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', color: '#173B57', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#172B3A', margin: 0 }}>
                    3. Explore a Right-Sized Loan Amount ($18,000)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#748391' }}>
                    Category: Debt Sizing • Risk: Cashflow Strain
                  </span>
                </div>
              </div>

              <span className="cl-badge cl-badge-teal" style={{ padding: '6px 12px' }}>
                Saves $1,280 in Interest
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
              <strong style={{ color: '#173B57', display: 'block', marginBottom: '4px' }}>
                Why This Recommendation Matters:
              </strong>
              Borrowing only what is immediately required for bakery capital expenses ($18,000 instead of $25,000) lowers your monthly payment from <strong>$774/mo</strong> to <strong>$557/mo</strong>.
              <br /><br />
              This $217/mo cash relief ensures that even your lowest revenue month (July) maintains a positive buffer, and saves you <strong>$1,280 in total finance charges</strong> over the 3-year term.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#748391' }}>Financial Impact:</span>
                <strong style={{ color: '#0F766E' }}>-$217/mo EMI • $1,280 Interest Savings</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary cl-btn-sm"
                  onClick={() => {
                    updateHypotheticalScenario({
                      amount: 18000,
                      termMonths: baseTerm,
                      apr: baseApr,
                      label: 'Right-Sized Loan ($18,000)'
                    });
                    handleNavigate('loan-simulator');
                  }}
                >
                  <Sliders size={13} />
                  <span>Test in Simulator</span>
                </button>
                <button
                  type="button"
                  className="cl-btn cl-btn-primary cl-btn-sm"
                  onClick={() => {
                    setTestRightSizedLoan(!testRightSizedLoan);
                    showToast(testRightSizedLoan ? 'Reset loan amount in sandbox.' : '✓ Applied $18k Right-Sized Loan to sandbox below!');
                  }}
                >
                  {testRightSizedLoan ? 'Remove from Sandbox' : 'Test in Sandbox'}
                </button>
              </div>
            </div>
          </div>

          {/* Recommendation 4: Review Existing Loan Obligations */}
          <div className="cl-card" style={{ borderLeft: '4px solid #245EA8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', color: '#245EA8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#172B3A', margin: 0 }}>
                    4. Review &amp; Pay Down Existing Equipment Lease ($380/mo)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#748391' }}>
                    Category: Debt Management • Balance: $4,200 remaining
                  </span>
                </div>
              </div>

              <span className="cl-badge cl-badge-neutral" style={{ padding: '6px 12px' }}>
                Cuts DTI to 0.0%
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
              <strong style={{ color: '#245EA8', display: 'block', marginBottom: '4px' }}>
                Why This Recommendation Matters:
              </strong>
              Your Bistro Equipment Finance commercial lease payment ($380/mo) currently consumes 7.8% of your monthly gross revenue.
              <br /><br />
              Paying down this final $4,200 balance frees up $380/mo in cashflow, completely eliminating your pre-existing debt burden and boosting your free monthly cushion to <strong>$1,683/mo</strong>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#748391' }}>Financial Impact:</span>
                <strong style={{ color: '#0F766E' }}>+$380/mo Free Cashflow • Lowers DTI to 0.0%</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-primary cl-btn-sm"
                  onClick={() => {
                    setTestPayoffDebt(!testPayoffDebt);
                    showToast(testPayoffDebt ? 'Reset lease debt in sandbox.' : '✓ Applied debt payoff to sandbox below!');
                  }}
                >
                  {testPayoffDebt ? 'Remove from Sandbox' : 'Test in Sandbox'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive "What-If" Copilot Sandbox */}
        <div className="cl-card" style={{ background: '#173B57', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#99EFE5" />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
                  Combined Copilot Scenario Sandbox
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#C6F0E7', margin: '4px 0 0' }}>
                See how combining these recommendations improves your financial capacity in real time.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="cl-btn cl-btn-sm"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}
                onClick={() => {
                  setTestSeasonalRepayment(false);
                  setTestUpload1099(false);
                  setTestRightSizedLoan(false);
                  setTestPayoffDebt(false);
                  showToast('✓ Cleared all sandbox selections.');
                }}
              >
                Reset Sandbox
              </button>
              <button
                type="button"
                className="cl-btn cl-btn-primary cl-btn-sm"
                onClick={handleApplyToSimulator}
              >
                <span>Launch in Loan Simulator</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Sandbox Toggle Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setTestSeasonalRepayment(!testSeasonalRepayment)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: testSeasonalRepayment ? '#0F766E' : 'rgba(255,255,255,0.25)',
                background: testSeasonalRepayment ? '#0F766E' : 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} color={testSeasonalRepayment ? '#99EFE5' : '#748391'} />
              <span>1. Seasonal Step-EMI</span>
            </button>

            <button
              type="button"
              onClick={() => setTestUpload1099(!testUpload1099)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: testUpload1099 ? '#0F766E' : 'rgba(255,255,255,0.25)',
                background: testUpload1099 ? '#0F766E' : 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} color={testUpload1099 ? '#99EFE5' : '#748391'} />
              <span>2. Upload 1099 (+Capacity)</span>
            </button>

            <button
              type="button"
              onClick={() => setTestRightSizedLoan(!testRightSizedLoan)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: testRightSizedLoan ? '#0F766E' : 'rgba(255,255,255,0.25)',
                background: testRightSizedLoan ? '#0F766E' : 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} color={testRightSizedLoan ? '#99EFE5' : '#748391'} />
              <span>3. Right-Sized Loan ($18k)</span>
            </button>

            <button
              type="button"
              onClick={() => setTestPayoffDebt(!testPayoffDebt)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: testPayoffDebt ? '#0F766E' : 'rgba(255,255,255,0.25)',
                background: testPayoffDebt ? '#0F766E' : 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} color={testPayoffDebt ? '#99EFE5' : '#748391'} />
              <span>4. Pay Off Lease Debt</span>
            </button>
          </div>

          {/* Sandbox Comparative Outcomes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#99EFE5', fontWeight: '700' }}>
                Simulated Monthly Payment
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: '4px 0' }}>
                {formatCurrency(simEmiData.monthlyEmi)}
              </div>
              <span style={{ fontSize: '11px', color: '#C6F0E7' }}>
                Base: {formatCurrency(baseEmi)} ({formatCurrency(baseEmi - simEmiData.monthlyEmi)} savings)
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#99EFE5', fontWeight: '700' }}>
                Cash Cushion Residual
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: effectiveSimSurplus > 500 ? '#99EFE5' : '#FFD280', margin: '4px 0' }}>
                {formatCurrency(effectiveSimSurplus)}/mo
              </div>
              <span style={{ fontSize: '11px', color: '#C6F0E7' }}>
                After simulated obligations
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#99EFE5', fontWeight: '700' }}>
                Deficit Months Risk
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: deficitMonths === 0 ? '#99EFE5' : '#FFD280', margin: '4px 0' }}>
                {deficitMonths === 0 ? '0 Months (Safe!)' : `${deficitMonths} Deficit Months`}
              </div>
              <span style={{ fontSize: '11px', color: '#C6F0E7' }}>
                {deficitMonths === 0 ? 'Cashflow positive all year' : 'Lean summer dip present'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#99EFE5', fontWeight: '700' }}>
                Total Borrowing Capacity
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: '4px 0' }}>
                {formatCurrencyShort(baseAmount + simExtraCapacity)}
              </div>
              <span style={{ fontSize: '11px', color: '#C6F0E7' }}>
                {testUpload1099 ? '+$6,500 unblocked via 1099' : 'Standard qualifying ceiling'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#99EFE5', fontWeight: '700' }}>
                Est. Interest Savings
              </span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: '4px 0' }}>
                {totalInterestSaved > 0 ? formatCurrency(totalInterestSaved) : '$0'}
              </div>
              <span style={{ fontSize: '11px', color: '#C6F0E7' }}>
                Cumulative finance charge savings
              </span>
            </div>
          </div>
        </div>
      </div>
    </UserPortalLayout>
  );
}

export default ReadinessCopilot;
