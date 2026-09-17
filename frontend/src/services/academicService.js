import { apiClient } from './apiClient';

export const academicService = {
  // Class Levels
  getClassLevels: async (params = {}) => {
    const res = await apiClient.get('/classes/levels/', { params });
    return res.data;
  },

  createClassLevel: async (data) => {
    const res = await apiClient.post('/classes/levels/', data);
    return res.data;
  },

  updateClassLevel: async (id, data) => {
    const res = await apiClient.patch(`/classes/levels/${id}/`, data);
    return res.data;
  },

  deleteClassLevel: async (id) => {
    const res = await apiClient.delete(`/classes/levels/${id}/`);
    return res.data;
  },

  // Sections
  getSections: async (params = {}) => {
    const res = await apiClient.get('/classes/sections/', { params });
    return res.data;
  },

  createSection: async (data) => {
    const res = await apiClient.post('/classes/sections/', data);
    return res.data;
  },

  updateSection: async (id, data) => {
    const res = await apiClient.patch(`/classes/sections/${id}/`, data);
    return res.data;
  },

  getSectionRoster: async (sectionId) => {
    const res = await apiClient.get(`/classes/sections/${sectionId}/roster/`);
    return res.data;
  },

  // Teacher Assignments
  getTeacherAssignments: async (params = {}) => {
    const res = await apiClient.get('/classes/teacher-assignments/', { params });
    return res.data;
  },

  createTeacherAssignment: async (data) => {
    const res = await apiClient.post('/classes/teacher-assignments/', data);
    return res.data;
  },

  deleteTeacherAssignment: async (id) => {
    const res = await apiClient.delete(`/classes/teacher-assignments/${id}/`);
    return res.data;
  },

  // Enrollments
  getEnrollments: async (params = {}) => {
    const res = await apiClient.get('/classes/enrollments/', { params });
    return res.data;
  },

  createEnrollment: async (data) => {
    const res = await apiClient.post('/classes/enrollments/', data);
    return res.data;
  },

  updateEnrollment: async (id, data) => {
    const res = await apiClient.patch(`/classes/enrollments/${id}/`, data);
    return res.data;
  },
};
