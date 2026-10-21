import React, { useState, useEffect, useCallback } from 'react';
import type { User, LoginRequest } from '../types/auth.types';
import type { CandidateRegisterRequest } from '../types/candidate.types';
import authService from '../api/authService';
import candidateService from '../api/candidateService';
import { AuthContext, type AuthContextType } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify existing token on app mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch {
        // Token expired or invalid
        if (isMounted) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(credentials);
      localStorage.setItem('token', authData.accessToken);
      setToken(authData.accessToken);
      setUser(authData.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerCandidate = useCallback(async (data: CandidateRegisterRequest) => {
    setIsLoading(true);
    try {
      const authData = await candidateService.register(data);
      localStorage.setItem('token', authData.accessToken);
      setToken(authData.accessToken);
      setUser(authData.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    registerCandidate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
