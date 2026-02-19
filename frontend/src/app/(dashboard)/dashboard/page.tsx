'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { DashboardStats, Job, Application } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Link from 'next/link';
import { Briefcase, FileText, Users, TrendingUp, ArrowRight, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/jobs?limit=5'),
      ]);
      setStats(statsRes.data.data || {});
      setRecentJobs(jobsRes.data.data?.jobs || []);
      
      if (user?.role === 'student') {
        const appsRes = await api.get('/applications/my');
        setRecentApplications(appsRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'warning',
      shortlisted: 'success',
      rejected: 'error',
      interview: 'info',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Welcome back, {user.name}!</h1>
          <p className="text-slate-500">Here&apos;s what&apos;s happening with your {user.role === 'student' ? 'job search' : 'recruitment'}.</p>
        </div>
        {user.role === 'recruiter' && (
          <Link href="/jobs/new">
            <Button>Post New Job</Button>
          </Link>
        )}
      </div>

      {user.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Applications</p>
              <p className="text-2xl font-bold">{stats.myApplications || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Shortlisted</p>
              <p className="text-2xl font-bold">
                {recentApplications.filter((a: Application) => a.status === 'shortlisted').length}
              </p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Interviews</p>
              <p className="text-2xl font-bold">
                {recentApplications.filter((a: Application) => a.status === 'interview').length}
              </p>
            </div>
          </Card>
        </div>
      )}

      {user.role === 'recruiter' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Posted Jobs</p>
              <p className="text-2xl font-bold">{stats.postedJobs || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Applicants</p>
              <p className="text-2xl font-bold">{stats.totalApplications || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Interviews</p>
              <p className="text-2xl font-bold">{stats.interviewsScheduled || 0}</p>
            </div>
          </Card>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Jobs</p>
              <p className="text-2xl font-bold">{stats.totalJobs || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Applications</p>
              <p className="text-2xl font-bold">{stats.totalApplications || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Resumes</p>
              <p className="text-2xl font-bold">{stats.totalResumes || 0}</p>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Jobs" subtitle="Latest job postings" action={
          <Link href="/jobs" className="text-secondary hover:underline text-sm flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        }>
          {recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job: Job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <h4 className="font-medium text-slate-800">{job.title}</h4>
                    <p className="text-sm text-slate-500">{job.company} - {job.location}</p>
                  </div>
                  <Badge variant={job.status === 'active' ? 'success' : 'default'}>
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No jobs available yet.</p>
          )}
        </Card>

        {user.role === 'student' && (
          <Card title="My Applications" subtitle="Track your applications" action={
            <Link href="/applications" className="text-secondary hover:underline text-sm flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.slice(0, 5).map((app: Application) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">{app.job?.title}</h4>
                      <p className="text-sm text-slate-500">{app.job?.company}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No applications yet. <Link href="/jobs" className="text-secondary">Browse jobs</Link></p>
            )}
          </Card>
        )}

        {user.role === 'recruiter' && (
          <Card title="Quick Actions" subtitle="Common tasks">
            <div className="space-y-3">
              <Link href="/jobs/new">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post a New Job
                </Button>
              </Link>
              <Link href="/applicants">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  View All Applicants
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {user.role === 'admin' && (
          <Card title="Quick Actions" subtitle="Admin tasks">
            <div className="space-y-3">
              <Link href="/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Courses
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
