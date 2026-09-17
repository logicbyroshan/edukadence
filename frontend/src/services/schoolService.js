import { apiClient } from './apiClient';

export const schoolService = {
  getSchools: async () => {
    const response = await apiClient.get('/schools/');
    return response.data.results || response.data;
  },

  getSchool: async (id) => {
    const response = await apiClient.get(`/schools/${id}/`);
    return response.data;
  },

  getSchoolStats: async (id) => {
    const response = await apiClient.get(`/schools/${id}/stats/`);
    return response.data.data;
  },

  getMemberships: async () => {
    const response = await apiClient.get('/schools/memberships/');
    return response.data.results || response.data;
  },

  getAcademicYears: async () => {
    const response = await apiClient.get('/schools/academic-years/');
    return response.data.results || response.data;
  },
};
