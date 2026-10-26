import React, { useEffect, useRef } from 'react';
import { colors, radii, shadows } from './bankerTheme';
import { IconAlertTriangle, IconCheckCircle, IconX } from './BankerIcons';

/**
 * ConfirmationModal
 * Accessible, keyboard-friendly confirmation modal for important underwriter actions.
 */
export default function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning', // 'warning' | 'danger' | 'success' | 'brand'
  onConfirm,
  onCancel,
  confirmDisabled = false,
  children,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous focus and focus the modal
    const prevActive = document.activeElement;
    modalRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      prevActive?.focus?.();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantColors = {
    warning: {
      icon: colors.warning,
      bg: colors.warningBg,
      button: colors.warning,
      buttonText: '#FFFFFF',
    },
    danger: {
      icon: colors.danger,
      bg: colors.dangerBg,
      button: colors.danger,
      buttonText: '#FFFFFF',
    },
    success: {
      icon: colors.success,
      bg: colors.successBg,
      button: colors.success,
      buttonText: '#FFFFFF',
    },
    brand: {
      icon: colors.brand,
      bg: colors.surfaceSubtle,
      button: colors.brand,
      buttonText: '#FFFFFF',
    },
  }[variant] || {
    icon: colors.brand,
    bg: colors.surfaceSubtle,
    button: colors.brand,
    buttonText: '#FFFFFF',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 30, 45, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          maxWidth: '480px',
          width: '100%',
          boxShadow: shadows.modal,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceSubtle,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: variantColors.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {variant === 'success' ? (
                <IconCheckCircle size={18} color={variantColors.icon} />
              ) : (
                <IconAlertTriangle size={18} color={variantColors.icon} />
              )}
            </div>
            <h3
              id="confirm-modal-title"
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: colors.brand,
                margin: 0,
              }}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: radii.button,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
            }}
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {message && (
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                color: colors.text,
                margin: 0,
              }}
            >
              {message}
            </p>
          )}
          {children}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '14px 20px',
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceSubtle,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: colors.surface,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.button,
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            style={{
              backgroundColor: variantColors.button,
              color: variantColors.buttonText,
              border: 'none',
              borderRadius: radii.button,
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: confirmDisabled ? 'not-allowed' : 'pointer',
              opacity: confirmDisabled ? 0.6 : 1,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
