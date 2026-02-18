export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'employer' | 'admin';
  avatar_url?: string;
  created_at: string;
}

export interface Job {
  id: string;
  employer_id?: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  requirements?: string[];
  skills: string[];
  salary_min?: number;
  salary_max?: number;
  job_type: 'full-time' | 'part-time' | 'internship';
  status: 'active' | 'closed' | 'draft';
  posted_at: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  role?: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  resume_url?: string;
  match_score: number;
  status: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
  created_at: string;
}

export interface Skill {
  name: string;
  score: number;
  category: 'technical' | 'soft' | 'domain';
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
}

export interface Experience {
  company: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
  job?: Job;
  candidate?: Candidate;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  description?: string;
  skills: string[];
  duration?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  image_url?: string;
  rating?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
