'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Application, Job } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { Users, Briefcase, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface CandidateMatch {
  candidateId: string;
  studentId: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation?: string | null;
  hasApplied: boolean;
  applicationStatus?: string | null;
}

export default function ApplicantsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'employer' || user?.role === 'admin')) {
      fetchApplications();
      fetchJobs();
    }
  }, [isAuthenticated, user, statusFilter]);

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidateMatches(selectedJobId);
    } else {
      setCandidateMatches([]);
    }
  }, [selectedJobId]);

  const fetchApplications = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/applications${params}`);
      setApplications(res.data.data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const endpoint = user?.role === 'employer' ? '/jobs?my=true&status=active' : '/jobs?status=active';
      const res = await api.get(endpoint);
      const fetchedJobs = res.data.data?.jobs || [];
      setJobs(fetchedJobs);
      if (!selectedJobId && fetchedJobs.length > 0) {
        setSelectedJobId(fetchedJobs[0].id);
      }
    } catch {
      setJobs([]);
    }
  };

  const fetchCandidateMatches = async (jobId: string) => {
    setLoadingMatches(true);
    try {
      const res = await api.get(`/jobs/${jobId}/candidate-matches`);
      setCandidateMatches(res.data.data || []);
    } catch {
      setCandidateMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      fetchApplications();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'primary'> = {
      pending: 'warning',
      shortlisted: 'success',
      rejected: 'error',
      interview: 'primary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (user?.role !== 'employer' && user?.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Applicants</h1>
        <p className="text-secondary">Review and manage job applications</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <Users className="w-6 h-6 text-black mx-auto mb-2" />
          <p className="text-2xl font-bold text-black">{stats.total}</p>
          <p className="text-sm text-secondary">Total</p>
        </Card>
        <Card className="text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-secondary">Pending</p>
        </Card>
        <Card className="text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p>
          <p className="text-sm text-secondary">Shortlisted</p>
        </Card>
        <Card className="text-center">
          <Briefcase className="w-6 h-6 text-black mx-auto mb-2" />
          <p className="text-2xl font-bold text-black">{stats.interview}</p>
          <p className="text-sm text-secondary">Interview</p>
        </Card>
      </div>

      <Card title="AI Candidate Ranking" subtitle="Similarity score based on job skills and resume skills">
        <div className="space-y-4">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-secondary/70 mb-1">Select Job</label>
            <select
              value={selectedJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
              className="field-3d w-full rounded-xl px-4 py-2.5 focus:outline-none"
            >
              {jobs.length === 0 && <option value="">No active jobs</option>}
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          </div>

          {loadingMatches ? (
            <div className="text-sm text-secondary py-8 text-center">Loading AI candidate rankings...</div>
          ) : candidateMatches.length > 0 ? (
            <div className="space-y-3">
              {candidateMatches.slice(0, 8).map((match) => (
                <div key={match.candidateId} className="p-4 bg-black/5 rounded-xl border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-black">{match.name}</p>
                      <p className="text-sm text-secondary">{match.email}</p>
                    </div>
                    <Badge variant={match.matchScore >= 70 ? 'success' : match.matchScore >= 50 ? 'warning' : 'secondary'}>
                      {match.matchScore}% Match
                    </Badge>
                  </div>
                  {match.missingSkills.length > 0 && (
                    <p className="mt-2 text-xs text-secondary">
                      Missing: {match.missingSkills.slice(0, 5).join(', ')}
                    </p>
                  )}
                  {match.hasApplied && (
                    <p className="mt-1 text-xs text-secondary">
                      Application: {match.applicationStatus || 'pending'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-secondary py-8 text-center">
              No candidate ranking available for this job yet.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or job..."
              className="field-3d w-full rounded-xl py-2.5 pl-10 pr-4 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="field-3d rounded-xl px-4 py-2.5 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-black/5 rounded-xl hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center">
                    <span className="text-black font-medium">
                      {app.student?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-black">{app.student?.name}</h4>
                    <p className="text-sm text-secondary">
                      {app.job?.title} at {app.job?.company}
                    </p>
                    {app.matchScore && (
                      <p className="text-xs text-black">
                        Match: {Math.round(app.matchScore)}%
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(app.status)}
                  <div className="flex space-x-2">
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                          className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                          title="Shortlist"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-500"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {app.status === 'shortlisted' && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'interview')}
                        className="px-3 py-1 bg-black text-white rounded-lg text-sm hover:bg-primary/90"
                      >
                        Schedule Interview
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-secondary/70 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No applicants yet</h3>
            <p className="text-secondary">Applications will appear here when candidates apply</p>
          </div>
        )}
      </Card>
    </div>
  );
}
