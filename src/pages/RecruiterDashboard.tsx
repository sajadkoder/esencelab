import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useCandidates } from '@/hooks/useCandidates';
import { useApplications } from '@/hooks/useApplications';
import { Header } from '@/components/layout/Header';
import { GlassCard, GlassBadge, GlassButton, GlassInput, GlassTextarea, GlassSelect } from '@/components/ui/Glass';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, Users, Briefcase, Filter, Plus, Mail, Clock
} from 'lucide-react';

export function RecruiterDashboard() {
  const { user } = useAuth();
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidates();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [showPostJob, setShowPostJob] = useState(false);
  
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    type: 'full-time',
    description: '',
    skills: '',
  });

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkill = !skillFilter ||
      c.skills?.some((s: { name: string }) => s.name.toLowerCase().includes(skillFilter.toLowerCase()));
    
    return matchesSearch && matchesSkill;
  });

  const avgMatchScore = candidates.length > 0 
    ? Math.round(candidates.reduce((acc: number, c) => acc + (c.matchScore || 0), 0) / candidates.length)
    : 0;

  const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
    new: 'info',
    screening: 'warning',
    interview: 'default',
    hired: 'success',
    rejected: 'error',
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header 
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Recruiter'}`} 
        subtitle="Manage your job postings and candidates"
      />
      
      <div className="p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Candidates</p>
                <p className="text-2xl font-bold gradient-text">{candidates.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/20">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Jobs</p>
                <p className="text-2xl font-bold gradient-text">{jobs.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <Briefcase className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Match Score</p>
                <p className="text-2xl font-bold gradient-text">{avgMatchScore}%</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <Dialog open={showPostJob} onOpenChange={setShowPostJob}>
            <DialogTrigger asChild>
              <GlassButton>
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </GlassButton>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border border-white/10 rounded-2xl max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Post a New Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <GlassInput
                  label="Job Title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Software Engineer"
                />
                <GlassInput
                  label="Location"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                />
                <GlassSelect
                  label="Job Type"
                  value={newJob.type}
                  onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  options={[
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'internship', label: 'Internship' },
                  ]}
                />
                <GlassTextarea
                  label="Description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Job description..."
                  rows={4}
                />
                <GlassInput
                  label="Skills (comma-separated)"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  placeholder="e.g. React, TypeScript, Node.js"
                />
                <div className="flex gap-2 pt-4">
                  <GlassButton onClick={() => {
                    toast.success('Job posted successfully!');
                    setShowPostJob(false);
                  }} className="flex-1">
                    Post Job
                  </GlassButton>
                  <GlassButton variant="secondary" onClick={() => setShowPostJob(false)}>
                    Cancel
                  </GlassButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Candidates List */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-white">Candidates</h2>
            <span className="text-sm text-slate-400 ml-auto">{filteredCandidates.length} found</span>
          </div>
          
          {candidatesLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => {
                const isExpanded = expandedCandidate === candidate.id;
                const candidateApplications = applications.filter(a => a.candidate_id === candidate.id);
                
                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-white">{candidate.name}</h3>
                          <GlassBadge variant={statusColors[candidate.status || 'new']}>
                            {candidate.status || 'new'}
                          </GlassBadge>
                        </div>
                        <p className="text-sm text-slate-400">{candidate.role}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {candidate.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Applied {candidateApplications.length} jobs
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-2xl font-semibold gradient-text">{candidate.matchScore || 0}%</span>
                          <p className="text-xs text-slate-500">match</p>
                        </div>
                        <button
                          onClick={() => setExpandedCandidate(isExpanded ? null : candidate.id)}
                          className="text-sm text-indigo-400 hover:underline"
                        >
                          {isExpanded ? 'Less' : 'More'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-slate-400 mb-2">Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills.map((skill: { name: string; score: number }) => (
                                <GlassBadge key={skill.name} variant="info">
                                  {skill.name} ({skill.score}%)
                                </GlassBadge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 flex-wrap">
                          <GlassButton size="sm">
                            Move to Screening
                          </GlassButton>
                          <GlassButton variant="secondary" size="sm">
                            Schedule Interview
                          </GlassButton>
                          <GlassButton variant="ghost" size="sm">
                            Reject
                          </GlassButton>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
