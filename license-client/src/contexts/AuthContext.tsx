import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

interface User {
  email: string;
  name?: string;
  phone?: string;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, isAdmin: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string, role: 'admin' | 'customer') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, isAdmin: boolean) => {
    try {
      const response = isAdmin
        ? await authApi.adminLogin({ email, password })
        : await authApi.customerLogin({ email, password });

      setToken(response.token);
      const userData: User = {
        email: response.email || email,
        name: response.name,
        phone: response.phone,
        role: isAdmin ? 'admin' : 'customer',
      };
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, phone: string, role: 'admin' | 'customer') => {
    try {
      const response = await authApi.signup({ name, email, password, phone, role });
      setToken(response.token);
      const userData: User = {
        email: response.email || email,
        name: response.name,
        phone: response.phone,
        role: response.role || role,
      };
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
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
        isAuthenticated: !!token && !!user,
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
