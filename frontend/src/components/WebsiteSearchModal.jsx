import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, FileText, Sliders, Calendar, ShieldCheck, Award, Printer, Users } from 'lucide-react';

const SEARCHABLE_ITEMS = [
  {
    id: 'dashboard',
    title: 'Applicant Overview Dashboard',
    category: 'Dashboard',
    icon: FileText,
    snippet: 'View monthly net surplus, DTI ratio, application pipeline stages, and recent bank verification feeds.',
    pageId: 'dashboard'
  },
  {
    id: 'seasonal-intelligence',
    title: 'Seasonal Income Intelligence (Step-EMI)',
    category: 'Seasonal Model',
    icon: Calendar,
    snippet: 'Compare flat EMI vs flexible seasonal step-EMI schedule ($320 in lean summer, $1,150 in peak winter).',
    pageId: 'seasonal-intelligence'
  },
  {
    id: 'financial-profile',
    title: 'Financial Profile & Verified Ledger',
    category: 'Profile & Income',
    icon: Users,
    snippet: 'Inspect primary business W-2/1040 income, 1099 freelance retainers, and itemized living expenses.',
    pageId: 'financial-profile'
  },
  {
    id: 'my-assessment',
    title: 'Explainable Credit Assessment',
    category: 'Underwriting Score',
    icon: Award,
    snippet: 'Review statutory model weights, positive drivers, adverse factors, and interactive What-If capacity optimizer.',
    pageId: 'my-assessment'
  },
  {
    id: 'loan-simulator',
    title: 'Loan Comparison Simulator & Amortization',
    category: 'Calculator',
    icon: Sliders,
    snippet: 'Right-size loan amounts, adjust APR, test 24/36/48/60 month tenures, and inspect month-by-month amortization.',
    pageId: 'loan-simulator'
  },
  {
    id: 'document-evidence',
    title: 'Document & Evidence Management',
    category: 'Documents',
    icon: ShieldCheck,
    snippet: 'Upload 1099-NEC or Schedule C tax records, view verification status, and submit borrower clarification notes.',
    pageId: 'document-evidence'
  },
  {
    id: 'readiness-copilot',
    title: 'Credit Readiness Copilot',
    category: 'Guidance',
    icon: Award,
    snippet: 'Actionable financial recommendations with simulated score impact and repayment buffer optimization.',
    pageId: 'readiness-copilot'
  },
  {
    id: 'credit-decision',
    title: 'Understand My Credit Decision',
    category: 'Decision Audit',
    icon: ShieldCheck,
    snippet: 'Plain-language underwriter rationale, required conditions checklist, and formal FCRA dispute procedure.',
    pageId: 'credit-decision'
  },
  {
    id: 'financial-report',
    title: 'Borrower Financial & Solvency Report',
    category: 'Report & Export',
    icon: Printer,
    snippet: 'Printable full audit preview with JSON export, watermark, and underwriter compliance disclosures.',
    pageId: 'financial-report'
  },
  {
    id: 'loan-application',
    title: 'Loan Request & Application Form',
    category: 'Apply',
    icon: FileText,
    snippet: 'Submit formal financing requests with real-time DTI check, purpose selection, and FCRA consent.',
    pageId: 'loan-application'
  },
  {
    id: 'fcra-rights',
    title: 'FCRA 15 U.S.C. § 1681i Dispute Rights',
    category: 'Compliance',
    icon: ShieldCheck,
    snippet: 'Statutory rights allowing borrowers to challenge inaccurate data drivers with zero adverse score penalty.',
    pageId: 'my-assessment'
  },
  {
    id: '1099-haircut',
    title: 'Freelance 1099 Income Haircut Resolution',
    category: 'Underwriting Rules',
    icon: ShieldCheck,
    snippet: 'Remove the 50% unverified freelance discount by uploading signed 1099 or Schedule C statements.',
    pageId: 'financial-profile'
  }
];

export function WebsiteSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter items
  const results = query.trim()
    ? SEARCHABLE_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.snippet.toLowerCase().includes(q)
        );
      })
    : SEARCHABLE_ITEMS.slice(0, 6); // Default top shortcuts

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item) => {
    onNavigate(item.pageId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="cl-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Website Search"
      onClick={onClose}
    >
      <div
        className="cl-modal-card"
        style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid #DCE3EA',
            background: '#FFFFFF'
          }}
        >
          <Search size={20} color="#0F766E" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search modules, seasonal tools, calculators, documents..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: '#172B3A',
              background: 'transparent'
            }}
            aria-label="Search site content"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="cl-btn-icon"
              style={{ width: '24px', height: '24px' }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <kbd
            style={{
              fontSize: '11px',
              background: '#F1F5F9',
              border: '1px solid #DCE3EA',
              borderRadius: '4px',
              padding: '2px 6px',
              color: '#5B6B79'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {results.length > 0 ? (
            results.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? '#E6F4F1' : 'transparent',
                    border: isSelected ? '1px solid #99EFE5' : '1px solid transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: isSelected ? '#0F766E' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#173B57',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '14px', color: isSelected ? '#0F766E' : '#172B3A' }}>
                        {item.title}
                      </strong>
                      <span className="cl-badge cl-badge-neutral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {item.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#5B6B79', margin: 0, lineHeight: 1.4 }}>
                      {item.snippet}
                    </p>
                  </div>
                  <ArrowRight size={14} color={isSelected ? '#0F766E' : '#748391'} style={{ marginTop: '8px' }} />
                </div>
              );
            })
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#748391' }}>
              <p style={{ fontSize: '14px', margin: '0 0 4px', fontWeight: '600' }}>No matching results</p>
              <p style={{ fontSize: '12px', margin: 0 }}>Try searching for "seasonal", "loan", "1099", or "DTI".</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          style={{
            padding: '10px 16px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#748391'
          }}
        >
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd> • Select with <kbd>Enter</kbd></span>
          <span>CreditLens Portal Search</span>
        </div>
      </div>
    </div>
  );
}

export default WebsiteSearchModal;
