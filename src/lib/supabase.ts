import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const clerkSupabaseTemplate = import.meta.env.VITE_CLERK_SUPABASE_TEMPLATE || 'supabase';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

async function getClerkToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const clerk = (window as Window & { Clerk?: { session?: { getToken: (options?: { template?: string }) => Promise<string | null> } } }).Clerk;
  if (!clerk?.session?.getToken) {
    return null;
  }

  try {
    return await clerk.session.getToken({ template: clerkSupabaseTemplate });
  } catch {
    return null;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: getClerkToken,
});

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          name: string;
          role: 'student' | 'employer' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          name: string;
          role?: 'student' | 'employer' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          name?: string;
          role?: 'student' | 'employer' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          employer_id: string;
          title: string;
          company: string;
          location: string | null;
          description: string | null;
          requirements: string[] | null;
          skills: string[] | null;
          salary_min: number | null;
          salary_max: number | null;
          job_type: 'full-time' | 'part-time' | 'internship';
          status: 'active' | 'closed' | 'draft';
          posted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          title: string;
          company: string;
          location?: string | null;
          description?: string | null;
          requirements?: string[] | null;
          skills?: string[] | null;
          salary_min?: number | null;
          salary_max?: number | null;
          job_type?: 'full-time' | 'part-time' | 'internship';
          status?: 'active' | 'closed' | 'draft';
          posted_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employer_id?: string;
          title?: string;
          company?: string;
          location?: string | null;
          description?: string | null;
          requirements?: string[] | null;
          skills?: string[] | null;
          salary_min?: number | null;
          salary_max?: number | null;
          job_type?: 'full-time' | 'part-time' | 'internship';
          status?: 'active' | 'closed' | 'draft';
          posted_at?: string;
          created_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          user_id: string | null;
          clerk_user_id: string | null;
          name: string;
          email: string;
          role: string | null;
          skills: Json | null;
          education: Json | null;
          experience: Json | null;
          resume_url: string | null;
          resume_text: string | null;
          match_score: number;
          status: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          clerk_user_id?: string | null;
          name: string;
          email: string;
          role?: string | null;
          skills?: Json | null;
          education?: Json | null;
          experience?: Json | null;
          resume_url?: string | null;
          resume_text?: string | null;
          match_score?: number;
          status?: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          clerk_user_id?: string | null;
          name?: string;
          email?: string;
          role?: string | null;
          skills?: Json | null;
          education?: Json | null;
          experience?: Json | null;
          resume_url?: string | null;
          resume_text?: string | null;
          match_score?: number;
          status?: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          candidate_id: string;
          status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          candidate_id: string;
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          applied_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          candidate_id?: string;
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
          applied_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          provider: string | null;
          url: string | null;
          skills: string[] | null;
          duration: string | null;
          level: 'beginner' | 'intermediate' | 'advanced' | null;
          rating: number | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          provider?: string | null;
          url?: string | null;
          skills?: string[] | null;
          duration?: string | null;
          level?: 'beginner' | 'intermediate' | 'advanced' | null;
          rating?: number | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          provider?: string | null;
          url?: string | null;
          skills?: string[] | null;
          duration?: string | null;
          level?: 'beginner' | 'intermediate' | 'advanced' | null;
          rating?: number | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          clerk_user_id: string | null;
          action: string;
          details: string | null;
          metadata: Json | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          clerk_user_id?: string | null;
          action: string;
          details?: string | null;
          metadata?: Json | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          clerk_user_id?: string | null;
          action?: string;
          details?: string | null;
          metadata?: Json | null;
          timestamp?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'student' | 'employer' | 'admin';
      job_type: 'full-time' | 'part-time' | 'internship';
      job_status: 'active' | 'closed' | 'draft';
      candidate_status: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
      application_status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
      course_level: 'beginner' | 'intermediate' | 'advanced';
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
