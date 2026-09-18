import { apiClient } from './apiClient';

export const learningService = {
  // Kid Mode Home Summary
  getKidHome: async (childId) => {
    const res = await apiClient.get('/learning/kid-home/', {
      params: childId ? { child_id: childId } : {},
    });
    return res.data;
  },

  // Levels & Areas
  getLevels: async () => {
    const res = await apiClient.get('/learning/levels/');
    return res.data.results || res.data;
  },

  getAreas: async () => {
    const res = await apiClient.get('/learning/areas/');
    return res.data.results || res.data;
  },

  getTopics: async (params = {}) => {
    const res = await apiClient.get('/learning/topics/', { params });
    return res.data.results || res.data;
  },

  // Activities
  getActivities: async (params = {}) => {
    const res = await apiClient.get('/learning/activities/', { params });
    return res.data.results || res.data;
  },

  getActivityDetail: async (id) => {
    const res = await apiClient.get(`/learning/activities/${id}/`);
    return res.data;
  },

  getActivityTemplates: async () => {
    const res = await apiClient.get('/learning/activities/templates/');
    return res.data.templates || res.data;
  },

  createActivity: async (data) => {
    const res = await apiClient.post('/learning/activities/', data);
    return res.data;
  },

  updateActivity: async (id, data) => {
    const res = await apiClient.put(`/learning/activities/${id}/`, data);
    return res.data;
  },

  duplicateActivity: async (id) => {
    const res = await apiClient.post(`/learning/activities/${id}/duplicate/`);
    return res.data;
  },

  deleteActivity: async (id) => {
    const res = await apiClient.delete(`/learning/activities/${id}/`);
    return res.data;
  },

  submitAttempt: async (activityId, payload) => {
    const res = await apiClient.post(
      `/learning/activities/${activityId}/submit_attempt/`,
      payload
    );
    return res.data;
  },

  // Homework Sets
  getHomeworkList: async (params = {}) => {
    const res = await apiClient.get('/learning/homework/', { params });
    return res.data.results || res.data;
  },

  getHomeworkDetail: async (id) => {
    const res = await apiClient.get(`/learning/homework/${id}/`);
    return res.data;
  },

  createHomework: async (data) => {
    const res = await apiClient.post('/learning/homework/', data);
    return res.data;
  },

  updateHomework: async (id, data) => {
    const res = await apiClient.put(`/learning/homework/${id}/`, data);
    return res.data;
  },

  publishHomework: async (id) => {
    const res = await apiClient.post(`/learning/homework/${id}/publish/`);
    return res.data;
  },

  duplicateHomework: async (id) => {
    const res = await apiClient.post(`/learning/homework/${id}/duplicate/`);
    return res.data;
  },

  deleteHomework: async (id) => {
    const res = await apiClient.delete(`/learning/homework/${id}/`);
    return res.data;
  },

  // Assignments
  getAssignments: async (params = {}) => {
    const res = await apiClient.get('/learning/assignments/', { params });
    return res.data.results || res.data;
  },

  getAssignmentDetail: async (id) => {
    const res = await apiClient.get(`/learning/assignments/${id}/`);
    return res.data;
  },

  createAssignment: async (data) => {
    const res = await apiClient.post('/learning/assignments/', data);
    return res.data;
  },

  getClassProgress: async (assignmentId) => {
    const res = await apiClient.get(`/learning/assignments/${assignmentId}/class_progress/`);
    return res.data;
  },

  submitTeacherFeedback: async (assignmentId, payload) => {
    const res = await apiClient.post(
      `/learning/assignments/${assignmentId}/feedback/`,
      payload
    );
    return res.data;
  },

  // Attempts & Progress
  getAttempts: async (params = {}) => {
    const res = await apiClient.get('/learning/attempts/', { params });
    return res.data.results || res.data;
  },

  getProgress: async (childId) => {
    const res = await apiClient.get('/learning/progress/', {
      params: childId ? { child_id: childId } : {},
    });
    return res.data.results || res.data;
  },

  getHomeworkProgress: async (params = {}) => {
    const res = await apiClient.get('/learning/homework-progress/', { params });
    return res.data.results || res.data;
  },

  // Badges
  getBadges: async () => {
    const res = await apiClient.get('/learning/badges/');
    return res.data.results || res.data;
  },

  getChildBadges: async (childId) => {
    const res = await apiClient.get('/learning/child-badges/', {
      params: childId ? { child_id: childId } : {},
    });
    return res.data.results || res.data;
  },

  // Stories & Videos
  getStories: async (params = {}) => {
    const res = await apiClient.get('/learning/stories/', { params });
    return res.data.results || res.data;
  },

  getVideos: async (params = {}) => {
    const res = await apiClient.get('/learning/videos/', { params });
    return res.data.results || res.data;
  },
};
