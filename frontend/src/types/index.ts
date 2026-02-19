export type UserRole = 'student' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  parsedData: ResumeParsedData;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeParsedData {
  name?: string;
  email?: string;
  phone?: string;
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  summary?: string;
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
  duration?: string;
  description?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: 'full-time' | 'part-time' | 'internship' | 'contract';
  status: 'active' | 'closed';
  recruiterId: string;
  recruiter?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  resumeId: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview';
  matchScore?: number;
  coverLetter?: string;
  job?: Job;
  student?: User;
  resume?: Resume;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  url: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobMatch {
  job: Job;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalJobs?: number;
  totalApplications?: number;
  totalResumes?: number;
  myApplications?: number;
  postedJobs?: number;
  interviewsScheduled?: number;
}
