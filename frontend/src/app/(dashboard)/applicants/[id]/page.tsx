'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { Skeleton } from '@/components/Skeleton';

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  skills: string[];
  education: Array<Record<string, unknown>>;
  experience: Array<Record<string, unknown>>;
  parsedData?: Record<string, unknown> | null;
  latestResumeScore?: {
    score: number;
    sectionScores?: {
      skills?: number;
      projects?: number;
      experience?: number;
      education?: number;
    };
  } | null;
}

const toPercent = (value: unknown) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n <= 1 ? Math.round(n * 100) : Math.round(n)));
};

export default function ApplicantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isLoading && user && user.role !== 'employer' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, user]);

  useEffect(() => {
    if (!id || !isAuthenticated || (user?.role !== 'employer' && user?.role !== 'admin')) return;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/candidates/${id}`);
        setProfile(res.data.data || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load candidate profile.');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [id, isAuthenticated, user?.role]);

  const sectionScores = useMemo(() => {
    return {
      skills: toPercent(profile?.latestResumeScore?.sectionScores?.skills),
      projects: toPercent(profile?.latestResumeScore?.sectionScores?.projects),
      experience: toPercent(profile?.latestResumeScore?.sectionScores?.experience),
      education: toPercent(profile?.latestResumeScore?.sectionScores?.education),
    };
  }, [profile?.latestResumeScore?.sectionScores]);

  if (isLoading || loading) {
    return (
      <div className="layout-container section-spacing space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-16 w-72" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (user?.role !== 'employer' && user?.role !== 'admin') return null;

  if (error) {
    return (
      <div className="layout-container section-spacing max-w-5xl mx-auto">
        <Card hoverable={false} className="p-6 text-red-700 bg-red-50 border-red-200">
          {error}
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="layout-container section-spacing max-w-5xl mx-auto">
        <Card hoverable={false} className="p-6 text-secondary">
          Candidate not found.
        </Card>
      </div>
    );
  }

  return (
    <div className="layout-container section-spacing space-y-6 max-w-5xl mx-auto">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">{profile.name}</h1>
        <p className="text-secondary">{profile.email}</p>
      </section>

      <Card hoverable={false} className="p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Role: {profile.role || 'Candidate'}</Badge>
          {profile.latestResumeScore && (
            <Badge variant="success">Resume Score: {toPercent(profile.latestResumeScore.score)}%</Badge>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Top Skills</h2>
          <div className="flex flex-wrap gap-2">
            {(profile.skills || []).map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card hoverable={false} className="p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Resume Score Breakdown</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(sectionScores).map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-white p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-secondary">{label}</p>
              <p className="mt-1 text-xl font-semibold text-primary">{value}%</p>
            </div>
          ))}
        </div>
      </Card>

      <Card hoverable={false} className="p-6">
        <h2 className="text-lg font-semibold text-primary mb-3">Experience Highlights</h2>
        {profile.experience?.length ? (
          <div className="space-y-2">
            {profile.experience.slice(0, 6).map((item, index) => (
              <div key={`${index}`} className="rounded-lg border border-border bg-white p-3 text-sm text-secondary">
                {JSON.stringify(item)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary">No experience entries available.</p>
        )}
      </Card>
    </div>
  );
}

