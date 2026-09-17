import { apiClient } from './apiClient';

export const reportService = {
  getAttendanceReport: async (params = {}) => {
    const res = await apiClient.get('/reports/attendance/', { params });
    return res.data;
  },

  getFeeReport: async () => {
    const res = await apiClient.get('/reports/fees/');
    return res.data;
  },

  getClassStrengthReport: async () => {
    const res = await apiClient.get('/reports/class-strength/');
    return res.data;
  },

  getExportUrl: (reportType) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/reports/export/${reportType}/`;
  },
};
