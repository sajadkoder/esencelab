export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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
  startDate: string;
  endDate: string;
}

export interface Experience {
  company: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface ResumeData {
  rawText: string;
  extractedSkills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  parsedAt: string;
}

export interface StudentProfile {
  userId: string;
  resumeData: ResumeData;
  skills: Skill[];
  skillGaps: string[];
  appliedJobs: string[];
  savedCourses: string[];
  targetRole?: string;
  skillGapPriorities?: SkillGapPriority[];
}

export interface SkillGapPriority {
  skill: string;
  priority: number;
  reason: string;
}

export interface Job {
  id: string;
  employer_id?: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  description: string;
  requirements: string[];
  skills: string[];
  salaryRange?: string;
  salary_min?: number;
  salary_max?: number;
  postedAt: string;
  postedBy: string;
  status?: 'active' | 'closed' | 'draft';
  matchScore?: number;
  missingSkills?: string[];
  matchedSkills?: string[];
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string;
  skills: string[];
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  image_url?: string;
  rating?: number;
  relevanceScore?: number;
  targetedSkillGaps?: string[];
}

export interface Candidate {
  id: string;
  userId?: string;
  user_id?: string;
  name: string;
  email: string;
  role: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  resume_url?: string;
  matchScore: number;
  appliedAt: string;
  status: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
  created_at?: string;
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

export interface RecommendationExplanation {
  itemId: string;
  itemType: 'job' | 'course';
  matchedSkills: string[];
  missingSkills: string[];
  relevanceScore: number;
  reason: string;
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalRecruiters: number;
  totalResumes: number;
  totalJobs: number;
  totalCourses: number;
  topSkills: { name: string; count: number }[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'job_match' | 'course_recommendation' | 'application_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
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

export interface IndianJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  skills: string[];
  posted: string;
  url: string;
}

export interface CourseResource {
  id: string;
  title: string;
  provider: string;
  type: 'youtube' | 'course' | 'book' | 'practice';
  url: string;
  duration?: string;
  rating?: number;
  price?: string;
  language?: string;
}

export interface AppliedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  appliedAt: string;
  status: 'applied' | 'under_review' | 'interview' | 'offer' | 'rejected';
  url: string;
}

export interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  skills: string[];
  savedAt: string;
  url: string;
}
