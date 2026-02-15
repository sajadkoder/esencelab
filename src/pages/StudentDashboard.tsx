import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useCourses } from '@/hooks/useCourses';
import { useCandidates } from '@/hooks/useCandidates';
import { useApplications } from '@/hooks/useApplications';
import { Header } from '@/components/layout/Header';
import { GlassCard, GlassBadge, GlassButton } from '@/components/ui/Glass';
import { CareerChatbot } from '@/components/chatbot/CareerChatbot';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { TargetRoleSelector, SkillGapAnalysis } from '@/components/profile/TargetRoleSelector';
import { toast } from 'sonner';
import type { TargetRole } from '@/types';
import { 
  Upload, FileText, Check, Briefcase, GraduationCap, 
  Award, MapPin, DollarSign, CheckCircle, Clock, TrendingUp, Target
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: candidates = [] } = useCandidates();
  const { data: applications = [] } = useApplications();
  
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedTargetRole, setSelectedTargetRole] = useState<TargetRole | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setIsParsing(true);
      setTimeout(() => {
        setIsParsing(false);
        toast.success('Resume parsed successfully!');
      }, 2000);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const userCandidate = candidates.find(c => c.email === user?.email);
  const skills = userCandidate?.skills || [];
  const skillNames = skills.map(s => s.name);
  const userApplications = applications.filter(a => a.candidate_id === userCandidate?.id);

  const handleTargetRoleSelect = (role: TargetRole) => {
    setSelectedTargetRole(role);
    toast.success(`Target role set to ${role.name}`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header 
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Student'}`} 
        subtitle="Find your dream job and track your applications"
        actions={
          <div className="flex items-center gap-4">
            <NotificationsDropdown userId={user?.id} />
          </div>
        }
      />
      
      <div className="p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Applications</p>
                <p className="text-2xl font-bold gradient-text">{userApplications.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/20">
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Skills</p>
                <p className="text-2xl font-bold gradient-text">{skills.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Job Matches</p>
                <p className="text-2xl font-bold gradient-text">{jobs.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Courses</p>
                <p className="text-2xl font-bold gradient-text">{courses.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Target Role Selector */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-400" />
                <h2 className="font-semibold text-white">Set Your Target Role</h2>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Select your career goal to get personalized skill gap analysis and recommendations.
              </p>
              <TargetRoleSelector 
                selectedRole={selectedTargetRole} 
                onSelect={handleTargetRoleSelect}
              />
            </GlassCard>
          </div>

          {/* Resume Upload */}
          <div>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h2 className="font-semibold text-white">Resume</h2>
              </div>
              {!userCandidate ? (
                <div 
                  {...getRootProps()}
                  className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    isDragActive 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  {isParsing ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Parsing...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-white">Drop resume PDF</p>
                      <p className="text-xs text-slate-500">AI will extract skills</p>
                    </div>
                  )}
                  <input {...getInputProps()} />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-white font-medium">Resume Uploaded</p>
                  <p className="text-sm text-slate-400">{skills.length} skills detected</p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        {selectedTargetRole && skills.length > 0 && (
          <div className="mb-8">
            <SkillGapAnalysis 
              userSkills={skillNames}
              targetSkills={selectedTargetRole.requiredSkills}
            />
          </div>
        )}

        {/* Job Matches */}
        <GlassCard className="mb-8 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-white">Job Matches</h2>
            <span className="text-sm text-slate-400 ml-auto">{jobs.length} opportunities</span>
          </div>
          
          {jobsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => {
                const hasApplied = userApplications.some(a => a.job_id === job.id);
                
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-white">{job.title}</h3>
                          {hasApplied && (
                            <GlassBadge variant="success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Applied
                            </GlassBadge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{job.company}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary_min && job.salary_max 
                              ? `$${job.salary_min}k - $${job.salary_max}k`
                              : 'Competitive'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                        className="text-sm text-indigo-400 hover:underline"
                      >
                        {expandedJob === job.id ? 'Less' : 'More'}
                      </button>
                    </div>

                    {expandedJob === job.id && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-slate-300 mb-4">{job.description}</p>
                        
                        {job.skills && job.skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-slate-400 mb-2">Required Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skill: string) => (
                                <GlassBadge key={skill} variant="info">{skill}</GlassBadge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          <GlassButton size="sm" disabled={hasApplied}>
                            {hasApplied ? 'Applied' : 'Apply Now'}
                          </GlassButton>
                          <GlassButton variant="secondary" size="sm">
                            View Details
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

        {/* Course Recommendations */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-white">Recommended Courses</h2>
            <span className="text-sm text-slate-400 ml-auto">Close your skill gaps</span>
          </div>
          
          {coursesLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 6).map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <h3 className="font-medium text-white mb-2">{course.title}</h3>
                  <p className="text-sm text-slate-400 mb-2">{course.provider}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration}</span>
                    <span>•</span>
                    <span className="capitalize">{course.level}</span>
                  </div>
                  
                  {course.skills && course.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.skills.slice(0, 3).map((skill: string) => (
                        <GlassBadge key={skill} variant="default">{skill}</GlassBadge>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                    className="text-sm text-indigo-400 hover:underline mt-2"
                  >
                    {expandedCourse === course.id ? 'Show less' : 'Show more'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* AI Career Chatbot */}
      <CareerChatbot />
    </div>
  );
}
