import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * CopyButton
 * Reusable copy-to-clipboard button with feedback state and accessible attributes.
 */
export function CopyButton({
  textToCopy,
  label = 'Copy',
  successLabel = 'Copied!',
  className = '',
  iconSize = 13,
  title = 'Copy to clipboard'
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`cl-copy-btn ${copied ? 'copied' : ''} ${className}`}
      title={copied ? successLabel : title}
      aria-label={`${label}: ${textToCopy}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 7px',
        fontSize: '11px',
        fontWeight: '600',
        color: copied ? '#027A48' : '#5B6B79',
        background: copied ? '#ECFDF3' : '#F1F5F9',
        border: `1px solid ${copied ? '#A6F4C5' : '#DCE3EA'}`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      {copied ? <Check size={iconSize} color="#027A48" /> : <Copy size={iconSize} />}
      <span>{copied ? successLabel : label}</span>
    </button>
  );
}

export default CopyButton;
