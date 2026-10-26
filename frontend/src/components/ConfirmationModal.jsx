import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

/**
 * ConfirmationModal
 * Accessible confirmation dialog for important, sensitive, or irreversible actions.
 */
export function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div
      className="cl-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
    >
      <div
        className="cl-modal-card"
        style={{ maxWidth: '440px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: isDanger ? '#FEF3F2' : '#E6F4F1',
              color: isDanger ? '#B42318' : '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isDanger ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>

          <div style={{ flex: 1 }}>
            <h3 id="confirm-modal-title" style={{ fontSize: '16px', fontWeight: '800', color: '#172B3A', margin: '0 0 6px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0, lineHeight: 1.45 }}>
              {message}
            </p>
          </div>

          <button
            type="button"
            className="cl-btn-icon"
            onClick={onCancel}
            aria-label="Cancel"
            style={{ width: '24px', height: '24px' }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            className="cl-btn cl-btn-secondary cl-btn-sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`cl-btn ${isDanger ? 'cl-btn-danger' : 'cl-btn-primary'} cl-btn-sm`}
            onClick={onConfirm}
            style={isDanger ? { background: '#B42318', borderColor: '#B42318', color: '#FFFFFF' } : {}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
