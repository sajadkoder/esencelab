'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Application } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { Users, Briefcase, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

export default function ApplicantsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin')) {
      fetchApplications();
    }
  }, [isAuthenticated, user, statusFilter]);

  const fetchApplications = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/applications${params}`);
      setApplications(res.data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
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

  if (user?.role !== 'recruiter' && user?.role !== 'admin') {
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
        <h1 className="text-2xl font-bold text-primary">Applicants</h1>
        <p className="text-slate-500">Review and manage job applications</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">Total</p>
        </Card>
        <Card className="text-center">
          <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          <p className="text-sm text-slate-500">Pending</p>
        </Card>
        <Card className="text-center">
          <CheckCircle className="w-6 h-6 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-accent">{stats.shortlisted}</p>
          <p className="text-sm text-slate-500">Shortlisted</p>
        </Card>
        <Card className="text-center">
          <Briefcase className="w-6 h-6 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-secondary">{stats.interview}</p>
          <p className="text-sm text-slate-500">Interview</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or job..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50"
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
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-secondary font-medium">
                      {app.student?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{app.student?.name}</h4>
                    <p className="text-sm text-slate-500">
                      {app.job?.title} at {app.job?.company}
                    </p>
                    {app.matchScore && (
                      <p className="text-xs text-secondary">
                        Match: {Math.round(app.matchScore * 100)}%
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
                          className="p-2 hover:bg-green-100 rounded-lg text-accent"
                          title="Shortlist"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="p-2 hover:bg-red-100 rounded-lg text-error"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {app.status === 'shortlisted' && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'interview')}
                        className="px-3 py-1 bg-secondary text-white rounded-lg text-sm hover:bg-blue-600"
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
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No applicants yet</h3>
            <p className="text-slate-500">Applications will appear here when candidates apply</p>
          </div>
        )}
      </Card>
    </div>
  );
}
