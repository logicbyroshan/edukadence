import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../lib/tokenStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await authService.getMe();
        setUser(userData);
      } catch (err) {
        tokenStorage.clearAll();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const data = await authService.login(identifier, password);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const switchSchool = (schoolId) => {
    tokenStorage.setActiveSchoolId(schoolId);
    // Refresh current user with new active school context
    authService.getMe().then(setUser);
  };

  const activeMembership = user?.active_membership || user?.memberships?.[0];
  const activeRole = activeMembership?.role || (user?.is_superuser ? 'SUPER_ADMIN' : 'GUEST');

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    activeMembership,
    activeRole,
    login,
    logout,
    switchSchool,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
