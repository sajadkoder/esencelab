import { useEffect, useMemo, useState } from 'react';
import { BarChart3, BookOpen, Briefcase, Download, Loader2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'employer' | 'admin';
  created_at?: string;
};

type JobRow = {
  id: string;
  title: string;
  company: string;
  location?: string;
  status?: 'active' | 'closed' | 'draft';
  posted_at?: string;
};

type CourseRow = {
  id: string;
  title: string;
  provider?: string;
  url?: string;
  skills?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
};

type CandidateRow = {
  id: string;
  name: string;
  email: string;
  role?: string;
  skills?: { name?: string }[] | string[];
  education?: Record<string, unknown>[];
  experience?: Record<string, unknown>[];
  resume_text?: string;
  match_score?: number;
  updated_at?: string;
};

type ApplicationRow = {
  id: string;
  status: string;
  applied_at?: string;
  jobs?: { title?: string; company?: string };
  candidates?: { name?: string; email?: string };
};

type ActivityLogRow = {
  id: string;
  action: string;
  details?: string;
  timestamp?: string;
  clerk_user_id?: string;
  metadata?: Record<string, unknown>;
};

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
  ];

  return csvRows.join('\n');
}

function downloadCsvFile(filename: string, rows: Record<string, unknown>[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
}

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

export function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'usage'>('overview');
  const [loading, setLoading] = useState(true);

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogRow[]>([]);

  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseProvider, setNewCourseProvider] = useState('');
  const [newCourseUrl, setNewCourseUrl] = useState('');
  const [newCourseSkills, setNewCourseSkills] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [profilesRes, jobsRes, coursesRes, candidatesRes, applicationsRes, activityRes] = await Promise.all([
        api.getProfiles(),
        api.getJobs(),
        api.getCourses(),
        api.getCandidates(),
        api.getApplications(),
        api.getActivityLogs(200),
      ]);

      if (!profilesRes.error) {
        setProfiles((profilesRes.data || []) as ProfileRow[]);
      }
      if (!jobsRes.error) {
        setJobs((jobsRes.data || []) as JobRow[]);
      }
      if (!coursesRes.error) {
        setCourses((coursesRes.data || []) as CourseRow[]);
      }
      if (!candidatesRes.error) {
        setCandidates((candidatesRes.data || []) as CandidateRow[]);
      }
      if (!applicationsRes.error) {
        setApplications((applicationsRes.data || []) as ApplicationRow[]);
      }
      if (!activityRes.error) {
        setActivityLogs((activityRes.data || []) as ActivityLogRow[]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (location.pathname === '/users') {
      setActiveTab('users');
      return;
    }
    if (location.pathname === '/jobs' || location.pathname === '/courses') {
      setActiveTab('content');
      return;
    }
    if (location.pathname === '/analytics') {
      setActiveTab('usage');
      return;
    }
    setActiveTab('overview');
  }, [location.pathname]);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((candidate) => {
      extractSkillNames(candidate.skills).forEach((skill) => {
        counts.set(skill, (counts.get(skill) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [candidates]);

  const stats = useMemo(() => {
    const students = profiles.filter((profile) => profile.role === 'student').length;
    const recruiters = profiles.filter((profile) => profile.role === 'employer').length;

    return {
      totalUsers: profiles.length,
      students,
      recruiters,
      jobs: jobs.length,
      courses: courses.length,
      applications: applications.length,
    };
  }, [profiles, jobs, courses, applications]);

  const resumeReviewRows = useMemo(() => (
    candidates
      .map((candidate) => {
        const skills = extractSkillNames(candidate.skills);
        const education = Array.isArray(candidate.education) ? candidate.education : [];
        const experience = Array.isArray(candidate.experience) ? candidate.experience : [];
        return {
          ...candidate,
          skillCount: skills.length,
          educationCount: education.length,
          experienceCount: experience.length,
        };
      })
      .sort((a, b) => (new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()))
  ), [candidates]);

  const recommendationLogs = useMemo(() => (
    activityLogs.filter((log) => ['resume_uploaded', 'recommendations_generated', 'candidate_ranked'].includes(log.action))
  ), [activityLogs]);

  const updateUserRole = async (profileId: string, role: 'student' | 'employer' | 'admin') => {
    const result = await api.updateProfileRole(profileId, role);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setProfiles((prev) => prev.map((profile) => (profile.id === profileId ? { ...profile, role } : profile)));
    await api.logActivity(user?.authUserId || '', 'user_role_updated', 'Admin updated user role', { profile_id: profileId, role }, user?.id);
    toast.success('Role updated');
  };

  const updateJobStatus = async (jobId: string, status: 'active' | 'closed' | 'draft') => {
    const result = await api.updateJob(jobId, { status });
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status } : job)));
    await api.logActivity(user?.authUserId || '', 'job_status_updated', 'Admin updated job status', { job_id: jobId, status }, user?.id);
  };

  const removeJob = async (jobId: string) => {
    const result = await api.deleteJob(jobId);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    await api.logActivity(user?.authUserId || '', 'job_deleted', 'Admin deleted job', { job_id: jobId }, user?.id);
    toast.success('Job deleted');
  };

  const addCourse = async () => {
    if (!newCourseTitle.trim()) {
      toast.error('Course title is required');
      return;
    }

    setCreatingCourse(true);
    try {
      const result = await api.createCourse({
        title: newCourseTitle.trim(),
        provider: newCourseProvider.trim() || undefined,
        url: newCourseUrl.trim() || undefined,
        skills: newCourseSkills.split(',').map((skill) => skill.trim()).filter(Boolean),
        level: 'intermediate',
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setCourses((prev) => [result.data as CourseRow, ...prev]);
      setNewCourseTitle('');
      setNewCourseProvider('');
      setNewCourseUrl('');
      setNewCourseSkills('');
      await api.logActivity(user?.authUserId || '', 'course_created', 'Admin added a course', {
        course_title: newCourseTitle.trim(),
      }, user?.id);
      toast.success('Course added');
    } finally {
      setCreatingCourse(false);
    }
  };

  const removeCourse = async (courseId: string) => {
    const result = await api.deleteCourse(courseId);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setCourses((prev) => prev.filter((course) => course.id !== courseId));
    await api.logActivity(user?.authUserId || '', 'course_deleted', 'Admin deleted a course', { course_id: courseId }, user?.id);
  };

  const exportUsersReport = () => {
    downloadCsvFile('users-report.csv', profiles.map((profile) => ({
      name: profile.name,
      email: profile.email,
      role: profile.role,
      created_at: profile.created_at || '',
    })));
  };

  const exportJobsReport = () => {
    downloadCsvFile('jobs-report.csv', jobs.map((job) => ({
      title: job.title,
      company: job.company,
      location: job.location || '',
      status: job.status || '',
      posted_at: job.posted_at || '',
    })));
  };

  const exportUsageReport = () => {
    downloadCsvFile('usage-report.csv', activityLogs.map((log) => ({
      action: log.action,
      details: log.details || '',
      timestamp: log.timestamp || '',
      auth_user_id: log.clerk_user_id || '',
    })));
  };

  return (
    <div>
      <Header title="Admin Console" subtitle="Platform governance, analytics, and reporting" />

      <div className="p-4 md:p-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {(['overview', 'users', 'content', 'usage'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                activeTab === tab ? 'bg-white text-black' : 'bg-[#111] text-gray-300'
              }`}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            onClick={refreshAll}
            className="px-4 py-2 rounded text-sm font-medium bg-[#111] text-gray-300"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}

        {!loading && activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs"><Users className="w-3 h-3" />Users</div>
                <p className="text-xl text-white font-bold mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs"><Shield className="w-3 h-3" />Students</div>
                <p className="text-xl text-white font-bold mt-1">{stats.students}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs"><Briefcase className="w-3 h-3" />Recruiters</div>
                <p className="text-xl text-white font-bold mt-1">{stats.recruiters}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs"><Briefcase className="w-3 h-3" />Jobs</div>
                <p className="text-xl text-white font-bold mt-1">{stats.jobs}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs"><BookOpen className="w-3 h-3" />Courses</div>
                <p className="text-xl text-white font-bold mt-1">{stats.courses}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs"><BarChart3 className="w-3 h-3" />Applications</div>
                <p className="text-xl text-white font-bold mt-1">{stats.applications}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                <h3 className="text-white text-sm font-medium mb-3">Top Skills Across Candidates</h3>
                <div className="space-y-2">
                  {topSkills.map(([skill, count]) => (
                    <div key={skill} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{skill}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                <h3 className="text-white text-sm font-medium mb-3">Reports</h3>
                <div className="space-y-2">
                  <button onClick={exportUsersReport} className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-gray-300 flex items-center justify-between">
                    Users Report
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={exportJobsReport} className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-gray-300 flex items-center justify-between">
                    Jobs Report
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={exportUsageReport} className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-gray-300 flex items-center justify-between">
                    Usage Report
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && activeTab === 'users' && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <h3 className="text-white text-sm font-medium mb-3">Manage Users</h3>
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div key={profile.id} className="bg-[#111] border border-[#222] rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">{profile.name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                  <select
                    value={profile.role}
                    onChange={(event) => updateUserRole(profile.id, event.target.value as 'student' | 'employer' | 'admin')}
                    className="bg-black border border-[#222] rounded px-2 py-1.5 text-xs text-white"
                  >
                    <option value="student">student</option>
                    <option value="employer">employer</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'content' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
              <h3 className="text-white text-sm font-medium mb-3">Manage Jobs</h3>
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-[#111] border border-[#222] rounded-lg p-3">
                    <p className="text-sm text-white">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.company} - {job.location || 'N/A'}</p>
                    <div className="flex gap-2 mt-3">
                      <select
                        value={job.status || 'active'}
                        onChange={(event) => updateJobStatus(job.id, event.target.value as 'active' | 'closed' | 'draft')}
                        className="bg-black border border-[#222] rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="active">active</option>
                        <option value="draft">draft</option>
                        <option value="closed">closed</option>
                      </select>
                      <button onClick={() => removeJob(job.id)} className="bg-red-600/20 text-red-300 px-2 py-1 rounded text-xs">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
              <h3 className="text-white text-sm font-medium mb-3">Manage Courses</h3>
              <div className="bg-[#111] border border-[#222] rounded-lg p-3 mb-3 space-y-2">
                <input
                  value={newCourseTitle}
                  onChange={(event) => setNewCourseTitle(event.target.value)}
                  placeholder="Course title"
                  className="w-full bg-black border border-[#222] rounded px-3 py-2 text-xs text-white"
                />
                <input
                  value={newCourseProvider}
                  onChange={(event) => setNewCourseProvider(event.target.value)}
                  placeholder="Provider"
                  className="w-full bg-black border border-[#222] rounded px-3 py-2 text-xs text-white"
                />
                <input
                  value={newCourseUrl}
                  onChange={(event) => setNewCourseUrl(event.target.value)}
                  placeholder="URL"
                  className="w-full bg-black border border-[#222] rounded px-3 py-2 text-xs text-white"
                />
                <input
                  value={newCourseSkills}
                  onChange={(event) => setNewCourseSkills(event.target.value)}
                  placeholder="Skills (comma-separated)"
                  className="w-full bg-black border border-[#222] rounded px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={addCourse}
                  disabled={creatingCourse}
                  className="bg-white text-black rounded px-3 py-2 text-xs font-medium inline-flex items-center gap-2"
                >
                  {creatingCourse && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Course
                </button>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {courses.map((course) => (
                  <div key={course.id} className="bg-[#111] border border-[#222] rounded-lg p-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-white">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.provider || 'Unknown provider'}</p>
                    </div>
                    <button onClick={() => removeCourse(course.id)} className="bg-red-600/20 text-red-300 px-2 py-1 rounded text-xs">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'usage' && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <h3 className="text-white text-sm font-medium mb-3">System Usage Monitor</h3>
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#111] border border-[#222] rounded-lg p-3">
                <h4 className="text-white text-xs font-medium mb-2">Resume Uploads and Parsed Outputs</h4>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {resumeReviewRows.slice(0, 20).map((candidate) => (
                    <div key={candidate.id} className="bg-black border border-[#222] rounded p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-white">{candidate.name || 'Candidate'}</p>
                          <p className="text-[11px] text-gray-500">{candidate.email || 'No email'}</p>
                        </div>
                        {typeof candidate.match_score === 'number' && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-white text-black">
                            {Math.round(candidate.match_score)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Skills: {candidate.skillCount} | Education: {candidate.educationCount} | Experience: {candidate.experienceCount}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                        {(candidate.resume_text || '').trim() || 'No parsed resume text saved'}
                      </p>
                    </div>
                  ))}
                  {resumeReviewRows.length === 0 && (
                    <p className="text-[11px] text-gray-500">No resume profiles found yet.</p>
                  )}
                </div>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-lg p-3">
                <h4 className="text-white text-xs font-medium mb-2">Recommendation Outputs</h4>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {recommendationLogs.map((log) => (
                    <div key={log.id} className="bg-black border border-[#222] rounded p-2">
                      <p className="text-xs text-white">{log.action}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{log.details || 'No details'}</p>
                      {log.metadata && (
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                          {JSON.stringify(log.metadata)}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">{log.timestamp || ''}</p>
                    </div>
                  ))}
                  {recommendationLogs.length === 0 && (
                    <p className="text-[11px] text-gray-500">No recommendation logs available yet.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="bg-[#111] border border-[#222] rounded-lg p-3">
                  <p className="text-sm text-white">{log.action}</p>
                  <p className="text-xs text-gray-400 mt-1">{log.details || 'No details'}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{log.timestamp || ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
