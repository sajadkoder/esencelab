/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'student' | 'employer' | 'admin';

export interface AuthUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isSignedIn: boolean;
  needsRoleSelection: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeRole(role: unknown): UserRole {
  if (typeof role !== 'string') {
    return 'student';
  }

  const normalized = role.toLowerCase();
  if (normalized === 'admin') {
    return 'admin';
  }
  if (normalized === 'employer' || normalized === 'recruiter') {
    return 'employer';
  }
  return 'student';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { getToken: clerkGetToken } = useClerkAuth();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  const getMetadataRole = useCallback((): UserRole | null => {
    if (!clerkUser) {
      return null;
    }

    const roleFromPublic = clerkUser.publicMetadata?.role;
    const roleFromUnsafe = clerkUser.unsafeMetadata?.role;
    const roleFromMetadata = roleFromPublic || roleFromUnsafe;
    if (!roleFromMetadata) {
      return null;
    }

    return normalizeRole(roleFromMetadata);
  }, [clerkUser]);

  const loadProfile = useCallback(async (clerkUserId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) {
      console.error('profile load failed', error);
      return null;
    }

    return data;
  }, []);

  const createProfile = useCallback(async (
    clerkUserId: string,
    email: string,
    name: string,
    avatarUrl?: string,
  ) => {
    const role = getMetadataRole() || 'student';

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        clerk_user_id: clerkUserId,
        email,
        name,
        role,
        avatar_url: avatarUrl || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('profile create failed', error);
      return null;
    }

    return data;
  }, [getMetadataRole]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const syncUser = async () => {
      if (!isSignedIn || !clerkUser) {
        setUser(null);
        setNeedsRoleSelection(false);
        setLoading(false);
        return;
      }

      const clerkUserId = clerkUser.id;
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const name = clerkUser.fullName || clerkUser.firstName || email.split('@')[0];
      const avatarUrl = clerkUser.imageUrl;

      let profile = await loadProfile(clerkUserId);
      if (!profile) {
        profile = await createProfile(clerkUserId, email, name, avatarUrl);
      }

      const metadataRole = getMetadataRole();
      const resolvedRole = normalizeRole(metadataRole || profile?.role);
      const shouldAskRole = !metadataRole;

      if (profile && profile.role !== resolvedRole) {
        await supabase
          .from('profiles')
          .update({ role: resolvedRole, updated_at: new Date().toISOString() })
          .eq('id', profile.id);
      }

      const profileId = profile?.id || clerkUserId;
      setUser({
        id: profileId,
        clerkUserId,
        email: profile?.email || email,
        name: profile?.name || name,
        role: resolvedRole,
        avatar_url: profile?.avatar_url || avatarUrl,
      });
      setNeedsRoleSelection(shouldAskRole);
      setLoading(false);
    };

    syncUser();
  }, [isSignedIn, isLoaded, clerkUser, loadProfile, createProfile, getMetadataRole]);

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
  };

  const getToken = useCallback(async () => {
    const template = import.meta.env.VITE_CLERK_API_TEMPLATE;
    if (template) {
      const templateToken = await clerkGetToken({ template });
      if (templateToken) {
        return templateToken;
      }
    }

    return clerkGetToken();
  }, [clerkGetToken]);

  const setRole = useCallback(async (role: UserRole) => {
    if (!clerkUser || !user) {
      return;
    }

    try {
      await clerkUser.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          role,
        },
      });
    } catch (error) {
      console.error('clerk metadata update failed', error);
    }

    await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('clerk_user_id', user.clerkUserId);

    setUser((prev) => (prev ? { ...prev, role } : prev));
    setNeedsRoleSelection(false);
  }, [clerkUser, user]);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', user.clerkUserId);

    if (!error) {
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSignedIn: Boolean(isSignedIn),
        needsRoleSelection,
        signOut,
        updateProfile,
        setRole,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
