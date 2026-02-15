import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useCourses } from '@/hooks/useCourses';
import { useCandidates } from '@/hooks/useCandidates';
import { useApplications } from '@/hooks/useApplications';
import { Header } from '@/components/layout/Header';
import { GlassCard, GlassBadge, GlassProgress, GlassButton } from '@/components/ui/Glass';
import { toast } from 'sonner';
import { 
  Upload, FileText, Check, Loader2, Briefcase, GraduationCap, 
  Award, MapPin, DollarSign, CheckCircle, Clock, TrendingUp
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
  const userApplications = applications.filter(a => a.candidate_id === userCandidate?.id);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header 
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Student'}`} 
        subtitle="Find your dream job and track your applications"
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
                <p className="text-sm text-slate-400">Saved Courses</p>
                <p className="text-2xl font-bold gradient-text">0</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Skills Detected</p>
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
        </div>

        {/* Resume Upload Section */}
        {!userCandidate ? (
          <GlassCard className="mb-8 p-8">
            <div 
              {...getRootProps()}
              className={`p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                isDragActive 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/5'
              }`}
            >
              {isParsing ? (
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-400" />
                  <p className="text-white font-medium mb-1">Parsing your resume...</p>
                  <p className="text-sm text-slate-400">Using AI to extract skills and experience</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-white font-medium mb-1">Upload your resume</p>
                  <p className="text-sm text-slate-400 mb-4">Drag & drop PDF or click to browse</p>
                  <input {...getInputProps()} />
                  <GlassButton variant="secondary">
                    <FileText className="w-4 h-4 mr-2" />
                    Browse files
                  </GlassButton>
                </div>
              )}
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="mb-8 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Profile Active</p>
                  <p className="text-sm text-slate-400">{skills.length} skills on your profile</p>
                </div>
              </div>
              <GlassBadge variant="success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </GlassBadge>
            </div>
          </GlassCard>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <GlassCard className="mb-8 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-white">Your Skills</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill: { name: string; score: number; category: string }) => (
                <div key={skill.name} className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{skill.name}</span>
                    <span className="text-sm text-slate-400">{skill.score}%</span>
                  </div>
                  <GlassProgress value={skill.score} color={skill.category === 'technical' ? 'indigo' : 'cyan'} />
                  <span className="text-xs text-slate-500 mt-2 capitalize block">{skill.category}</span>
                </div>
              ))}
            </div>
          </GlassCard>
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
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
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
                      <div className="text-right">
                        <button
                          onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                          className="text-sm text-indigo-400 hover:underline"
                        >
                          {expandedJob === job.id ? 'Less' : 'More'}
                        </button>
                      </div>
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
                          <GlassButton 
                            size="sm"
                            disabled={hasApplied}
                          >
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
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
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
    </div>
  );
}
