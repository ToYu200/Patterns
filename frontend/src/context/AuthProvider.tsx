import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../types';
import { fetchMe, login as loginRequest, register as registerRequest } from '../api/platform';
import { AuthContext } from './authContext';

const TOKEN_KEY = 'pvp_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    fetchMe(token)
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const saveSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest(email, password);
      saveSession(result.token, result.user);
    },
    [saveSession],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const result = await registerRequest(username, email, password);
      saveSession(result.token, result.user);
    },
    [saveSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
