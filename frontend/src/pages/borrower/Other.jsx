import React from 'react';
import { Sparkles, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BorrowerLayout from '../../components/layout/BorrowerLayout';

export default function Other() {
  return (
    <BorrowerLayout>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '55vh',
          textAlign: 'center',
          padding: '40px 20px'
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #DCE3EA',
            padding: '48px 36px',
            boxShadow: '0 4px 16px rgba(23, 43, 58, 0.04)'
          }}
        >
          {/* Subtle Icon Box */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#E6F4F1',
              color: '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 2px 8px rgba(15, 118, 110, 0.15)'
            }}
          >
            <Sparkles size={32} />
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#173B57',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em'
            }}
          >
            More features are coming soon.
          </h1>

          <p
            style={{
              fontSize: '15px',
              color: '#5B6B79',
              lineHeight: 1.6,
              margin: '0 0 28px 0'
            }}
          >
            We're working on additional tools and features to make your financial journey easier.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <Link
              to="/home"
              style={{
                backgroundColor: '#173B57',
                color: '#FFFFFF',
                padding: '11px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Compass size={16} />
              <span>Return to Borrower Home</span>
            </Link>

            <span style={{ fontSize: '12px', color: '#748391' }}>
              Planned tools: Automated Tax Deduction Planner &bull; Credit Bureau Dispute Assistant
            </span>
          </div>
        </div>
      </div>
    </BorrowerLayout>
  );
}
