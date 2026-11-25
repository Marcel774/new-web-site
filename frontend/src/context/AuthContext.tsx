import React, { createContext, useCallback, useContext, useState } from 'react';
import { api, setAuthToken } from '../services/api';
import type { AdminUser } from '../types/movie';

interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.loginAdmin({ email, password });
    setAuthToken(response.token);
    setAdmin(response.admin);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await api.registerAdmin({ name, email, password });
    setAuthToken(response.token);
    setAdmin(response.admin);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: Boolean(admin),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
