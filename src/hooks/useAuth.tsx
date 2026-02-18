import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Profile, UserRole } from '@/types';

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

const USERS_KEY = 'esencelab_users';
const CURRENT_USER_KEY = 'esencelab_current_user';

interface StoredUser {
  password: string;
  name: string;
  role: UserRole;
}

function getUsers(): Record<string, StoredUser> {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveUsers(users: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getStoredUser(email: string): StoredUser | null {
  const users = getUsers();
  return users[email] || null;
}

function saveUser(email: string, data: StoredUser) {
  const users = getUsers();
  users[email] = data;
  saveUsers(users);
}

function getInitialUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
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

  const signIn = async (email: string, password: string) => {
    const userData = getStoredUser(email);
    
    if (!userData) {
      return { error: new Error('No account found. Please sign up first.') };
    }

    if (userData.password !== password) {
      return { error: new Error('Incorrect password') };
    }

    const authUser: AuthUser = {
      id: uuidv4(),
      email,
      name: userData.name,
      role: userData.role,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    setUser(authUser);

    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    const existing = getStoredUser(email);
    
    if (existing) {
      return { error: new Error('Account already exists. Please sign in.') };
    }

    saveUser(email, { password, name, role });

    const authUser: AuthUser = {
      id: uuidv4(),
      email,
      name,
      role,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    setUser(authUser);

    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const userData = getStoredUser(user.email);
    if (userData) {
      saveUser(user.email, { ...userData, ...updates });
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
