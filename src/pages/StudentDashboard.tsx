import { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Bot, Briefcase, FileText, GraduationCap, Loader2, Send, Sparkles, Target, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCareerChatbot } from '@/hooks/useChatbot';
import { Header } from '@/components/layout/Header';
import { TargetRoleSelector, SkillGapAnalysis } from '@/components/profile/TargetRoleSelector';
import { useJobs } from '@/hooks/useJobs';
import { useCourses } from '@/hooks/useCourses';
import { api, aiService } from '@/lib/api';
import type { TargetRole } from '@/types';

type ParsedResume = {
  summary?: string;
  skills?: string[];
  education?: Record<string, unknown>[];
  experience?: Record<string, unknown>[];
  contact_details?: {
    emails?: string[];
    phones?: string[];
    linkedin?: string[];
    github?: string[];
  };
  experience_level?: string;
  suggested_roles?: string[];
  raw_text?: string;
};

type SkillGapResult = {
  similarity_score?: number;
  missing_skills?: string[];
  matched_skills?: string[];
  recommended_courses?: {
    id?: string;
    title: string;
    provider?: string;
    url?: string;
    skills?: string[];
    relevance?: number;
  }[];
  explanation?: string;
};

type JobRecommendation = {
  id: string;
  title: string;
  company: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  requirements?: string[];
  match_score: number;
  matched_skills?: string[];
  missing_skills?: string[];
};

function extractSkillNames(rawSkills: unknown): string[] {
  if (!Array.isArray(rawSkills)) {
    return [];
  }

  return rawSkills
    .map((skill) => {
      if (typeof skill === 'string') {
        return skill;
      }
      if (skill && typeof skill === 'object' && 'name' in skill) {
        return String(skill.name || '');
      }
      return '';
    })
    .filter(Boolean);
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) {
    return 'Compensation not listed';
  }

  if (min && max) {
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  }

  return min ? `From ₹${min.toLocaleString()}` : `Up to ₹${(max || 0).toLocaleString()}`;
}

export function StudentDashboard() {
  const { user, getToken } = useAuth();
  const { data: jobs = [] } = useJobs();
  const { data: courses = [] } = useCourses();
  const { messages, isLoading: chatLoading, sendMessage } = useCareerChatbot();

  const [resumeResult, setResumeResult] = useState<ParsedResume | null>(null);
  const [candidateId, setCandidateId] = useState<string>('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [selectedTargetRole, setSelectedTargetRole] = useState<TargetRole | null>(null);
  const [skillGapResult, setSkillGapResult] = useState<SkillGapResult | null>(null);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([]);
  const [courseRecommendations, setCourseRecommendations] = useState<Record<string, unknown>[]>([]);
  const [applications, setApplications] = useState<Record<string, unknown>[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadCandidate = async () => {
      const result = await api.getCandidateByClerkId(user.clerkUserId);
      if (result.error || !result.data) {
        return;
      }

      setCandidateId(result.data.id);

      setResumeResult((previous) => {
        if (previous) {
          return previous;
        }

        return {
          skills: extractSkillNames(result.data.skills),
          education: Array.isArray(result.data.education) ? result.data.education : [],
          experience: Array.isArray(result.data.experience) ? result.data.experience : [],
          raw_text: result.data.resume_text || '',
        };
      });

      const applicationsResponse = await api.getApplicationsByCandidate(result.data.id);
      if (!applicationsResponse.error) {
        setApplications(applicationsResponse.data || []);
      }
    };

    loadCandidate();
  }, [user]);

  const currentSkills = useMemo(
    () => (resumeResult?.skills || []).filter(Boolean),
    [resumeResult],
  );

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user || acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    setIsParsingResume(true);

    try {
      const token = await getToken();
      const parsed = await aiService.parseResume(file, token);

      setResumeResult(parsed);
      toast.success(`Resume parsed successfully. ${parsed.skills?.length || 0} skills detected.`);

      const upsert = await api.upsertCandidateProfile({
        clerk_user_id: user.clerkUserId,
        name: user.name,
        email: user.email,
        role: 'student',
        skills: (parsed.skills || []).map((skill: string) => ({ name: skill, score: 1, category: 'technical' })),
        education: parsed.education || [],
        experience: parsed.experience || [],
        resume_text: parsed.raw_text || '',
      });

      if (upsert.error) {
        toast.error(`Profile save failed: ${upsert.error}`);
      } else if (upsert.data?.id) {
        setCandidateId(upsert.data.id);
        await api.logActivity(user.clerkUserId, 'resume_parsed', 'Student uploaded and parsed resume', {
          skills_count: parsed.skills?.length || 0,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse resume');
    } finally {
      setIsParsingResume(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const runSkillGapAndRecommendations = async () => {
    if (!user) {
      return;
    }
    if (!selectedTargetRole) {
      toast.error('Select a target role first');
      return;
    }
    if (currentSkills.length === 0) {
      toast.error('Upload and parse your resume first');
      return;
    }

    setIsGeneratingInsights(true);
    try {
      const token = await getToken();

      const gapResult = await aiService.analyzeSkillGaps(currentSkills, selectedTargetRole.name, token);
      setSkillGapResult(gapResult);

      const recommendedJobs = await aiService.recommendJobs(currentSkills, jobs, 6, token);
      setJobRecommendations(recommendedJobs?.recommendations || []);

      const recommendedCourses = await aiService.recommendCourses(
        gapResult?.missing_skills || [],
        currentSkills,
        courses,
        6,
        token,
      );
      setCourseRecommendations(recommendedCourses?.recommendations || []);

      await api.logActivity(user.clerkUserId, 'insights_generated', 'Generated skill-gap and recommendations', {
        target_role: selectedTargetRole.name,
      });

      toast.success('AI recommendations generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate recommendations');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const applyToJob = async (jobId: string) => {
    if (!user) {
      return;
    }
    if (!candidateId) {
      toast.error('Parse and save your profile before applying');
      return;
    }

    const result = await api.applyToJob(jobId, candidateId);
    if (result.error) {
      toast.error(result.error.includes('duplicate') ? 'You already applied to this job' : result.error);
      return;
    }

    toast.success('Application submitted');
    await api.logActivity(user.clerkUserId, 'job_applied', 'Applied to a recommended job', { job_id: jobId });

    const applicationsResponse = await api.getApplicationsByCandidate(candidateId);
    if (!applicationsResponse.error) {
      setApplications(applicationsResponse.data || []);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) {
      return;
    }
    sendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div>
      <Header
        title={`Hi, ${user?.name?.split(' ')[0] || 'Student'}`}
        subtitle="Resume intelligence, skill-gap analysis, and personalized recommendations"
      />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-white" />
              <h2 className="text-white font-medium text-sm">Resume Upload & Parsing</h2>
            </div>

            <div
              {...getRootProps()}
              className={`p-4 border border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive ? 'border-white bg-[#111]' : 'border-[#333] hover:border-[#666]'
              }`}
            >
              <input {...getInputProps()} />
              {isParsingResume ? (
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Parsing resume with AI...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-white">Drop PDF or click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">NLP parsing + NER + skill extraction</p>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {currentSkills.slice(0, 10).map((skill) => (
                <span key={skill} className="px-2 py-0.5 rounded bg-white text-black text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-white" />
              <h2 className="text-white font-medium text-sm">Target Role & AI Insights</h2>
            </div>

            <TargetRoleSelector selectedRole={selectedTargetRole} onSelect={setSelectedTargetRole} />

            <button
              onClick={runSkillGapAndRecommendations}
              disabled={isGeneratingInsights}
              className="mt-4 inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
            >
              {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGeneratingInsights ? 'Generating' : 'Run AI Analysis'}
            </button>
          </div>
        </div>

        {(resumeResult?.summary || resumeResult?.contact_details) && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-white" />
              <h2 className="text-white font-medium text-sm">Parsed Profile Details</h2>
            </div>

            {resumeResult?.summary && (
              <p className="text-sm text-gray-300 mb-4">{resumeResult.summary}</p>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Education</p>
                <div className="space-y-2">
                  {(resumeResult?.education || []).slice(0, 3).map((education, index) => (
                    <div key={`edu-${index}`} className="bg-[#111] rounded p-2">
                      <p className="text-xs text-white">{String(education.degree || 'Degree')}</p>
                      <p className="text-[11px] text-gray-500">{String(education.institution || '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Experience</p>
                <div className="space-y-2">
                  {(resumeResult?.experience || []).slice(0, 3).map((experience, index) => (
                    <div key={`exp-${index}`} className="bg-[#111] rounded p-2">
                      <p className="text-xs text-white">{String(experience.title || 'Role')}</p>
                      <p className="text-[11px] text-gray-500">{String(experience.company || '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Contact Extraction</p>
                <div className="space-y-2 bg-[#111] rounded p-2">
                  <p className="text-[11px] text-gray-300">
                    Email: {resumeResult?.contact_details?.emails?.[0] || 'Not found'}
                  </p>
                  <p className="text-[11px] text-gray-300">
                    Phone: {resumeResult?.contact_details?.phones?.[0] || 'Not found'}
                  </p>
                  <p className="text-[11px] text-gray-300">
                    LinkedIn: {resumeResult?.contact_details?.linkedin?.[0] || 'Not found'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {skillGapResult && selectedTargetRole && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SkillGapAnalysis
                userSkills={currentSkills}
                targetSkills={selectedTargetRole.requiredSkills}
              />
            </div>
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Similarity Score</p>
              <p className="text-2xl font-bold text-white mb-3">{Math.round(skillGapResult.similarity_score || 0)}%</p>
              <p className="text-xs text-gray-400">{skillGapResult.explanation || 'Skill-gap analysis ready.'}</p>
            </div>
          </div>
        )}

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-white" />
            <h2 className="text-white font-medium text-sm">Top Job Recommendations</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(jobRecommendations.length > 0 ? jobRecommendations : jobs.slice(0, 6)).map((job) => (
              <div key={String(job.id)} className="bg-[#111] rounded-lg p-3 border border-[#222]">
                <p className="text-sm text-white font-medium">{String(job.title || 'Role')}</p>
                <p className="text-xs text-gray-500">{String(job.company || 'Company')}</p>
                <p className="text-xs text-gray-500 mt-1">{String(job.location || 'Location')}</p>
                <p className="text-xs text-gray-300 mt-2">
                  {formatSalary(Number(job.salary_min || 0), Number(job.salary_max || 0))}
                </p>

                {typeof (job as JobRecommendation).match_score === 'number' && (
                  <p className="text-xs text-green-400 mt-2">Match: {Math.round((job as JobRecommendation).match_score)}%</p>
                )}

                <button
                  onClick={() => applyToJob(String(job.id))}
                  className="mt-3 w-full bg-white text-black rounded px-3 py-1.5 text-xs font-medium"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-white" />
            <h2 className="text-white font-medium text-sm">Recommended Courses</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(courseRecommendations.length > 0 ? courseRecommendations : courses.slice(0, 6)).map((course) => (
              <a
                key={String(course.id)}
                href={String(course.url || '#')}
                target="_blank"
                rel="noreferrer"
                className="bg-[#111] rounded-lg p-3 border border-[#222] hover:border-[#555] transition-colors"
              >
                <p className="text-sm text-white font-medium">{String(course.title || 'Course')}</p>
                <p className="text-xs text-gray-500">{String(course.provider || 'Provider')}</p>
                <p className="text-xs text-gray-500 mt-2">{String(course.duration || '')}</p>
              </a>
            ))}
          </div>
        </div>

        {applications.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <h2 className="text-white font-medium text-sm mb-3">My Applications</h2>
            <div className="space-y-2">
              {applications.slice(0, 8).map((application) => (
                (() => {
                  const job = (application as { jobs?: { title?: string; company?: string } }).jobs;
                  return (
                    <div key={String(application.id)} className="bg-[#111] rounded-lg p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-white">{job?.title || 'Job'}</p>
                        <p className="text-xs text-gray-500">{job?.company || ''}</p>
                      </div>
                      <span className="text-xs text-gray-300 capitalize">{String(application.status || 'pending')}</span>
                    </div>
                  );
                })()
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowChat((prev) => !prev)}
        className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 z-50"
      >
        <Bot className="w-4 h-4" />
        Career Chat
      </button>

      {showChat && (
        <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-[360px] bg-[#0a0a0a] border border-[#222] rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-[#222]">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Career Assistant</span>
            </div>
            <button onClick={() => setShowChat(false)}>
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                <span
                  className={`inline-block px-3 py-2 rounded-lg text-xs ${
                    message.role === 'user' ? 'bg-white text-black' : 'bg-[#222] text-white'
                  }`}
                >
                  {message.content}
                </span>
              </div>
            ))}
            {chatLoading && (
              <div className="text-left">
                <span className="inline-block px-3 py-2 rounded-lg text-xs bg-[#222] text-white">
                  Thinking...
                </span>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-[#222] flex gap-2">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  sendChatMessage();
                }
              }}
              placeholder="Ask about interviews, roadmap, resumes..."
              className="flex-1 bg-[#111] border border-[#222] rounded px-3 py-2 text-xs text-white"
            />
            <button onClick={sendChatMessage} className="bg-white text-black px-3 rounded">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
