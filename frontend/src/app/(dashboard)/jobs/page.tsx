'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Job } from '@/types';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, Clock, Search } from 'lucide-react';
import Input from '@/components/Input';
import Select from '@/components/Select';

export default function JobsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs();
    }
  }, [isAuthenticated, searchTerm, jobType, location]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (jobType) params.append('jobType', jobType);
      if (location) params.append('location', location);
      
      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.data?.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getJobTypeBadge = (type: string) => {
    const variants: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
      'full-time': 'info',
      'part-time': 'success',
      'internship': 'warning',
      'contract': 'default',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Job Listings</h1>
          <p className="text-slate-500">Find your dream job or hire talent</p>
        </div>
        {user?.role === 'recruiter' && (
          <Link href="/jobs/new">
            <Button>Post New Job</Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
          <Select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'full-time', label: 'Full Time' },
              { value: 'part-time', label: 'Part Time' },
              { value: 'internship', label: 'Internship' },
              { value: 'contract', label: 'Contract' },
            ]}
          />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </Card>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={job.status === 'active' ? 'success' : 'default'}>
                  {job.status}
                </Badge>
                {getJobTypeBadge(job.jobType)}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">{job.title}</h3>
              <p className="text-slate-600 mb-3">{job.company}</p>
              <div className="space-y-2 text-sm text-slate-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {job.location}
                </div>
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {job.salaryMin && job.salaryMax
                      ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                      : job.salaryMin
                      ? `From $${job.salaryMin.toLocaleString()}`
                      : `Up to $${job.salaryMax?.toLocaleString()}`}
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Link href={`/jobs/${job.id}`}>
                <Button variant="outline" className="w-full">View Details</Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">No jobs found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </Card>
      )}
    </div>
  );
}
