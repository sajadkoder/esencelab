import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'student' | 'employer' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'student' | 'employer' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
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
          name: string;
          email: string;
          role: string | null;
          skills: Record<string, unknown>[] | null;
          education: Record<string, unknown>[] | null;
          experience: Record<string, unknown>[] | null;
          resume_url: string | null;
          match_score: number;
          status: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          role?: string | null;
          skills?: Record<string, unknown>[] | null;
          education?: Record<string, unknown>[] | null;
          experience?: Record<string, unknown>[] | null;
          resume_url?: string | null;
          match_score?: number;
          status?: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          role?: string | null;
          skills?: Record<string, unknown>[] | null;
          education?: Record<string, unknown>[] | null;
          experience?: Record<string, unknown>[] | null;
          resume_url?: string | null;
          match_score?: number;
          status?: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
          created_at?: string;
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
          action: string;
          details: string | null;
          metadata: Record<string, unknown> | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          details?: string | null;
          metadata?: Record<string, unknown> | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          details?: string | null;
          metadata?: Record<string, unknown> | null;
          timestamp?: string;
        };
      };
    };
  };
};
