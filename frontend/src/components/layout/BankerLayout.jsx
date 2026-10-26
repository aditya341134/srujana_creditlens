import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Lock, ExternalLink, HelpCircle } from 'lucide-react';
import BankerNavbar from './BankerNavbar';

export default function BankerLayout({ children }) {
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
      <BankerNavbar />

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

      {/* Accessible Enterprise Banker Footer matching Borrower Layout */}
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
          © {new Date().getFullYear()} <strong>CreditLens Technologies</strong>. Institutional Rule-Based Credit Underwriting &amp; Fair Lending Platform.
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="mailto:underwriting@creditlens.bank?subject=CreditLens%20Underwriter%20Support"
            style={{ color: '#0F766E', textDecoration: 'none', fontWeight: '500' }}
          >
            Underwriting Desk: underwriting@creditlens.bank
          </a>
          <span style={{ color: '#DCE3EA' }}>•</span>
          <a href="tel:+912261234567" style={{ color: '#0F766E', textDecoration: 'none', fontWeight: '500' }}>
            Compliance Hotline: +91 22 6123 4567
          </a>
          <span style={{ color: '#DCE3EA' }}>•</span>
          <Link
            to="/banker/audit"
            style={{ color: '#526677', textDecoration: 'none', fontSize: '12px' }}
          >
            Regulatory Decision Log
          </Link>
          <span style={{ color: '#DCE3EA' }}>•</span>
          <Link
            to="/home"
            style={{ color: '#0F766E', textDecoration: 'none', fontSize: '12px', fontWeight: '500' }}
          >
            Switch to Borrower Portal &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
