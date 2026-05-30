import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/axios';

export const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [authReady, setAuthReady] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    return Boolean(readStoredUser());
  });

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      try {
        const { data } = await api.get('/auth/me', { timeout: 5000 });
        if (!cancelled && data?.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch {
        const cached = readStoredUser();
        if (!cancelled) {
          if (cached) {
            setUser(cached);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((userData, token) => {
    if (token) localStorage.setItem('token', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    setAuthReady(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthReady(true);
  }, []);

  const isAuthenticated = Boolean(localStorage.getItem('token') && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading: !authReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
