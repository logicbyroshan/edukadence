import { apiClient } from './apiClient';
import { tokenStorage } from '../lib/tokenStorage';

export const authService = {
  login: async (identifier, password) => {
    const response = await apiClient.post('/auth/login/', { identifier, password });
    const { access, refresh, user } = response.data.data;
    tokenStorage.setAccessToken(access);
    tokenStorage.setRefreshToken(refresh);
    if (user.active_membership?.school_id) {
      tokenStorage.setActiveSchoolId(user.active_membership.school_id);
    }
    return response.data.data;
  },

  logout: async () => {
    const refresh = tokenStorage.getRefreshToken();
    try {
      if (refresh) {
        await apiClient.post('/auth/logout/', { refresh });
      }
    } finally {
      tokenStorage.clearAll();
    }
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.patch('/auth/me/', data);
    return response.data.data;
  },

  changePassword: async (old_password, new_password) => {
    const response = await apiClient.post('/auth/change-password/', {
      old_password,
      new_password,
    });
    return response.data;
  },
};
