import React, { useState } from 'react';
import { MessageCircle, X, Phone, Mail, Clock, HelpCircle, ShieldCheck } from 'lucide-react';

/**
 * FloatingContact
 * Floating support and contact panel providing instant access to direct phone,
 * email, underwriting hours, and compliance disclosures.
 */
export function FloatingContact({ userEmail = 'rajesh.elena@artisanoven.com', userPhone = '(415) 892-4412' }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '76px', zIndex: 90 }}>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cl-floating-contact-btn"
        aria-label="Contact borrower support"
        title="Need assistance? Contact CreditLens Underwriting Support"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: '#0F766E',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, background 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#0B5C55')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#0F766E')}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Contact Panel Card */}
      {open && (
        <div
          className="cl-card"
          style={{
            position: 'absolute',
            bottom: '52px',
            right: 0,
            width: '320px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(23, 43, 58, 0.15)',
            border: '1px solid #DCE3EA',
            borderRadius: '12px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: '#E6F4F1',
                  color: '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HelpCircle size={16} />
              </div>
              <strong style={{ fontSize: '14px', color: '#172B3A' }}>Borrower Assistance</strong>
            </div>
            <button
              type="button"
              className="cl-btn-icon"
              style={{ width: '22px', height: '22px' }}
              onClick={() => setOpen(false)}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: '#5B6B79', margin: '0 0 12px', lineHeight: 1.4 }}>
            Direct support from CreditLens underwriting specialists and compliance examiners.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Clickable Phone */}
            <a
              href="tel:+14158924412"
              className="cl-card-flat"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                textDecoration: 'none',
                color: '#172B3A',
                borderRadius: '8px',
                transition: 'background 0.15s'
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  color: '#173B57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Phone size={15} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#748391', display: 'block' }}>Direct Phone Helpline</span>
                <strong style={{ fontSize: '13px' }}>{userPhone}</strong>
              </div>
            </a>

            {/* Clickable Email */}
            <a
              href="mailto:support@creditlens.io"
              className="cl-card-flat"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                textDecoration: 'none',
                color: '#172B3A',
                borderRadius: '8px',
                transition: 'background 0.15s'
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  color: '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mail size={15} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#748391', display: 'block' }}>Underwriting Support</span>
                <strong style={{ fontSize: '13px' }}>support@creditlens.io</strong>
              </div>
            </a>
          </div>

          <div
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#748391'
            }}
          >
            <Clock size={12} color="#0F766E" />
            <span>Mon–Fri 8:00 AM – 8:00 PM EST</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloatingContact;
