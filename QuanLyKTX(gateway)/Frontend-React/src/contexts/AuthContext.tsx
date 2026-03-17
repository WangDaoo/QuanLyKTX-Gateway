// Auth Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginResponse } from '../types/api';
import { LOCAL_STORAGE_KEYS, API_BASE_URL } from '../utils/constants';
import { ENDPOINTS } from '../utils/constants';

// === PascalCase → camelCase normalizer (same logic as apiClient.norm) ===
function toCamelCase(str: string): string {
  if (!str) return str;
  const afterSnake = str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return afterSnake[0].toLowerCase() + afterSnake.slice(1);
}

function normUser<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = toCamelCase(key);
    if (result[camelKey] === undefined) {
      const val = obj[key as keyof T];
      result[camelKey] = val !== null && typeof val === 'object' && !Array.isArray(val)
        ? normUser(val as Record<string, unknown>)
        : Array.isArray(val)
        ? val.map((v) => (typeof v === 'object' && v !== null ? normUser(v as Record<string, unknown>) : v))
        : val;
    }
  }
  return result as T;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tenDangNhap: string, matKhau: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Normalize: support both PascalCase and camelCase (from previous sessions)
      return normUser(parsed as unknown as Record<string, unknown>) as unknown as User;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  });

  const [isLoading, setIsLoading] = useState(false);

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (tenDangNhap: string, matKhau: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap, matKhau }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Đăng nhập thất bại' }));
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      const data: LoginResponse = await response.json();

      if (!data.success || !data.token) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Normalize user fields: PascalCase → camelCase
      // Backend returns VaiTro, MaTaiKhoan, TenDangNhap, HoTen
      // Frontend expects vaiTro, maTaiKhoan, tenDangNhap, hoTen
      const user = normUser(data.user as unknown as Record<string, unknown>) as unknown as User;

      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));

      setToken(data.token);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
