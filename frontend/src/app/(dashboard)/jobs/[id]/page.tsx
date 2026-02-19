'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Job, Application } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, Briefcase, ArrowLeft, Building, CheckCircle, XCircle } from 'lucide-react';

export default function JobDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchJob();
      checkApplication();
    }
  }, [isAuthenticated, params.id]);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${params.id}`);
      setJob(res.data.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const res = await api.get(`/applications/my`);
      const applications = res.data.data || [];
      const applied = applications.some((app: Application) => app.jobId === params.id);
      setHasApplied(applied);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleApply = async () => {
    if (!user?.id) return;
    
    setApplying(true);
    try {
      await api.post('/applications', {
        jobId: params.id,
        studentId: user.id,
      });
      setHasApplied(true);
      alert('Application submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (isLoading || loading || !job) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  const isRecruiterOrAdmin = user?.role === 'recruiter' || user?.role === 'admin';
  const isOwner = user?.id === job.recruiterId;

  return (
    <div className="space-y-6">
      <Link href="/jobs" className="inline-flex items-center text-slate-600 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-primary mb-1">{job.title}</h1>
                <p className="text-lg text-slate-600 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  {job.company}
                </p>
              </div>
              <Badge variant={job.status === 'active' ? 'success' : 'default'}>
                {job.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-slate-600">
                <MapPin className="w-4 h-4 mr-2" />
                {job.location}
              </div>
              <div className="flex items-center text-slate-600">
                <Briefcase className="w-4 h-4 mr-2" />
                {job.jobType}
              </div>
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center text-slate-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {job.salaryMin && job.salaryMax
                    ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                    : job.salaryMin
                    ? `From $${job.salaryMin.toLocaleString()}`
                    : `Up to $${job.salaryMax?.toLocaleString()}`}
                </div>
              )}
              <div className="flex items-center text-slate-600">
                <Clock className="w-4 h-4 mr-2" />
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Description</h2>
                <p className="text-slate-600 whitespace-pre-line">{job.description}</p>
              </div>

              {job.requirements && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-2">Requirements</h2>
                  <p className="text-slate-600 whitespace-pre-line">{job.requirements}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {user?.role === 'student' && (
            <Card>
              {hasApplied ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
                  <p className="font-medium text-slate-800">You have applied</p>
                  <p className="text-sm text-slate-500">Track your application in the dashboard</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">Apply for this position</h3>
                  <p className="text-sm text-slate-500">Submit your application and attach your resume for AI-powered matching.</p>
                  <Button onClick={handleApply} isLoading={applying} className="w-full">
                    Apply Now
                  </Button>
                </div>
              )}
            </Card>
          )}

          {(isRecruiterOrAdmin || isOwner) && (
            <Card>
              <h3 className="font-semibold text-slate-800 mb-4">Manage Job</h3>
              <div className="space-y-3">
                {isOwner && (
                  <>
                    <Link href={`/jobs/${job.id}/edit`}>
                      <Button variant="outline" className="w-full">Edit Job</Button>
                    </Link>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this job?')) {
                          try {
                            await api.delete(`/jobs/${job.id}`);
                            router.push('/jobs');
                          } catch (error) {
                            alert('Failed to delete job');
                          }
                        }
                      }}
                    >
                      Delete Job
                    </Button>
                  </>
                )}
                {user?.role === 'recruiter' && !isOwner && (
                  <Link href={`/jobs/${job.id}/applicants`}>
                    <Button className="w-full">View Applicants</Button>
                  </Link>
                )}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold text-slate-800 mb-3">Job Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Job Type</span>
                <span className="font-medium capitalize">{job.jobType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-medium">{job.location}</span>
              </div>
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Salary Range</span>
                  <span className="font-medium">
                    ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Posted</span>
                <span className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
