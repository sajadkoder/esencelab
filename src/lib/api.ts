const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('esencelab_token', token);
    } else {
      localStorage.removeItem('esencelab_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('esencelab_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed', message: data.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error', message: String(error) };
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string, role: string) {
    return this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Jobs endpoints
  async getJobs(filters?: { status?: string; location?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.location) params.append('location', filters.location);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>('/jobs' + query);
  }

  async getJob(id: string) {
    return this.request<any>(`/jobs/${id}`);
  }

  async createJob(data: any) {
    return this.request<any>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Candidates endpoints
  async getCandidates(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>('/candidates' + query);
  }

  async getCandidateProfile() {
    return this.request<any>('/candidates/me');
  }

  async updateCandidateProfile(data: any) {
    return this.request<any>('/candidates/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateCandidateStatus(id: string, status: string) {
    return this.request<any>(`/candidates/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Applications endpoints
  async getApplications() {
    return this.request<any[]>('/applications/user');
  }

  async applyToJob(jobId: string) {
    return this.request<any>('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  }

  // Courses endpoints
  async getCourses(filters?: { level?: string; skill?: string }) {
    const params = new URLSearchParams();
    if (filters?.level) params.append('level', filters.level);
    if (filters?.skill) params.append('skill', filters.skill);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>('/courses' + query);
  }
}

// AI Service API
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
