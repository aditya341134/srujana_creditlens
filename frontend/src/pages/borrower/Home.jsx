import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Award,
  BookOpen,
  Pause,
  Play,
  Home as HomeIcon,
  Briefcase,
  GraduationCap,
  Car,
  User,
  Coins,
  Sparkles,
  Info
} from 'lucide-react';
import BorrowerLayout from '../../components/layout/BorrowerLayout';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);

  // Marquee loan offers
  const loanOffers = [
    {
      id: 'personal',
      name: 'Personal Loan',
      category: 'Personal Loan',
      rate: '10.50% p.a.',
      maxAmount: '₹25,00,000',
      tenure: 'Up to 5 Years',
      icon: User,
      badge: 'Zero Collateral',
      desc: 'Instant liquidity for medical, travel, or home expenses.'
    },
    {
      id: 'home',
      name: 'Home Loan',
      category: 'Home Loan',
      rate: '8.40% p.a.',
      maxAmount: '₹1,50,00,000',
      tenure: 'Up to 30 Years',
      icon: HomeIcon,
      badge: 'Prime Fixed/Floating',
      desc: 'Affordable financing for residential property acquisition or renovation.'
    },
    {
      id: 'business',
      name: 'Business Growth Loan',
      category: 'Business Loan',
      rate: '11.25% p.a.',
      maxAmount: '₹50,00,000',
      tenure: 'Up to 7 Years',
      icon: Briefcase,
      badge: 'Working Capital',
      desc: 'Empowering small & seasonal enterprises with cash flow-backed underwriting.'
    },
    {
      id: 'education',
      name: 'Higher Education Loan',
      category: 'Education Loan',
      rate: '9.15% p.a.',
      maxAmount: '₹40,00,000',
      tenure: 'Up to 10 Years',
      icon: GraduationCap,
      badge: 'Moratorium Benefit',
      desc: 'Fund domestic and overseas degree programs with flexible repayment.'
    },
    {
      id: 'vehicle',
      name: 'Electric & Auto Loan',
      category: 'Vehicle Loan',
      rate: '8.90% p.a.',
      maxAmount: '₹20,00,000',
      tenure: 'Up to 7 Years',
      icon: Car,
      badge: 'Green Vehicle Concession',
      desc: 'Financing for personal and commercial electric & hybrid vehicles.'
    },
    {
      id: 'gold',
      name: 'Gold & Asset Backed Loan',
      category: 'Gold Loan',
      rate: '7.95% p.a.',
      maxAmount: '₹30,00,000',
      tenure: 'Up to 3 Years',
      icon: Coins,
      badge: 'Lowest Interest',
      desc: 'High value-to-loan ratio with minimal documentation and same-day approval.'
    }
  ];

  const handleSelectLoan = (category) => {
    navigate(`/loan?category=${encodeURIComponent(category)}`);
  };

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {/* Hero Section */}
        <section
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #DCE3EA',
            padding: '48px 36px',
            boxShadow: '0 4px 16px rgba(23, 43, 58, 0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle decorative accent */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              backgroundColor: '#E6F4F1',
              opacity: 0.6,
              zIndex: 0
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#E6F4F1',
                color: '#0F766E',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                marginBottom: '18px'
              }}
            >
              <Sparkles size={14} />
              <span>Fair &amp; Explainable Credit Assessment</span>
            </div>

            <h1
              style={{
                fontSize: '36px',
                fontWeight: '800',
                color: '#173B57',
                lineHeight: '1.2',
                margin: '0 0 16px 0',
                letterSpacing: '-0.02em'
              }}
            >
              Know where you stand before you apply.
            </h1>

            <p
              style={{
                fontSize: '16px',
                color: '#5B6B79',
                lineHeight: '1.6',
                margin: '0 0 28px 0',
                maxWidth: '640px'
              }}
            >
              Understand your financial readiness, explore transparent loan options, and discover actionable ways to maximize your approval potential without impacting your credit score.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/knowledge')}
                style={{
                  backgroundColor: '#173B57',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s ease',
                  boxShadow: '0 2px 8px rgba(23, 59, 87, 0.2)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#102E45')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#173B57')}
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/loan')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#173B57',
                  border: '1.5px solid #173B57',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F4F8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <span>Explore Loans</span>
                <Sliders size={16} color="#0F766E" />
              </button>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px solid #E2E8F0',
                fontSize: '13px',
                color: '#5B6B79',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#0F766E" />
                <span>Zero Bureau Score Impact (Soft Pull)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#0F766E" />
                <span>100% Explainable Decisions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#0F766E" />
                <span>RBI &amp; Fair Lending Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling Loan-Offer Marquee Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#173B57',
                  margin: '0 0 4px 0'
                }}
              >
                Available Loan Products &amp; Indicative Offers
              </h2>
              <span style={{ fontSize: '13px', color: '#5B6B79' }}>
                Click any product to simulate repayments and assess your eligibility.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMarqueePaused((prev) => !prev)}
              aria-label={isMarqueePaused ? 'Resume scrolling' : 'Pause scrolling'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DCE3EA',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#5B6B79',
                cursor: 'pointer'
              }}
            >
              {isMarqueePaused ? <Play size={14} color="#0F766E" /> : <Pause size={14} color="#0F766E" />}
              <span>{isMarqueePaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>

          {/* Marquee Wrapper */}
          <div
            className="cl-marquee-container"
            onMouseEnter={() => setIsMarqueePaused(true)}
            onMouseLeave={() => setIsMarqueePaused(false)}
            style={{
              overflow: 'hidden',
              position: 'relative',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DCE3EA',
              padding: '16px 0'
            }}
          >
            <div
              className="cl-marquee-track"
              style={{
                display: 'flex',
                gap: '16px',
                width: 'max-content',
                animation: 'marqueeScroll 65s linear infinite',
                animationPlayState: isMarqueePaused ? 'paused' : 'running'
              }}
            >
              {/* Double list for smooth infinite scroll */}
              {[...loanOffers, ...loanOffers].map((offer, idx) => {
                const Icon = offer.icon;
                return (
                  <div
                    key={`${offer.id}-${idx}`}
                    onClick={() => handleSelectLoan(offer.category)}
                    style={{
                      width: '280px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(23, 43, 58, 0.08)';
                      e.currentTarget.style.borderColor = '#0F766E';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#E6F4F1',
                          color: '#0F766E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          backgroundColor: '#F1F4F8',
                          color: '#173B57',
                          padding: '3px 8px',
                          borderRadius: '12px'
                        }}
                      >
                        {offer.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#173B57', margin: '0 0 4px 0' }}>
                      {offer.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#5B6B79', margin: '0 0 12px 0', minHeight: '32px', lineHeight: 1.3 }}>
                      {offer.desc}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '10px', borderTop: '1px solid #F1F4F8' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#748391', display: 'block' }}>Starting at</span>
                        <strong style={{ fontSize: '14px', color: '#0F766E' }}>{offer.rate}</strong>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#173B57' }}>
                        {offer.maxAmount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <style>{`
            @keyframes marqueeScroll {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
          `}</style>
        </section>

        {/* 3-Step Process: Explore, Assess, Understand */}
        <section
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #DCE3EA',
            padding: '36px',
            boxShadow: '0 2px 12px rgba(23, 43, 58, 0.03)'
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#173B57', margin: '0 0 8px 0' }}>
              How CreditLens Works
            </h2>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0 }}>
              Three transparent steps to complete financial clarity before formal banking application.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#173B57',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700'
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                Explore &amp; Discover
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', lineHeight: 1.5, margin: 0 }}>
                Browse verified loan products, search by keywords, filter by indicative rate or tenure, and identify loan types matching your exact requirements.
              </p>
              <Link
                to="/knowledge"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0F766E',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: 'auto'
                }}
              >
                <span>Browse categories</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#0F766E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700'
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                Assess &amp; Simulate
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', lineHeight: 1.5, margin: 0 }}>
                Enter your details through a sequential 4-step workflow. Simulate monthly EMIs, stress test income ratios, compare alternative loan scenarios, and submit documents.
              </p>
              <Link
                to="/loan"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0F766E',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: 'auto'
                }}
              >
                <span>Start simulation</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#173B57',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700'
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                Understand &amp; Improve
              </h3>
              <p style={{ fontSize: '13px', color: '#5B6B79', lineHeight: 1.5, margin: 0 }}>
                Receive an explainable assessment: see the positive indicators, risk factors, and personalized suggestions to strengthen your creditworthiness.
              </p>
              <Link
                to="/review"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0F766E',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: 'auto'
                }}
              >
                <span>Check status</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Clear Disclaimer Banner */}
        <section
          style={{
            backgroundColor: '#EAF2FE',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Info size={24} color="#245EA8" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '14px', color: '#173B57', display: 'block', marginBottom: '2px' }}>
              Responsible Assessment Notice
            </strong>
            <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.4 }}>
              CreditLens provides an estimated creditworthiness assessment for informational purposes. The final decision rests with the bank or lending institution. Eligibility estimates do not constitute guaranteed loan approval.
            </p>
          </div>
        </section>
      </div>
    </BorrowerLayout>
  );
}
