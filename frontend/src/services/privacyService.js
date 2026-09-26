import { apiClient } from './apiClient';

export const privacyService = {
  // 1. Notice & Legal Baseline
  getLatestNotice: async () => {
    const response = await apiClient.get('/privacy/notice/latest/');
    return response.data.data;
  },

  // 2. Consent Engine (Section 6 & 9 DPDP Act)
  getConsentPurposes: async () => {
    const response = await apiClient.get('/privacy/consent/purposes/');
    return response.data.data;
  },

  getMyConsents: async () => {
    const response = await apiClient.get('/privacy/consent/my-consents/');
    return response.data.data;
  },

  updateConsent: async ({ purpose_id, child_id = null, status = 'GRANTED', revocation_reason = '', verification_method = 'PORTAL_ACTION' }) => {
    const response = await apiClient.post('/privacy/consent/my-consents/', {
      purpose_id,
      child_id,
      status,
      revocation_reason,
      verification_method,
    });
    return response.data.data;
  },

  // 3. Section 11 Right to Access Summary (Instant Data Package)
  exportMyData: async () => {
    const response = await apiClient.get('/privacy/export-my-data/');
    return response.data.data;
  },

  // 4. Data Principal Rights Requests (Section 11 & 12)
  getDataRequests: async () => {
    const response = await apiClient.get('/privacy/requests/');
    return response.data.results || response.data;
  },

  submitDataRequest: async ({ child = null, request_type, details }) => {
    const response = await apiClient.post('/privacy/requests/', {
      child,
      request_type,
      details,
    });
    return response.data.data;
  },

  // 5. Section 14 Right to Nominate
  getNominations: async () => {
    const response = await apiClient.get('/privacy/nominations/');
    return response.data.results || response.data;
  },

  createNomination: async (data) => {
    const response = await apiClient.post('/privacy/nominations/', data);
    return response.data;
  },

  deleteNomination: async (id) => {
    const response = await apiClient.delete(`/privacy/nominations/${id}/`);
    return response.data;
  },

  // 6. Section 13 Grievance Redressal
  getGrievances: async () => {
    const response = await apiClient.get('/privacy/grievances/');
    return response.data.results || response.data;
  },

  submitGrievance: async ({ category, subject, description }) => {
    const response = await apiClient.post('/privacy/grievances/', {
      category,
      subject,
      description,
    });
    return response.data.data;
  },

  // ===========================================================================
  // School Admin / Governance Endpoints
  // ===========================================================================
  getAdminRequests: async () => {
    const response = await apiClient.get('/privacy/admin/requests/');
    return response.data.results || response.data;
  },

  updateAdminRequestStatus: async (id, { status, resolution_notes }) => {
    const response = await apiClient.post(`/privacy/admin/requests/${id}/update-status/`, {
      status,
      resolution_notes,
    });
    return response.data.data;
  },

  getAdminGrievances: async () => {
    const response = await apiClient.get('/privacy/admin/grievances/');
    return response.data.results || response.data;
  },

  resolveAdminGrievance: async (id, { status, resolution_summary }) => {
    const response = await apiClient.post(`/privacy/admin/grievances/${id}/resolve/`, {
      status,
      resolution_summary,
    });
    return response.data.data;
  },

  getAdminBreaches: async () => {
    const response = await apiClient.get('/privacy/admin/breaches/');
    return response.data.results || response.data;
  },

  createAdminBreach: async (data) => {
    const response = await apiClient.post('/privacy/admin/breaches/', data);
    return response.data;
  },

  getAdminRetentionPolicies: async () => {
    const response = await apiClient.get('/privacy/admin/retention-policies/');
    return response.data.results || response.data;
  },

  runRetentionCleanup: async () => {
    const response = await apiClient.post('/privacy/admin/run-retention-cleanup/');
    return response.data.data;
  },

  getAdminAuditLogs: async () => {
    const response = await apiClient.get('/privacy/admin/audit-logs/');
    return response.data.results || response.data;
  },
};
