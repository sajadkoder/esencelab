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
          <h1 className="heading-hero text-primary mb-2">Recruiter Dashboard</h1>
          <p className="text-body text-secondary">Post jobs and review ranked candidates quickly.</p>
        </section>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-accent-soft bg-accent-soft/30 px-4 py-3 text-sm text-accent"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <section>
          <Card title="Post a New Job" className="max-w-4xl hover:scale-100 pb-8">
            <form className="space-y-6 pt-4" onSubmit={handleCreateJob}>
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
                <label className="absolute left-4 transition-all duration-200 pointer-events-none text-xs px-1 bg-background text-secondary z-10 -top-1">
                  Required Skills (comma separated)
                </label>
                <textarea
                  rows={3}
                  value={jobForm.requirements}
                  onChange={(event) =>
                    setJobForm((prev) => ({ ...prev, requirements: event.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-transparent px-4 py-3.5 text-primary text-base transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary relative z-0 appearance-none bg-white"
                  placeholder="Node.js, Express, SQL"
                  required
                />
              </div>
              <Button type="submit" isLoading={postingJob} className="w-full justify-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post Job
              </Button>
            </form>
          </Card>
        </section>

        <section>
          <Card title="Ranked Candidates List" className="hover:scale-100">
            <div className="mb-6 max-w-sm pt-4">
              <div className="relative pt-2">
                <label className="absolute left-4 transition-all duration-200 pointer-events-none text-xs px-1 bg-background text-secondary z-10 -top-1">Select Job</label>
                <select
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  className="w-full rounded-xl border border-border bg-transparent px-4 py-3.5 text-primary text-base transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary relative z-0 appearance-none bg-white"
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
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-secondary">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <span>Scanning and ranking candidates...</span>
              </div>
            ) : topCandidateMatches.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {topCandidateMatches.map((candidate) => {
                  const topSkills = (candidate.matchedSkills || candidate.skills || []).slice(0, 3);
                  const match = scoreToPercent(candidate.matchScore);
                  return (
                    <Card
                      key={candidate.candidateId}
                      hoverable
                      className="p-6"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <p className="text-lg font-semibold text-primary">{candidate.name}</p>
                        <Badge variant={match > 75 ? 'success' : match > 50 ? 'warning' : 'secondary'}>
                          {match}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary">
                        Top skills: {topSkills.length > 0 ? topSkills.join(', ') : 'No strong overlap yet'}
                      </p>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-body text-secondary">
                  No ranked candidates available for the selected job.
                </p>
              </div>
            )}
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="layout-container section-spacing space-y-12">
      <section>
        <h1 className="heading-hero text-primary mb-2">System Overview</h1>
        <p className="text-body text-secondary">Real-time metrics and platform activity.</p>
      </section>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="text-center hover:scale-102 transition-transform duration-250">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Users className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-secondary tracking-wide uppercase">Total Users</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-primary">{stats.totalUsers || 0}</p>
        </Card>
        <Card className="text-center hover:scale-102 transition-transform duration-250">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <FileText className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-secondary tracking-wide uppercase">Total Resumes</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-primary">{stats.totalResumes || 0}</p>
        </Card>
        <Card className="text-center hover:scale-102 transition-transform duration-250">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Briefcase className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-secondary tracking-wide uppercase">Total Jobs</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-primary">{stats.totalJobs || 0}</p>
        </Card>
      </section>
    </div>
  );
}
