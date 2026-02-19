export interface Skill {
  name: string;
  score: number;
  category: 'technical' | 'soft' | 'domain';
}

export interface Education {
  institution?: string;
  degree?: string;
  field?: string;
  year?: string;
}

export interface Experience {
  company?: string;
  title?: string;
  description?: string;
  duration?: string;
}

export interface Job {
  id: string;
  employer_id?: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
  salary_min?: number;
  salary_max?: number;
  job_type?: 'full-time' | 'part-time' | 'internship';
  status?: 'active' | 'closed' | 'draft';
  posted_at?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  provider?: string;
  description?: string;
  skills?: string[];
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  image_url?: string;
  rating?: number;
}

export interface Candidate {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  role?: string;
  skills?: Skill[];
  education?: Education[];
  experience?: Experience[];
  resume_url?: string;
  resume_text?: string;
  match_score?: number;
  status?: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TargetRole {
  id: string;
  name: string;
  requiredSkills: string[];
  category: string;
}
