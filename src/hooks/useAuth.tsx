/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type UserRole = 'student' | 'employer' | 'admin';

type SignUpRole = 'student' | 'employer';

type AuthUser = {
  id: string; // profiles.id
  authUserId: string; // supabase auth user id
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  needsRoleSelection: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (input: { name: string; email: string; password: string; role: SignUpRole }) => Promise<{
    error?: string;
    pendingVerification?: boolean;
  }>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  setRole: (role: UserRole) => Promise<void>;
  updateProfile: (input: { name?: string; avatarUrl?: string | null }) => Promise<void>;
};

type ProfileRow = {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  role: UserRole | 'recruiter' | string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
};

const ROLE_ALIASES: Record<string, UserRole> = {
  recruiter: 'employer',
  employer: 'employer',
  student: 'student',
  admin: 'admin',
};

function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') {
    return null;
  }
  return ROLE_ALIASES[value.toLowerCase()] || null;
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().toLowerCase();
}

function deriveName(user: SupabaseAuthUser): string {
  const metadata = user.user_metadata && typeof user.user_metadata === 'object'
    ? user.user_metadata as Record<string, unknown>
    : {};
  const fromMetadata = String(
    metadata.name
    || metadata.full_name
    || metadata.display_name
    || '',
  ).trim();

  if (fromMetadata) {
    return fromMetadata;
  }

  const email = normalizeEmail(user.email);
  if (!email) {
    return 'User';
  }

  return email.split('@')[0] || 'User';
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  const ensureProfile = useCallback(async (session: Session): Promise<AuthUser> => {
    const authUser = session.user;
    const authUserId = authUser.id;
    const email = normalizeEmail(authUser.email);
    const name = deriveName(authUser);
    const metadataRole = normalizeRole(authUser.user_metadata?.role) || normalizeRole(authUser.app_metadata?.role);
    const fallbackRole: UserRole = metadataRole || 'student';
    let profile: ProfileRow | null = null;

    const byAuthId = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', authUserId)
      .maybeSingle();

    if (!byAuthId.error) {
      profile = byAuthId.data as ProfileRow | null;
    }

    if (!profile && email) {
      const byEmail = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!byEmail.error && byEmail.data) {
        profile = byEmail.data as ProfileRow;

        if (profile.clerk_user_id !== authUserId) {
          const relink = await supabase
            .from('profiles')
            .update({
              clerk_user_id: authUserId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)
            .select('*')
            .single();

          if (!relink.error && relink.data) {
            profile = relink.data as ProfileRow;
          }
        }
      }
    }

    if (!profile) {
      const created = await supabase
        .from('profiles')
        .insert({
          clerk_user_id: authUserId,
          email: email || `${authUserId}@unknown.local`,
          name,
          role: fallbackRole,
        })
        .select('*')
        .single();

      if (created.error) {
        throw new Error(created.error.message);
      }

      profile = created.data as ProfileRow;
    }

    const resolvedRole = normalizeRole(profile.role) || fallbackRole;
    const metadataRoleNow = normalizeRole(authUser.user_metadata?.role);

    if (metadataRoleNow !== resolvedRole) {
      await supabase.auth.updateUser({
        data: {
          ...(authUser.user_metadata || {}),
          role: resolvedRole,
          name: profile.name || name,
        },
      });
    }

    return {
      id: profile.id,
      authUserId,
      email: profile.email || email,
      name: profile.name || name,
      role: resolvedRole,
      avatarUrl: profile.avatar_url,
    };
  }, []);

  const syncSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setNeedsRoleSelection(false);
      return;
    }

    try {
      const syncedUser = await ensureProfile(session);
      setUser(syncedUser);
      setNeedsRoleSelection(false);
    } catch (error) {
      console.error('auth profile sync failed', error);
      setUser(null);
      setNeedsRoleSelection(false);
    }
  }, [ensureProfile]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) {
          return;
        }
        await syncSession(data.session);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (!active) {
          return;
        }
        setLoading(true);
        try {
          await syncSession(session);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      })();
    });

    void initialize();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (response.error) {
      return { error: response.error.message };
    }

    if (response.data.session) {
      await syncSession(response.data.session);
    }

    return {};
  }, [syncSession]);

  const signUp = useCallback(async (input: { name: string; email: string; password: string; role: SignUpRole }) => {
    const { name, email, password, role } = input;
    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole || normalizedRole === 'admin') {
      return { error: 'Invalid role selection. Admin accounts are invite-only.' };
    }

    const response = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name.trim() || normalizedEmail.split('@')[0] || 'User',
          role: normalizedRole,
        },
      },
    });

    if (response.error) {
      return { error: response.error.message };
    }

    if (response.data.session) {
      await syncSession(response.data.session);
      return {};
    }

    const signInAttempt = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!signInAttempt.error && signInAttempt.data.session) {
      await syncSession(signInAttempt.data.session);
      return {};
    }

    return {
      pendingVerification: true,
    };
  }, [syncSession]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNeedsRoleSelection(false);
  }, []);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, []);

  const setRole = useCallback(async (role: UserRole) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
      throw new Error('Invalid role');
    }
    if (normalizedRole === 'admin' && user.role !== 'admin') {
      throw new Error('Admin role is invite-only');
    }

    const updateProfile = await supabase
      .from('profiles')
      .update({
        role: normalizedRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (updateProfile.error) {
      throw new Error(updateProfile.error.message);
    }

    await supabase.auth.updateUser({
      data: {
        role: normalizedRole,
      },
    });

    setUser((previous) => (
      previous
        ? {
          ...previous,
          role: normalizedRole,
        }
        : previous
    ));
    setNeedsRoleSelection(false);
  }, [user]);

  const updateProfile = useCallback(async (input: { name?: string; avatarUrl?: string | null }) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    const payload: { name?: string; avatar_url?: string | null; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (typeof input.name === 'string') {
      payload.name = input.name.trim() || user.name;
    }
    if ('avatarUrl' in input) {
      payload.avatar_url = input.avatarUrl || null;
    }

    const response = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select('*')
      .single();

    if (response.error) {
      throw new Error(response.error.message);
    }

    const next = response.data as ProfileRow;
    setUser((previous) => (
      previous
        ? {
          ...previous,
          name: next.name || previous.name,
          email: next.email || previous.email,
          avatarUrl: next.avatar_url,
        }
        : previous
    ));

    if (typeof payload.name === 'string') {
      await supabase.auth.updateUser({
        data: {
          ...(user ? { name: payload.name } : {}),
        },
      });
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    needsRoleSelection,
    signIn,
    signUp,
    signOut,
    getToken,
    setRole,
    updateProfile,
  }), [user, loading, needsRoleSelection, signIn, signUp, signOut, getToken, setRole, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
