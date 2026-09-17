import { apiClient } from './apiClient';

export const activityService = {
  getActivities: async (params = {}) => {
    const res = await apiClient.get('/activities/', { params });
    return res.data;
  },

  getActivityById: async (id) => {
    const res = await apiClient.get(`/activities/${id}/`);
    return res.data;
  },

  createActivity: async (data) => {
    const res = await apiClient.post('/activities/', data);
    return res.data;
  },

  updateActivity: async (id, data) => {
    const res = await apiClient.patch(`/activities/${id}/`, data);
    return res.data;
  },

  deleteActivity: async (id) => {
    const res = await apiClient.delete(`/activities/${id}/`);
    return res.data;
  },
};
