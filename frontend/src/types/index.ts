export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  canonicalRole?: 'student' | 'recruiter' | 'admin';
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface ResumeParsedData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  education?: Education[];
  experience?: Experience[];
  projects?: Array<Record<string, unknown>>;
  skills?: string[];
  summary?: string | null;
  organizations?: string[];
  dates?: string[];
}

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  parsedData: ResumeParsedData;
  skills: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[] | string;
  skills: string[];
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  jobType: 'full_time' | 'part_time' | 'internship' | 'contract';
  status: 'active' | 'closed';
  employerId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview' | 'applied' | 'interviewing' | 'offer';
  trackerStatus?: 'applied' | 'interviewing' | 'offer' | 'rejected';
  storageStatus?: 'pending' | 'shortlisted' | 'interview' | 'rejected';
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  explanation?: string | null;
  notes?: string;
  job?: Job;
  student?: User;
  resume?: Resume | null;
  appliedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  url: string;
  skills?: string[];
  duration?: string;
  level?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobMatch {
  job: Job;
  matchScore: number;
  requiredSkills?: string[];
  matchedSkills: string[];
  missingSkills: string[];
  explanation?: string | null;
  shortSummary?: string;
  explanationMeta?: {
    summary: string;
    matchedCount: number;
    totalRequired: number;
    improvementImpacts: Array<{
      skill: string;
      impact: number;
    }>;
  };
}

export interface CourseRecommendation extends Course {
  matchedMissingSkills: string[];
  relevanceScore: number;
}

export interface StudentRecommendations {
  generatedAt: string;
  recommendedJobs: JobMatch[];
  missingSkills: string[];
  recommendedCourses: CourseRecommendation[];
  summary?: string;
}

export interface ResumeScoreEntry {
  id: string;
  userId: string;
  roleId: string;
  score: number;
  sectionScores: {
    skillsCompleteness?: number;
    experienceRelevance?: number;
    projectStrength?: number;
    formattingConsistency?: number;
    skills: number;
    projects: number;
    experience: number;
    education: number;
  };
  suggestions: string[];
  createdAt: string;
}

export interface CareerRole {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  suggestedTools: string[];
  growthPath: string[];
}

export interface RoadmapItem {
  skill: string;
  status: 'completed' | 'in_progress' | 'missing';
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface WeeklyPlannerItem {
  day: number;
  title: string;
  tasks: string[];
}

export interface CareerOverview {
  roleId: string;
  role: CareerRole;
  latestScore: ResumeScoreEntry | null;
  scoreHistory: ResumeScoreEntry[];
  roadmap: RoadmapItem[];
  weeklyPlanner: WeeklyPlannerItem[];
  progress: {
    resumeImprovement: number;
    skillsCompleted: number;
    skillsInProgress: number;
    totalSkills: number;
    jobsMatchedImprovement: number;
  };
  applicationStatusCounts?: {
    saved: number;
    applied: number;
    interviewing: number;
    offer: number;
    rejected: number;
  };
  missingSkills: string[];
}

export interface LearningPlan {
  id: string;
  userId: string;
  roleId: string;
  durationDays: number;
  planData: {
    roleId: string;
    roleName: string;
    durationDays: number;
    generatedAt: string;
    weeks: Array<{
      week: number;
      title: string;
      goals: string[];
      resources: Array<{
        title: string;
        provider: string;
        url: string;
      }>;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MockInterviewPack {
  roleId: string;
  roleName: string;
  technical: Array<{
    question: string;
    suggestedAnswer: string;
  }>;
  behavioral: Array<{
    question: string;
    suggestedAnswer: string;
  }>;
}

export interface JobTrackerData {
  savedJobs: Array<{
    id: string;
    userId: string;
    jobId: string;
    createdAt: string;
    job: Job;
  }>;
  applications: Application[];
  statusCounts?: {
    saved: number;
    applied: number;
    interviewing: number;
    offer: number;
    rejected: number;
  };
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalJobs?: number;
  totalApplications?: number;
  totalCandidates?: number;
  totalCourses?: number;
  totalResumes?: number;
  myApplications?: number;
  postedJobs?: number;
  interviewsScheduled?: number;
}
