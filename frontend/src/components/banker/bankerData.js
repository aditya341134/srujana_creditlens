/**
 * Synthetic Demo Data & State Manager for CreditLens Banker Portal
 * Complies with design.md and Banker Development Prompt requirements:
 * - Uses external JSON files as seed datasets
 * - Employs localStorage for interactive persistence while preserving JSON initial baseline
 * - Currency: Indian Rupee (INR ₹)
 * - 8 distinct realistic synthetic borrower profiles
 */

import SEED_APPLICATIONS from '../../data/applications.json';
import SEED_VERIFICATION_TASKS from '../../data/verificationTasks.json';
import SEED_REVIEW_ACTIONS from '../../data/reviewActions.json';
import SEED_AUDIT_EVENTS from '../../data/auditEvents.json';
import SEED_NOTIFICATIONS from '../../data/notifications.json';
import { calculateEMI, calculateDTI, calculateDSCR, calculateRemainingSurplus } from '../../utils/financialCalculations';

// Storage keys
const STORAGE_KEYS = {
  APPLICATIONS: 'creditlens_banker_apps_v2',
  VERIFICATION: 'creditlens_banker_verification_v2',
  ACTIONS: 'creditlens_banker_actions_v2',
  AUDIT: 'creditlens_banker_audit_v2',
  NOTIFICATIONS: 'creditlens_banker_notifs_v2',
};

function getStoredOrSeed(key, seedData) {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn(`Failed to parse ${key} from localStorage`, e);
      }
    }
  }
  return seedData;
}

function saveToStorage(key, data) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
    }
  }
}

// ----------------- APPLICATIONS -----------------

export function getApplications() {
  return getStoredOrSeed(STORAGE_KEYS.APPLICATIONS, SEED_APPLICATIONS);
}

export function saveApplications(apps) {
  saveToStorage(STORAGE_KEYS.APPLICATIONS, apps);
}

export function getApplicationById(id) {
  const apps = getApplications();
  return apps.find((app) => app.id.toLowerCase() === (id || '').toLowerCase()) || null;
}

// ----------------- VERIFICATION TASKS -----------------

export function getVerificationTasks() {
  return getStoredOrSeed(STORAGE_KEYS.VERIFICATION, SEED_VERIFICATION_TASKS);
}

export function saveVerificationTasks(tasks) {
  saveToStorage(STORAGE_KEYS.VERIFICATION, tasks);
}

export function updateVerificationTask(taskId, updates) {
  const tasks = getVerificationTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) throw new Error(`Task ${taskId} not found`);

  const updated = {
    ...tasks[index],
    ...updates,
    lastActionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  tasks[index] = updated;
  saveVerificationTasks(tasks);

  // Log audit event
  logAuditEvent({
    applicationId: updated.applicationId,
    eventType: 'Evidence Status Updated',
    description: `Task ${taskId} (${updated.claim}) marked as '${updated.status}'. Reviewer note: "${updated.notes || ''}"`,
    changedValues: { taskId, status: updated.status },
  });

  return updated;
}

// ----------------- REVIEW ACTIONS -----------------

export function getReviewActions() {
  return getStoredOrSeed(STORAGE_KEYS.ACTIONS, SEED_REVIEW_ACTIONS);
}

export function saveReviewActions(actions) {
  saveToStorage(STORAGE_KEYS.ACTIONS, actions);
}

export function updateReviewAction(actionId, updates) {
  const actions = getReviewActions();
  const index = actions.findIndex((a) => a.id === actionId);
  if (index === -1) throw new Error(`Action ${actionId} not found`);

  const updated = { ...actions[index], ...updates };
  actions[index] = updated;
  saveReviewActions(actions);

  logAuditEvent({
    applicationId: updated.applicationId,
    eventType: 'Review Action Completed',
    description: `Review action '${updated.suggestedAction}' status changed to '${updated.status}'.`,
    changedValues: { actionId, status: updated.status },
  });

  return updated;
}

// ----------------- AUDIT EVENTS -----------------

export function getAuditEvents() {
  return getStoredOrSeed(STORAGE_KEYS.AUDIT, SEED_AUDIT_EVENTS);
}

export function logAuditEvent({ applicationId, eventType, description, changedValues = {} }) {
  const events = getAuditEvents();
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

  const newEvent = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp,
    applicationId: applicationId || 'SYSTEM',
    user: 'David Vance (Senior Underwriter #301)',
    eventType,
    description,
    changedValues,
  };

  events.unshift(newEvent);
  saveToStorage(STORAGE_KEYS.AUDIT, events);
  return newEvent;
}

// ----------------- NOTIFICATIONS -----------------

export function getNotifications() {
  return getStoredOrSeed(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
}

export function markNotificationRead(id) {
  const notifs = getNotifications();
  const index = notifs.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifs[index].read = true;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }
  return notifs;
}

// ----------------- BANKER STATS (Prompt Section 4) -----------------

export function getBankerStats() {
  const apps = getApplications();
  const tasks = getVerificationTasks();

  const total = apps.length;
  const pendingReview = apps.filter((a) => a.status === 'Pending Review').length;
  const verificationRequired = apps.filter((a) => a.status === 'Verification Required' || a.status === 'Missing Information').length;
  const readyForReview = apps.filter((a) => a.status === 'Ready for Review').length;
  const completedDecisions = apps.filter((a) => a.status === 'Completed Decisions' || a.status === 'Approved' || a.status === 'Rejected').length;
  const furtherReview = apps.filter((a) => a.status === 'Further Review Required').length;

  const approved = apps.filter((a) => a.status === 'Approved' || (a.decisionHistory && a.decisionHistory.decision === 'Approved')).length;
  const rejected = apps.filter((a) => a.status === 'Rejected' || (a.decisionHistory && a.decisionHistory.decision === 'Rejected')).length;
  const decidedCount = approved + rejected;

  const approvalRate = decidedCount > 0 ? ((approved / decidedCount) * 100).toFixed(1) : '60.0';

  return {
    total,
    pendingReview,
    verificationRequired,
    readyForReview,
    completedDecisions,
    furtherReview,
    approved,
    rejected,
    approvalRate,
    outstandingTasksCount: tasks.filter((t) => t.status !== 'Verified').length,
    distribution: [
      { label: 'Ready for Review', count: readyForReview, status: 'Ready for Review', color: '#0F766E', bg: '#E6F4F1' },
      { label: 'Verification Required', count: verificationRequired, status: 'Verification Required', color: '#925D00', bg: '#FFF4D6' },
      { label: 'Pending Review', count: pendingReview, status: 'Pending Review', color: '#245EA8', bg: '#EAF2FE' },
      { label: 'Further Review', count: furtherReview, status: 'Further Review Required', color: '#7E22CE', bg: '#F3E8FF' },
      { label: 'Completed Decisions', count: completedDecisions, status: 'Completed Decisions', color: '#18794E', bg: '#E8F5EE' },
    ],
  };
}

// ----------------- DECISION RECORDING -----------------

export function recordBankerDecision(applicationId, { decision, reason, approvedAmount, approvedTenure, conditions, officer = 'David Vance (Senior Underwriter #301)' }) {
  const apps = getApplications();
  const index = apps.findIndex((a) => a.id.toLowerCase() === (applicationId || '').toLowerCase());
  if (index === -1) {
    throw new Error(`Application ${applicationId} not found.`);
  }

  const updatedApp = { ...apps[index] };
  const now = new Date();
  const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

  if (decision === 'Approved') {
    updatedApp.status = 'Approved';
    updatedApp.reviewStatus = 'Completed Decisions';
  } else if (decision === 'Rejected') {
    updatedApp.status = 'Rejected';
    updatedApp.reviewStatus = 'Completed Decisions';
  } else if (decision === 'Request Additional Information' || decision === 'Missing Information') {
    updatedApp.status = 'Missing Information';
    updatedApp.reviewStatus = 'Missing Information';
  } else if (decision === 'Further Review Required') {
    updatedApp.status = 'Further Review Required';
    updatedApp.reviewStatus = 'Further Review Required';
  }

  const decisionRecord = {
    decision,
    officer,
    timestamp: formattedDate,
    reason: reason || 'Documented underwriting rationale recorded.',
    approvedAmount: approvedAmount !== undefined ? approvedAmount : updatedApp.requestedAmount,
    approvedTenure: approvedTenure !== undefined ? approvedTenure : updatedApp.tenureMonths,
    conditions: conditions || 'Standard CreditLens loan facility covenants apply.',
  };

  updatedApp.decisionHistory = decisionRecord;
  updatedApp.lastUpdated = formattedDate;

  apps[index] = updatedApp;
  saveApplications(apps);

  logAuditEvent({
    applicationId,
    eventType: 'Decision Recorded',
    description: `Underwriter decision: ${decision} by ${officer}. Rationale: "${reason?.substring(0, 75)}..."`,
    changedValues: { decision, approvedAmount, approvedTenure },
  });

  return updatedApp;
}

// ----------------- RESET DEMO DATA -----------------

export function resetDemoData() {
  if (typeof window !== 'undefined') {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
  return SEED_APPLICATIONS;
}
