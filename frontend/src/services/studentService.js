import { apiClient } from './apiClient';

export const studentService = {
  // Children
  getChildren: async (params = {}) => {
    const res = await apiClient.get('/students/children/', { params });
    return res.data;
  },

  getChildById: async (id) => {
    const res = await apiClient.get(`/students/children/${id}/`);
    return res.data;
  },

  getChildOverview: async (id) => {
    const res = await apiClient.get(`/students/children/${id}/overview/`);
    return res.data;
  },

  createChild: async (data) => {
    const res = await apiClient.post('/students/children/', data);
    return res.data;
  },

  updateChild: async (id, data) => {
    const res = await apiClient.patch(`/students/children/${id}/`, data);
    return res.data;
  },

  deleteChild: async (id) => {
    const res = await apiClient.delete(`/students/children/${id}/`);
    return res.data;
  },

  // Parents
  getParents: async (params = {}) => {
    const res = await apiClient.get('/students/parents/', { params });
    return res.data;
  },

  createParent: async (data) => {
    const res = await apiClient.post('/students/parents/', data);
    return res.data;
  },

  updateParent: async (id, data) => {
    const res = await apiClient.patch(`/students/parents/${id}/`, data);
    return res.data;
  },

  // Parent-Child Relationships
  getRelationships: async (params = {}) => {
    const res = await apiClient.get('/students/relationships/', { params });
    return res.data;
  },

  createRelationship: async (data) => {
    const res = await apiClient.post('/students/relationships/', data);
    return res.data;
  },

  deleteRelationship: async (id) => {
    const res = await apiClient.delete(`/students/relationships/${id}/`);
    return res.data;
  },

  // Authorized Pickups
  getAuthorizedPickups: async (params = {}) => {
    const res = await apiClient.get('/students/authorized-pickups/', { params });
    return res.data;
  },

  createAuthorizedPickup: async (data) => {
    const res = await apiClient.post('/students/authorized-pickups/', data);
    return res.data;
  },

  updateAuthorizedPickup: async (id, data) => {
    const res = await apiClient.patch(`/students/authorized-pickups/${id}/`, data);
    return res.data;
  },

  // Pickup Records / Daily Dismissals
  getPickupRecords: async (params = {}) => {
    const res = await apiClient.get('/students/pickup-records/', { params });
    return res.data;
  },

  recordDismissal: async (data) => {
    const res = await apiClient.post('/students/pickup-records/record_dismissal/', data);
    return res.data;
  },
};
