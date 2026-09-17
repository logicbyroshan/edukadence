import { apiClient } from './apiClient';

export const attendanceService = {
  getAttendance: async (params = {}) => {
    const res = await apiClient.get('/attendance/', { params });
    return res.data;
  },

  createAttendance: async (data) => {
    const res = await apiClient.post('/attendance/', data);
    return res.data;
  },

  updateAttendance: async (id, data) => {
    const res = await apiClient.patch(`/attendance/${id}/`, data);
    return res.data;
  },

  bulkMarkAttendance: async (data) => {
    const res = await apiClient.post('/attendance/bulk_mark/', data);
    return res.data;
  },

  getAttendanceSummary: async (params = {}) => {
    const res = await apiClient.get('/attendance/summary/', { params });
    return res.data;
  },
};
