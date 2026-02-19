import { supabase } from './supabase';

function resolveAiServiceUrl() {
  const configuredUrl = String(import.meta.env.VITE_AI_SERVICE_URL || '').trim();
  if (!configuredUrl) {
    return '/api/ai';
  }

  const isPlaceholder = configuredUrl.includes('your-ai-service.vercel.app') || configuredUrl.includes('your-ai-service');
  const isLocalhostUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredUrl);

  if (typeof window !== 'undefined') {
    const runtimeHost = window.location.hostname;
    const runningLocally = runtimeHost === 'localhost' || runtimeHost === '127.0.0.1';

    if (!runningLocally && (isPlaceholder || isLocalhostUrl)) {
      return '/api/ai';
    }
  }

  return configuredUrl;
}

export const AI_SERVICE_URL = resolveAiServiceUrl();

function normalizeSupabaseError(error: unknown): string {
  if (!error) {
    return 'Unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unknown error';
}

async function toBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function mapCandidateSkills(skills: unknown): { name: string; score: number; category: 'technical' | 'domain' | 'soft' }[] {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills
    .map((item) => {
      if (typeof item === 'string') {
        return {
          name: item,
          score: 1,
          category: 'technical' as const,
        };
      }

      if (item && typeof item === 'object') {
        const name = 'name' in item ? String(item.name || '') : '';
        if (!name) {
          return null;
        }
        return {
          name,
          score: 'score' in item && typeof item.score === 'number' ? item.score : 1,
          category: 'category' in item && typeof item.category === 'string'
            ? (item.category as 'technical' | 'domain' | 'soft')
            : 'technical',
        };
      }

      return null;
    })
    .filter((item): item is { name: string; score: number; category: 'technical' | 'domain' | 'soft' } => Boolean(item));
}

class ApiService {
  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data: data || [] };
  }

  async updateProfileRole(profileId: string, role: 'student' | 'employer' | 'admin') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select('*')
      .single();

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data };
  }

  async getJobs(filters?: { status?: string; location?: string; employerId?: string }) {
    let query = supabase
      .from('jobs')
      .select('*')
      .order('posted_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.employerId) {
      query = query.eq('employer_id', filters.employerId);
    }

    const { data, error } = await query;
    if (error) {
      return { error: normalizeSupabaseError(error) };
    }
    return { data: data || [] };
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
      .select('*')
      .single();

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data };
  }

  async updateJob(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('jobs')
      .update({ ...updates })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data };
  }

  async deleteJob(id: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { success: true };
  }

  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data: data || [] };
  }

  async createCourse(course: {
    title: string;
    provider?: string;
    url?: string;
    skills?: string[];
    duration?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    rating?: number;
    image_url?: string;
  }) {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select('*')
      .single();

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data };
  }

  async updateCourse(courseId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select('*')
      .single();

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data };
  }

  async deleteCourse(courseId: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { success: true };
  }

  async getCandidateByClerkId(clerkUserId: string) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data };
  }

  async upsertCandidateProfile(input: {
    clerk_user_id: string;
    name: string;
    email: string;
    role?: string;
    skills?: unknown[];
    education?: unknown[];
    experience?: unknown[];
    resume_text?: string;
    resume_url?: string;
    match_score?: number;
  }) {
    const existing = await this.getCandidateByClerkId(input.clerk_user_id);
    if (existing.error) {
      return { error: existing.error };
    }

    if (existing.data) {
      const { data, error } = await supabase
        .from('candidates')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', input.clerk_user_id)
        .select('*')
        .single();

      if (error) {
        return { error: normalizeSupabaseError(error) };
      }

      return { data };
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert({
        ...input,
        status: 'new',
        match_score: input.match_score || 0,
      })
      .select('*')
      .single();

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data };
  }

  async getCandidates() {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data: data || [] };
  }

  async applyToJob(jobId: string, candidateId: string) {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: candidateId,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data };
  }

  async getApplicationsByCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, jobs(*)')
      .eq('candidate_id', candidateId)
      .order('applied_at', { ascending: false });

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data: data || [] };
  }

  async getApplicationsByJob(jobId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, candidates(*), jobs(*)')
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data: data || [] };
  }

  async getApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*, jobs(*), candidates(*)')
      .order('applied_at', { ascending: false });

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data: data || [] };
  }

  async getActivityLogs(limit = 100) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      return { error: normalizeSupabaseError(error) };
    }

    return { data: data || [] };
  }

  async logActivity(clerkUserId: string, action: string, details?: string, metadata?: Record<string, unknown>) {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        clerk_user_id: clerkUserId,
        action,
        details: details || null,
        metadata: metadata || {},
      });

    if (error) {
      console.error('activity log failed', error);
    }
  }

  extractSkillNames(skills: unknown): string[] {
    return mapCandidateSkills(skills).map((item) => item.name);
  }
}

class AIService {
  private async request(path: string, body: Record<string, unknown>, token?: string | null) {
    let response: Response;
    try {
      response = await fetch(`${AI_SERVICE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error(`Unable to reach AI service at ${AI_SERVICE_URL}. Check VITE_AI_SERVICE_URL and deployment routes.`);
    }

    if (!response.ok) {
      let message = `AI request failed (${response.status})`;
      try {
        const payload = await response.json();
        if (payload?.error) {
          message = String(payload.error);
        }
      } catch {
        // ignore JSON parsing failure
      }

      throw new Error(message);
    }

    return response.json();
  }

  async parseResume(file: File, token?: string | null) {
    const fileBase64 = await toBase64(file);
    return this.request('/resume/parse', {
      fileBase64,
      fileName: file.name,
      mimeType: file.type,
    }, token);
  }

  async parseResumeText(text: string, token?: string | null) {
    return this.request('/resume/parse', { text }, token);
  }

  async matchJobs(candidateSkills: string[], jobRequirements: string[], jobTitle: string, company: string, token?: string | null) {
    return this.request('/matching/match', {
      candidate_skills: candidateSkills,
      job_requirements: jobRequirements,
      job_title: jobTitle,
      company,
    }, token);
  }

  async analyzeSkillGaps(currentSkills: string[], targetRole: string, token?: string | null) {
    return this.request('/matching/skill-gaps', {
      current_skills: currentSkills,
      target_role: targetRole,
    }, token);
  }

  async rankCandidates(candidates: unknown[], jobRequirements: string[], token?: string | null) {
    return this.request('/matching/rank-candidates', {
      candidates,
      job_requirements: jobRequirements,
    }, token);
  }

  async recommendJobs(candidateSkills: string[], jobs: unknown[], topN = 6, token?: string | null) {
    return this.request('/recommendations/jobs', {
      candidate_skills: candidateSkills,
      jobs,
      top_n: topN,
    }, token);
  }

  async recommendCourses(missingSkills: string[], currentSkills: string[], courses: unknown[], topN = 6, token?: string | null) {
    return this.request('/recommendations/courses', {
      missing_skills: missingSkills,
      current_skills: currentSkills,
      courses,
      top_n: topN,
    }, token);
  }

  async chat(message: string, context?: Record<string, unknown>, history?: { role: string; content: string }[], token?: string | null) {
    return this.request('/chatbot/chat', {
      message,
      context: context || {},
      history: history || [],
    }, token);
  }
}

export const api = new ApiService();
export const aiService = new AIService();
