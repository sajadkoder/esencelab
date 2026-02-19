import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Profile, UserRole } from '@/types';
import { api } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'esencelab_current_user';

function getInitialUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('esencelab_token');
  if (!token) return null;
  
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    const result = await api.signup(email, password, name, role);
    
    if (result.error) {
      return { error: new Error(result.error) };
    }

    if (result.data) {
      api.setToken(result.data.token);
      const authUser: AuthUser = {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.name,
        role: result.data.user.role,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const result = await api.login(email, password);
    
    if (result.error) {
      return { error: new Error(result.error) };
    }

    if (result.data) {
      api.setToken(result.data.token);
      const authUser: AuthUser = {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.name,
        role: result.data.user.role,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
    }

    return { error: null };
  };

  const signOut = async () => {
    await api.signOut();
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const updatedUser: AuthUser = { 
      ...user, 
      ...updates,
      avatar_url: updates.avatar_url || undefined 
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);

    return { error: null };
  };

  const value: AuthContextType = {
    user,
    loading: false,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
