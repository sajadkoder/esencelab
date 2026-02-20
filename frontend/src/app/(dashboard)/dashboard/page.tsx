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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B35]"></div>
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
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Welcome back, {user.name}!</h1>
          <p className="text-gray-500">Here's what's happening with your {user.role === 'student' ? 'job search' : 'recruitment'}.</p>
        </div>
        {user.role === 'employer' && (
          <Link href="/jobs/new">
            <Button className="bg-[#FF6B35] hover:bg-[#e55a2b]">Post New Job</Button>
          </Link>
        )}
      </div>

      {user.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-[#FFF5E6] rounded-xl">
              <FileText className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Applications</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.myApplications || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Shortlisted</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">
                {recentApplications.filter((a: Application) => a.status === 'shortlisted').length}
              </p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Interviews</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">
                {recentApplications.filter((a: Application) => a.status === 'interview').length}
              </p>
            </div>
          </Card>
        </div>
      )}

      {user.role === 'employer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-[#FFF5E6] rounded-xl">
              <Briefcase className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Posted Jobs</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.postedJobs || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Applicants</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.totalApplications || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Interviews</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.interviewsScheduled || 0}</p>
            </div>
          </Card>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-[#FFF5E6] rounded-xl">
              <Users className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.totalUsers || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Briefcase className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.totalJobs || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Applications</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.totalApplications || 0}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FileText className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Candidates</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stats.totalCandidates || 0}</p>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Jobs" subtitle="Latest job postings" action={
          <Link href="/jobs" className="text-[#FF6B35] hover:underline text-sm flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        }>
          {recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job: Job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-[#FFF8F0] rounded-xl hover:bg-[#FFF5E6] transition-colors">
                  <div>
                    <h4 className="font-medium text-[#1a1a1a]">{job.title}</h4>
                    <p className="text-sm text-gray-500">{job.company} - {job.location}</p>
                  </div>
                  <Badge variant={job.status === 'active' ? 'success' : 'default'}>
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No jobs available yet.</p>
          )}
        </Card>

        {user.role === 'student' && (
          <Card title="My Applications" subtitle="Track your applications" action={
            <Link href="/applications" className="text-[#FF6B35] hover:underline text-sm flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }>
            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.slice(0, 5).map((app: Application) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-[#FFF8F0] rounded-xl">
                    <div>
                      <h4 className="font-medium text-[#1a1a1a]">{app.job?.title}</h4>
                      <p className="text-sm text-gray-500">{app.job?.company}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No applications yet. <Link href="/jobs" className="text-[#FF6B35]">Browse jobs</Link></p>
            )}
          </Card>
        )}

        {user.role === 'employer' && (
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
