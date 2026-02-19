'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Application } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { Briefcase, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

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
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-error" />;
      case 'interview':
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'warning',
      shortlisted: 'success',
      rejected: 'error',
      interview: 'info',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">My Applications</h1>
        <p className="text-slate-500">Track your job applications</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">Total</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          <p className="text-sm text-slate-500">Pending</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-accent">{stats.shortlisted}</p>
          <p className="text-sm text-slate-500">Shortlisted</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-error">{stats.rejected}</p>
          <p className="text-sm text-slate-500">Rejected</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-secondary">{stats.interview}</p>
          <p className="text-sm text-slate-500">Interview</p>
        </Card>
      </div>

      {applications.length > 0 ? (
        <Card>
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg">
                    <Briefcase className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{app.job?.title}</h4>
                    <p className="text-sm text-slate-500">{app.job?.company} • {app.job?.location}</p>
                    {app.matchScore && (
                      <p className="text-xs text-slate-400">Match: {Math.round(app.matchScore * 100)}%</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(app.status)}
                  <span className="text-xs text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">No applications yet</h3>
          <p className="text-slate-500 mb-4">Start applying to jobs to track your progress</p>
          <button
            onClick={() => router.push('/jobs')}
            className="text-secondary hover:underline font-medium"
          >
            Browse Jobs
          </button>
        </Card>
      )}
    </div>
  );
}
