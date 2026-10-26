import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'creditlens_cookie_consent';

/**
 * CookieConsent
 * Lightweight, transparent notice about essential storage and session tokens
 * used by CreditLens to manage local underwriting simulations.
 */
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // fallback
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    } catch {
      // ignore
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'dismissed');
    } catch {
      // ignore
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      className="cl-cookie-banner"
      role="region"
      aria-label="Storage and Cookie Preferences"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #DCE3EA',
        boxShadow: '0 -4px 16px rgba(23, 43, 58, 0.08)',
        padding: '16px 24px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '760px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#E6F4F1',
              color: '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#172B3A', display: 'block', marginBottom: '2px' }}>
              Essential Storage Notice
            </strong>
            <p style={{ fontSize: '12px', color: '#5B6B79', margin: 0, lineHeight: 1.45 }}>
              CreditLens uses essential browser local storage to preserve your financial calculations, simulated repayment scenarios, and persona switches. We do not track or sell your personal data.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: '#F1F5F9',
              border: '1px solid #DCE3EA',
              color: '#5B6B79',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleAccept}
            style={{
              background: '#0F766E',
              border: 'none',
              color: '#FFFFFF',
              padding: '7px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Accept Essential Storage
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CookieConsent;
