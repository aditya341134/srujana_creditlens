import React, { useState } from 'react';
import {
  Calculator,
  Sliders,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Copy,
  Check
} from 'lucide-react';
import BankerLayout from '../../components/layout/BankerLayout';

export function calculateEMI(principal, annualRate, tenureMonths) {
  const p = Number(principal) || 0;
  const rate = Number(annualRate) || 0;
  const n = Number(tenureMonths) || 1;

  if (p <= 0 || n <= 0) return { emi: 0, totalRepayment: 0, totalInterest: 0 };
  if (rate <= 0) {
    const emi = Math.round(p / n);
    return { emi, totalRepayment: p, totalInterest: 0 };
  }

  const monthlyRate = (rate / 100) / 12;
  const factor = Math.pow(1 + monthlyRate, n);
  const emi = Math.round(p * monthlyRate * factor / (factor - 1));
  const totalRepayment = emi * n;
  const totalInterest = totalRepayment - p;
  return { emi, totalRepayment, totalInterest };
}

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export default function LoanSimulator() {
  const [principal, setPrincipal] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [monthlyIncome, setMonthlyIncome] = useState(85000);
  const [existingEmi, setExistingEmi] = useState(12000);
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  // Calculations
  const { emi, totalRepayment, totalInterest } = calculateEMI(principal, interestRate, tenureMonths);
  const totalMonthlyDebt = Number(existingEmi) + emi;
  const dti = Number(monthlyIncome) > 0 ? Math.round((totalMonthlyDebt / Number(monthlyIncome)) * 1000) / 10 : 0;
  const netSurplus = Math.round(Number(monthlyIncome) * 0.65) - Number(existingEmi) - emi;
  const dscr = emi > 0 ? Math.round(((Math.round(Number(monthlyIncome) * 0.65) - Number(existingEmi)) / emi) * 100) / 100 : 1.5;

  const isDtiOptimal = dti <= 40;
  const isDtiCaution = dti > 40 && dti <= 50;

  // Sensitivity Stress-Testing (+1% and +2% Rate Hikes)
  const stress1 = calculateEMI(principal, interestRate + 1.0, tenureMonths);
  const stress1Dti = Number(monthlyIncome) > 0 ? Math.round(((Number(existingEmi) + stress1.emi) / Number(monthlyIncome)) * 1000) / 10 : 0;

  const stress2 = calculateEMI(principal, interestRate + 2.0, tenureMonths);
  const stress2Dti = Number(monthlyIncome) > 0 ? Math.round(((Number(existingEmi) + stress2.emi) / Number(monthlyIncome)) * 1000) / 10 : 0;

  // Generate Year-by-Year Amortization Schedule
  const generateAmortization = () => {
    const rows = [];
    let balance = Number(principal);
    const monthlyRate = (Number(interestRate) / 100) / 12;
    const numYears = Math.ceil(Number(tenureMonths) / 12);

    for (let y = 1; y <= numYears; y++) {
      let yearInterest = 0;
      let yearPrincipal = 0;
      const monthsInYear = Math.min(12, Number(tenureMonths) - (y - 1) * 12);

      for (let m = 1; m <= monthsInYear; m++) {
        if (balance <= 0) break;
        const interestMonth = balance * monthlyRate;
        const principalMonth = Math.min(balance, emi - interestMonth);
        yearInterest += interestMonth;
        yearPrincipal += principalMonth;
        balance -= principalMonth;
      }

      rows.push({
        year: `Year ${y}`,
        principalPaid: Math.round(yearPrincipal),
        interestPaid: Math.round(yearInterest),
        remainingBalance: Math.max(0, Math.round(balance))
      });
    }
    return rows;
  };

  const amortization = generateAmortization();

  const handleCopySchedule = () => {
    const text = `Loan Underwriting Schedule:
Principal: INR ${principal.toLocaleString('en-IN')}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenureMonths} Months
Monthly EMI: INR ${emi.toLocaleString('en-IN')}
Total Repayment: INR ${totalRepayment.toLocaleString('en-IN')}
Resulting DTI: ${dti}%`;
    navigator.clipboard.writeText(text);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2000);
  };

  return (
    <BankerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header Breadcrumb */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Banker Portal</span>
            <span>/</span>
            <span style={{ color: '#173B57', fontWeight: '700' }}>Underwriting Tools</span>
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
            Loan Underwriting &amp; Affordability Simulator
          </h1>
          <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
            Calibrate debt-service affordability, stress-test interest rate fluctuations, and evaluate DTI impact against banking benchmarks.
          </p>
        </div>

        {/* 2-Column Calculator Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 460px) 1fr',
            gap: '24px',
            alignItems: 'start'
          }}
          className="cl-simulator-grid"
        >
          {/* Left Column: Input Sliders & Financials */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DCE3EA',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ borderBottom: '1px solid #F0F4F8', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                Loan Parameters
              </h2>
            </div>

            {/* Principal Input & Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>Loan Amount (₹)</label>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F766E' }}>{formatINR(principal)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="10000000"
                step="25000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8C9BA8', marginTop: '4px' }}>
                <span>₹50,000</span>
                <span>₹50,00,000</span>
                <span>₹1,00,00,000</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>Annual Interest Rate (%)</label>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#173B57' }}>{interestRate}% p.a.</span>
              </div>
              <input
                type="range"
                min="6.0"
                max="22.0"
                step="0.25"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8C9BA8', marginTop: '4px' }}>
                <span>6.0% (Prime Secure)</span>
                <span>10.5% (Standard)</span>
                <span>22.0% (Unsecured)</span>
              </div>
            </div>

            {/* Tenure Months */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>Tenure (Months)</label>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#173B57' }}>{tenureMonths} Months ({Math.round((tenureMonths / 12) * 10) / 10} Yrs)</span>
              </div>
              <input
                type="range"
                min="6"
                max="120"
                step="6"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8C9BA8', marginTop: '4px' }}>
                <span>6m</span>
                <span>36m (3 Yrs)</span>
                <span>60m (5 Yrs)</span>
                <span>120m (10 Yrs)</span>
              </div>
            </div>

            {/* Borrower Financial Inflow Context */}
            <div style={{ borderTop: '1px solid #F0F4F8', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#173B57', marginBottom: '12px' }}>
                Affordability &amp; Inflow Inputs
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5B6B79', marginBottom: '4px' }}>
                    Gross Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #DCE3EA',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      color: '#172B3A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#5B6B79', marginBottom: '4px' }}>
                    Existing Monthly Debt Payments (₹)
                  </label>
                  <input
                    type="number"
                    value={existingEmi}
                    onChange={(e) => setExistingEmi(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #DCE3EA',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      color: '#172B3A'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calculated Results & Stress Testing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Primary KPI Results Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #DCE3EA',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Underwriting Calculation Results
                </span>
                <button
                  type="button"
                  onClick={handleCopySchedule}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    backgroundColor: '#F6F8FB',
                    border: '1px solid #DCE3EA',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#173B57',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {copiedSchedule ? <Check size={13} color="#18794E" /> : <Copy size={13} />}
                  <span>{copiedSchedule ? 'Copied' : 'Copy Schedule'}</span>
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}
              >
                {/* EMI */}
                <div style={{ backgroundColor: '#E6F4F1', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>Monthly Installment (EMI)</div>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F766E', marginTop: '4px' }}>
                    {formatINR(emi)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0F766E', marginTop: '2px' }}>
                    Standard reducing balance
                  </div>
                </div>

                {/* Total Interest */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#5B6B79', fontWeight: '600' }}>Total Interest Payable</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#173B57', marginTop: '4px' }}>
                    {formatINR(totalInterest)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                    Across {tenureMonths} months
                  </div>
                </div>

                {/* Total Repayment */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#5B6B79', fontWeight: '600' }}>Total Repayment Outflow</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#173B57', marginTop: '4px' }}>
                    {formatINR(totalRepayment)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                    Principal + Interest
                  </div>
                </div>

                {/* Resulting DTI */}
                <div
                  style={{
                    backgroundColor: isDtiOptimal ? '#E8F5EE' : isDtiCaution ? '#FFF4D6' : '#FEF3F2',
                    borderRadius: '10px',
                    padding: '16px',
                    border: `1px solid ${isDtiOptimal ? '#A6F4C5' : isDtiCaution ? '#FEDF89' : '#FECDCA'}`
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '600', color: isDtiOptimal ? '#18794E' : isDtiCaution ? '#B54708' : '#B42318' }}>
                    Resulting DTI (FOIR)
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: isDtiOptimal ? '#18794E' : isDtiCaution ? '#B54708' : '#B42318', marginTop: '4px' }}>
                    {dti}%
                  </div>
                  <div style={{ fontSize: '11px', color: isDtiOptimal ? '#18794E' : isDtiCaution ? '#B54708' : '#B42318', marginTop: '2px' }}>
                    {isDtiOptimal ? 'Optimal & Safe' : isDtiCaution ? 'Moderate Burden' : 'Exceeds 50% Cap'}
                  </div>
                </div>
              </div>

              {/* Stress-Testing Matrix */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#173B57', margin: '0 0 10px 0' }}>
                  Interest Rate Sensitivity Stress-Test (+1% and +2% Rate Shocks):
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#5B6B79' }}>Stress +1.0% Rate Hike ({interestRate + 1.0}%)</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57', marginTop: '3px' }}>
                      EMI: {formatINR(stress1.emi)}
                    </div>
                    <div style={{ fontSize: '11px', color: stress1Dti <= 50 ? '#18794E' : '#B42318', marginTop: '2px' }}>
                      Stressed DTI: {stress1Dti}%
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#5B6B79' }}>Stress +2.0% Rate Hike ({interestRate + 2.0}%)</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#173B57', marginTop: '3px' }}>
                      EMI: {formatINR(stress2.emi)}
                    </div>
                    <div style={{ fontSize: '11px', color: stress2Dti <= 50 ? '#18794E' : '#B42318', marginTop: '2px' }}>
                      Stressed DTI: {stress2Dti}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Annual Amortization Breakdown Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #DCE3EA',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#173B57', margin: '0 0 14px 0' }}>
                Annual Amortization Schedule
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#5B6B79' }}>
                      <th style={{ padding: '8px 12px' }}>Period</th>
                      <th style={{ padding: '8px 12px' }}>Principal Repaid</th>
                      <th style={{ padding: '8px 12px' }}>Interest Outflow</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortization.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F0F4F8' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '600', color: '#173B57' }}>{row.year}</td>
                        <td style={{ padding: '10px 12px', color: '#0F766E', fontWeight: '600' }}>{formatINR(row.principalPaid)}</td>
                        <td style={{ padding: '10px 12px', color: '#5B6B79' }}>{formatINR(row.interestPaid)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#173B57' }}>
                          {formatINR(row.remainingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BankerLayout>
  );
}
