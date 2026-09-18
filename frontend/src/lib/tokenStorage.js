const ACCESS_TOKEN_KEY = 'edukadence_access_token';
const REFRESH_TOKEN_KEY = 'edukadence_refresh_token';
const ACTIVE_SCHOOL_ID_KEY = 'edukadence_active_school_id';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  getActiveSchoolId: () => localStorage.getItem(ACTIVE_SCHOOL_ID_KEY),
  setActiveSchoolId: (schoolId) => {
    if (schoolId) {
      localStorage.setItem(ACTIVE_SCHOOL_ID_KEY, schoolId);
    } else {
      localStorage.removeItem(ACTIVE_SCHOOL_ID_KEY);
    }
  },

  clearAll: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACTIVE_SCHOOL_ID_KEY);
  },
};
