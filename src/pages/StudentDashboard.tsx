import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLocation } from 'react-router-dom';
import { Bot, Briefcase, FileText, GraduationCap, Loader2, Search, Send, Sparkles, Target, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCareerChatbot } from '@/hooks/useChatbot';
import { Header } from '@/components/layout/Header';
import { TargetRoleSelector, SkillGapAnalysis } from '@/components/profile/TargetRoleSelector';
import { useJobs } from '@/hooks/useJobs';
import { useCourses } from '@/hooks/useCourses';
import { api, aiService } from '@/lib/api';
import { LEARNING_CATALOG } from '@/lib/learningCatalog';
import type { LearningResourceCategory, LearningResourceLevel } from '@/lib/learningCatalog';
import type { TargetRole } from '@/types';

type ParsedResume = {
  summary?: string;
  skills?: string[];
  education?: Record<string, unknown>[];
  experience?: Record<string, unknown>[];
  contact_details?: { emails?: string[]; phones?: string[]; linkedin?: string[]; github?: string[] };
  raw_text?: string;
};

type SkillGapResult = {
  similarity_score?: number;
  missing_skills?: string[];
  explanation?: string;
};

type LiveJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  status: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  match_score?: number;
};

type CandidateApplication = {
  id: string;
  status?: string;
  jobs?: { title?: string; company?: string };
};

const RESOURCE_CATEGORIES: { value: 'all' | LearningResourceCategory; label: string }[] = [
  { value: 'all', label: 'All Resources' },
  { value: 'roadmap', label: 'Roadmaps' },
  { value: 'course', label: 'Courses' },
  { value: 'book', label: 'Books' },
  { value: 'practice', label: 'Practice' },
  { value: 'video', label: 'Video' },
  { value: 'certification', label: 'Certifications' },
  { value: 'community', label: 'Communities' },
  { value: 'newsletter', label: 'Newsletters' },
];

const RESOURCE_LEVELS: { value: 'all' | LearningResourceLevel; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function extractSkillNames(rawSkills: unknown): string[] {
  if (!Array.isArray(rawSkills)) return [];
  return rawSkills
    .map((skill) => {
      if (typeof skill === 'string') return skill;
      if (skill && typeof skill === 'object' && 'name' in skill) return String(skill.name || '');
      return '';
    })
    .filter(Boolean);
}

function normalizeJob(raw: Record<string, unknown>): LiveJob {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'Role'),
    company: String(raw.company || 'Company'),
    location: String(raw.location || 'Remote'),
    jobType: String(raw.job_type || raw.type || 'full-time'),
    status: String(raw.status || 'active'),
    skills: Array.isArray(raw.skills) ? raw.skills.map((value) => String(value)).filter(Boolean) : [],
    salaryMin: Number.isFinite(Number(raw.salary_min)) ? Number(raw.salary_min) : 0,
    salaryMax: Number.isFinite(Number(raw.salary_max)) ? Number(raw.salary_max) : 0,
    match_score: Number.isFinite(Number(raw.match_score)) ? Number(raw.match_score) : undefined,
  };
}

function formatSalary(min: number, max: number) {
  if (!min && !max) return 'Compensation not listed';
  if (min && max) return `INR ${min.toLocaleString()} - INR ${max.toLocaleString()}`;
  return min ? `From INR ${min.toLocaleString()}` : `Up to INR ${max.toLocaleString()}`;
}

export function StudentDashboard() {
  const { user, getToken } = useAuth();
  const location = useLocation();
  const { data: jobs = [] } = useJobs();
  const { data: courses = [] } = useCourses();
  const { messages, isLoading: chatLoading, sendMessage } = useCareerChatbot();

  const [resumeResult, setResumeResult] = useState<ParsedResume | null>(null);
  const [candidateId, setCandidateId] = useState('');
  const [selectedTargetRole, setSelectedTargetRole] = useState<TargetRole | null>(null);
  const [skillGapResult, setSkillGapResult] = useState<SkillGapResult | null>(null);
  const [jobRecommendations, setJobRecommendations] = useState<LiveJob[]>([]);
  const [courseRecommendations, setCourseRecommendations] = useState<Record<string, unknown>[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);

  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const [jobSearch, setJobSearch] = useState('');
  const [jobLocationFilter, setJobLocationFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');

  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceCategory, setResourceCategory] = useState<'all' | LearningResourceCategory>('all');
  const [resourceLevel, setResourceLevel] = useState<'all' | LearningResourceLevel>('all');
  const [resourceLimit, setResourceLimit] = useState(24);

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const jobsSectionRef = useRef<HTMLDivElement | null>(null);
  const coursesSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadCandidate = async () => {
      const result = await api.getCandidateByClerkId(user.clerkUserId);
      if (result.error || !result.data) return;
      setCandidateId(result.data.id);
      setResumeResult((previous) =>
        previous || {
          skills: extractSkillNames(result.data.skills),
          education: Array.isArray(result.data.education) ? result.data.education : [],
          experience: Array.isArray(result.data.experience) ? result.data.experience : [],
          raw_text: result.data.resume_text || '',
        },
      );
      const applicationsResponse = await api.getApplicationsByCandidate(result.data.id);
      if (!applicationsResponse.error) {
        setApplications((applicationsResponse.data || []) as CandidateApplication[]);
      }
    };
    loadCandidate();
  }, [user]);

  useEffect(() => {
    const target = location.pathname === '/jobs'
      ? jobsSectionRef.current
      : location.pathname === '/courses'
        ? coursesSectionRef.current
        : null;

    if (!target) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  const currentSkills = useMemo(() => (resumeResult?.skills || []).filter(Boolean), [resumeResult]);
  const liveJobs = useMemo(() => jobs.map((job) => normalizeJob(job as unknown as Record<string, unknown>)), [jobs]);
  const locationOptions = useMemo(() => ['all', ...Array.from(new Set(liveJobs.map((job) => job.location).filter(Boolean)))], [liveJobs]);

  const filteredLiveJobs = useMemo(() => {
    const query = jobSearch.toLowerCase().trim();
    return liveJobs.filter((job) => {
      const matchesSearch = !query
        || job.title.toLowerCase().includes(query)
        || job.company.toLowerCase().includes(query)
        || job.location.toLowerCase().includes(query)
        || job.skills.some((skill) => skill.toLowerCase().includes(query));
      const matchesLocation = jobLocationFilter === 'all' || job.location === jobLocationFilter;
      const matchesType = jobTypeFilter === 'all' || job.jobType === jobTypeFilter;
      return matchesSearch && matchesLocation && matchesType && job.status === 'active';
    });
  }, [liveJobs, jobSearch, jobLocationFilter, jobTypeFilter]);

  const filteredResources = useMemo(() => {
    const query = resourceSearch.toLowerCase().trim();
    return LEARNING_CATALOG.filter((resource) => {
      const matchesCategory = resourceCategory === 'all' || resource.category === resourceCategory;
      const matchesLevel = resourceLevel === 'all' || resource.level === resourceLevel || resource.level === 'all';
      const matchesSearch = !query
        || resource.title.toLowerCase().includes(query)
        || resource.provider.toLowerCase().includes(query)
        || resource.description.toLowerCase().includes(query)
        || resource.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [resourceSearch, resourceCategory, resourceLevel]);

  const visibleResources = useMemo(() => filteredResources.slice(0, resourceLimit), [filteredResources, resourceLimit]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user || acceptedFiles.length === 0) return;
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
    if (!user) return;
    if (!selectedTargetRole) return toast.error('Select a target role first');
    if (currentSkills.length === 0) return toast.error('Upload and parse your resume first');
    setIsGeneratingInsights(true);
    try {
      const token = await getToken();
      const gapResult = await aiService.analyzeSkillGaps(currentSkills, selectedTargetRole.name, token);
      setSkillGapResult(gapResult);
      const recommendedJobs = await aiService.recommendJobs(currentSkills, filteredLiveJobs, 8, token);
      setJobRecommendations((recommendedJobs?.recommendations || []).map((job: Record<string, unknown>) => normalizeJob(job)));
      const recommendedCourses = await aiService.recommendCourses(gapResult?.missing_skills || [], currentSkills, courses, 8, token);
      setCourseRecommendations(recommendedCourses?.recommendations || []);
      toast.success('AI recommendations generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate recommendations');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const applyToJob = async (jobId: string) => {
    if (!user) return;
    if (!candidateId) return toast.error('Parse and save your profile before applying');
    const result = await api.applyToJob(jobId, candidateId);
    if (result.error) return toast.error(result.error.includes('duplicate') ? 'You already applied to this job' : result.error);
    toast.success('Application submitted');
    const applicationsResponse = await api.getApplicationsByCandidate(candidateId);
    if (!applicationsResponse.error) {
      setApplications((applicationsResponse.data || []) as CandidateApplication[]);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div>
      <Header title={`Hi, ${user?.name?.split(' ')[0] || 'Student'}`} subtitle="Live jobs, AI insights, and full learning roadmaps" />
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3"><Upload className="w-4 h-4 text-white" /><h2 className="text-white font-medium text-sm">Resume Upload and Parsing</h2></div>
            <div {...getRootProps()} className={`p-4 border border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-white bg-[#111]' : 'border-[#333] hover:border-[#666]'}`}>
              <input {...getInputProps()} />
              {isParsingResume ? <div className="text-center"><Loader2 className="w-6 h-6 animate-spin text-white mx-auto mb-2" /><p className="text-xs text-gray-400">Parsing resume with AI...</p></div> : <div className="text-center"><p className="text-sm text-white">Drop PDF or click to upload</p><p className="text-xs text-gray-500 mt-1">NLP parsing + NER + skill extraction</p></div>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">{currentSkills.slice(0, 12).map((skill) => <span key={skill} className="px-2 py-0.5 rounded bg-white text-black text-xs">{skill}</span>)}</div>
          </div>
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-white" /><h2 className="text-white font-medium text-sm">Target Role and AI Insights</h2></div>
            <TargetRoleSelector selectedRole={selectedTargetRole} onSelect={setSelectedTargetRole} />
            <button onClick={runSkillGapAndRecommendations} disabled={isGeneratingInsights} className="mt-4 inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded text-sm font-medium disabled:opacity-50">{isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{isGeneratingInsights ? 'Generating' : 'Run AI Analysis'}</button>
          </div>
        </div>

        {resumeResult?.summary && <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4"><div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-white" /><h2 className="text-white font-medium text-sm">Resume Summary</h2></div><p className="text-sm text-gray-300">{resumeResult.summary}</p></div>}

        {skillGapResult && selectedTargetRole && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><SkillGapAnalysis userSkills={currentSkills} targetSkills={selectedTargetRole.requiredSkills} /></div>
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4"><p className="text-xs text-gray-500 mb-2">Similarity Score</p><p className="text-2xl font-bold text-white mb-3">{Math.round(skillGapResult.similarity_score || 0)}%</p><p className="text-xs text-gray-400">{skillGapResult.explanation || 'Skill-gap analysis ready.'}</p></div>
          </div>
        )}

        <div ref={jobsSectionRef} className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3"><Briefcase className="w-4 h-4 text-white" /><h2 className="text-white font-medium text-sm">Search Live Jobs</h2></div>
          <div className="grid md:grid-cols-4 gap-2 mb-3">
            <div className="md:col-span-2 relative"><Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" /><input value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} placeholder="Search title, company, location, skills..." className="w-full bg-[#111] border border-[#222] rounded py-2 pl-9 pr-3 text-sm text-white" /></div>
            <select value={jobLocationFilter} onChange={(event) => setJobLocationFilter(event.target.value)} className="bg-[#111] border border-[#222] rounded py-2 px-3 text-sm text-white">{locationOptions.map((location) => <option key={location} value={location} className="bg-[#111]">{location === 'all' ? 'All Locations' : location}</option>)}</select>
            <select value={jobTypeFilter} onChange={(event) => setJobTypeFilter(event.target.value)} className="bg-[#111] border border-[#222] rounded py-2 px-3 text-sm text-white"><option value="all" className="bg-[#111]">All Types</option><option value="full-time" className="bg-[#111]">Full-time</option><option value="part-time" className="bg-[#111]">Part-time</option><option value="internship" className="bg-[#111]">Internship</option></select>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLiveJobs.slice(0, 12).map((job) => (
              <div key={job.id} className="bg-[#111] rounded-lg p-3 border border-[#222]">
                <p className="text-sm text-white font-medium">{job.title}</p><p className="text-xs text-gray-500">{job.company}</p><p className="text-xs text-gray-500 mt-1">{job.location}</p><p className="text-xs text-gray-300 mt-2">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                <div className="mt-2 flex flex-wrap gap-1">{job.skills.slice(0, 4).map((skill) => <span key={`${job.id}-${skill}`} className="px-2 py-0.5 bg-[#222] text-gray-300 text-[11px] rounded">{skill}</span>)}</div>
                <button onClick={() => applyToJob(job.id)} className="mt-3 w-full bg-white text-black rounded px-3 py-1.5 text-xs font-medium">Apply</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-white" /><h2 className="text-white font-medium text-sm">Top AI Job Recommendations</h2></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(jobRecommendations.length > 0 ? jobRecommendations : filteredLiveJobs.slice(0, 6)).map((job) => (
              <div key={job.id} className="bg-[#111] rounded-lg p-3 border border-[#222]">
                <p className="text-sm text-white font-medium">{job.title}</p><p className="text-xs text-gray-500">{job.company}</p><p className="text-xs text-gray-500 mt-1">{job.location}</p><p className="text-xs text-gray-300 mt-2">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                {typeof job.match_score === 'number' && <p className="text-xs text-green-400 mt-2">Match: {Math.round(job.match_score)}%</p>}
                <button onClick={() => applyToJob(job.id)} className="mt-3 w-full bg-white text-black rounded px-3 py-1.5 text-xs font-medium">Apply</button>
              </div>
            ))}
          </div>
        </div>

        <div ref={coursesSectionRef} className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3"><GraduationCap className="w-4 h-4 text-white" /><h2 className="text-white font-medium text-sm">Recommended Courses</h2></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(courseRecommendations.length > 0 ? courseRecommendations : courses.slice(0, 8)).map((course) => (
              <a key={String(course.id)} href={String(course.url || '#')} target="_blank" rel="noreferrer" className="bg-[#111] rounded-lg p-3 border border-[#222] hover:border-[#555] transition-colors">
                <p className="text-sm text-white font-medium">{String(course.title || 'Course')}</p><p className="text-xs text-gray-500">{String(course.provider || 'Provider')}</p><p className="text-xs text-gray-500 mt-2">{String(course.duration || '')}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-white" /><h2 className="text-white font-medium text-sm">Roadmaps, Resources, Courses, and Books</h2></div>
          <div className="grid md:grid-cols-4 gap-2 mb-3">
            <div className="md:col-span-2 relative"><Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" /><input value={resourceSearch} onChange={(event) => setResourceSearch(event.target.value)} placeholder="Search roadmap, course, book, provider, tags..." className="w-full bg-[#111] border border-[#222] rounded py-2 pl-9 pr-3 text-sm text-white" /></div>
            <select value={resourceCategory} onChange={(event) => { setResourceCategory(event.target.value as 'all' | LearningResourceCategory); setResourceLimit(24); }} className="bg-[#111] border border-[#222] rounded py-2 px-3 text-sm text-white">{RESOURCE_CATEGORIES.map((category) => <option key={category.value} value={category.value} className="bg-[#111]">{category.label}</option>)}</select>
            <select value={resourceLevel} onChange={(event) => { setResourceLevel(event.target.value as 'all' | LearningResourceLevel); setResourceLimit(24); }} className="bg-[#111] border border-[#222] rounded py-2 px-3 text-sm text-white">{RESOURCE_LEVELS.map((level) => <option key={level.value} value={level.value} className="bg-[#111]">{level.label}</option>)}</select>
          </div>
          <p className="text-xs text-gray-500 mb-3">Showing {visibleResources.length} of {filteredResources.length} resources.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleResources.map((resource) => (
              <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="bg-[#111] rounded-lg p-3 border border-[#222] hover:border-[#555] transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2"><span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-[#222] text-gray-300">{resource.category}</span><span className="text-[10px] text-gray-500 capitalize">{resource.level}</span></div>
                <p className="text-sm text-white font-medium">{resource.title}</p><p className="text-xs text-gray-500 mt-1">{resource.provider}</p><p className="text-xs text-gray-400 mt-2 line-clamp-2">{resource.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">{resource.tags.slice(0, 4).map((tag) => <span key={`${resource.id}-${tag}`} className="text-[10px] px-2 py-0.5 rounded bg-black text-gray-400 border border-[#222]">{tag}</span>)}</div>
              </a>
            ))}
          </div>
          {visibleResources.length < filteredResources.length && <button onClick={() => setResourceLimit((previous) => previous + 24)} className="mt-3 bg-white text-black rounded px-4 py-2 text-xs font-medium">Load More Resources</button>}
        </div>

        {applications.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <h2 className="text-white font-medium text-sm mb-3">My Applications</h2>
            <div className="space-y-2">
              {applications.slice(0, 10).map((application) => (
                <div key={application.id} className="bg-[#111] rounded-lg p-3 flex items-center justify-between gap-3">
                  <div><p className="text-sm text-white">{application.jobs?.title || 'Job'}</p><p className="text-xs text-gray-500">{application.jobs?.company || ''}</p></div>
                  <span className="text-xs text-gray-300 capitalize">{String(application.status || 'pending')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => setShowChat((previous) => !previous)} className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 z-50"><Bot className="w-4 h-4" />Career Chat</button>
      {showChat && (
        <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-[360px] bg-[#0a0a0a] border border-[#222] rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-[#222]"><div className="flex items-center gap-2"><Bot className="w-4 h-4 text-white" /><span className="text-sm font-medium text-white">Career Assistant</span></div><button onClick={() => setShowChat(false)}><X className="w-4 h-4 text-gray-500" /></button></div>
          <div className="h-64 overflow-y-auto p-3 space-y-2">{messages.map((message) => <div key={message.id} className={message.role === 'user' ? 'text-right' : 'text-left'}><span className={`inline-block px-3 py-2 rounded-lg text-xs ${message.role === 'user' ? 'bg-white text-black' : 'bg-[#222] text-white'}`}>{message.content}</span></div>)}{chatLoading && <div className="text-left"><span className="inline-block px-3 py-2 rounded-lg text-xs bg-[#222] text-white">Thinking...</span></div>}</div>
          <div className="p-2 border-t border-[#222] flex gap-2"><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendChatMessage(); }} placeholder="Ask about roadmap, interviews, and jobs..." className="flex-1 bg-[#111] border border-[#222] rounded px-3 py-2 text-xs text-white" /><button onClick={sendChatMessage} className="bg-white text-black px-3 rounded"><Send className="w-4 h-4" /></button></div>
        </div>
      )}
    </div>
  );
}
