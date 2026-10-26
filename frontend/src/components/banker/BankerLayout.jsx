import React from 'react';
import BankerLayoutUnified from '../layout/BankerLayout';

export default function BankerLayout({
  activeScreen = 'dashboard',
  children,
  pageTitle,
  pageSubtitle,
  actions,
}) {
  return (
    <BankerLayoutUnified>
      {(pageTitle || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          <div>
            {pageTitle && (
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#173B57',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.02em'
                }}
              >
                {pageTitle}
              </h1>
            )}
            {pageSubtitle && (
              <p
                style={{
                  fontSize: '14px',
                  color: '#5B6B79',
                  margin: 0,
                  maxWidth: '750px',
                  lineHeight: 1.5
                }}
              >
                {pageSubtitle}
              </p>
            )}
          </div>
          {actions && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </BankerLayoutUnified>
  );
}
