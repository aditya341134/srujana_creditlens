import React, { useState } from 'react';
import { colors, radii } from './bankerTheme';

export default function CopyButton({ text, label = '', size = 'sm' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older environments
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : `Copy ${label || text}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: copied ? colors.successBg : 'transparent',
        border: `1px solid ${copied ? '#86EFAC' : colors.border}`,
        borderRadius: radii.small,
        padding: size === 'sm' ? '2px 6px' : '4px 8px',
        color: copied ? colors.success : colors.textSecondary,
        fontSize: '11px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
      aria-label={`Copy ${label || text} to clipboard`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
