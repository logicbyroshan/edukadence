import { apiClient } from './apiClient';

export const communicationService = {
  getAnnouncements: async (params = {}) => {
    const res = await apiClient.get('/communication/announcements/', { params });
    return res.data;
  },

  createAnnouncement: async (data) => {
    const res = await apiClient.post('/communication/announcements/', data);
    return res.data;
  },

  updateAnnouncement: async (id, data) => {
    const res = await apiClient.patch(`/communication/announcements/${id}/`, data);
    return res.data;
  },

  deleteAnnouncement: async (id) => {
    const res = await apiClient.delete(`/communication/announcements/${id}/`);
    return res.data;
  },
};
