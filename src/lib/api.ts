import { supabase } from './supabase';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  async getJobs(filters?: { status?: string; location?: string; skills?: string[] }) {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('posted_at', { ascending: false });

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data };
  }

  async getJob(id: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { error: error.message };
    return { data };
  }

  async createJob(jobData: {
    title: string;
    company: string;
    location?: string;
    description?: string;
    requirements?: string[];
    skills?: string[];
    salary_min?: number;
    salary_max?: number;
    job_type?: 'full-time' | 'part-time' | 'internship';
    employer_id: string;
  }) {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...jobData,
        status: 'active',
        posted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { error: error.message };
    return { data };
  }

  async updateJob(id: string, jobData: Partial<{
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    skills: string[];
    salary_min: number;
    salary_max: number;
    job_type: 'full-time' | 'part-time' | 'internship';
    status: 'active' | 'closed' | 'draft';
  }>) {
    const { data, error } = await supabase
      .from('jobs')
      .update(jobData)
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data };
  }

  async deleteJob(id: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
  }

  async getCandidateByClerkId(clerkUserId: string) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error && error.code !== 'PGRST116') return { error: error.message };
    return { data };
  }

  async updateCandidateProfile(clerkUserId: string, profileData: {
    name?: string;
    email?: string;
    role?: string;
    skills?: Record<string, unknown>[];
    education?: Record<string, unknown>[];
    experience?: Record<string, unknown>[];
    resume_url?: string;
    resume_text?: string;
  }) {
    const { data: existing } = await supabase
      .from('candidates')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('candidates')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single();

      if (error) return { error: error.message };
      return { data };
    } else {
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          clerk_user_id: clerkUserId,
          ...profileData,
          name: profileData.name || '',
          email: profileData.email || '',
          status: 'new',
          match_score: 0,
        })
        .select()
        .single();

      if (error) return { error: error.message };
      return { data };
    }
  }

  async getCandidates(filters?: { status?: string; skills?: string[] }) {
    let query = supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data };
  }

  async updateCandidateStatus(id: string, status: 'new' | 'screening' | 'interview' | 'hired' | 'rejected') {
    const { data, error } = await supabase
      .from('candidates')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data };
  }

  async getApplicationsByCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (*)
      `)
      .eq('candidate_id', candidateId)
      .order('applied_at', { ascending: false });

    if (error) return { error: error.message };
    return { data };
  }

  async applyToJob(jobId: string, candidateId: string) {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: candidateId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return { error: error.message };
    return { data };
  }

  async updateApplicationStatus(id: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected') {
    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data };
  }

  async getCourses(filters?: { level?: string; skill?: string }) {
    let query = supabase
      .from('courses')
      .select('*')
      .order('rating', { ascending: false });

    if (filters?.level) {
      query = query.eq('level', filters.level);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data };
  }

  async logActivity(clerkUserId: string, action: string, details?: string, metadata?: Record<string, unknown>) {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        clerk_user_id: clerkUserId,
        action,
        details,
        metadata,
      });

    if (error) console.error('Failed to log activity:', error);
  }

  async getActivityLogs(limit = 50) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) return { error: error.message };
    return { data };
  }
}

class AIService {
  async parseResume(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${AI_SERVICE_URL}/resume/parse`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }

  async parseResumeText(text: string): Promise<any> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/resume/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      return await response.json();
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }

  async extractSkills(text: string): Promise<any> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/resume/extract-skills?text=${encodeURIComponent(text)}`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Skill extraction error:', error);
      throw error;
    }
  }

  async chat(message: string, context?: any, history?: any[]): Promise<string> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, history }),
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async matchJobs(candidateSkills: string[], jobRequirements: string[], jobTitle: string, company: string): Promise<any> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/matching/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_skills: candidateSkills,
          job_requirements: jobRequirements,
          job_title: jobTitle,
          company: company,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Job matching error:', error);
      throw error;
    }
  }

  async analyzeSkillGaps(currentSkills: string[], targetRole: string): Promise<any> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/matching/skill-gaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_skills: currentSkills,
          target_role: targetRole,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      throw error;
    }
  }
}

export const api = new ApiService();
export const aiService = new AIService();
