import { useState, useEffect } from 'react';

// Storage key for client-side persistence of User Portal simulation state
export const BORROWER_STORAGE_KEY = 'creditlens_borrower_state_v6';
const STORAGE_KEY = BORROWER_STORAGE_KEY;

/**
 * 4 Realistic Synthetic Personas
 * Prioritising the Seasonal Small-Business Owner as the main live demonstration workflow.
 */
export const SYNTHETIC_PERSONAS = {
  seasonal_business: {
    id: 'seasonal_business',
    badge: 'Primary Demo Workflow',
    user: {
      id: 'CL-84091',
      name: 'harsh Patil',
      businessName: 'Artisan Oven Bakery & Seasonal Events',
      email: 'rajesh.elena@artisanoven.com',
      phone: '(415) 892-4412',
      tier: 'Tier B-1 Seasonal Prime',
      personaType: 'Small-Business Owner (Seasonal Income)',
      kycVerified: true,
      institutionId: 'Plaid Business ID: biz-us-9841',
      lastSyncTime: '12 minutes ago',
      activeModelVersion: 'CreditLens Fair Solvency Engine v4.2'
    },
    application: {
      id: 'CL-8924',
      dossierProtocol: 'APP-2024-8849E',
      loanPurpose: 'Commercial Bakery Oven & Cold Storage Expansion',
      requestedAmount: 25000,
      termMonths: 36,
      apr: 7.25,
      monthlyPayment: 774.72,
      status: 'Conditional Pre-Approval (Seasonal Review Required)',
      statusBadge: 'Seasonal Review',
      currentStage: 3,
      stages: [
        { id: 1, title: 'Application Submitted', description: 'Business Plaid link authenticated', status: 'completed', completedDate: 'Oct 20' },
        { id: 2, title: 'Explainable AI Audit', description: 'Zero demographic or category bias verified', status: 'completed', completedDate: 'Passed Fair-Check' },
        { id: 3, title: 'Seasonal Affordability Review', description: 'Off-season summer cashflow stress evaluated', status: 'in_progress', actionRequired: true, actionLabel: 'Review Seasonal Structuring' },
        { id: 4, title: 'Final Underwriter Offer', description: 'Flexible seasonal repayment schedule offer', status: 'pending', estimatedTime: 'Estimated 24-48h' }
      ]
    },
    financials: {
      employmentType: 'Small-Business Owner',
      businessCategory: 'Artisan Food & Event Catering',
      annualGrossRevenue: 82400,
      annualNetProfit: 58600,
      monthlyNetIncome: 4883, // Annual average net
      isSeasonal: true,
      seasonalSummary: 'High peak wedding/festival revenue (Oct–Feb); low off-season lean revenue (May–Aug).',
      // Month-by-Month 12-Month Inflows:
      monthlyInflows: [
        { month: 'Jan', label: 'January', inflow: 7600, season: 'peak', note: 'New Year & Wedding Season' },
        { month: 'Feb', label: 'February', inflow: 6800, season: 'peak', note: 'Valentine & Winter Events' },
        { month: 'Mar', label: 'March', inflow: 5200, season: 'shoulder', note: 'Spring Transition' },
        { month: 'Apr', label: 'April', inflow: 4800, season: 'shoulder', note: 'Corporate Catering' },
        { month: 'May', label: 'May', inflow: 3400, season: 'lean', note: 'Early Summer Slowdown' },
        { month: 'Jun', label: 'June', inflow: 2900, season: 'lean', note: 'Deep Off-Season / Monsoon' },
        { month: 'Jul', label: 'July', inflow: 2850, season: 'lean', note: 'Lowest Annual Off-Season' },
        { month: 'Aug', label: 'August', inflow: 3350, season: 'lean', note: 'Late Summer Slump' },
        { month: 'Sep', label: 'September', inflow: 5400, season: 'shoulder', note: 'Autumn Re-opening' },
        { month: 'Oct', label: 'October', inflow: 7900, season: 'peak', note: 'Festival & Wedding Surge' },
        { month: 'Nov', label: 'November', inflow: 9100, season: 'peak', note: 'Peak Holiday Bookings' },
        { month: 'Dec', label: 'December', inflow: 9200, season: 'peak', note: 'Year-End Corporate Galas' }
      ],
      monthlyLivingExpenses: 2100,
      monthlyBusinessExpenses: 1100, // Total base overhead = $3,200/mo
      livingBreakdown: {
        housing: 1400,
        utilities: 350,
        subsistence: 600,
        discretionary: 350,
        businessOverhead: 500
      },
      monthlyDebtObligations: 380, // Equipment lease
      dti: 14.8,
      freeRepaymentSurplus: 1303, // Average monthly surplus
      tradelines: [
        { id: 'tl-1', creditor: 'Bistro Equipment Finance', type: 'Commercial Lease', monthly: 380, balance: 4200, status: '24/24 Clean', isClean: true },
        { id: 'tl-2', creditor: 'Community Business Credit', type: 'Working Capital Card', monthly: 0, balance: 840, limit: 10000, utilization: 8.4, status: 'Optimal (<10%)', isClean: true }
      ],
      onTimeEntriesCount: 36,
      totalEntriesCount: 36,
      delinquenciesCount: 0,
      formalCreditAvailable: true,
      primaryEmployer: {
        company: 'Artisan Oven Bakery & Seasonal Events',
        employer: 'Artisan Oven Bakery & Seasonal Events',
        position: 'Principal Baker & General Manager',
        type: 'Small-Business Owner / Director',
        tenureYears: 4,
        tenureMonths: 6,
        tenure: '4.5 Years Operating',
        grossAnnual: 82400,
        netMonthly: 4883,
        integration: 'Plaid Business Depository + IRS Transcript'
      },
      secondaryIncome: {
        confirmed: false,
        source: 'Event Catering & Festival Retainers',
        statusLabel: 'Pending 1099 Verification',
        declaredMonthly: 1800,
        creditedMonthly: 900
      },
      incomeChangeYoY: '+14.2% YoY',
      stabilityScore: 84,
      incomeConsumedPercent: 39,
      surplusPercentage: 27,
      capacityClass: 'Optimal Seasonal Buffer'
    },
    documents: {
      hasUploaded1099: false,
      readinessPercent: 83,
      milestonesPassed: 5,
      totalMilestones: 6
    },
    telemetryLogs: [
      { id: 'log-1', title: 'Plaid Inflow Synced', amount: '+$7,900.00', description: 'October catering direct deposits confirmed', time: 'Today 08:30 AM', type: 'credit' },
      { id: 'log-2', title: 'Commercial Lease Debit', amount: '-$380.00', description: 'Bistro Equipment Finance recurring cleared', time: 'Yesterday', type: 'debit' },
      { id: 'log-3', title: 'Fair AI Solvency Audit', amount: 'Score 718', description: 'Passed FCRA fair lending compliance with zero bias', time: 'Oct 22', type: 'audit' }
    ],
    assessment: {
      solvencyScore: 718,
      solvencyGrade: 'Seasonal Prime',
      tierRank: 'Tier B-1 Flexible',
      annualAverageSurplus: 1303,
      safeRepaymentCap: 1100,
      leanMonthSurplus: -730, // Deficit under fixed EMI!
      revolvingUtilization: 8.4,
      liquidBufferMonths: 3.1,
      adverseRecords: 0,
      recommendedCapacity: 25000,
      positiveFactors: [
        {
          id: 'pf-1',
          title: 'Strong Annual Net Cashflow',
          scoreBadge: '+38 pts',
          description: 'Generates $58,600 net profit annually with an average monthly free cushion of $1,303 across the full operating year.',
          source: 'Verified Plaid Business Feed',
          metric: '$58,600/yr Net'
        },
        {
          id: 'pf-2',
          title: 'Flawless 3-Year Commercial Payment Record',
          scoreBadge: '+35 pts',
          description: '36 consecutive on-time payments on commercial equipment lease and trade vendor accounts.',
          source: 'Commercial Tradeline Ledger',
          metric: '100% On-Time'
        },
        {
          id: 'pf-3',
          title: 'Low Credit Card Utilization',
          scoreBadge: '+24 pts',
          description: 'Working capital credit card utilization standing at only 8.4% ($840 of $10,000 limit).',
          source: 'Card Statement Bureau',
          metric: '8.4% Utilization'
        }
      ],
      limitingFactors: [
        {
          id: 'lf-1',
          title: 'Severe Seasonal Cashflow Variance',
          impact: 'Cashflow Stress in Off-Season',
          severity: 'warning',
          description: 'Revenue drops from $9,200 in December to $2,850 in July. A flat monthly EMI of $774 creates cash shortfalls in June (-$680), July (-$730), and August (-$230).',
          isActionable: true,
          resolutionText: 'Adopt Structured Seasonal Repayment or build a $2,200 off-season escrow reserve'
        },
        {
          id: 'lf-2',
          title: 'Missing Q3 Schedule C Statement',
          impact: '-$5,000 Capacity Hold',
          severity: 'danger',
          description: 'Unverified cash catering income requires Schedule C tax documentation to count towards base qualifying cashflow.',
          isActionable: true,
          resolutionText: 'Upload most recent Schedule C / 1099 form to verify uncredited revenue'
        }
      ]
    },
    evidence: [
      { id: 'ev-1', name: 'Plaid_12Month_Business_Checking.pdf', type: 'Bank Statement', status: 'verified', verifiedDate: 'Oct 22, 2026', size: '2.4 MB', supports: '12-Month Inflows & Expenses' },
      { id: 'ev-2', name: 'Bistro_Equipment_Lease_Tradeline.pdf', type: 'Loan Agreement', status: 'verified', verifiedDate: 'Oct 20, 2026', size: '1.1 MB', supports: 'Existing Debt: $380/mo' },
      { id: 'ev-3', name: 'Form_1099_ScheduleC_Draft.pdf', type: 'Tax Return', status: 'needs_clarification', verifiedDate: 'Under Review', size: '890 KB', supports: 'Catering Revenue' },
      { id: 'ev-4', name: 'Commercial_Kitchen_Rental_Contract.pdf', type: 'Lease Agreement', status: 'verified', verifiedDate: 'Oct 21, 2026', size: '1.8 MB', supports: 'Fixed Overhead: $1,400/mo' }
    ],
    recommendations: [
      {
        id: 'rec-1',
        title: 'Choose Seasonal Step-EMI Repayment',
        impact: 'Eliminates 3 Deficit Months',
        type: 'loan_structure',
        description: 'Pay $320/mo during off-season (May–Aug) and $1,150/mo during peak festival season (Sep–Apr). Total interest remains identical, but eliminates default risk in summer.',
        actionableType: 'seasonal_plan',
        potentialSavings: '100% Cashflow Positive Year-Round'
      },
      {
        id: 'rec-2',
        title: 'Upload Official 2025 Schedule C Tax Return',
        impact: '+$6,500 Borrowing Capacity',
        type: 'documentation',
        description: 'Submitting signed Schedule C tax returns removes the 50% discount on catering revenue and unlocks additional capacity.',
        actionableType: 'upload_document',
        potentialSavings: '+$6,500'
      },
      {
        id: 'rec-3',
        title: 'Consider a $18,000 Right-Sized Loan',
        impact: 'Reduces Monthly Payment to $557/mo',
        type: 'loan_amount',
        description: 'Right-sizing the loan to $18,000 lowers the monthly payment to $557, ensuring even lean July remains in a safe cash balance.',
        actionableType: 'adjust_amount',
        potentialSavings: 'Saves $1,280 Total Interest'
      }
    ],
    decision: {
      status: 'Conditional Pre-Approval',
      date: 'Oct 24, 2026',
      reviewer: 'Underwriting Algorithm CL-NEO v4.2 & Loan Officer M. Patel',
      rationale: 'Approved for up to $25,000 subject to agreement on a Seasonal Structured Repayment Plan or minimum $2,500 off-season operating cash buffer.',
      conditions: [
        'Agreement to flexible seasonal amortization schedule or summer reserve escrow',
        'Upload of finalized signed 1099 / Schedule C tax statement',
        'Direct debit mandate linked to Plaid business depository'
      ],
      nextSteps: 'Select your preferred repayment schedule in the Seasonal Cashflow tab and submit your confirmation.'
    }
  },

  salaried: {
    id: 'salaried',
    badge: 'Stable Salaried Persona',
    user: {
      id: 'CL-92104',
      name: 'Marcus Chen',
      businessName: 'Apex Cloud Systems Inc.',
      email: 'marcus.chen@apexcloud.io',
      phone: '(415) 701-3829',
      tier: 'Tier A-1 Super Prime',
      personaType: 'Salaried Corporate Professional',
      kycVerified: true,
      institutionId: 'Plaid ID: w2-us-10492',
      lastSyncTime: '5 minutes ago',
      activeModelVersion: 'CreditLens Fair Solvency Engine v4.2'
    },
    application: {
      id: 'CL-7102',
      dossierProtocol: 'APP-2024-9102A',
      loanPurpose: 'Energy Efficient Home Heat Pump & Solar Installation',
      requestedAmount: 20000,
      termMonths: 48,
      apr: 5.99,
      monthlyPayment: 469.64,
      status: 'Pre-Approved Instant Offer',
      statusBadge: 'Pre-Approved',
      currentStage: 4,
      stages: [
        { id: 1, title: 'Application Submitted', description: 'W-2 verified via Workday API', status: 'completed', completedDate: 'Oct 22' },
        { id: 2, title: 'Explainable AI Audit', description: 'Zero bias certified; 99.8% fair index', status: 'completed', completedDate: 'Passed Fair-Check' },
        { id: 3, title: 'Capacity Validation', description: 'Consistent $6,450/mo direct deposits affirmed', status: 'completed', completedDate: 'Verified' },
        { id: 4, title: 'Final Underwriter Offer', description: 'Ready for digital e-signature disbursement', status: 'in_progress', estimatedTime: 'Ready to Sign' }
      ]
    },
    financials: {
      employmentType: 'Full-Time Salaried (W-2)',
      businessCategory: 'Software Engineering',
      annualGrossRevenue: 105000,
      annualNetProfit: 77400,
      monthlyNetIncome: 6450,
      isSeasonal: false,
      seasonalSummary: 'Completely stable bi-weekly direct deposit of $3,225 across all 12 months with zero seasonal volatility.',
      monthlyInflows: Array.from({ length: 12 }).map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        label: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i],
        inflow: 6450,
        season: 'steady',
        note: 'Bi-weekly Direct Deposit'
      })),
      monthlyLivingExpenses: 3450,
      monthlyBusinessExpenses: 0,
      livingBreakdown: { housing: 1950, utilities: 380, subsistence: 720, discretionary: 400 },
      monthlyDebtObligations: 680,
      dti: 10.5,
      freeRepaymentSurplus: 2320,
      tradelines: [
        { id: 'tl-1', creditor: 'Honda Financial Services', type: 'Auto Loan', monthly: 380, balance: 6400, status: '36/36 Clean', isClean: true },
        { id: 'tl-2', creditor: 'Federal Student Direct', type: 'Student Loan', monthly: 300, balance: 11200, status: 'Current', isClean: true }
      ],
      onTimeEntriesCount: 72,
      totalEntriesCount: 72,
      delinquenciesCount: 0,
      formalCreditAvailable: true,
      primaryEmployer: {
        company: 'Apex Cloud Systems Inc.',
        employer: 'Apex Cloud Systems Inc.',
        position: 'Senior Infrastructure Engineer',
        type: 'Full-Time Salaried (W-2)',
        tenureYears: 3,
        tenureMonths: 2,
        tenure: '3.2 Years',
        grossAnnual: 105000,
        netMonthly: 6450,
        integration: 'Workday Direct Payroll Sync'
      },
      secondaryIncome: {
        confirmed: true,
        source: 'Corporate Bonus & Dividends',
        statusLabel: 'Verified W-2/1099',
        declaredMonthly: 0,
        creditedMonthly: 0
      },
      incomeChangeYoY: '+9.5% YoY',
      stabilityScore: 98,
      incomeConsumedPercent: 53,
      surplusPercentage: 36,
      capacityClass: 'Super Prime'
    },
    documents: {
      hasUploaded1099: true,
      readinessPercent: 100,
      milestonesPassed: 6,
      totalMilestones: 6
    },
    telemetryLogs: [
      { id: 'log-1', title: 'Payroll Direct Deposit', amount: '+$3,225.00', description: 'Apex Cloud Systems bi-weekly direct payroll', time: 'Today 09:00 AM', type: 'credit' },
      { id: 'log-2', title: 'Auto Loan Debit', amount: '-$380.00', description: 'Honda Financial Services ACH transfer', time: 'Oct 18', type: 'debit' },
      { id: 'log-3', title: 'Instant Pre-Approval', amount: 'Pre-Approved', description: 'Solvency score 785 verified super-prime', time: 'Oct 23', type: 'audit' }
    ],
    assessment: {
      solvencyScore: 785,
      solvencyGrade: 'Super Prime High',
      tierRank: 'Tier A-1 Prime',
      annualAverageSurplus: 2320,
      leanMonthSurplus: 2320,
      revolvingUtilization: 6.2,
      liquidBufferMonths: 5.4,
      adverseRecords: 0,
      recommendedCapacity: 45000,
      safeRepaymentCap: 1800,
      positiveFactors: [
        { id: 'pf-1', title: 'Unbroken 72-Month On-Time Payments', scoreBadge: '+45 pts', description: 'Zero missed payments across all tracked debt notes and utilities over 6 years.', source: 'Tri-Bureau Metro2', metric: '100% Clean' },
        { id: 'pf-2', title: 'Substantial Cash Cushion ($2,320/mo)', scoreBadge: '+40 pts', description: 'Disposable monthly buffer of $2,320 easily absorbs the $469 proposed payment.', source: 'Plaid Direct Depository', metric: '$2,320 Free/mo' },
        { id: 'pf-3', title: 'Low Debt-to-Income (10.5%)', scoreBadge: '+30 pts', description: 'Well below statutory safety limit of 36.0%.', source: 'DTI Formula', metric: '10.5% DTI' }
      ],
      limitingFactors: [
        { id: 'lf-1', title: 'Tenure Optimization Opportunity', impact: 'Potential $420 Interest Savings', severity: 'neutral', description: 'Selecting a 36-month tenure instead of 48 months saves $420 in interest while staying well within surplus.', isActionable: true, resolutionText: 'Test 36 Mo tenure in simulator' }
      ]
    },
    evidence: [
      { id: 'ev-1', name: 'Workday_Automated_W2_Verification.pdf', type: 'Paystub & W-2', status: 'verified', verifiedDate: 'Oct 22, 2026', size: '1.2 MB', supports: 'W-2 Salary $6,450/mo' },
      { id: 'ev-2', name: 'Plaid_Direct_Deposit_History.pdf', type: 'Bank Statement', status: 'verified', verifiedDate: 'Oct 22, 2026', size: '3.1 MB', supports: 'Cashflow Stability' }
    ],
    recommendations: [
      { id: 'rec-1', title: 'Consider a 36-Month Accelerated Term', impact: 'Saves $420 in Interest', type: 'loan_structure', description: 'Your monthly buffer can effortlessly accommodate the slightly higher $608/mo payment, eliminating debt 1 year earlier.', actionableType: 'adjust_term', potentialSavings: 'Save $420 Interest' }
    ],
    decision: {
      status: 'Instant Offer Approved',
      date: 'Oct 23, 2026',
      reviewer: 'CreditLens Instant Autonomous Engine v4.2',
      rationale: 'Fully approved without exceptions. Extremely low DTI (10.5%) and strong cash surplus ($2,320/mo).',
      conditions: ['Digital e-signature on standard promissory note'],
      nextSteps: 'Click Review Terms to e-sign and schedule ACH transfer.'
    }
  },

  limited_history: {
    id: 'limited_history',
    badge: 'Limited Credit History Persona',
    user: {
      id: 'CL-63910',
      name: 'Priya Sharma',
      businessName: 'Priya Studio — Digital Product Design',
      email: 'priya.sharma@designcraft.io',
      phone: '(415) 441-9021',
      tier: 'Tier B-2 Fair Opportunity',
      personaType: 'Gig Worker / Limited Formal Credit History',
      kycVerified: true,
      institutionId: 'Plaid ID: gig-us-5921',
      lastSyncTime: '22 minutes ago',
      activeModelVersion: 'CreditLens Fair Solvency Engine v4.2'
    },
    application: {
      id: 'CL-5192',
      dossierProtocol: 'APP-2024-5192P',
      loanPurpose: 'Design Workstation & Mobile App Testing Rig',
      requestedAmount: 10000,
      termMonths: 24,
      apr: 8.50,
      monthlyPayment: 454.56,
      status: 'Qualified under Fair Lending Safe Harbor',
      statusBadge: 'Safe Harbor Active',
      currentStage: 3,
      stages: [
        { id: 1, title: 'Application Submitted', description: 'Alternative data integration linked', status: 'completed', completedDate: 'Oct 21' },
        { id: 2, title: 'Statutory Safe Harbor Check', description: 'Absence of credit history protected (0 pts penalty)', status: 'completed', completedDate: 'Protected' },
        { id: 3, title: 'Alternative Verification', description: '24-month rent & utility payment integrity affirmed', status: 'in_progress', actionRequired: false, actionLabel: 'Affirming Rent Ledger' },
        { id: 4, title: 'Final Underwriter Offer', description: 'Fair prime opportunity offer', status: 'pending', estimatedTime: 'Estimated 24h' }
      ]
    },
    financials: {
      employmentType: 'Freelance / Gig Economy',
      businessCategory: 'UI/UX & Product Design',
      annualGrossRevenue: 57600,
      annualNetProfit: 46800,
      monthlyNetIncome: 3900,
      isSeasonal: false,
      seasonalSummary: 'Moderate project-based variation; consistent average monthly client deposits of $3,900.',
      monthlyInflows: [
        { month: 'Jan', label: 'January', inflow: 3800, season: 'steady', note: 'Retainer' },
        { month: 'Feb', label: 'February', inflow: 4100, season: 'steady', note: 'Project milestone' },
        { month: 'Mar', label: 'March', inflow: 3900, season: 'steady', note: 'Retainer' },
        { month: 'Apr', label: 'April', inflow: 4200, season: 'steady', note: 'App delivery' },
        { month: 'May', label: 'May', inflow: 3600, season: 'steady', note: 'Retainer' },
        { month: 'Jun', label: 'June', inflow: 3700, season: 'steady', note: 'Sprint launch' },
        { month: 'Jul', label: 'July', inflow: 3900, season: 'steady', note: 'Retainer' },
        { month: 'Aug', label: 'August', inflow: 4000, season: 'steady', note: 'Contract renewal' },
        { month: 'Sep', label: 'September', inflow: 3900, season: 'steady', note: 'Retainer' },
        { month: 'Oct', label: 'October', inflow: 4300, season: 'steady', note: 'Branding project' },
        { month: 'Nov', label: 'November', inflow: 3800, season: 'steady', note: 'Retainer' },
        { month: 'Dec', label: 'December', inflow: 3600, season: 'steady', note: 'Year-end wrap' }
      ],
      monthlyLivingExpenses: 2450,
      monthlyBusinessExpenses: 350,
      livingBreakdown: { housing: 1450, utilities: 280, subsistence: 520, discretionary: 200 },
      monthlyDebtObligations: 0, // Zero formal credit debts!
      dti: 0.0,
      freeRepaymentSurplus: 1100,
      tradelines: [], // Zero traditional tradelines!
      onTimeEntriesCount: 24, // 24 rent & utility verified payments
      totalEntriesCount: 24,
      delinquenciesCount: 0,
      formalCreditAvailable: false, // Explicitly marked as unavailable
      primaryEmployer: {
        company: 'Priya Studio — Digital Product Design',
        employer: 'Priya Studio — Digital Product Design',
        position: 'Lead UI/UX Consultant',
        type: 'Independent Contractor / Gig Worker',
        tenureYears: 2,
        tenureMonths: 6,
        tenure: '2.5 Years Independent',
        grossAnnual: 57600,
        netMonthly: 3900,
        integration: 'Plaid Business Depository Link'
      },
      secondaryIncome: {
        confirmed: false,
        source: 'Mobile App Asset Royalties',
        statusLabel: 'Self-Reported',
        declaredMonthly: 600,
        creditedMonthly: 300
      },
      incomeChangeYoY: '+18.0% YoY',
      stabilityScore: 78,
      incomeConsumedPercent: 56,
      surplusPercentage: 44,
      capacityClass: 'Safe Harbor Prime'
    },
    documents: {
      hasUploaded1099: false,
      readinessPercent: 85,
      milestonesPassed: 5,
      totalMilestones: 6
    },
    telemetryLogs: [
      { id: 'log-1', title: 'Design Client Retainer', amount: '+$1,850.00', description: 'Wire transfer confirmed from FinTech Client', time: 'Today 11:15 AM', type: 'credit' },
      { id: 'log-2', title: 'Verified Rent Ledger', amount: '24 Months', description: '100% on-time residential lease history affirmed', time: 'Oct 21', type: 'audit' }
    ],
    assessment: {
      solvencyScore: 695,
      solvencyGrade: 'Alternative Verified Opportunity',
      tierRank: 'Tier B-2 Safe Harbor',
      annualAverageSurplus: 1100,
      leanMonthSurplus: 800,
      revolvingUtilization: 0,
      liquidBufferMonths: 3.8,
      adverseRecords: 0,
      recommendedCapacity: 12000,
      safeRepaymentCap: 900,
      positiveFactors: [
        { id: 'pf-1', title: 'ECOA & FCRA Statutory Safe Harbor', scoreBadge: '0 Pts Penalty', description: 'Under fair lending regulations, applicants without formal credit bureau files receive zero negative score deduction.', source: 'Statutory Safe Harbor Compliance', metric: 'Protected Class Safe' },
        { id: 'pf-2', title: '24-Month On-Time Alternative Data', scoreBadge: '+38 pts', description: '24 consecutive verified on-time residential rent ($1,450) and telecom payments via bank feed.', source: 'Rent & Utility Affirmation', metric: '24/24 Verified' },
        { id: 'pf-3', title: 'Zero Existing Debt Obligations', scoreBadge: '+32 pts', description: 'DTI is 0.0%. No auto notes, student loans, or high-interest revolving balances.', source: 'Bank Transaction Reconciliation', metric: '0% Initial DTI' }
      ],
      limitingFactors: [
        { id: 'lf-1', title: 'Thin Client Diversification', impact: '-$2,000 Buffer Hold', severity: 'warning', description: '65% of revenue originates from two primary anchor clients. Providing 6 months of client agreements adds stability.', isActionable: true, resolutionText: 'Upload client service agreements' }
      ]
    },
    evidence: [
      { id: 'ev-1', name: 'Rent_Ledger_24Month_Proof.pdf', type: 'Alternative Credit', status: 'verified', verifiedDate: 'Oct 21, 2026', size: '1.9 MB', supports: '24-Mo On-Time Rent ($1,450/mo)' },
      { id: 'ev-2', name: 'Bank_Statement_Freelance_Inflows.pdf', type: 'Bank Statement', status: 'verified', verifiedDate: 'Oct 21, 2026', size: '2.8 MB', supports: 'Net Income $3,900/mo' }
    ],
    recommendations: [
      { id: 'rec-1', title: 'Upload Active Client Service Master Agreements', impact: 'Adds Stability Score', type: 'documentation', description: 'Proving multi-month client commitments removes concentration haircut and supports your rate tier.', actionableType: 'upload_document', potentialSavings: 'Rate reduction to 7.9%' }
    ],
    decision: {
      status: 'Qualified Under Safe Harbor',
      date: 'Oct 22, 2026',
      reviewer: 'Fair Lending Autonomous Underwriting Protocol',
      rationale: 'Approved for $10,000 workstation loan on alternative payment evidence with zero debt burden.',
      conditions: ['Automated ACH repayment from primary studio account'],
      nextSteps: 'Review your alternative verification report and download your promissory packet.'
    }
  },

  high_debt: {
    id: 'high_debt',
    badge: 'High Debt / Debt Consolidation',
    user: {
      id: 'CL-48190',
      name: 'David Miller',
      businessName: 'Miller Logistics & Field Operations',
      email: 'david.miller@millerlogistics.net',
      phone: '(415) 302-8841',
      tier: 'Tier C-1 High Burden',
      personaType: 'High Existing Debt / Consolidation Candidate',
      kycVerified: true,
      institutionId: 'Plaid ID: debt-us-4819',
      lastSyncTime: '30 minutes ago',
      activeModelVersion: 'CreditLens Fair Solvency Engine v4.2'
    },
    application: {
      id: 'CL-3910',
      dossierProtocol: 'APP-2024-3910D',
      loanPurpose: 'Debt Consolidation & Credit Card Refinance',
      requestedAmount: 30000,
      termMonths: 60,
      apr: 9.80,
      monthlyPayment: 634.35,
      status: 'High DTI Warning (Consolidation Pathway Recommended)',
      statusBadge: 'High DTI Alert',
      currentStage: 3,
      stages: [
        { id: 1, title: 'Application Submitted', description: 'Credit report debt reconciliation', status: 'completed', completedDate: 'Oct 19' },
        { id: 2, title: 'DTI Risk Alert', description: 'Existing debt payments consume 43.6% of income', status: 'completed', completedDate: '43.6% DTI Flagged' },
        { id: 3, title: 'Consolidation Structuring', description: 'Refinancing 4 high-rate credit cards to lower total debt payment', status: 'in_progress', actionRequired: true, actionLabel: 'Debt Consolidation Path' },
        { id: 4, title: 'Final Underwriter Offer', description: 'Disbursement conditional on direct card payoff', status: 'pending', estimatedTime: 'Pending Structuring' }
      ]
    },
    financials: {
      employmentType: 'Operations Supervisor',
      businessCategory: 'Logistics & Supply Chain',
      annualGrossRevenue: 72000,
      annualNetProfit: 55000,
      monthlyNetIncome: 5500,
      isSeasonal: false,
      seasonalSummary: 'Consistent base income, but heavily burdened by $2,400/mo in multi-card revolving debt payments.',
      monthlyInflows: Array.from({ length: 12 }).map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        label: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i],
        inflow: 5500,
        season: 'steady',
        note: 'Salary Deposit'
      })),
      monthlyLivingExpenses: 2600,
      monthlyBusinessExpenses: 0,
      livingBreakdown: { housing: 1500, utilities: 350, subsistence: 550, discretionary: 200 },
      monthlyDebtObligations: 2400, // HIGH DEBT!
      dti: 43.6, // EXCEEDS 36%
      freeRepaymentSurplus: 500, // Very thin cushion!
      tradelines: [
        { id: 'tl-1', creditor: 'Chase Freedom & Sapphire', type: 'Credit Card (22.9% APR)', monthly: 650, balance: 14200, limit: 16000, utilization: 88.7, status: 'High Utilization', isClean: true },
        { id: 'tl-2', creditor: 'Citi Double Cash', type: 'Credit Card (24.4% APR)', monthly: 480, balance: 9800, limit: 11000, utilization: 89.1, status: 'High Utilization', isClean: true },
        { id: 'tl-3', creditor: 'Discover IT Card', type: 'Credit Card (23.9% APR)', monthly: 320, balance: 6000, limit: 7000, utilization: 85.7, status: 'High Utilization', isClean: true },
        { id: 'tl-4', creditor: 'Ford Motor Credit', type: 'Auto Loan Note', monthly: 550, balance: 14200, status: 'Clean Auto', isClean: true },
        { id: 'tl-5', creditor: 'Credit Union Personal Loan', type: 'Unsecured Note', monthly: 400, balance: 4800, status: 'Clean Note', isClean: true }
      ],
      onTimeEntriesCount: 48,
      totalEntriesCount: 48,
      delinquenciesCount: 0,
      formalCreditAvailable: true,
      primaryEmployer: {
        company: 'Miller Logistics & Field Operations',
        employer: 'Miller Logistics & Field Operations',
        position: 'Field Logistics Supervisor',
        type: 'Full-Time Salaried (W-2)',
        tenureYears: 5,
        tenureMonths: 1,
        tenure: '5.1 Years',
        grossAnnual: 72000,
        netMonthly: 5500,
        integration: 'ADP Workforce Sync'
      },
      secondaryIncome: {
        confirmed: false,
        source: 'Weekend Dispatch Retainer',
        statusLabel: 'Self-Reported',
        declaredMonthly: 400,
        creditedMonthly: 200
      },
      incomeChangeYoY: '+4.2% YoY',
      stabilityScore: 82,
      incomeConsumedPercent: 47,
      surplusPercentage: 9,
      capacityClass: 'Restricted / Consolidation Only'
    },
    documents: {
      hasUploaded1099: false,
      readinessPercent: 80,
      milestonesPassed: 4,
      totalMilestones: 6
    },
    telemetryLogs: [
      { id: 'log-1', title: 'Operations Salary Inflow', amount: '+$2,750.00', description: 'Miller Logistics bi-weekly direct deposit', time: 'Today 08:00 AM', type: 'credit' },
      { id: 'log-2', title: 'Revolving Interest Charge', amount: '-$420.00', description: 'Chase & Citi 24.9% APR revolving balances', time: 'Yesterday', type: 'debit' },
      { id: 'log-3', title: 'DTI Alert Triggered', amount: '43.6% DTI', description: 'Exceeds 36.0% statutory threshold; consolidation plan initiated', time: 'Oct 20', type: 'audit' }
    ],
    assessment: {
      solvencyScore: 645,
      solvencyGrade: 'High Debt Concentration',
      tierRank: 'Tier C-1 Consolidation Required',
      annualAverageSurplus: 500,
      leanMonthSurplus: 500,
      revolvingUtilization: 88.2, // Severely high
      liquidBufferMonths: 0.9, // Less than 1 month!
      adverseRecords: 0,
      recommendedCapacity: 30000, // As direct consolidation
      safeRepaymentCap: 800,
      positiveFactors: [
        { id: 'pf-1', title: 'Zero Late Payments Despite High Burden', scoreBadge: '+30 pts', description: 'Maintained 48 on-time payments across all accounts despite heavy debt service load.', source: 'Bureau History', metric: '100% On-Time' },
        { id: 'pf-2', title: 'Steady Base W-2 Salary', scoreBadge: '+25 pts', description: 'Dependable $5,500/mo net income confirmed via direct deposit.', source: 'Depository Sync', metric: '$5,500/mo' }
      ],
      limitingFactors: [
        { id: 'lf-1', title: 'Debt-to-Income (43.6%) Exceeds Safe Ceiling', impact: 'Exceeds 36.0% Maximum', severity: 'danger', description: 'Existing obligations consume 43.6% of income. Adding a new loan without debt payoff will cause cash insolvency.', isActionable: true, resolutionText: 'Require direct creditor payoff of high-rate cards' },
        { id: 'lf-2', title: 'Extreme Revolving Utilization (88.2%)', impact: '-65 pts Score Drag', severity: 'danger', description: '$30,000 in credit card balances across 3 cards carrying average 23.5% APR.', isActionable: true, resolutionText: 'Consolidate to 9.8% single loan note' }
      ]
    },
    evidence: [
      { id: 'ev-1', name: 'Equifax_TriBureau_Tradeline_Report.pdf', type: 'Credit Report', status: 'verified', verifiedDate: 'Oct 19, 2026', size: '3.4 MB', supports: '5 Tradelines ($30,000 cards)' },
      { id: 'ev-2', name: 'Logistics_Operations_Paystub.pdf', type: 'Paystub', status: 'verified', verifiedDate: 'Oct 19, 2026', size: '1.4 MB', supports: 'Net Income $5,500/mo' }
    ],
    recommendations: [
      {
        id: 'rec-1',
        title: 'Execute Direct Card Consolidation',
        impact: 'Saves $815/mo in Cashflow & Lowers DTI to 28.5%',
        type: 'consolidation',
        description: 'Using the $30,000 loan to pay off Chase, Citi, and Discover directly eliminates $1,450/mo in card payments and replaces them with a single $634/mo loan note. Your net monthly surplus jumps from $500 to $1,315/mo!',
        actionableType: 'consolidate_debts',
        potentialSavings: '+$815/mo Free Cashflow'
      }
    ],
    decision: {
      status: 'Conditional Direct-Payoff Approval',
      date: 'Oct 20, 2026',
      reviewer: 'CreditLens Debt Consolidation Underwriting Committee',
      rationale: 'Approved for $30,000 on the mandatory condition that proceeds are disbursed directly to Chase ($14.2k), Citi ($9.8k), and Discover ($6.0k) to reduce borrower monthly debt obligations.',
      conditions: [
        'Mandatory direct-to-creditor electronic disbursement',
        'Closure or limit reduction of refinanced revolving lines',
        'Signed consolidation agreement'
      ],
      nextSteps: 'Verify your credit card account numbers for direct payoff disbursement.'
    }
  }
};

/**
 * Standard reducing balance EMI calculation:
 * EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 * Correctly handles:
 * - Zero interest loans (rate = 0): EMI = P / n
 * - Zero principal: EMI = 0
 * - Optional prepayments
 */
export function calculateEMI(principal, annualRatePct, tenureMonths, monthlyPrepayment = 0) {
  const p = Math.max(0, Number(principal) || 0);
  const n = Math.max(1, Number(tenureMonths) || 12);
  const rate = Math.max(0, Number(annualRatePct) || 0);
  const prepay = Math.max(0, Number(monthlyPrepayment) || 0);

  if (p === 0) {
    return {
      monthlyEmi: 0,
      totalPayment: 0,
      totalInterest: 0,
      totalMonths: n,
      effectiveMonthlyPayment: 0,
      principal: 0
    };
  }

  let monthlyEmi = 0;
  if (rate === 0) {
    // Zero-interest loan calculation
    monthlyEmi = p / n;
  } else {
    const monthlyRate = (rate / 100) / 12;
    const factor = Math.pow(1 + monthlyRate, n);
    monthlyEmi = (p * monthlyRate * factor) / (factor - 1);
  }

  monthlyEmi = Math.round(monthlyEmi * 100) / 100;
  const effectiveMonthly = monthlyEmi + prepay;

  let remainingBalance = p;
  let totalInterest = 0;
  let monthsCount = 0;
  const monthlyRate = (rate / 100) / 12;

  for (let m = 1; m <= n && remainingBalance > 0; m++) {
    const interestPart = rate === 0 ? 0 : remainingBalance * monthlyRate;
    let principalPart = effectiveMonthly - interestPart;
    if (principalPart > remainingBalance) {
      principalPart = remainingBalance;
    }
    totalInterest += interestPart;
    remainingBalance -= principalPart;
    monthsCount = m;
  }

  totalInterest = Math.round(totalInterest * 100) / 100;
  const totalPayment = Math.round((p + totalInterest) * 100) / 100;

  return {
    monthlyEmi,
    effectiveMonthlyPayment: effectiveMonthly,
    totalPayment,
    totalInterest,
    totalMonths: monthsCount,
    principal: p
  };
}

/**
 * Calculates month-by-month cashflow affordability across 12 calendar months.
 * Flags months where the proposed EMI causes a cashflow shortage/deficit.
 */
export function calculateSeasonalAffordability(monthlyInflows, baseExpenses, monthlyDebt, emi) {
  const exp = Number(baseExpenses) || 0;
  const debt = Number(monthlyDebt) || 0;
  const loanEmi = Number(emi) || 0;

  let totalInflow = 0;
  let deficitMonthsCount = 0;
  let worstDeficit = 0;
  let totalRemainingSurplus = 0;

  const monthRows = (monthlyInflows || []).map((m) => {
    const inflow = Number(m.inflow) || 0;
    totalInflow += inflow;
    const totalOutflowBeforeLoan = exp + debt;
    const surplusBeforeLoan = inflow - totalOutflowBeforeLoan;
    const remainingCash = surplusBeforeLoan - loanEmi;
    const isDeficit = remainingCash < 0;

    if (isDeficit) {
      deficitMonthsCount++;
      const deficitAmt = Math.abs(remainingCash);
      if (deficitAmt > worstDeficit) worstDeficit = deficitAmt;
    }
    totalRemainingSurplus += remainingCash;

    return {
      month: m.month,
      label: m.label || m.month,
      inflow,
      season: m.season || 'steady',
      note: m.note || '',
      baseExpenses: exp,
      monthlyDebt: debt,
      surplusBeforeLoan,
      proposedEmi: loanEmi,
      remainingCash,
      isDeficit,
      deficitAmount: isDeficit ? Math.abs(remainingCash) : 0
    };
  });

  const avgMonthlyInflow = Math.round(totalInflow / 12);
  const avgMonthlySurplusBefore = avgMonthlyInflow - (exp + debt);
  const avgRemainingCash = avgMonthlySurplusBefore - loanEmi;

  return {
    monthRows,
    avgMonthlyInflow,
    avgMonthlySurplusBefore,
    avgRemainingCash,
    deficitMonthsCount,
    hasDeficit: deficitMonthsCount > 0,
    worstDeficit,
    totalAnnualRemainingSurplus: totalRemainingSurplus
  };
}

/**
 * Calculates an alternative structured seasonal repayment plan
 * E.g., Lower payments in 4 lean months, higher in 8 peak months.
 */
export function calculateSeasonalFlexibleSchedule(amount, apr, tenureMonths, monthlyInflows, baseExpenses, monthlyDebt) {
  const standard = calculateEMI(amount, apr, tenureMonths);
  const baseEmi = standard.monthlyEmi;

  // 4 lean months: May, Jun, Jul, Aug pay 40% of standard EMI
  const leanMonthlyEmi = Math.round((baseEmi * 0.42) * 100) / 100;
  // 8 peak/shoulder months pay remaining amortized obligation
  const annualTotalRequired = baseEmi * 12;
  const leanAnnualSum = leanMonthlyEmi * 4;
  const peakMonthlyEmi = Math.round(((annualTotalRequired - leanAnnualSum) / 8) * 100) / 100;

  const exp = Number(baseExpenses) || 0;
  const debt = Number(monthlyDebt) || 0;

  let deficitMonthsWithFlexible = 0;
  const flexibleRows = (monthlyInflows || []).map((m) => {
    const isLean = ['May', 'Jun', 'Jul', 'Aug'].includes(m.month);
    const scheduledPayment = isLean ? leanMonthlyEmi : peakMonthlyEmi;
    const surplusBefore = m.inflow - (exp + debt);
    const remaining = surplusBefore - scheduledPayment;
    if (remaining < 0) deficitMonthsWithFlexible++;

    return {
      month: m.month,
      label: m.label || m.month,
      inflow: m.inflow,
      isLean,
      scheduledPayment,
      remainingCash: remaining,
      isDeficit: remaining < 0
    };
  });

  return {
    standardEmi: baseEmi,
    leanMonthlyEmi,
    peakMonthlyEmi,
    flexibleRows,
    deficitMonthsCount: deficitMonthsWithFlexible,
    isSafeYearRound: deficitMonthsWithFlexible === 0
  };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
}

export function formatCurrencyShort(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

/**
 * Central State Hook for Borrower Portal
 */
export function useUserPortalState() {
  const [activePersonaId, setActivePersonaId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.activePersonaId && SYNTHETIC_PERSONAS[parsed.activePersonaId]) {
          return parsed.activePersonaId;
        }
      }
    } catch {
      // fallback
    }
    return 'seasonal_business'; // Primary demonstration persona
  });

  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.data) {
          const personaKey = parsed.activePersonaId || 'seasonal_business';
          const baseline = SYNTHETIC_PERSONAS[personaKey] || SYNTHETIC_PERSONAS.seasonal_business;
          return {
            ...baseline,
            ...parsed.data,
            user: { ...baseline.user, ...(parsed.data.user || {}) },
            application: { ...baseline.application, ...(parsed.data.application || {}) },
            financials: {
              ...baseline.financials,
              ...(parsed.data.financials || {}),
              primaryEmployer: {
                ...baseline.financials?.primaryEmployer,
                ...(parsed.data.financials?.primaryEmployer || {})
              },
              secondaryIncome: {
                ...baseline.financials?.secondaryIncome,
                ...(parsed.data.financials?.secondaryIncome || {})
              },
              livingBreakdown: {
                ...baseline.financials?.livingBreakdown,
                ...(parsed.data.financials?.livingBreakdown || {})
              }
            },
            documents: {
              ...baseline.documents,
              ...(parsed.data.documents || {})
            },
            assessment: {
              ...baseline.assessment,
              ...(parsed.data.assessment || {})
            }
          };
        }
      }
    } catch {
      // fallback
    }
    return SYNTHETIC_PERSONAS.seasonal_business;
  });

  const [hypotheticalScenario, setHypotheticalScenario] = useState({
    amount: 18000,
    termMonths: 36,
    apr: 7.25,
    extraMonthlyIncome: 0,
    reducedExpense: 0,
    active: false,
    label: 'Hypothetical Right-Sized Loan'
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activePersonaId, data: state }));
    } catch {
      // ignore
    }
  }, [activePersonaId, state]);

  const showToast = (msg, duration = 3000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  const switchPersona = (personaId) => {
    if (SYNTHETIC_PERSONAS[personaId]) {
      setActivePersonaId(personaId);
      setState(SYNTHETIC_PERSONAS[personaId]);
      showToast(`✓ Switched to: ${SYNTHETIC_PERSONAS[personaId].user.personaType}`);
    }
  };

  const uploadEvidenceDocument = (newDoc) => {
    const docEntry = {
      id: `ev-${Date.now()}`,
      name: newDoc.name || 'Financial_Evidence_Document.pdf',
      type: newDoc.type || 'Supplementary Tax Record',
      status: 'verified',
      verifiedDate: 'Just now (Simulated Verification)',
      size: newDoc.size || '1.4 MB',
      supports: newDoc.supports || 'Verified Secondary Income'
    };

    setState((prev) => {
      const updatedEvidence = [docEntry, ...prev.evidence];
      return {
        ...prev,
        evidence: updatedEvidence,
        documents: {
          ...prev.documents,
          hasUploaded1099: true,
          readinessPercent: 100,
          milestonesPassed: Math.min(prev.documents?.totalMilestones || 6, (prev.documents?.milestonesPassed || 5) + 1)
        },
        assessment: {
          ...prev.assessment,
          solvencyScore: Math.min(850, prev.assessment.solvencyScore + 15),
          recommendedCapacity: prev.assessment.recommendedCapacity + 6500,
          limitingFactors: prev.assessment.limitingFactors.map((lf) =>
            lf.id === 'lf-2' ? { ...lf, severity: 'success', impact: 'Verified Document Affirmed', resolutionText: 'Document verified' } : lf
          )
        }
      };
    });

    showToast('✓ Document uploaded & verified in local simulation (+15 score points, +$6,500 capacity)!');
  };

  const upload1099Document = (fileName) => {
    uploadEvidenceDocument({
      name: fileName || '1099_NEC_ScheduleC_Verified.pdf',
      type: 'Tax Return (Schedule C / 1099-NEC)',
      supports: 'Secondary Self-Employed Catering Revenue'
    });
  };

  const submitClarification = (docId, clarificationText) => {
    setState((prev) => ({
      ...prev,
      evidence: prev.evidence.map((ev) =>
        ev.id === docId ? { ...ev, status: 'under_review', clarificationNote: clarificationText } : ev
      )
    }));
    showToast('✓ Clarification note recorded and submitted for reviewer inspection.');
  };

  const updateHypotheticalScenario = (updates) => {
    setHypotheticalScenario((prev) => ({
      ...prev,
      ...updates,
      active: true
    }));
    showToast('✓ Hypothetical scenario updated. Comparison view refreshed.');
  };

  const clearHypotheticalScenario = () => {
    setHypotheticalScenario({
      amount: state.application.requestedAmount,
      termMonths: state.application.termMonths,
      apr: state.application.apr,
      extraMonthlyIncome: 0,
      reducedExpense: 0,
      active: false,
      label: 'Default Baseline'
    });
    showToast('✓ Reset hypothetical scenario to actual application baseline.');
  };

  const submitLoanApplication = (formData) => {
    const emiDetails = calculateEMI(formData.requestedAmount, formData.apr || state.application.apr, formData.termMonths);
    const newAppId = `CL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDossier = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}E`;

    setState((prev) => ({
      ...prev,
      application: {
        id: newAppId,
        dossierProtocol: newDossier,
        loanPurpose: formData.loanPurpose,
        requestedAmount: Number(formData.requestedAmount),
        termMonths: Number(formData.termMonths),
        apr: Number(formData.apr || state.application.apr),
        monthlyPayment: emiDetails.monthlyEmi,
        status: 'Under Review',
        statusBadge: 'Submitted',
        currentStage: 2,
        stages: [
          { id: 1, title: 'Application Submitted', description: 'Borrower parameters confirmed', status: 'completed', completedDate: 'Today' },
          { id: 2, title: 'Explainable AI Audit', description: 'Statutory anti-bias evaluation', status: 'in_progress', completedDate: 'Running' },
          { id: 3, title: 'Cashflow Affordability Review', description: 'Month-by-month sustainability check', status: 'pending' },
          { id: 4, title: 'Underwriter Final Offer', description: 'Offer generation', status: 'pending' }
        ]
      }
    }));

    showToast(`✓ Loan application #${newDossier} submitted successfully!`);
  };

  const syncBankData = () => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        lastSyncTime: 'Just now'
      }
    }));
    showToast('✓ Bank feeds resynchronized via simulated Plaid link.');
  };

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActivePersonaId('seasonal_business');
    setState(SYNTHETIC_PERSONAS.seasonal_business);
    showToast('✓ Reset all data to baseline seasonal small-business owner demonstration.');
  };

  return {
    state,
    setState,
    activePersonaId,
    switchPersona,
    personas: SYNTHETIC_PERSONAS,
    hypotheticalScenario,
    updateHypotheticalScenario,
    clearHypotheticalScenario,
    toastMessage,
    showToast,
    uploadEvidenceDocument,
    upload1099Document,
    submitClarification,
    submitLoanApplication,
    syncBankData,
    resetToDefault
  };
}
