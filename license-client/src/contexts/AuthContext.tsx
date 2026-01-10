import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, LoginResponse } from '../api/auth';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'customer';
  name?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: 'admin' | 'customer') => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore user session from localStorage
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Token will be validated on first API call via interceptor
          // If expired, it will automatically refresh using storedRefreshToken
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'customer') => {
    let response: LoginResponse;
    if (role === 'admin') {
      response = await authApi.adminLogin({ email, password });
    } else {
      response = await authApi.customerLogin({ email, password });
    }

    setToken(response.token);
    const userData: User = {
      id: 0, // Will be decoded from token in real implementation
      email: response.email || email,
      role,
      name: response.name,
      phone: response.phone,
    };
    setUser(userData);
    localStorage.setItem('token', response.token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const signup = async (name: string, email: string, password: string, phone: string) => {
    const response = await authApi.customerSignup({ name, email, password, phone });
    setToken(response.token);
    const userData: User = {
      id: 0,
      email,
      role: 'customer',
      name: response.name || name,
      phone: response.phone || phone,
    };
    setUser(userData);
    localStorage.setItem('token', response.token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
