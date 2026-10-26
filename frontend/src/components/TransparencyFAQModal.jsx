import React, { useState } from 'react';
import { HelpCircle, ChevronDown, X, ShieldCheck, FileCheck } from 'lucide-react';

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'How does seasonal income affect loan affordability?',
    answer: 'Traditional banks divide total annual revenue by 12, forcing flat monthly installments that can trigger cashflow distress during lean summer months. CreditLens identifies your revenue rhythm and allows you to select a Flexible Step-EMI schedule: lower payments ($320/mo) during off-peak months and higher payments ($1,150/mo) during festival/peak wedding cycles, keeping your cash balance positive year-round without increasing overall interest.'
  },
  {
    id: 'faq-2',
    question: 'What is an "Explainable Credit Assessment"?',
    answer: 'Unlike legacy black-box credit models, CreditLens provides 100% auditable mathematical attribution for your score. Every factor is derived strictly from verified cashflow, debt obligations, and repayment consistency. Demographic attributes (such as age, gender, race, or zip code) are strictly excluded in accordance with the Equal Credit Opportunity Act (ECOA 12 CFR Part 1002).'
  },
  {
    id: 'faq-3',
    question: 'Why is there a 50% discount on my freelance or secondary income?',
    answer: 'Self-reported freelance revenue carries an initial prudence haircut until confirmed with verified tax records. Uploading your finalized 2024/2025 Schedule C (Form 1040) or 1099-NEC statements in the "Evidence & Documents" tab eliminates this discount and unlocks up to $6,500 in additional borrowing capacity.'
  },
  {
    id: 'faq-4',
    question: 'What are my legal rights if I believe a factor is inaccurate?',
    answer: 'Under the Fair Credit Reporting Act (FCRA 15 U.S.C. § 1681i), you have the legal right to challenge any adverse factor or tradeline without negative rating impact. You can click the "Dispute Factor" button directly on the Credit Assessment page to initiate a formal compliance audit with our underwriting team.'
  },
  {
    id: 'faq-5',
    question: 'Are my financial documents transmitted to third parties?',
    answer: 'All optical character checks and verification simulations in this live demonstration run in client-side secure sandboxes. No unencrypted private financial data is sold, brokered, or used for automated marketing.'
  }
];

export function TransparencyFAQModal({ isOpen, onClose }) {
  const [openItem, setOpenItem] = useState('faq-1');

  if (!isOpen) return null;

  const toggleItem = (id) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="cl-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-modal-title"
      onClick={onClose}
    >
      <div
        className="cl-modal-card"
        style={{ maxWidth: '680px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#E6F4F1',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 id="faq-modal-title" style={{ fontSize: '18px', fontWeight: '800', color: '#172B3A', margin: 0 }}>
                Transparency &amp; Fair Lending FAQs
              </h2>
              <span style={{ fontSize: '12px', color: '#748391' }}>
                Audited guidelines, seasonal structuring rules, and statutory borrower rights
              </span>
            </div>
          </div>

          <button
            type="button"
            className="cl-btn-icon"
            onClick={onClose}
            aria-label="Close FAQ dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Expandable Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
          {FAQ_ITEMS.map((item) => {
            const isExpanded = openItem === item.id;
            return (
              <div
                key={item.id}
                style={{
                  border: '1px solid #DCE3EA',
                  borderRadius: '8px',
                  background: isExpanded ? '#F8FAFC' : '#FFFFFF',
                  overflow: 'hidden',
                  transition: 'background 0.15s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    gap: '12px'
                  }}
                >
                  <strong style={{ fontSize: '14px', color: isExpanded ? '#0F766E' : '#172B3A' }}>
                    {item.question}
                  </strong>
                  <ChevronDown
                    size={16}
                    color={isExpanded ? '#0F766E' : '#748391'}
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }}
                  />
                </button>

                {isExpanded && (
                  <div
                    style={{
                      padding: '0 16px 14px',
                      fontSize: '13px',
                      color: '#5B6B79',
                      lineHeight: 1.5,
                      borderTop: '1px solid #EEF2F6',
                      paddingTop: '10px'
                    }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Regulatory Badge Footer */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #DCE3EA',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#748391'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#0F766E" />
            <span>FCRA &amp; ECOA Compliant Disclosure</span>
          </div>
          <button
            type="button"
            className="cl-btn cl-btn-secondary cl-btn-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransparencyFAQModal;
