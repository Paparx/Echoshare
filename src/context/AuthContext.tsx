import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockApi } from '../lib/mockApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUserBadge: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = mockApi.getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const { user } = await mockApi.login(email, pass);
    setUser(user);
  };

  const register = async (data: any) => {
    const newUser = await mockApi.register(data);
    setUser(newUser);
  };

  const logout = () => {
    mockApi.logout();
    setUser(null);
  };

  const updateUserBadge = () => {
    const current = mockApi.getCurrentUser();
    if (current) {
      setUser(current);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = await mockApi.updateProfile(user.id, updates);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserBadge, updateProfile }}>
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
