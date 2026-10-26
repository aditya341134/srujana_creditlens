import React, { useState } from 'react';
import { colors, radii } from './bankerTheme';
import { IconChevronRight } from './BankerIcons';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'How does CreditLens guarantee transparent, explainable creditworthiness assessment?',
      a: 'CreditLens breaks credit evaluation into four strictly independent dimensions: Repayment Capacity, Financial Risk Indicators, Evidence Completeness, and Assessment Uncertainty. Rather than computing an opaque unified credit score, every finding details its exact mathematical input values, applied formula, calculated result, and underlying assumptions.',
    },
    {
      q: 'Which formula governs the interactive Loan Simulator and cashflow calculations?',
      a: 'All EMI and repayment metrics use the standard fixed-rate reducing-balance formula: EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ − 1), where P is principal, r is the monthly interest rate, and n is the tenure in months. Total repayment, interest overhead, and net remaining discretionary surplus are derived in real time without approximations.',
    },
    {
      q: 'Why are thin credit bureau files not penalized under fair lending rules?',
      a: 'In accordance with Fair Lending and financial inclusion principles, an absence of extensive traditional credit bureau tradelines is mapped strictly to "Assessment Uncertainty" rather than penalized as delinquency or bad faith repayment behavior.',
    },
    {
      q: 'How does the platform handle discrepancies between self-reported income and bank statements?',
      a: 'When declared income exceeds evidence-supported deposits, CreditLens initiates an underwriter clarification workflow instead of issuing automatic fraud accusations. This accommodates seasonal business revenue, quarterly bonuses, and supplementary cash credits while ensuring auditable documentation.',
    },
    {
      q: 'What is the role of the authorized credit officer in the decision workflow?',
      a: 'Automated statistical evaluations provide advisory attribution only. Final underwriting determinations (Approve, Decline, or Request Information) rest solely with authorized human officers. Every determination requires a documented rationale committed to an immutable audit trail.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.small,
              border: `1px solid ${isOpen ? colors.accent : colors.border}`,
              overflow: 'hidden',
              transition: 'border-color 150ms ease',
            }}
          >
            <button
              onClick={() => toggle(idx)}
              style={{
                width: '100%',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isOpen ? colors.surfaceSubtle : 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: '600',
                color: isOpen ? colors.accent : colors.brand,
                cursor: 'pointer',
                gap: '12px',
              }}
              aria-expanded={isOpen}
            >
              <span>{faq.q}</span>
              <span
                style={{
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 180ms ease',
                  color: colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <IconChevronRight size={14} />
              </span>
            </button>

            {isOpen && (
              <div
                style={{
                  padding: '12px 16px 16px 16px',
                  fontSize: '13px',
                  lineHeight: '20px',
                  color: colors.textSecondary,
                  borderTop: `1px solid ${colors.surfaceSubtle}`,
                  backgroundColor: colors.surface,
                }}
              >
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
