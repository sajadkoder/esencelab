'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Application } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { Briefcase, FileText } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { motion } from 'framer-motion';

export default function ApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      fetchApplications();
    }
  }, [isAuthenticated, user]);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data.data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'primary' | 'error' | 'secondary'> = {
      pending: 'warning',
      shortlisted: 'success',
      rejected: 'error',
      interview: 'primary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="layout-container section-spacing space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-16 w-1/3 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (user?.role !== 'student') {
    router.push('/dashboard');
    return null;
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    interview: applications.filter(a => a.status === 'interview').length,
  };

  return (
    <div className="layout-container section-spacing space-y-10 max-w-6xl mx-auto">
      <div>
        <h1 className="heading-hero text-primary mb-2">My Applications</h1>
        <p className="text-body text-secondary">Track the status of your job applications</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card hoverable className="text-center py-6 px-4">
          <p className="text-3xl font-semibold text-primary mb-1">{stats.total}</p>
          <p className="text-xs uppercase tracking-wider text-secondary font-medium">Total</p>
        </Card>
        <Card hoverable className="text-center py-6 px-4 border-l-4 border-l-orange-400">
          <p className="text-3xl font-semibold text-orange-500 mb-1">{stats.pending}</p>
          <p className="text-xs uppercase tracking-wider text-secondary font-medium">Pending</p>
        </Card>
        <Card hoverable className="text-center py-6 px-4 border-l-4 border-l-emerald-400">
          <p className="text-3xl font-semibold text-emerald-500 mb-1">{stats.shortlisted}</p>
          <p className="text-xs uppercase tracking-wider text-secondary font-medium">Shortlisted</p>
        </Card>
        <Card hoverable className="text-center py-6 px-4 border-l-4 border-l-red-400">
          <p className="text-3xl font-semibold text-red-500 mb-1">{stats.rejected}</p>
          <p className="text-xs uppercase tracking-wider text-secondary font-medium">Rejected</p>
        </Card>
        <Card hoverable className="text-center py-6 px-4 border-l-4 border-l-accent text-accent">
          <p className="text-3xl font-semibold text-accent mb-1">{stats.interview}</p>
          <p className="text-xs uppercase tracking-wider text-secondary font-medium">Interview</p>
        </Card>
      </div>

      {applications.length > 0 ? (
        <Card hoverable={false} className="overflow-hidden p-0 border border-border">
          <div className="divide-y divide-border">
            {applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white hover:bg-background/50 transition-colors gap-4"
              >
                <div className="flex items-start sm:items-center space-x-5">
                  <div className="p-3 bg-accent-soft text-accent rounded-xl flex-shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-primary mb-1">{app.job?.title || 'Job Position'}</h4>
                    <p className="text-sm text-secondary font-medium mb-2">{app.job?.company} — {app.job?.location}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {app.matchScore !== undefined && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium">
                          Match: {Math.round(app.matchScore)}%
                        </span>
                      )}
                      {Array.isArray((app as any).missingSkills) && (app as any).missingSkills.length > 0 && (
                        <span className="text-xs text-secondary font-medium">
                          Missing: {(app as any).missingSkills.slice(0, 3).join(', ')}
                          {(app as any).missingSkills.length > 3 && '...'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center mt-4 sm:mt-0 gap-2 w-full sm:w-auto">
                  {getStatusBadge(app.status)}
                  <span className="text-xs text-secondary font-medium">
                    Applied: {new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      ) : (
        <Card hoverable={false} className="text-center py-16 flex flex-col items-center">
          <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-medium text-primary mb-2">No applications yet</h3>
          <p className="text-secondary mb-6">Start applying to jobs to track your progress.</p>
          <button
            onClick={() => router.push('/jobs')}
            className="text-accent hover:text-accent-hover font-medium hover:underline focus:outline-none"
          >
            Browse Jobs
          </button>
        </Card>
      )}
    </div>
  );
}
