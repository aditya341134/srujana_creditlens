import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import BorrowerNavbar from './BorrowerNavbar';
import { FloatingChatWidget } from '../FloatingChatWidget';

export default function BorrowerLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F6F8FB',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#172B3A'
      }}
    >
      <BorrowerNavbar />

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '28px 20px 48px'
        }}
      >
        {children}
      </main>

      <FloatingChatWidget />

      {/* Accessible Footer identical to Banker Portal */}
      <footer
        style={{
          padding: '20px 28px',
          borderTop: '1px solid #DCE3EA',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: '#526677',
          marginTop: 'auto'
        }}
        className="no-print"
      >
        <div>
          © {new Date().getFullYear()} <strong>CreditLens Technologies</strong>. Fair &amp; Explainable Creditworthiness Assessment.
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="mailto:support@creditlens.bank?subject=CreditLens%20Borrower%20Support"
            style={{ color: '#0F766E', textDecoration: 'none', fontWeight: '500' }}
          >
            Desk: support@creditlens.bank
          </a>
          <span style={{ color: '#DCE3EA' }}>•</span>
          <a href="tel:+912261234567" style={{ color: '#0F766E', textDecoration: 'none', fontWeight: '500' }}>
            Tel: +91 22 6123 4567
          </a>
          <span style={{ color: '#DCE3EA' }}>•</span>
          <Link
            to="/other"
            style={{ color: '#526677', textDecoration: 'none', fontSize: '12px' }}
          >
            Policies &amp; Fair Lending
          </Link>
        </div>
      </footer>
    </div>
  );
}
