import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  Home,
  User,
  Briefcase,
  GraduationCap,
  Car,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sliders,
  DollarSign,
  HelpCircle
} from 'lucide-react';
import BorrowerLayout from '../../components/layout/BorrowerLayout';

const LOAN_CATEGORIES_DATA = [
  {
    id: 'personal',
    name: 'Personal Loan',
    category: 'Personal Loan',
    icon: User,
    badge: 'Unsecured',
    rateNum: 10.5,
    rateDisplay: '10.50% – 13.50% p.a.',
    maxAmountNum: 2500000,
    maxAmountDisplay: '₹25,00,000',
    tenureNum: 60,
    tenureDisplay: '12 – 60 Months',
    tenureCategory: 'medium',
    rateCategory: 'mid',
    amountCategory: 'mid',
    useCase: 'Emergency medical expenses, debt consolidation, travel, home renovation',
    eligibility: [
      'Salaried individuals or self-employed professionals',
      'Minimum monthly net income of ₹25,000',
      'Age between 21 and 58 years',
      'Minimum work experience of 1+ year'
    ],
    features: [
      'No collateral or security needed',
      'Same-day algorithmic eligibility evaluation',
      'Zero penalty for partial prepayments after 12 months'
    ]
  },
  {
    id: 'home',
    name: 'Home Loan',
    category: 'Home Loan',
    icon: Home,
    badge: 'Secured Lien',
    rateNum: 8.4,
    rateDisplay: '8.40% – 9.75% p.a.',
    maxAmountNum: 15000000,
    maxAmountDisplay: '₹1,50,00,000',
    tenureNum: 360,
    tenureDisplay: 'Up to 30 Years',
    tenureCategory: 'long',
    rateCategory: 'low',
    amountCategory: 'high',
    useCase: 'Purchase of residential apartments, villas, plots, or home construction/extension',
    eligibility: [
      'Salaried employees or business owners with 3+ years track record',
      'Minimum monthly household income of ₹45,000',
      'Property title cleared by legal counsel'
    ],
    features: [
      'Attractive tax deductions under Section 80C and Section 24',
      'Floating and fixed rate customization',
      'PMAY subsidy benefits where eligible'
    ]
  },
  {
    id: 'business',
    name: 'Business Growth Loan',
    category: 'Business Loan',
    icon: Briefcase,
    badge: 'Enterprise',
    rateNum: 11.25,
    rateDisplay: '11.25% – 14.50% p.a.',
    maxAmountNum: 5000000,
    maxAmountDisplay: '₹50,00,000',
    tenureNum: 84,
    tenureDisplay: '12 – 84 Months',
    tenureCategory: 'medium',
    rateCategory: 'high',
    amountCategory: 'high',
    useCase: 'Working capital, inventory expansion, commercial machinery purchase, seasonal stocking',
    eligibility: [
      'Enterprises with minimum 2 years of active business operations',
      'Annual turnover of at least ₹15,00,000',
      'Audited financials or 12-month GST filing statements'
    ],
    features: [
      'Step-down EMI options structured around seasonal cash flows',
      'Minimal financial covenant restrictions',
      'Quick working capital overdraft lines'
    ]
  },
  {
    id: 'education',
    name: 'Higher Education Loan',
    category: 'Education Loan',
    icon: GraduationCap,
    badge: 'Career Building',
    rateNum: 9.15,
    rateDisplay: '9.15% – 11.00% p.a.',
    maxAmountNum: 4000000,
    maxAmountDisplay: '₹40,00,000',
    tenureNum: 120,
    tenureDisplay: 'Up to 10 Years',
    tenureCategory: 'long',
    rateCategory: 'mid',
    amountCategory: 'mid',
    useCase: 'Domestic and international graduate, post-graduate, and specialized vocational degree courses',
    eligibility: [
      'Confirmed admission in recognized university or accredited institution',
      'Co-borrower (parent, spouse, or guardian) with verifiable income',
      'Academic track record with qualifying entrance scores'
    ],
    features: [
      'Moratorium period covering course duration + 6 months',
      '100% tuition, travel, and accommodation expense coverage',
      'Section 80E interest deduction benefit'
    ]
  },
  {
    id: 'vehicle',
    name: 'Vehicle & Green Mobility Loan',
    category: 'Vehicle Loan',
    icon: Car,
    badge: 'Asset Hypothecated',
    rateNum: 8.9,
    rateDisplay: '8.90% – 10.50% p.a.',
    maxAmountNum: 2000000,
    maxAmountDisplay: '₹20,00,000',
    tenureNum: 84,
    tenureDisplay: '12 – 84 Months',
    tenureCategory: 'medium',
    rateCategory: 'low',
    amountCategory: 'mid',
    useCase: 'New 4-wheeler, 2-wheeler, electric mobility, or commercial light delivery vehicle',
    eligibility: [
      'Salaried or self-employed with minimum 1 year continuous income',
      'Minimum monthly income of ₹20,000',
      'Valid driving license and KYC documents'
    ],
    features: [
      'Up to 90% on-road financing available',
      '0.25% concession on interest for fully electric vehicles (EVs)',
      'Simplified documentation with dealer tie-ups'
    ]
  },
  {
    id: 'gold',
    name: 'Gold & Asset Backed Loan',
    category: 'Gold Loan',
    icon: Coins,
    badge: 'Fast Liquidity',
    rateNum: 7.95,
    rateDisplay: '7.95% – 9.50% p.a.',
    maxAmountNum: 3000000,
    maxAmountDisplay: '₹30,00,000',
    tenureNum: 36,
    tenureDisplay: '6 – 36 Months',
    tenureCategory: 'short',
    rateCategory: 'low',
    amountCategory: 'mid',
    useCase: 'Instant emergency cash flow, micro-enterprise funding, short-term bridging finance',
    eligibility: [
      'Any individual owning 18-24 karat gold ornaments or coins',
      'Valid identity and residential proof',
      'No formal salary slip or credit score barrier'
    ],
    features: [
      'Highest loan-to-value (LTV) ratio as per RBI guidelines',
      'Bullet repayment or monthly interest-only payment options',
      'Secure insured vault storage for pledged assets'
    ]
  }
];

export default function Knowledge() {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [rateFilter, setRateFilter] = useState('ALL'); // 'ALL' | 'low' | 'mid' | 'high'
  const [tenureFilter, setTenureFilter] = useState('ALL'); // 'ALL' | 'short' | 'medium' | 'long'
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'rate-low' | 'rate-high' | 'amount-high' | 'tenure-high'

  // Filter & Sort Logic
  const filteredAndSortedLoans = useMemo(() => {
    let result = [...LOAN_CATEGORIES_DATA];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.useCase.toLowerCase().includes(q) ||
          item.features.some((f) => f.toLowerCase().includes(q)) ||
          item.eligibility.some((e) => e.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (selectedType !== 'ALL') {
      result = result.filter((item) => item.category === selectedType);
    }

    // Rate filter
    if (rateFilter !== 'ALL') {
      result = result.filter((item) => item.rateCategory === rateFilter);
    }

    // Tenure filter
    if (tenureFilter !== 'ALL') {
      result = result.filter((item) => item.tenureCategory === tenureFilter);
    }

    // Sorting
    if (sortBy === 'rate-low') {
      result.sort((a, b) => a.rateNum - b.rateNum);
    } else if (sortBy === 'rate-high') {
      result.sort((a, b) => b.rateNum - a.rateNum);
    } else if (sortBy === 'amount-high') {
      result.sort((a, b) => b.maxAmountNum - a.maxAmountNum);
    } else if (sortBy === 'tenure-high') {
      result.sort((a, b) => b.tenureNum - a.tenureNum);
    }

    return result;
  }, [searchQuery, selectedType, rateFilter, tenureFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setRateFilter('ALL');
    setTenureFilter('ALL');
    setSortBy('relevance');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'ALL' ||
    rateFilter !== 'ALL' ||
    tenureFilter !== 'ALL' ||
    sortBy !== 'relevance';

  const handleSelectLoan = (category) => {
    navigate(`/loan?category=${encodeURIComponent(category)}`);
  };

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: '#173B57', fontWeight: '700' }}>Loan Knowledge</span>
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#173B57',
              margin: '6px 0 8px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Loan Discovery &amp; Financial Knowledge
          </h1>
          <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
            Compare verified loan types, examine eligibility standards, and select the appropriate financing product for your goals.
          </p>
        </div>

        {/* Search & Filter Bar Controls */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #DCE3EA',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Top Search Input Row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search loan types, keywords (e.g. Renovation, Solar, Medical, Education)..."
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 40px',
                  borderRadius: '8px',
                  border: '1px solid #DCE3EA',
                  fontSize: '14px',
                  color: '#172B3A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0F766E')}
                onBlur={(e) => (e.target.style.borderColor = '#DCE3EA')}
              />
              <Search
                size={18}
                color="#748391"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#748391',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} color="#748391" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #DCE3EA',
                  fontSize: '13px',
                  color: '#172B3A',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="rate-low">Interest: Low to High</option>
                <option value="rate-high">Interest: High to Low</option>
                <option value="amount-high">Max Loan Amount</option>
                <option value="tenure-high">Longest Tenure</option>
              </select>
            </div>
          </div>

          {/* Filter Pills Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #F1F4F8'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Filter By:
              </span>

              {/* Category Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #DCE3EA',
                  fontSize: '12px',
                  color: '#172B3A',
                  backgroundColor: selectedType !== 'ALL' ? '#E6F4F1' : '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
                <option value="Gold Loan">Gold Loan</option>
              </select>

              {/* Rate Filter */}
              <select
                value={rateFilter}
                onChange={(e) => setRateFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #DCE3EA',
                  fontSize: '12px',
                  color: '#172B3A',
                  backgroundColor: rateFilter !== 'ALL' ? '#E6F4F1' : '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Interest Rates</option>
                <option value="low">Under 9.0% p.a. (Prime)</option>
                <option value="mid">9.0% – 11.0% p.a. (Standard)</option>
                <option value="high">Above 11.0% p.a.</option>
              </select>

              {/* Tenure Filter */}
              <select
                value={tenureFilter}
                onChange={(e) => setTenureFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #DCE3EA',
                  fontSize: '12px',
                  color: '#172B3A',
                  backgroundColor: tenureFilter !== 'ALL' ? '#E6F4F1' : '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Repayment Tenures</option>
                <option value="short">Short (&le; 3 Years)</option>
                <option value="medium">Medium (3 – 7 Years)</option>
                <option value="long">Long (&gt; 7 Years)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#B42318',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <X size={14} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#5B6B79' }}>
            Showing <strong>{filteredAndSortedLoans.length}</strong> loan categories
          </span>
          <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>
            Click any card to start application with that loan type
          </span>
        </div>

        {/* Empty State */}
        {filteredAndSortedLoans.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DCE3EA',
              padding: '60px 24px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#F1F4F8',
                color: '#5B6B79',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Search size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: '0 0 8px' }}>
              No loan categories match your criteria
            </h3>
            <p style={{ fontSize: '13px', color: '#5B6B79', maxWidth: '420px', margin: '0 auto 20px' }}>
              Try searching with broader terms or clear your active category and interest rate filters.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              style={{
                backgroundColor: '#173B57',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredAndSortedLoans.map((loan) => {
              const Icon = loan.icon;
              return (
                <div
                  key={loan.id}
                  onClick={() => handleSelectLoan(loan.category)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1.5px solid #DCE3EA',
                    padding: '24px',
                    boxShadow: '0 2px 10px rgba(23, 43, 58, 0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(23, 43, 58, 0.1)';
                    e.currentTarget.style.borderColor = '#0F766E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(23, 43, 58, 0.04)';
                    e.currentTarget.style.borderColor = '#DCE3EA';
                  }}
                >
                  <div>
                    {/* Top Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: '#E6F4F1',
                            color: '#0F766E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Icon size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                            {loan.name}
                          </h3>
                          <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                            {loan.category}
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: '#F1F4F8',
                          color: '#173B57',
                          padding: '4px 10px',
                          borderRadius: '12px'
                        }}
                      >
                        {loan.badge}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '13px', color: '#5B6B79', lineHeight: 1.5, margin: '0 0 16px' }}>
                      {loan.useCase}
                    </p>

                    {/* Metrics Bar */}
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        marginBottom: '16px',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                          Indicative Rate
                        </span>
                        <strong style={{ fontSize: '13px', color: '#0F766E' }}>{loan.rateDisplay}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                          Max Principal
                        </span>
                        <strong style={{ fontSize: '13px', color: '#173B57' }}>{loan.maxAmountDisplay}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#748391', textTransform: 'uppercase', display: 'block' }}>
                          Max Tenure
                        </span>
                        <strong style={{ fontSize: '13px', color: '#173B57' }}>{loan.tenureDisplay}</strong>
                      </div>
                    </div>

                    {/* Eligibility Highlights */}
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#173B57', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                        Key Eligibility Criteria
                      </span>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {loan.eligibility.slice(0, 3).map((item, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#5B6B79' }}>
                            <CheckCircle2 size={14} color="#0F766E" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Apply CTA Footer */}
                  <div
                    style={{
                      paddingTop: '16px',
                      borderTop: '1px solid #F1F4F8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#748391' }}>
                      Prefill in Simulator
                    </span>
                    <button
                      type="button"
                      style={{
                        backgroundColor: '#173B57',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <span>Select &amp; Apply</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BorrowerLayout>
  );
}
