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

  submitAttempt: async (activityId, payload) => {
    const res = await apiClient.post(
      `/learning/activities/${activityId}/submit_attempt/`,
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
