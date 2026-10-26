import React from 'react';
import BankerLayout from '../../components/banker/BankerLayout';
import { colors, radii, shadows } from '../../components/banker/bankerTheme';
import { IconArrowLeft, IconShield, IconSearch } from '../../components/banker/BankerIcons';
import { useBankerRoute } from '../../components/banker/navigation';

export default function NotFound() {
  const { navigate } = useBankerRoute();

  return (
    <BankerLayout activeScreen="404" pageTitle="Page Not Found (404)">
      <div style={{ maxWidth: '580px', margin: '40px auto', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.card,
            border: `1px solid ${colors.border}`,
            padding: '48px 32px',
            boxShadow: shadows.subtle,
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: colors.surfaceSubtle,
              color: colors.brand,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <IconShield size={28} color={colors.accent} />
          </div>

          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: colors.accent,
              letterSpacing: '0.8px',
            }}
          >
            Error 404 • Resource Unavailable
          </span>

          <h1 style={{ fontSize: '24px', fontWeight: '800', color: colors.brand, margin: '10px 0 12px 0' }}>
            Underwriting Dossier Not Found
          </h1>

          <p style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: '21px', margin: '0 0 28px 0' }}>
            The requested application identifier, assessment report, or workspace route does not exist in the active CreditLens demonstration repository. Please verify the URL or search for an active applicant dossier.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('dashboard')}
              style={{
                backgroundColor: colors.brand,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: radii.button,
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <IconArrowLeft size={16} />
              <span>Return to Dashboard</span>
            </button>

            <button
              onClick={() => navigate('applications')}
              style={{
                backgroundColor: colors.surfaceSubtle,
                color: colors.brand,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.button,
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Browse Applications Queue
            </button>
          </div>
        </div>
      </div>
    </BankerLayout>
  );
}
