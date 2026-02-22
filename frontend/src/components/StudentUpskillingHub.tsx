'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { CircularProgress } from '@/components/Progress';
import { Skeleton } from '@/components/Skeleton';
import { CareerOverview, JobMatch, Resume, StudentRecommendations } from '@/types';
import {
  clearRecommendationCache,
  getCareerOverview,
  getReadableErrorMessage,
  getResume,
  uploadResume,
} from '@/lib/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentUpskillingHubProps {
  recommendations: StudentRecommendations | null;
  onRefresh: () => Promise<void>;
}

type FeedbackTone = 'success' | 'error' | 'info';

interface FeedbackState {
  tone: FeedbackTone;
  text: string;
}

const scoreToPercent = (score: number) => {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, score <= 1 ? Math.round(score * 100) : Math.round(score)));
};

const oneLine = (text: string | undefined, max = 98) => {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return 'Recommended based on your current resume and skills.';
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}...`;
};

const validatePdf = (candidate: File) => {
  const isPdf = candidate.type === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'Invalid PDF. Please upload a valid resume PDF file.';
  if (candidate.size > 5 * 1024 * 1024) return 'File is too large. Maximum allowed size is 5MB.';
  return null;
};

export default function StudentUpskillingHub({
  recommendations,
  onRefresh,
}: StudentUpskillingHubProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [overview, setOverview] = useState<CareerOverview | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const resumeData = await getResume();
      setResume(resumeData);
      if (resumeData) {
        const overviewData = await getCareerOverview();
        setOverview(overviewData);
      } else {
        setOverview(null);
      }
    } catch (error: any) {
      setFeedback({
        tone: 'error',
        text: getReadableErrorMessage(error, 'Unable to load dashboard data.'),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const topRecommendedJobs = useMemo(() => {
    return (recommendations?.recommendedJobs || []).slice(0, 3);
  }, [recommendations]);

  const topMissingSkills = useMemo(() => {
    const recommendationSkills = (recommendations?.missingSkills || []).slice(0, 6);
    if (recommendationSkills.length > 0) return recommendationSkills;
    return (overview?.missingSkills || []).slice(0, 6);
  }, [overview?.missingSkills, recommendations?.missingSkills]);

  const readiness = useMemo(() => {
    if (overview?.latestScore) return scoreToPercent(overview.latestScore.score);
    if (topRecommendedJobs.length > 0) {
      const avg =
        topRecommendedJobs.reduce((sum, entry) => sum + scoreToPercent(entry.matchScore), 0) /
        topRecommendedJobs.length;
      return Math.round(avg);
    }
    return 25;
  }, [overview?.latestScore, topRecommendedJobs]);

  const targetRole = useMemo(() => {
    return overview?.role?.name || topRecommendedJobs[0]?.job?.title || 'your selected role';
  }, [overview?.role?.name, topRecommendedJobs]);

  const processResumeUpload = async (candidate: File | null) => {
    if (!candidate || uploading) return;
    const validationError = validatePdf(candidate);
    if (validationError) {
      setFeedback({ tone: 'error', text: validationError });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setFeedback({ tone: 'info', text: 'Analyzing your resume...' });

    try {
      const parsedResume = await uploadResume(candidate, setUploadProgress);
      setResume(parsedResume);
      if (user?.id) clearRecommendationCache(user.id);
      await Promise.all([onRefresh(), loadData()]);
      setFeedback({
        tone: 'success',
        text: 'Your profile has been analyzed successfully.',
      });
    } catch (error: any) {
      setFeedback({
        tone: 'error',
        text: getReadableErrorMessage(error, 'Unable to analyze your resume right now.'),
      });
    } finally {
      setUploading(false);
    }
  };

  const feedbackClass =
    feedback?.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : feedback?.tone === 'error'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-accent-soft text-accent';

  const renderJobCard = (entry: JobMatch) => {
    const match = scoreToPercent(entry.matchScore);
    return (
      <Card key={entry.job.id} hoverable className="flex flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-primary line-clamp-1">{entry.job.title}</h3>
            <p className="text-sm text-secondary">{entry.job.company}</p>
          </div>
          <Badge variant={match > 75 ? 'success' : match > 50 ? 'warning' : 'secondary'}>
            {match}% Match
          </Badge>
        </div>
        <p className="text-sm text-secondary flex-grow mb-6 line-clamp-2">{oneLine(entry.job.description)}</p>
        <div>
          <Link href={`/jobs/${entry.job.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8 layout-container section-spacing">
        <Skeleton className="h-24 w-full max-w-2xl" />
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="layout-container section-spacing flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-10">
            <h2 className="heading-section text-primary mb-3">Upload Your Resume</h2>
            <p className="text-base text-secondary">Let's analyze your profile and build your career roadmap.</p>
          </div>

          <Card hoverable={false} className="border-dashed border-2 bg-transparent hover:bg-white/40 transition-colors p-12 flex flex-col items-center justify-center text-center cursor-pointer"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="w-full max-w-sm space-y-4">
                <div className="flex items-center justify-center gap-3 text-sm text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  <span>Analyzing your resume...</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-accent-soft text-accent rounded-full flex items-center justify-center mb-6">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">Drag and drop your resume here</h3>
                <p className="text-sm text-secondary mb-6">PDF files up to 5MB</p>
                <Button variant="primary">Browse Files</Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(event) => {
                void processResumeUpload(event.target.files?.[0] || null);
                event.currentTarget.value = '';
              }}
            />
          </Card>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-6 rounded-xl border px-4 py-3 text-sm flex items-center gap-3 ${feedbackClass}`}
              >
                {feedback.tone === 'error' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                {feedback.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="layout-container section-spacing space-y-12">
      <section className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2">Welcome back, {user?.name || 'Student'}.</h1>
        <p className="text-base text-secondary">Here's your career progress, let's keep improving together.</p>
      </section>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-3 ${feedbackClass}`}
          >
            {feedback.tone === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <Card hoverable={false} className="flex flex-col md:flex-row items-center justify-between gap-10 p-8 md:p-12">
          <div className="space-y-4 max-w-lg text-center md:text-left flex-1">
            <h2 className="heading-section text-primary">Resume Strength Score</h2>
            <p className="text-base text-secondary mb-6">You are {readiness}% ready for the {targetRole} role. Check your skill gaps and continue learning to increase your match.</p>
            {uploading ? (
              <div className="flex items-center md:justify-start justify-center gap-2 text-sm text-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>Analyzing your updated resume...</span>
              </div>
            ) : (
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Update Resume
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(event) => {
                void processResumeUpload(event.target.files?.[0] || null);
                event.currentTarget.value = '';
              }}
            />
          </div>
          <div className="flex-shrink-0">
            <CircularProgress value={readiness} max={100} size={160} strokeWidth={12} />
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="heading-section text-primary">Missing Skills</h2>
        <div className="flex flex-wrap gap-3">
          {topMissingSkills.length > 0 ? (
            topMissingSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-sm py-1.5 px-4 font-normal">
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-secondary">Great work. You have strong coverage for your target roles.</p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="heading-section text-primary">Top Recommendations</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topRecommendedJobs.length > 0 ? (
            topRecommendedJobs.map(renderJobCard)
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-secondary">
                We are preparing recommendations based on your profile.
              </p>
            </Card>
          )}
        </div>
      </section>

    </div>
  );
}
