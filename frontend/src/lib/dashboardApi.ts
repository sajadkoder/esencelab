import api from '@/lib/api';
import {
  CareerOverview,
  CareerRole,
  Job,
  JobTrackerData,
  LearningPlan,
  MockInterviewPack,
  Resume,
  RoadmapItem,
  StudentRecommendations,
} from '@/types';

interface RecommendationCachePayload {
  ts: number;
  data: StudentRecommendations;
}

const RECOMMENDATION_CACHE_PREFIX = 'esencelab.recommendations.';
const RECOMMENDATION_CACHE_TTL_MS = 5 * 60 * 1000;

const getRecommendationCacheKey = (userId: string) =>
  `${RECOMMENDATION_CACHE_PREFIX}${userId}`;

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data.data || {};
};

export const getLatestJobs = async (limit = 6): Promise<Job[]> => {
  const res = await api.get(`/jobs?limit=${limit}`);
  return res.data.data?.jobs || [];
};

export const getEmployerJobs = async (): Promise<Job[]> => {
  const res = await api.get('/jobs?my=true&status=active');
  return res.data.data?.jobs || [];
};

export const getCandidateMatches = async (jobId: string) => {
  const res = await api.get(`/jobs/${jobId}/candidate-matches`);
  return res.data.data || [];
};

export const createJob = async (payload: {
  title: string;
  company: string;
  location: string;
  requirements: string;
}) => {
  const requirements = payload.requirements
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const safeRequirements = requirements.length > 0 ? requirements : ['Communication', 'Problem Solving'];

  const res = await api.post('/jobs', {
    title: payload.title,
    company: payload.company,
    location: payload.location,
    description: `Opportunity for ${payload.title} candidates.`,
    requirements: safeRequirements,
    skills: safeRequirements,
    jobType: 'full_time',
    status: 'active',
  });
  return res.data.data;
};

export const getResume = async (): Promise<Resume | null> => {
  try {
    const res = await api.get('/resume');
    return res.data.data || null;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const uploadResume = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<Resume> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress) return;
      const percent = Math.round((event.loaded * 100) / (event.total || 1));
      onProgress(percent);
    },
  });
  return res.data.data;
};

export const deleteResume = async (resumeId: string) => {
  await api.delete(`/resume/${resumeId}`);
};

export const getStudentRecommendations = async (
  userId: string,
  forceRefresh = false
): Promise<StudentRecommendations | null> => {
  const cacheKey = getRecommendationCacheKey(userId);
  const canUseCache = !forceRefresh && typeof window !== 'undefined';

  if (canUseCache) {
    const cached = safeJsonParse<RecommendationCachePayload>(sessionStorage.getItem(cacheKey));
    if (cached && Date.now() - cached.ts < RECOMMENDATION_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const res = await api.get('/recommendations');
  const data = (res.data.data || null) as StudentRecommendations | null;

  if (data && typeof window !== 'undefined') {
    const payload: RecommendationCachePayload = { ts: Date.now(), data };
    sessionStorage.setItem(cacheKey, JSON.stringify(payload));
  }

  return data;
};

export const clearRecommendationCache = (userId: string) => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(getRecommendationCacheKey(userId));
};

export const getCareerRoles = async (): Promise<CareerRole[]> => {
  const res = await api.get('/career/roles');
  return res.data.data || [];
};

export const setTargetRole = async (roleId: string) => {
  const res = await api.post('/career/target-role', { roleId });
  return res.data.data;
};

export const getCareerOverview = async (): Promise<CareerOverview> => {
  const res = await api.get('/career/overview');
  return res.data.data;
};

export const getCareerRoadmap = async (roleId?: string): Promise<{ role: CareerRole; roadmap: RoadmapItem[] }> => {
  const query = roleId ? `?roleId=${encodeURIComponent(roleId)}` : '';
  const res = await api.get(`/career/roadmap${query}`);
  return res.data.data;
};

export const updateRoadmapSkill = async (payload: {
  roleId: string;
  skillName: string;
  status: 'completed' | 'in_progress' | 'missing';
}) => {
  const res = await api.put('/career/roadmap/skill', payload);
  return res.data.data;
};

export const getLearningPlan = async (roleId?: string, durationDays: 30 | 60 = 30): Promise<LearningPlan> => {
  const params = new URLSearchParams();
  params.append('durationDays', String(durationDays));
  if (roleId) params.append('roleId', roleId);
  const res = await api.get(`/career/learning-plan?${params.toString()}`);
  return res.data.data;
};

export const regenerateLearningPlan = async (roleId?: string, durationDays: 30 | 60 = 30): Promise<LearningPlan> => {
  const res = await api.post('/career/learning-plan', {
    roleId,
    durationDays,
  });
  return res.data.data;
};

export const getMockInterview = async (roleId?: string): Promise<MockInterviewPack> => {
  const query = roleId ? `?roleId=${encodeURIComponent(roleId)}` : '';
  const res = await api.get(`/career/mock-interview${query}`);
  return res.data.data;
};

export const saveInterviewSession = async (payload: {
  roleId: string;
  question: string;
  answer: string;
  rating?: number;
}) => {
  const res = await api.post('/career/mock-interview/session', payload);
  return res.data.data;
};

export const getJobTracker = async (): Promise<JobTrackerData> => {
  const res = await api.get('/career/job-tracker');
  return res.data.data || { savedJobs: [], applications: [] };
};

export const saveJobForLater = async (jobId: string) => {
  const res = await api.post('/career/job-tracker/save', { jobId });
  return res.data.data;
};

export const removeSavedJob = async (jobId: string) => {
  await api.delete(`/career/job-tracker/save/${jobId}`);
};

export const updateTrackedApplication = async (
  applicationId: string,
  payload: { notes?: string; status?: 'pending' | 'shortlisted' | 'interview' | 'rejected' }
) => {
  const res = await api.put(`/career/job-tracker/application/${applicationId}`, payload);
  return res.data.data;
};

export const getReadableErrorMessage = (error: any, fallback: string) => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;

  if (status === 401) return 'Your session has expired. Please login again.';
  if (status === 400 && serverMessage) return serverMessage;
  if (status >= 500) return 'Server error occurred. Please try again in a moment.';
  return serverMessage || fallback;
};
