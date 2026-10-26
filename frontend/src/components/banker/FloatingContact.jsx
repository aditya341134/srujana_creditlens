import React, { useState } from 'react';
import { colors, radii, shadows } from './bankerTheme';
import { IconClose } from './BankerIcons';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="floating-support-btn"
        aria-label="Contact lending support and underwriting desk"
        title="Lending Desk Support"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span>Desk Support</span>
      </button>

      {/* Contact Popover Card */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '24px',
            width: '320px',
            maxWidth: '90vw',
            backgroundColor: colors.surface,
            borderRadius: radii.card,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.elevated,
            padding: '20px',
            zIndex: 90,
            animation: 'slideUp 200ms ease-out',
          }}
          role="dialog"
          aria-label="Lending support contact details"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <strong style={{ fontSize: '14px', color: colors.brand }}>CreditLens Support Desk</strong>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>Authorised Underwriting Ops</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: '4px' }}
              aria-label="Close support dialog"
            >
              <IconClose size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            {/* Clickable Phone Number */}
            <a
              href="tel:+912261234567"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: radii.small,
                backgroundColor: colors.surfaceSubtle,
                color: colors.text,
                textDecoration: 'none',
                border: `1px solid ${colors.border}`,
                transition: 'border-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: colors.accentLight,
                  color: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>Direct Underwriter Hotline</div>
                <div style={{ fontWeight: '600', color: colors.brand, fontVariantNumeric: 'tabular-nums' }}>+91 22 6123 4567</div>
              </div>
            </a>

            {/* Clickable Email Address */}
            <a
              href="mailto:d.vance@creditlens.bank?subject=CreditLens%20Underwriter%20Assistance"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: radii.small,
                backgroundColor: colors.surfaceSubtle,
                color: colors.text,
                textDecoration: 'none',
                border: `1px solid ${colors.border}`,
                transition: 'border-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: colors.accentLight,
                  color: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>Officer Inquiries</div>
                <div style={{ fontWeight: '600', color: colors.brand, fontSize: '12px' }}>d.vance@creditlens.bank</div>
              </div>
            </a>

            <div style={{ fontSize: '11px', color: colors.textMuted, lineHeight: '16px', paddingTop: '4px' }}>
              BKC Branch, Mumbai • Hours: Mon–Fri, 9:00 AM – 6:00 PM IST
            </div>
          </div>
        </div>
      )}
    </>
  );
}
