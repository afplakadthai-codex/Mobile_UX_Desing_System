import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import {
  authApi,
  tokenStorage,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from '../../api/auth';

type AuthStatus = 'loading' | 'authenticated' | 'guest';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const applyAuthenticatedState = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const clearSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    setStatus('guest');
    await tokenStorage.clear();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const response = await authApi.me(token);
    setUser(response.user);
  }, [token]);

  const bootstrap = useCallback(async () => {
    try {
      const storedToken = await tokenStorage.get();
      if (!storedToken) {
        setStatus('guest');
        return;
      }
      const response = await authApi.me(storedToken);
      applyAuthenticatedState(storedToken, response.user);
    } catch {
      await clearSession();
    }
  }, [applyAuthenticatedState, clearSession]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    await tokenStorage.set(response.token);
    applyAuthenticatedState(response.token, response.user);
  }, [applyAuthenticatedState]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    await tokenStorage.set(response.token);
    applyAuthenticatedState(response.token, response.user);
  }, [applyAuthenticatedState]);

  const logout = useCallback(async () => {
    const activeToken = token;
    try {
      if (activeToken) {
        await authApi.logout(activeToken);
      }
    } finally {
      await clearSession();
    }
  }, [clearSession, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      refreshUser,
    }),
    [login, logout, refreshUser, register, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
