import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { UserService, User, AuthResponse } from '../api/userService';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await storage.getItem('authToken');
        const storedUser = await storage.getItem('authUser');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token is still valid
          try {
            await UserService.verifyToken(storedToken);
          } catch (err) {
            // Token invalid, clear storage
            await storage.removeItem('authToken');
            await storage.removeItem('authUser');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (
    email: string,
    username: string,
    password: string,
    fullName?: string
  ) => {
    try {
      setError(null);
      setIsLoading(true);

      const response: AuthResponse = await UserService.register({
        email,
        username,
        password,
        fullName,
      });

      // Save token and user to storage
      await storage.setItem('authToken', response.token);
      await storage.setItem('authUser', JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err?.error || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response: AuthResponse = await UserService.login(email, password);

      // Save token and user to storage
      await storage.setItem('authToken', response.token);
      await storage.setItem('authUser', JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err?.error || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear storage
      await storage.removeItem('authToken');
      await storage.removeItem('authUser');

      // Clear state
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    error,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
