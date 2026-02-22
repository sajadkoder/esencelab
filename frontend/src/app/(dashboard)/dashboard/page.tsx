'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, FileText, Loader2, PlusCircle, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Badge from '@/components/Badge';
import { Skeleton } from '@/components/Skeleton';
import StudentUpskillingHub from '@/components/StudentUpskillingHub';
import { DashboardStats, Job, StudentRecommendations } from '@/types';
import {
  createJob,
  getCandidateMatches,
  getDashboardStats,
  getEmployerJobs,
  getReadableErrorMessage,
  getStudentRecommendations,
} from '@/lib/dashboardApi';
import { motion, AnimatePresence } from 'framer-motion';

interface CandidateMatch {
  candidateId: string;
  name: string;
  matchScore: number;
  matchedSkills: string[];
  skills: string[];
}

const scoreToPercent = (score: number) => {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, score <= 1 ? Math.round(score * 100) : Math.round(score)));
};

function DashboardSkeleton() {
  return (
    <div className="layout-container section-spacing space-y-8">
      <Skeleton className="h-24 w-full max-w-xl" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<StudentRecommendations | null>(null);
  const [stats, setStats] = useState<DashboardStats>({});
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [postingJob, setPostingJob] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    requirements: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchStudentDashboard = useCallback(
    async (forceRefresh = false) => {
      if (!user) return;
      try {
        const data = await getStudentRecommendations(user.id, forceRefresh);
        setRecommendations(data);
      } catch (error: any) {
        setMessage(getReadableErrorMessage(error, 'Failed to load recommendations.'));
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const fetchEmployerDashboard = useCallback(async () => {
    try {
      const jobs = await getEmployerJobs();
      setEmployerJobs(jobs);
      setSelectedJobId((current) => {
        if (current && jobs.some((job) => job.id === current)) return current;
        return jobs[0]?.id || '';
      });
    } catch (error: any) {
      setMessage(getReadableErrorMessage(error, 'Failed to load recruiter dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminDashboard = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error: any) {
      setMessage(getReadableErrorMessage(error, 'Failed to load admin dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    setMessage(null);

    if (user.role === 'student') {
      void fetchStudentDashboard(false);
      return;
    }
    if (user.role === 'employer') {
      void fetchEmployerDashboard();
      return;
    }
    void fetchAdminDashboard();
  }, [fetchAdminDashboard, fetchEmployerDashboard, fetchStudentDashboard, isAuthenticated, user]);

  const fetchCandidateRanking = useCallback(async (jobId: string) => {
    if (!jobId) {
      setCandidateMatches([]);
      return;
    }
    setLoadingMatches(true);
    try {
      const matches = await getCandidateMatches(jobId);
      setCandidateMatches(matches || []);
    } catch (error: any) {
      setMessage(getReadableErrorMessage(error, 'Failed to load ranked candidates.'));
      setCandidateMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'employer') return;
    void fetchCandidateRanking(selectedJobId);
  }, [fetchCandidateRanking, selectedJobId, user?.role]);

  const handleCreateJob = async (event: FormEvent) => {
    event.preventDefault();
    if (postingJob) return;

    setPostingJob(true);
    setMessage(null);
    try {
      await createJob(jobForm);
      setJobForm({
        title: '',
        company: '',
        location: '',
        requirements: '',
      });
      setMessage('Job posted successfully.');
      await fetchEmployerDashboard();
    } catch (error: any) {
      setMessage(getReadableErrorMessage(error, 'Failed to create job.'));
    } finally {
      setPostingJob(false);
    }
  };

  const topCandidateMatches = useMemo(() => {
    return [...candidateMatches]
      .sort((left, right) => scoreToPercent(right.matchScore) - scoreToPercent(left.matchScore))
      .slice(0, 8);
  }, [candidateMatches]);

  if (isLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!user) return null;

  if (user.role === 'student') {
    return (
      <>
        {message && (
          <div className="layout-container pt-8">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          </div>
        )}
        <StudentUpskillingHub
          recommendations={recommendations}
          onRefresh={() => fetchStudentDashboard(true)}
        />
      </>
    );
  }

  if (user.role === 'employer') {
    return (
      <div className="layout-container section-spacing space-y-12">
        <section>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3 tracking-tight">Recruiter Command Center</h1>
          <p className="text-lg font-sans text-secondary font-light">Post jobs and review ranked candidates quickly.</p>
        </section>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border-[0.5px] border-accent/20 bg-accent/5 px-6 py-4 text-sm font-sans font-medium text-accent shadow-sm"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <section>
          <div className="glass-panel p-8 max-w-4xl rounded-3xl">
            <h2 className="text-2xl font-serif text-primary mb-6">Post a New Job</h2>
            <form className="space-y-6" onSubmit={handleCreateJob}>
              <Input
                label="Job Title"
                value={jobForm.title}
                onChange={(event) => setJobForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Backend Developer"
                required
              />
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Company"
                  value={jobForm.company}
                  onChange={(event) => setJobForm((prev) => ({ ...prev, company: event.target.value }))}
                  placeholder="EsenceLab"
                  required
                />
                <Input
                  label="Location"
                  value={jobForm.location}
                  onChange={(event) => setJobForm((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="Remote / Kochi"
                  required
                />
              </div>
              <div className="relative pt-2">
                <label className="absolute left-4 transition-all duration-200 pointer-events-none text-[10px] uppercase tracking-widest px-1 bg-transparent text-secondary z-10 -top-1 font-bold">
                  Required Skills (comma separated)
                </label>
                <textarea
                  rows={3}
                  value={jobForm.requirements}
                  onChange={(event) =>
                    setJobForm((prev) => ({ ...prev, requirements: event.target.value }))
                  }
                  className="w-full rounded-2xl border-[0.5px] border-border bg-white/50 px-4 py-4 font-sans text-primary text-base transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent shadow-inner relative z-0 appearance-none"
                  placeholder="Node.js, Express, SQL"
                  required
                />
              </div>
              <Button type="submit" isLoading={postingJob} className="w-full justify-center h-12 rounded-full font-serif text-lg bg-primary text-white hover:bg-black/80 transition-all">
                <PlusCircle className="mr-2 h-5 w-5" />
                Deploy Job Profile
              </Button>
            </form>
          </div>
        </section>

        <section>
          <div className="glass-panel p-8 rounded-3xl">
            <h2 className="text-2xl font-serif text-primary mb-6">Ranked Candidates List</h2>
            <div className="mb-8 max-w-sm">
              <div className="relative pt-2">
                <label className="absolute left-4 transition-all duration-200 pointer-events-none text-[10px] uppercase tracking-widest px-1 bg-transparent text-secondary z-10 -top-1 font-bold">Select Active Job</label>
                <select
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  className="w-full rounded-2xl border-[0.5px] border-border bg-white/50 px-4 py-4 font-sans text-primary text-base transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent shadow-sm relative z-0 appearance-none"
                >
                  {employerJobs.length === 0 && <option value="">No active jobs</option>}
                  {employerJobs.map((job) => (
                    <option key={job.id} value={job.id} className="text-primary bg-white">
                      {job.title} - {job.company}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-[60%] -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {loadingMatches ? (
              <div className="flex items-center justify-center gap-3 py-16 text-sm font-sans font-medium text-secondary">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                <span>Running candidate analysis matrix...</span>
              </div>
            ) : topCandidateMatches.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topCandidateMatches.map((candidate) => {
                  const topSkills = (candidate.matchedSkills || candidate.skills || []).slice(0, 3);
                  const match = scoreToPercent(candidate.matchScore);
                  return (
                    <div
                      key={candidate.candidateId}
                      className="p-6 rounded-2xl border-[0.5px] border-border bg-white/60 hover:bg-white transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <p className="text-xl font-serif font-bold text-primary">{candidate.name}</p>
                        <Badge variant={match > 75 ? 'success' : match > 50 ? 'warning' : 'secondary'} className="font-sans font-semibold tracking-wide uppercase text-[10px] px-2 py-1">
                          {match}% Match
                        </Badge>
                      </div>
                      <div>
                        <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-secondary mb-2">Detected Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {topSkills.map(skill => (
                            <span key={skill} className="px-2 py-1 text-[10px] font-semibold bg-primary/5 text-primary border-[0.5px] border-border rounded-md uppercase tracking-wider">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg font-sans font-light text-secondary">
                  No ranked candidates available for the selected job.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="layout-container section-spacing space-y-12">
      <section>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3 tracking-tight">System Global View</h1>
        <p className="text-lg font-sans text-secondary font-light">Real-time telemetry and platform metrics.</p>
      </section>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border-[0.5px] border-red-200 bg-red-50/50 px-6 py-4 text-sm font-sans font-medium text-red-700 shadow-sm"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel p-8 text-center rounded-3xl hover:-translate-y-1 transition-transform duration-500">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/5 text-accent border-[0.5px] border-accent/20 shadow-inner">
            <Users className="h-8 w-8" />
          </div>
          <p className="text-[10px] font-sans font-bold text-secondary tracking-widest uppercase mb-2">Network Size</p>
          <p className="text-6xl font-serif font-bold tracking-tighter text-primary">{stats.totalUsers || 0}</p>
        </div>
        <div className="glass-panel p-8 text-center rounded-3xl hover:-translate-y-1 transition-transform duration-500">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/5 text-emerald-600 border-[0.5px] border-emerald-500/20 shadow-inner">
            <FileText className="h-8 w-8" />
          </div>
          <p className="text-[10px] font-sans font-bold text-secondary tracking-widest uppercase mb-2">Resumes Processed</p>
          <p className="text-6xl font-serif font-bold tracking-tighter text-primary">{stats.totalResumes || 0}</p>
        </div>
        <div className="glass-panel p-8 text-center rounded-3xl hover:-translate-y-1 transition-transform duration-500">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/5 text-blue-600 border-[0.5px] border-blue-500/20 shadow-inner">
            <Briefcase className="h-8 w-8" />
          </div>
          <p className="text-[10px] font-sans font-bold text-secondary tracking-widest uppercase mb-2">Active Roles</p>
          <p className="text-6xl font-serif font-bold tracking-tighter text-primary">{stats.totalJobs || 0}</p>
        </div>
      </section>
    </div>
  );
}
