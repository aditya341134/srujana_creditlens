import React from 'react';
import { Layers, ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';

/**
 * NotFound (404 Page)
 * Custom 404 fallback for invalid routes and broken links.
 */
export function NotFound({ onNavigate }) {
  const handleBackToDashboard = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    } else {
      window.location.hash = 'dashboard';
    }
  };

  return (
    <UserPortalLayout activePage="404" onNavigate={onNavigate}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 20px',
          textAlign: 'center',
          minHeight: '60vh'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: '#E6F4F1',
            color: '#0F766E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}
        >
          <FileQuestion size={32} />
        </div>

        <span className="cl-badge cl-badge-neutral" style={{ marginBottom: '10px' }}>
          Error 404 • Resource Not Found
        </span>

        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#172B3A', margin: '0 0 10px' }}>
          Page or Module Not Found
        </h1>

        <p style={{ fontSize: '14px', color: '#5B6B79', maxWidth: '480px', margin: '0 0 24px', lineHeight: 1.5 }}>
          The requested borrower module or section does not exist or may have been relocated. All 10 active underwriting modules are available from your borrower sidebar.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            className="cl-btn cl-btn-primary"
            onClick={handleBackToDashboard}
          >
            <Home size={15} />
            <span>Return to Dashboard</span>
          </button>
          <button
            type="button"
            className="cl-btn cl-btn-secondary"
            onClick={() => onNavigate('seasonal-intelligence')}
          >
            <span>Seasonal Intelligence</span>
          </button>
        </div>
      </div>
    </UserPortalLayout>
  );
}

export default NotFound;
