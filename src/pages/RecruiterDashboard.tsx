import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Filter, Loader2, Mail, MapPin, Plus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useCandidates } from '@/hooks/useCandidates';
import { useEmployerJobs } from '@/hooks/useJobs';
import { aiService, api } from '@/lib/api';

type RankedCandidate = {
  id: string;
  name: string;
  email: string;
  role?: string;
  skills?: { name?: string }[] | string[];
  education?: Record<string, unknown>[];
  experience?: Record<string, unknown>[];
  match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
};

type RecruiterApplication = {
  id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  candidates?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    skills?: { name?: string }[] | string[];
  };
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

function parseSkillsInput(input: string): string[] {
  return input
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
}

export function RecruiterDashboard() {
  const { user, getToken } = useAuth();
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const { data: employerJobs = [], isLoading: loadingJobs, refetch: refetchJobs } = useEmployerJobs(user?.id || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [skillQuery, setSkillQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([]);
  const [rankingInProgress, setRankingInProgress] = useState(false);

  const [jobApplications, setJobApplications] = useState<RecruiterApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const [showJobForm, setShowJobForm] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [postingJob, setPostingJob] = useState(false);

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase().trim();
    const requiredSkills = parseSkillsInput(skillQuery).map((skill) => skill.toLowerCase());

    return candidates.filter((candidate) => {
      const candidateSkills = extractSkillNames(candidate.skills);

      const matchesText = !normalizedSearch
        || candidate.name?.toLowerCase().includes(normalizedSearch)
        || candidate.email?.toLowerCase().includes(normalizedSearch)
        || String(candidate.role || '').toLowerCase().includes(normalizedSearch);

      const matchesSkills = requiredSkills.length === 0
        || requiredSkills.every((required) =>
          candidateSkills.some((candidateSkill) => candidateSkill.toLowerCase().includes(required)),
        );

      return matchesText && matchesSkills;
    });
  }, [candidates, searchQuery, skillQuery]);

  const selectedJob = useMemo(
    () => employerJobs.find((job) => String(job.id) === selectedJobId),
    [employerJobs, selectedJobId],
  );

  const visibleCandidates = useMemo(() => {
    if (rankedCandidates.length > 0 && selectedJobId) {
      return rankedCandidates;
    }
    return filteredCandidates as unknown as RankedCandidate[];
  }, [rankedCandidates, filteredCandidates, selectedJobId]);

  useEffect(() => {
    if (!selectedJobId) {
      setJobApplications([]);
      return;
    }

    const loadApplications = async () => {
      setLoadingApplications(true);
      try {
        const response = await api.getApplicationsByJob(selectedJobId);
        if (response.error) {
          toast.error(response.error);
          return;
        }

        setJobApplications((response.data || []) as RecruiterApplication[]);
      } finally {
        setLoadingApplications(false);
      }
    };

    loadApplications();
  }, [selectedJobId]);

  const runMatching = async () => {
    if (!selectedJob) {
      toast.error('Select a job first');
      return;
    }

    const requirements = Array.isArray(selectedJob.requirements) && selectedJob.requirements.length > 0
      ? selectedJob.requirements
      : Array.isArray(selectedJob.skills) ? selectedJob.skills : [];

    if (requirements.length === 0) {
      toast.error('Selected job has no requirements configured');
      return;
    }

    setRankingInProgress(true);
    try {
      const token = await getToken();
      const ranking = await aiService.rankCandidates(filteredCandidates, requirements, token);
      setRankedCandidates(ranking?.ranked_candidates || []);
      await api.logActivity(user?.clerkUserId || '', 'candidate_ranked', 'Recruiter ranked candidates for a job', {
        job_id: selectedJob.id,
      });
      toast.success('Candidate ranking generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rank candidates');
    } finally {
      setRankingInProgress(false);
    }
  };

  const postJob = async () => {
    if (!user) {
      return;
    }
    if (!jobTitle.trim()) {
      toast.error('Job title is required');
      return;
    }

    setPostingJob(true);
    try {
      const result = await api.createJob({
        employer_id: user.id,
        title: jobTitle.trim(),
        company: user.name || 'Employer',
        location: jobLocation.trim() || undefined,
        description: jobDescription.trim() || undefined,
        requirements: parseSkillsInput(jobRequirements),
        skills: parseSkillsInput(jobSkills),
        job_type: 'full-time',
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      await refetchJobs();
      await api.logActivity(user.clerkUserId, 'job_posted', 'Recruiter posted a new job', {
        job_title: jobTitle.trim(),
      });

      toast.success('Job posted');
      setShowJobForm(false);
      setJobTitle('');
      setJobLocation('');
      setJobDescription('');
      setJobRequirements('');
      setJobSkills('');
    } finally {
      setPostingJob(false);
    }
  };

  return (
    <div>
      <Header
        title={`Recruiter Workspace${user?.name ? ` - ${user.name.split(' ')[0]}` : ''}`}
        subtitle="Post live jobs, view applicants, search candidates, and run matching"
      />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <p className="text-xs text-gray-500">Candidate Profiles</p>
            <p className="text-2xl text-white font-bold mt-1">{candidates.length}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <p className="text-xs text-gray-500">My Jobs</p>
            <p className="text-2xl text-white font-bold mt-1">{employerJobs.length}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <p className="text-xs text-gray-500">Applicants (selected job)</p>
            <p className="text-2xl text-white font-bold mt-1">{jobApplications.length}</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-white" />
              <h2 className="text-sm text-white font-medium">Live Job Management</h2>
            </div>
            <button
              onClick={() => setShowJobForm((prev) => !prev)}
              className="bg-white text-black text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {showJobForm ? 'Close' : 'Post Job'}
            </button>
          </div>

          {showJobForm && (
            <div className="grid md:grid-cols-2 gap-3 mb-4 p-3 rounded border border-[#222] bg-[#111]">
              <input
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="Job title"
                className="bg-black border border-[#222] rounded px-3 py-2 text-sm text-white"
              />
              <input
                value={jobLocation}
                onChange={(event) => setJobLocation(event.target.value)}
                placeholder="Location"
                className="bg-black border border-[#222] rounded px-3 py-2 text-sm text-white"
              />
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Description"
                rows={3}
                className="md:col-span-2 bg-black border border-[#222] rounded px-3 py-2 text-sm text-white"
              />
              <input
                value={jobRequirements}
                onChange={(event) => setJobRequirements(event.target.value)}
                placeholder="Requirements (comma-separated)"
                className="bg-black border border-[#222] rounded px-3 py-2 text-sm text-white"
              />
              <input
                value={jobSkills}
                onChange={(event) => setJobSkills(event.target.value)}
                placeholder="Skills (comma-separated)"
                className="bg-black border border-[#222] rounded px-3 py-2 text-sm text-white"
              />
              <div className="md:col-span-2">
                <button
                  onClick={postJob}
                  disabled={postingJob}
                  className="bg-white text-black text-sm px-4 py-2 rounded font-medium disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {postingJob && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publish Job
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {employerJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => {
                  setSelectedJobId(String(job.id));
                  setRankedCandidates([]);
                }}
                className={`text-left p-3 rounded border ${
                  selectedJobId === String(job.id) ? 'border-white bg-[#111]' : 'border-[#222] bg-[#111] hover:border-[#555]'
                }`}
              >
                <p className="text-sm text-white font-medium">{job.title}</p>
                <p className="text-xs text-gray-500 mt-1">{job.location || 'Location not specified'}</p>
                <p className="text-[11px] text-gray-400 mt-2 capitalize">Status: {job.status}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <h2 className="text-sm text-white font-medium">Applicants for Selected Job</h2>
            </div>
            {loadingApplications && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
          </div>

          {!selectedJob && (
            <p className="text-xs text-gray-400">Select a job to view students who applied.</p>
          )}

          {selectedJob && !loadingApplications && jobApplications.length === 0 && (
            <p className="text-xs text-gray-400">No applicants yet for this job.</p>
          )}

          {selectedJob && jobApplications.length > 0 && (
            <div className="space-y-2">
              {jobApplications.map((application) => {
                const candidate = application.candidates;
                const skills = extractSkillNames(candidate?.skills);

                return (
                  <div key={application.id} className="bg-[#111] border border-[#222] rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-white font-medium">{candidate?.name || 'Candidate'}</p>
                        <p className="text-xs text-gray-500">{candidate?.email || 'No email'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 capitalize">{application.status}</p>
                        <p className="text-[11px] text-gray-500">{formatDate(application.applied_at)}</p>
                      </div>
                    </div>
                    {skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {skills.slice(0, 8).map((skill) => (
                          <span key={`${application.id}-${skill}`} className="px-2 py-0.5 rounded bg-[#222] text-gray-300 text-[11px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
          <div className="grid md:grid-cols-3 gap-2 mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, email, role..."
                className="w-full bg-[#111] border border-[#222] rounded py-2 pl-9 pr-3 text-sm text-white"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={skillQuery}
                onChange={(event) => setSkillQuery(event.target.value)}
                placeholder="Filter skills: React, SQL"
                className="w-full bg-[#111] border border-[#222] rounded py-2 pl-9 pr-3 text-sm text-white"
              />
            </div>
            <button
              onClick={runMatching}
              disabled={rankingInProgress || !selectedJob}
              className="bg-white text-black text-sm rounded px-4 py-2 font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {rankingInProgress && <Loader2 className="w-4 h-4 animate-spin" />}
              Run Matching
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <h2 className="text-sm text-white font-medium">Candidate Profiles</h2>
            </div>
            {(loadingCandidates || loadingJobs) && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
          </div>

          <div className="space-y-3">
            {visibleCandidates.map((candidate) => {
              const skillNames = extractSkillNames(candidate.skills);
              const education = Array.isArray(candidate.education) ? candidate.education : [];
              const experience = Array.isArray(candidate.experience) ? candidate.experience : [];

              return (
                <div key={candidate.id} className="bg-[#111] border border-[#222] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium">{candidate.name}</p>
                      <p className="text-xs text-gray-500">{candidate.role || 'candidate'}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {candidate.email}
                        </span>
                        {candidate.role && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {candidate.role}
                          </span>
                        )}
                      </div>
                    </div>
                    {typeof candidate.match_score === 'number' && (
                      <span className="text-xs px-2 py-1 rounded bg-white text-black font-medium">
                        {Math.round(candidate.match_score)}%
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {skillNames.slice(0, 10).map((skill) => (
                      <span key={`${candidate.id}-${skill}`} className="px-2 py-0.5 rounded bg-[#222] text-gray-300 text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {(candidate.matched_skills || candidate.missing_skills) && (
                    <div className="grid md:grid-cols-2 gap-2 mt-3">
                      <div className="bg-[#0a0a0a] border border-[#222] rounded p-2">
                        <p className="text-[11px] text-gray-500 mb-1">Matched Skills</p>
                        <p className="text-xs text-green-400">
                          {(candidate.matched_skills || []).slice(0, 6).join(', ') || '-'}
                        </p>
                      </div>
                      <div className="bg-[#0a0a0a] border border-[#222] rounded p-2">
                        <p className="text-[11px] text-gray-500 mb-1">Missing Skills</p>
                        <p className="text-xs text-amber-400">
                          {(candidate.missing_skills || []).slice(0, 6).join(', ') || '-'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-2 mt-3">
                    <div className="bg-[#0a0a0a] border border-[#222] rounded p-2">
                      <p className="text-[11px] text-gray-500 mb-1">Education Insights</p>
                      <p className="text-xs text-gray-300">
                        {education.length > 0
                          ? `${String(education[0]?.degree || '')} ${String(education[0]?.institution || '')}`.trim()
                          : 'No education details yet'}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#222] rounded p-2">
                      <p className="text-[11px] text-gray-500 mb-1">Experience Insights</p>
                      <p className="text-xs text-gray-300">
                        {experience.length > 0
                          ? `${String(experience[0]?.title || '')} ${String(experience[0]?.company || '')}`.trim()
                          : 'No experience details yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

