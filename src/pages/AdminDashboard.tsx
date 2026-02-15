import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GlassCard, GlassBadge, GlassProgress, GlassButton } from '@/components/ui/Glass';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { useCourses } from '@/hooks/useCourses';
import { useActivityLogs } from '@/hooks/useActivity';
import { 
  Users, 
  FileText, 
  Briefcase, 
  BookOpen, 
  Activity,
  User,
  BarChart3
} from 'lucide-react';

export function AdminDashboard() {
  const { data: candidates = [] } = useCandidates();
  const { data: jobs = [] } = useJobs();
  const { data: courses = [] } = useCourses();
  const { data: activityLogs = [] } = useActivityLogs();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity'>('overview');

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
      new: 'info',
      screening: 'warning',
      interview: 'default',
      hired: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ReactNode> = {
      LOGIN: <User className="w-4 h-4" />,
      LOGOUT: <User className="w-4 h-4" />,
      RESUME_UPLOAD: <FileText className="w-4 h-4" />,
      JOB_APPLY: <Briefcase className="w-4 h-4" />,
      COURSE_SAVE: <BookOpen className="w-4 h-4" />,
      JOB_POST: <Briefcase className="w-4 h-4" />,
      CANDIDATE_STATUS: <Users className="w-4 h-4" />,
    };
    return icons[action] || <Activity className="w-4 h-4" />;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const skillCounts: Record<string, number> = {};
  candidates.forEach(c => {
    c.skills?.forEach((s: { name: string }) => {
      skillCounts[s.name] = (skillCounts[s.name] || 0) + 1;
    });
  });
  
  const topSkills = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header 
        title="Admin Dashboard" 
        subtitle="Monitor system activity and manage users"
      />
      
      <div className="p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['overview', 'users', 'activity'] as const).map((tab) => (
            <GlassButton
              key={tab}
              variant={activeTab === tab ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </GlassButton>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Users</p>
                    <p className="text-2xl font-bold gradient-text">{candidates.length + 2}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/20">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Students</p>
                    <p className="text-2xl font-bold gradient-text">{candidates.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/20">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Active Jobs</p>
                    <p className="text-2xl font-bold gradient-text">{jobs.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Courses</p>
                    <p className="text-2xl font-bold gradient-text">{courses.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Top Skills */}
            <GlassCard className="mb-8 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <h2 className="font-semibold text-white">Top Skills in Demand</h2>
              </div>
              <div className="space-y-4">
                {topSkills.length > 0 ? topSkills.map((skill, index) => (
                  <div key={skill.name} className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 w-6">{index + 1}.</span>
                    <span className="text-white w-32">{skill.name}</span>
                    <div className="flex-1">
                      <GlassProgress value={skill.count * 10} color="indigo" />
                    </div>
                    <span className="text-sm text-slate-400 w-12">{skill.count}</span>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm">No skill data available</p>
                )}
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h2 className="font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="space-y-3">
                {activityLogs.length > 0 ? activityLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{log.details}</p>
                      <p className="text-xs text-slate-500">{log.userName}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm">No recent activity</p>
                )}
              </div>
            </GlassCard>
          </>
        )}

        {activeTab === 'users' && (
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-white">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-sm text-slate-400 pb-3">Name</th>
                    <th className="text-left text-sm text-slate-400 pb-3">Role</th>
                    <th className="text-left text-sm text-slate-400 pb-3">Status</th>
                    <th className="text-left text-sm text-slate-400 pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-white/5">
                      <td className="py-3 text-white">{candidate.name}</td>
                      <td className="py-3">
                        <GlassBadge variant="info">Student</GlassBadge>
                      </td>
                      <td className="py-3">
                        <GlassBadge variant={getStatusColor(candidate.status || 'new')}>
                          {candidate.status || 'new'}
                        </GlassBadge>
                      </td>
                      <td className="py-3 text-slate-400">
                        {formatTime(candidate.created_at || new Date().toISOString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {activeTab === 'activity' && (
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-white">Activity Log</h2>
            </div>
            <div className="space-y-3">
              {activityLogs.length > 0 ? activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{log.details}</p>
                    <p className="text-xs text-slate-500">{log.action} • {log.userName}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              )) : (
                <p className="text-slate-400 text-sm">No activity logs</p>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
