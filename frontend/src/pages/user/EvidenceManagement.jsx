import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  Info,
  RefreshCw,
  X,
  MessageSquare,
  Lock
} from 'lucide-react';
import { UserPortalLayout } from '../../components/UserPortalLayout';
import { CopyButton } from '../../components/CopyButton';
import { useUserPortalState, formatCurrency } from './userPortalState';

/**
 * Module 4: Document and Evidence Management
 * UI for uploading financial documents, displaying document verification status,
 * identifying missing evidence, and submitting clarifications.
 * Clearly labels client-side simulation.
 */
export function EvidenceManagement({ onNavigate }) {
  const {
    state,
    toastMessage,
    uploadEvidenceDocument,
    submitClarification,
    syncBankData
  } = useUserPortalState();

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  // Upload modal / form state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docCategory, setDocCategory] = useState('Tax Return');
  const [supportsClaim, setSupportsClaim] = useState('Secondary Catering Revenue');
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);

  // Clarification modal state
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [activeClarifyDoc, setActiveClarifyDoc] = useState(null);
  const [clarificationText, setClarificationText] = useState('');
  const [submittingClarification, setSubmittingClarification] = useState(false);

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState(null);

  // Evidence list from state
  const evidenceList = state.evidence || [];
  const verifiedCount = evidenceList.filter((e) => e.status === 'verified').length;
  const pendingCount = evidenceList.filter((e) => e.status === 'needs_clarification' || e.status === 'under_review').length;

  const handleStartUpload = (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadStep(1);

    setTimeout(() => {
      setUploadStep(2); // Simulated cryptographic hash check
    }, 600);

    setTimeout(() => {
      setUploadStep(3); // Simulated optical character extraction
    }, 1200);

    setTimeout(() => {
      const fileName = selectedFile ? selectedFile.name : `${docCategory.replace(/\s+/g, '_')}_Official_Copy.pdf`;
      uploadEvidenceDocument({
        name: fileName,
        type: docCategory,
        size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
        supports: supportsClaim
      });
      setUploading(false);
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadStep(1);
    }, 1800);
  };

  const handleOpenClarification = (doc) => {
    setActiveClarifyDoc(doc);
    setClarificationText(
      doc.clarificationNote ||
        'This document contains verified catering contracts for Q3-Q4 festival bookings. Cash deposits were deposited in our primary checking account on the first Monday of each month.'
    );
    setClarificationModalOpen(true);
  };

  const handleSendClarification = (e) => {
    e.preventDefault();
    if (!activeClarifyDoc) return;
    setSubmittingClarification(true);

    setTimeout(() => {
      submitClarification(activeClarifyDoc.id, clarificationText);
      setSubmittingClarification(false);
      setClarificationModalOpen(false);
      setActiveClarifyDoc(null);
    }, 800);
  };

  return (
    <UserPortalLayout
      activePage="document-evidence"
      onNavigate={handleNavigate}
      user={state.user}
      toastMessage={toastMessage}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Screen Header & Top Action Bar */}
        <div className="cl-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Dashboard</span>
                <span>/</span>
                <span style={{ color: '#173B57', fontWeight: '700' }}>Evidence &amp; Documents</span>
              </div>
              <h1 className="cl-page-title" style={{ marginTop: '4px' }}>
                Document &amp; Evidence Management
              </h1>
              <p className="cl-page-subtitle">
                Inspect verified income statements, submit clarifications, and affirm self-reported financial claims.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="cl-btn cl-btn-secondary cl-btn-sm"
                onClick={syncBankData}
                title="Synchronize bank feeds"
              >
                <RefreshCw size={13} color="#0F766E" />
                <span>Re-Verify Feeds</span>
              </button>
              <button
                type="button"
                className="cl-btn cl-btn-primary cl-btn-sm"
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload size={14} />
                <span>Upload Document</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clear Demonstration Data Notice */}
        <div
          style={{
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#0369A1'
          }}
        >
          <Info size={18} color="#0284C7" style={{ flexShrink: 0 }} />
          <div>
            <strong>Interactive Verification Simulation:</strong> All cryptographic checks, optical character extractions, and underwriting reviews are executed locally in this frontend environment. No real private financial documents are transmitted to external servers.
          </div>
        </div>

        {/* 4 Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="cl-card">
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
              Total Tracked Documents
            </span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#172B3A', margin: '8px 0 4px' }}>
              {evidenceList.length} Files
            </div>
            <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>
              {verifiedCount} Authenticated
            </span>
          </div>

          <div className="cl-card">
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
              Verification Status
            </span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F766E', margin: '8px 0 4px' }}>
              {Math.round((verifiedCount / (evidenceList.length || 1)) * 100)}% Verified
            </div>
            <span style={{ fontSize: '12px', color: '#5B6B79' }}>
              {pendingCount > 0 ? `${pendingCount} item requires clarification` : 'Zero outstanding items'}
            </span>
          </div>

          <div className="cl-card">
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
              Evidence Integrity
            </span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#173B57', margin: '8px 0 4px' }}>
              256-Bit SHA
            </div>
            <span style={{ fontSize: '12px', color: '#5B6B79' }}>
              Anti-tamper audit trail verified
            </span>
          </div>

          <div className="cl-card" style={{ background: '#F8FAFC' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase' }}>
              Supported Borrowing Power
            </span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F766E', margin: '8px 0 4px' }}>
              +{formatCurrency(state.assessment?.recommendedCapacity || 25000)}
            </div>
            <span style={{ fontSize: '12px', color: '#5B6B79' }}>
              Based on verified annual surplus
            </span>
          </div>
        </div>

        {/* Missing Evidence Callout (if any document needs clarification) */}
        {evidenceList.some((e) => e.status === 'needs_clarification') && (
          <div className="cl-alert-banner warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: '#925D00',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '14px', color: '#7A4D00' }}>
                  Missing Evidence / Clarification Required
                </strong>
                <span style={{ fontSize: '13px', color: '#5B6B79' }}>
                  Your Schedule C / 1099 Form is currently unverified. Submitting a clarifying note or signed copy affirms uncredited catering revenue and unlocks up to <strong>+$6,500 borrowing capacity</strong>.
                </span>
              </div>
            </div>
            <button
              type="button"
              className="cl-btn cl-btn-primary cl-btn-sm"
              onClick={() => {
                const target = evidenceList.find((e) => e.status === 'needs_clarification');
                if (target) handleOpenClarification(target);
              }}
            >
              <MessageSquare size={14} />
              <span>Submit Clarification</span>
            </button>
          </div>
        )}

        {/* Evidence Ledger Table */}
        <div className="cl-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #DCE3EA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="#0F766E" />
              <h2 className="cl-card-title" style={{ fontSize: '16px' }}>
                Documentary Evidence Ledger
              </h2>
            </div>
            <span style={{ fontSize: '12px', color: '#748391' }}>
              Showing {evidenceList.length} verified and submitted files
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="cl-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #DCE3EA', textAlign: 'left', color: '#5B6B79' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Document Name</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Category</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Supports Financial Item</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Verification Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Timestamp</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {evidenceList.map((doc) => {
                  const isVerified = doc.status === 'verified';
                  const isClarify = doc.status === 'needs_clarification';
                  const isUnderReview = doc.status === 'under_review';

                  return (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: '1px solid #E2E8F0',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: '#F1F5F9',
                              color: '#173B57',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <FileText size={16} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: '#172B3A' }}>{doc.name}</strong>
                              <CopyButton text={doc.name} label="Copy Name" title="Copy Document Name" />
                            </div>
                            <span style={{ fontSize: '11px', color: '#748391' }}>{doc.size || '1.5 MB'} • SHA-256 Valid</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px', color: '#5B6B79' }}>
                        <span className="cl-badge cl-badge-neutral" style={{ fontSize: '11px' }}>
                          {doc.type}
                        </span>
                      </td>

                      <td style={{ padding: '14px', color: '#172B3A', fontWeight: '500' }}>
                        {doc.supports}
                      </td>

                      <td style={{ padding: '14px' }}>
                        {isVerified && (
                          <span className="cl-badge cl-badge-teal">
                            <CheckCircle2 size={13} />
                            <span>Verified</span>
                          </span>
                        )}
                        {isClarify && (
                          <span className="cl-badge cl-badge-warning">
                            <AlertTriangle size={13} />
                            <span>Needs Clarification</span>
                          </span>
                        )}
                        {isUnderReview && (
                          <span className="cl-badge cl-badge-neutral" style={{ background: '#EEF2F6', color: '#173B57' }}>
                            <Clock size={13} />
                            <span>Under Review</span>
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px', color: '#748391', fontSize: '12px' }}>
                        {doc.verifiedDate}
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {isClarify && (
                            <button
                              type="button"
                              className="cl-btn cl-btn-secondary cl-btn-sm"
                              onClick={() => handleOpenClarification(doc)}
                              style={{ color: '#925D00', borderColor: '#F5D998' }}
                            >
                              <MessageSquare size={13} />
                              <span>Clarify</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="cl-btn cl-btn-secondary cl-btn-sm"
                            onClick={() => setPreviewDoc(doc)}
                            title="Inspect document metadata"
                          >
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="cl-modal-overlay">
          <div className="cl-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Upload Financial Evidence
                </h3>
                <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
                  Affirm self-reported income, leases, or debts with supporting files.
                </p>
              </div>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setUploadModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="cl-label">Document Category</label>
                <select
                  className="cl-input"
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                >
                  <option value="Tax Return">Federal / State Tax Return (Schedule C, 1040, 1099)</option>
                  <option value="Bank Statement">Commercial / Personal Depository Bank Statement</option>
                  <option value="Lease Agreement">Commercial Facility or Residential Lease Contract</option>
                  <option value="Loan Agreement">Existing Equipment Note or Tradeline Agreement</option>
                  <option value="Utility Record">Utility, Telecom, or Commercial Service Bill</option>
                </select>
              </div>

              <div>
                <label className="cl-label">Supports Financial Claim</label>
                <input
                  type="text"
                  className="cl-input"
                  value={supportsClaim}
                  onChange={(e) => setSupportsClaim(e.target.value)}
                  placeholder="e.g. Catering Income, Fixed Kitchen Lease, Auto Debt"
                  required
                />
              </div>

              {/* Drag & Drop Simulation Dropzone */}
              <div
                style={{
                  border: '2px dashed #DCE3EA',
                  borderRadius: '10px',
                  padding: '28px 16px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('evidence-file-input').click()}
              >
                <Upload size={32} color="#0F766E" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#172B3A', margin: 0 }}>
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop financial document'}
                </p>
                <span style={{ fontSize: '11px', color: '#748391', marginTop: '4px', display: 'block' }}>
                  Supported formats: PDF, PNG, JPG (Max 25MB) • 256-Bit Hashing
                </span>
                <input
                  id="evidence-file-input"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Multi-step progress indicator when uploading */}
              {uploading && (
                <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#173B57' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                    <RefreshCw size={14} className="cl-spin" />
                    <span>
                      {uploadStep === 1 && 'Ingesting document bytes...'}
                      {uploadStep === 2 && 'Generating SHA-256 cryptographic anti-tamper hash...'}
                      {uploadStep === 3 && 'Simulating optical text extraction & financial factor linking...'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: '#DCE3EA', borderRadius: '999px', marginTop: '8px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(uploadStep / 3) * 100}%`,
                        height: '100%',
                        background: '#0F766E',
                        transition: 'width 0.4s ease'
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  onClick={() => setUploadModalOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cl-btn cl-btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Processing File...' : 'Upload & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clarification Submission Modal */}
      {clarificationModalOpen && activeClarifyDoc && (
        <div className="cl-modal-overlay">
          <div className="cl-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Submit Underwriter Clarification
                </h3>
                <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
                  Document: <strong>{activeClarifyDoc.name}</strong>
                </p>
              </div>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setClarificationModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendClarification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  background: '#FFF8E6',
                  border: '1px solid #F5D998',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#7A4D00'
                }}
              >
                <strong>Underwriting Note:</strong> Please explain the variance between self-reported catering receipts and deposit records in your seasonal checking account.
              </div>

              <div>
                <label className="cl-label">Your Clarification / Explanation</label>
                <textarea
                  className="cl-input"
                  rows={4}
                  value={clarificationText}
                  onChange={(e) => setClarificationText(e.target.value)}
                  placeholder="Provide context on income sources, timing of contract milestones, or off-season operations..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-secondary"
                  onClick={() => setClarificationModalOpen(false)}
                  disabled={submittingClarification}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cl-btn cl-btn-primary"
                  disabled={submittingClarification}
                >
                  {submittingClarification ? 'Submitting to Reviewer...' : 'Submit Clarification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {previewDoc && (
        <div className="cl-modal-overlay">
          <div className="cl-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#0F766E" />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#173B57', margin: 0 }}>
                  Evidence Inspection Record
                </h3>
              </div>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setPreviewDoc(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #DCE3EA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: '#748391' }}>File Name:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#172B3A' }}>{previewDoc.name}</strong>
                    <CopyButton text={previewDoc.name} label="Copy" title="Copy File Name" />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#748391' }}>Category:</span>
                  <span>{previewDoc.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#748391' }}>Supports Claim:</span>
                  <strong style={{ color: '#0F766E' }}>{previewDoc.supports}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#748391' }}>Verification Status:</span>
                  <span className="cl-badge cl-badge-teal">{previewDoc.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#748391' }}>Verification Date:</span>
                  <span>{previewDoc.verifiedDate}</span>
                </div>
              </div>

              {previewDoc.clarificationNote && (
                <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '12px', color: '#173B57', display: 'block', marginBottom: '4px' }}>
                    Clarification Submitted by Borrower:
                  </strong>
                  <p style={{ margin: 0, fontSize: '12px', color: '#5B6B79', fontStyle: 'italic' }}>
                    "{previewDoc.clarificationNote}"
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', fontSize: '11px', color: '#748391' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={12} color="#0F766E" />
                  <span>SHA-256 Digest: e89b4f2c8d2047a0648f87b1c31405b0781d09af</span>
                </div>
                <CopyButton text="e89b4f2c8d2047a0648f87b1c31405b0781d09af" label="Copy Hash" title="Copy SHA-256 Digest" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="cl-btn cl-btn-primary cl-btn-sm"
                onClick={() => setPreviewDoc(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </UserPortalLayout>
  );
}

export default EvidenceManagement;
