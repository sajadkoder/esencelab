import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
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
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (clerkUserId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading profile:', error);
      return null;
    }

    return profile;
  }, []);

  const createProfile = useCallback(async (
    clerkUserId: string,
    email: string,
    name: string,
    avatarUrl?: string
  ): Promise<AuthUser | null> => {
    const roleFromMetadata = clerkUser?.publicMetadata?.role as UserRole | undefined;
    const role = roleFromMetadata || 'student';

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        clerk_user_id: clerkUserId,
        email,
        name,
        role,
        avatar_url: avatarUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return {
      id: newProfile.id,
      clerkUserId: newProfile.clerk_user_id,
      email: newProfile.email,
      name: newProfile.name,
      role: newProfile.role,
      avatar_url: newProfile.avatar_url,
    };
  }, [clerkUser]);

  useEffect(() => {
    if (!isLoaded) return;

    const syncUser = async () => {
      if (isSignedIn && clerkUser) {
        const clerkUserId = clerkUser.id;
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const name = clerkUser.fullName || clerkUser.firstName || email.split('@')[0];
        const avatarUrl = clerkUser.imageUrl;

        let profile = await loadProfile(clerkUserId);

        if (!profile) {
          profile = await createProfile(clerkUserId, email, name, avatarUrl);
        }

        if (profile) {
          setUser({
            id: profile.id,
            clerkUserId: profile.clerk_user_id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            avatar_url: profile.avatar_url,
          });
        } else {
          setUser({
            id: clerkUserId,
            clerkUserId,
            email,
            name,
            role: (clerkUser.publicMetadata?.role as UserRole) || 'student',
            avatar_url: avatarUrl,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    syncUser();
  }, [isSignedIn, isLoaded, clerkUser, loadProfile, createProfile]);

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', user.clerkUserId);

    if (!error) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isSignedIn: !!isSignedIn,
      signOut,
      updateProfile,
    }}>
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
