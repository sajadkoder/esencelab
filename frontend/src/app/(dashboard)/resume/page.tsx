'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, FileText, Loader2, UploadCloud, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Resume } from '@/types';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { Skeleton } from '@/components/Skeleton';
import {
  deleteResume,
  getReadableErrorMessage,
  getResume,
  uploadResume,
} from '@/lib/dashboardApi';
import { motion, AnimatePresence } from 'framer-motion';

type FeedbackTone = 'success' | 'error' | 'info';

interface FeedbackState {
  tone: FeedbackTone;
  text: string;
}

const isResumeEffectivelyEmpty = (resume: Resume) => {
  const hasSkills = (resume.skills || []).length > 0;
  const hasSummary = Boolean(resume.parsedData?.summary);
  const hasEducation = (resume.parsedData?.education || []).length > 0;
  const hasExperience = (resume.parsedData?.experience || []).length > 0;
  return !hasSkills && !hasSummary && !hasEducation && !hasExperience;
};

export default function ResumeUploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resume, setResume] = useState<Resume | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResume = useCallback(async () => {
    try {
      const data = await getResume();
      setResume(data);
    } catch (error: any) {
      setFeedback({
        tone: 'error',
        text: getReadableErrorMessage(error, 'Failed to load resume data.'),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'student') {
      router.push('/dashboard');
      return;
    }
    void fetchResume();
  }, [fetchResume, router, user?.role]);

  const validatePdf = (candidate: File) => {
    const isPdf =
      candidate.type === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return 'Invalid file type. Please upload a PDF.';
    if (candidate.size > 5 * 1024 * 1024) return 'File too large. Maximum size is 5MB.';
    return null;
  };

  const setSelectedFile = (candidate: File | null) => {
    if (!candidate) {
      setFile(null);
      return;
    }
    const validationError = validatePdf(candidate);
    if (validationError) {
      setFeedback({ tone: 'error', text: validationError });
      return;
    }
    setFeedback(null);
    setFile(candidate);
  };

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') setDragActive(true);
    if (event.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    setSelectedFile(event.dataTransfer.files?.[0] || null);
  }, []);

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setUploadProgress(0);
    setFeedback({ tone: 'info', text: 'Analyzing your resume...' });

    try {
      const parsedResume = await uploadResume(file, setUploadProgress);
      setResume(parsedResume);
      setFile(null);
      if (isResumeEffectivelyEmpty(parsedResume)) {
        setFeedback({
          tone: 'error',
          text: 'Resume uploaded, but content appears empty. Please upload a text-based PDF.',
        });
      } else {
        setFeedback({
          tone: 'success',
          text: 'Your profile has been analyzed successfully.',
        });
      }
    } catch (error: any) {
      setFeedback({
        tone: 'error',
        text: getReadableErrorMessage(error, 'Failed to upload resume.'),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!resume) return;
    if (!confirm('Are you sure you want to delete your resume?')) return;
    try {
      await deleteResume(resume.id);
      setResume(null);
      setFile(null);
      setFeedback({ tone: 'success', text: 'Resume deleted successfully.' });
    } catch (error: any) {
      setFeedback({
        tone: 'error',
        text: getReadableErrorMessage(error, 'Failed to delete resume.'),
      });
    }
  };

  if (user?.role !== 'student') return null;

  const feedbackClass =
    feedback?.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : feedback?.tone === 'error'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-accent-soft text-accent';

  if (loading) {
    return (
      <div className="layout-container section-spacing space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="layout-container section-spacing space-y-10 max-w-4xl mx-auto">
      <section>
        <h1 className="heading-hero text-primary mb-2">Resume Management</h1>
        <p className="text-body text-secondary">Upload your resume to get AI-powered recommendations.</p>
      </section>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-3 ${feedbackClass}`}
          >
            {feedback.tone === 'error' ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      <Card hoverable={false} className="p-8 md:p-12">
        <div
          className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px] ${dragActive ? 'border-accent bg-accent-soft/50' : 'border-border hover:bg-white/40'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            className="hidden"
            id="file-upload"
          />

          {file ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-accent-soft text-accent rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-medium text-primary text-lg">{file.name}</p>
                <p className="text-sm text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  isLoading={uploading}
                  disabled={uploading}
                >
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload Resume
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent-soft text-accent rounded-full flex items-center justify-center mb-6">
                <UploadCloud className="mx-auto h-8 w-8" />
              </div>
              <p className="mb-2 text-lg font-medium text-primary">
                Drop your resume here or click to upload
              </p>
              <p className="text-sm text-secondary mb-6">PDF files only (max 5MB)</p>
              <Button variant="secondary" className="pointer-events-none">Select File</Button>
            </div>
          )}
        </div>

        {uploading && (
          <div className="mt-8 space-y-4 max-w-md mx-auto">
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
        )}
      </Card>

      {resume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hoverable={false} className="p-8">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <span className="font-semibold text-primary text-lg">Resume successfully parsed</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="mr-2 w-4 h-4" /> Delete
                </Button>
              </div>

              {resume.parsedData && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {resume.parsedData.name && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">Name</h4>
                      <p className="text-primary text-lg">{resume.parsedData.name}</p>
                    </div>
                  )}
                  {resume.parsedData.email && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">Email</h4>
                      <p className="text-primary text-lg">{resume.parsedData.email}</p>
                    </div>
                  )}
                  {resume.parsedData.phone && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">Phone</h4>
                      <p className="text-primary text-lg">{resume.parsedData.phone}</p>
                    </div>
                  )}
                  {resume.parsedData.summary && (
                    <div className="md:col-span-2">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">Summary</h4>
                      <p className="text-primary leading-relaxed">{resume.parsedData.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {resume.skills && resume.skills.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Extracted Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="font-normal px-4 py-1.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
