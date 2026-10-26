import React, { useState, useEffect } from 'react';
import { colors, radii, shadows } from './bankerTheme';
import { IconShield, IconClose } from './BankerIcons';

const STORAGE_KEY = 'creditlens_cookie_consent_v1';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay so it animates in smoothly
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // localStorage disabled/restricted
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {}
    setVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner-wrap" role="region" aria-label="Storage and Cookie Preferences">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: colors.accentLight,
            color: colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <IconShield size={16} color={colors.accent} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: colors.brand, marginBottom: '4px' }}>
            Browser Storage & Session Preferences
          </div>
          <p style={{ fontSize: '12px', color: colors.textSecondary, lineHeight: '18px', margin: '0 0 14px 0' }}>
            CreditLens utilizes local browser storage solely to preserve your underwriting review session, filter states, and prototype demonstration data. No advertising trackers or third-party behavioral cookies are deployed.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleAccept}
              style={{
                backgroundColor: colors.brand,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: radii.button,
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Accept & Continue
            </button>

            <button
              onClick={handleDismiss}
              style={{
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.button,
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: colors.textMuted,
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Close storage preference banner"
        >
          <IconClose size={16} />
        </button>
      </div>
    </div>
  );
}
