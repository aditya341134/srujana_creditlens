/**
 * Financial Calculation Utilities for CreditLens Banker Portal
 * Implements standard banking reducing-balance EMI formulas and ratio metrics.
 * Currency format: Indian Rupee (INR ₹)
 */

/**
 * Standard fixed-rate reducing-balance EMI formula:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 *
 * @param {number} principal - Loan amount in INR
 * @param {number} annualRatePct - Annual interest rate percentage (e.g. 10.5)
 * @param {number} tenureMonths - Loan tenure in months (e.g. 36)
 * @returns {number} Monthly EMI rounded to nearest integer
 */
export function calculateEMI(principal, annualRatePct, tenureMonths) {
  const P = Number(principal);
  const n = Number(tenureMonths);
  const annualRate = Number(annualRatePct);

  if (!P || P <= 0 || !n || n <= 0) return 0;

  // Handle zero interest loan separately
  if (!annualRate || annualRate <= 0) {
    return Math.round(P / n);
  }

  const r = annualRate / 12 / 100; // Monthly interest rate
  const factor = Math.pow(1 + r, n);
  const emi = (P * r * factor) / (factor - 1);

  return Math.round(emi);
}

/**
 * Calculate total repayment amount over loan tenure
 */
export function calculateTotalRepayment(emi, tenureMonths) {
  const monthly = Number(emi) || 0;
  const n = Number(tenureMonths) || 0;
  return Math.round(monthly * n);
}

/**
 * Calculate total interest payable over tenure
 */
export function calculateTotalInterest(totalRepayment, principal) {
  const total = Number(totalRepayment) || 0;
  const P = Number(principal) || 0;
  return Math.max(0, Math.round(total - P));
}

/**
 * Calculate Debt-to-Income (DTI) ratio
 * Total monthly debt / gross monthly income * 100
 */
export function calculateDTI(totalMonthlyDebt, grossMonthlyIncome) {
  const income = Number(grossMonthlyIncome) || 0;
  const debt = Number(totalMonthlyDebt) || 0;
  if (income <= 0) return 0;
  return Number(((debt / income) * 100).toFixed(1));
}

/**
 * Calculate Debt Service Coverage Ratio (DSCR)
 * Net monthly discretionary inflow / total monthly debt service
 */
export function calculateDSCR(netMonthlyDiscretionary, monthlyDebtService) {
  const debt = Number(monthlyDebtService) || 0;
  const surplus = Number(netMonthlyDiscretionary) || 0;
  if (debt <= 0) return surplus > 0 ? 5.0 : 0;
  return Number((surplus / debt).toFixed(2));
}

/**
 * Calculate estimated monthly surplus after proposed EMI
 */
export function calculateRemainingSurplus(netMonthlyInflow, livingExpenses, existingDebt, proposedEMI) {
  const inflow = Number(netMonthlyInflow) || 0;
  const expenses = Number(livingExpenses) || 0;
  const debt = Number(existingDebt) || 0;
  const emi = Number(proposedEMI) || 0;
  return Math.round(inflow - expenses - debt - emi);
}

/**
 * Format currency in Indian Rupees (INR ₹)
 */
export function formatCurrencyINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
