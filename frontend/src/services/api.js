/**
 * CreditLens Centralized API Service Client
 * Connects frontend directly to the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('creditlens_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return await response.json();
  } catch (error) {
    if (!error.status) {
      console.warn(`[CreditLens API] Network or connection error to ${endpoint}:`, error.message);
    }
    throw error;
  }
}

export const api = {
  // Base Health
  checkHealth: () => request('/health'),

  // Authentication
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getCurrentUser: () => request('/auth/me'),

  // Loan Applications
  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications${query ? `?${query}` : ''}`);
  },

  getApplicationById: (id) => request(`/applications/${id}`),

  createApplication: (data) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateApplicationStatus: (id, statusData) =>
    request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    }),

  // Assessment & ULAS Explainability
  getAssessment: (applicationId) => request(`/assessments/${applicationId}`),
  getUlasAssessment: (applicationId) => request(`/assessments/${applicationId}`),
  getUlasHistory: (applicationId) => request(`/assessments/${applicationId}/history`),
  runUlasAssessment: (applicationId) =>
    request(`/assessments/${applicationId}/run`, { method: 'POST' }),

  simulateLoan: (simulationData) =>
    request('/assessments/simulate', {
      method: 'POST',
      body: JSON.stringify(simulationData)
    }),

  // Document Management & PDF Upload
  uploadDocument: async (applicationId, file, category) => {
    const url = `${API_BASE_URL}/applications/${applicationId}/documents`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const token = localStorage.getItem('creditlens_auth_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || `Upload failed with status ${response.status}`;
      throw new Error(message);
    }
    return await response.json();
  },

  getApplicationDocuments: (applicationId) =>
    request(`/applications/${applicationId}/documents`),

  getVerificationReport: (applicationId) =>
    request(`/applications/${applicationId}/verification-report`),

  // Evidence & Verification
  getVerificationTasks: (applicationId) => {
    const query = applicationId ? `?application_id=${applicationId}` : '';
    return request(`/verification-tasks${query}`);
  },

  getApplicationEvidence: (applicationId) =>
    request(`/applications/${applicationId}/evidence`),

  // Audit Events
  getAuditEvents: (limit = 50) => request(`/audit-events?limit=${limit}`),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'POST' }),

  // Borrower Profile
  getUserProfile: () => request('/user/profile'),

  updateUserProfile: (profileData) =>
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  // AI Financial X-Ray & Bureau Reconciliation
  getFinancialXRay: (scenario) => {
    const query = scenario ? `?scenario=${scenario}` : '';
    return request(`/financial-xray/current${query}`);
  },

  runFinancialXRay: (data = {}) =>
    request('/financial-xray/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  loadDemoScenario: (scenarioId) =>
    request(`/financial-xray/demo/${scenarioId}`, {
      method: 'POST'
    }),

  generateDisputeLetter: (letterData) =>
    request('/financial-xray/dispute-letter', {
      method: 'POST',
      body: JSON.stringify(letterData)
    }),

  // CreditLens AI Finance Assistant Chatbot
  sendChatMessage: (message, scenarioContext = null) =>
    request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, scenario_context: scenarioContext })
    }),

  getChatHistory: () => request('/chat/history'),

  clearChatHistory: () =>
    request('/chat/history', {
      method: 'DELETE'
    }),

  getChatSuggestions: () => request('/chat/suggestions')
};

export default api;
