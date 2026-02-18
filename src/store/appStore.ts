import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { User, Skill, Job, Course, Candidate, ResumeData, StudentProfile, SystemStats, ActivityLog } from '@/types';
import { DEMO_USERS, SAMPLE_JOBS, SAMPLE_COURSES, SAMPLE_CANDIDATES } from '@/types';

// Skill ontology for extraction
const SKILL_ONTOLOGY: Record<string, string[]> = {
  'Python': ['python', 'py', 'pandas', 'numpy', 'django', 'flask'],
  'JavaScript': ['javascript', 'js', 'es6', 'nodejs', 'node'],
  'TypeScript': ['typescript', 'ts'],
  'React': ['react', 'reactjs', 'jsx'],
  'SQL': ['sql', 'mysql', 'postgresql', 'sqlite'],
  'Git': ['git', 'github', 'gitlab', 'version control'],
  'Machine Learning': ['machine learning', 'ml', 'scikit-learn', 'sklearn'],
  'Data Analysis': ['data analysis', 'analytics', 'data science'],
  'AWS': ['aws', 'amazon web services', 'ec2', 's3'],
  'Docker': ['docker', 'containerization'],
};

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Data
  jobs: Job[];
  courses: Course[];
  candidates: Candidate[];
  studentProfile: StudentProfile | null;
  isParsing: boolean;
  parseError: string | null;
  
  // Actions
  parseResume: (file: File) => Promise<void>;
  calculateJobMatches: () => void;
  calculateCourseRecommendations: () => void;
  getRecommendationExplanation: (itemId: string, itemType: 'job' | 'course') => { matched: string[]; missing: string[]; reason: string };
  applyToJob: (jobId: string) => void;
  saveCourse: (courseId: string) => void;
  updateCandidateStatus: (candidateId: string, status: Candidate['status']) => void;
  postJob: (job: Omit<Job, 'id' | 'postedAt'>) => void;
  searchCandidates: (query: string, filters: { skills?: string[]; minScore?: number }) => Candidate[];
  getSystemStats: () => SystemStats;
  logActivity: (action: string, details: string) => void;
  activityLogs: ActivityLog[];
}

// Extract skills from text using ontology
const extractSkills = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const found = new Set<string>();
  
  for (const [skill, aliases] of Object.entries(SKILL_ONTOLOGY)) {
    if (aliases.some(alias => lowerText.includes(alias))) {
      found.add(skill);
    }
  }
  
  return Array.from(found);
};

// Calculate TF-IDF cosine similarity
const calculateSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dotProduct / (magA * magB) : 0;
};

// Create skill vector for similarity calculation
const createSkillVector = (skills: string[], allSkills: string[]): number[] => {
  return allSkills.map(skill => skills.includes(skill) ? 1 : 0);
};

// Generate skills with scores
const generateSkillsWithScores = (skillNames: string[]): Skill[] => {
  return skillNames.map(name => ({
    name,
    score: Math.floor(70 + Math.random() * 28),
    category: Math.random() > 0.3 ? 'technical' : 'soft',
  }));
};

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      
      // Data
      jobs: SAMPLE_JOBS,
      courses: SAMPLE_COURSES,
      candidates: SAMPLE_CANDIDATES,
      studentProfile: null,
      isParsing: false,
      parseError: null,
      activityLogs: [],

      login: (email: string, password: string) => {
        const demoUser = DEMO_USERS.find(u => u.email === email && password === 'demo');
        if (demoUser) {
          const user: User = {
            id: uuidv4(),
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            createdAt: new Date().toISOString(),
          };
          set({ user, isAuthenticated: true });
          get().logActivity('LOGIN', `${user.name} logged in as ${user.role}`);
          return true;
        }
        return false;
      },

      logout: () => {
        const { user } = get();
        if (user) {
          get().logActivity('LOGOUT', `${user.name} logged out`);
        }
        set({
          user: null,
          isAuthenticated: false,
          studentProfile: null,
        });
      },

      parseResume: async (file: File) => {
        set({ isParsing: true, parseError: null });
        
        try {
          // Simulate NLP parsing delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const fileName = file.name.toLowerCase();
          const fileContent = fileName;
          
          // Extract skills using ontology
          let extractedSkills = extractSkills(fileContent);
          
          // Fallback based on filename patterns
          if (extractedSkills.length === 0) {
            if (fileName.includes('data')) {
              extractedSkills = ['Python', 'SQL', 'Pandas', 'Data Analysis'];
            } else if (fileName.includes('web') || fileName.includes('front')) {
              extractedSkills = ['JavaScript', 'React', 'TypeScript', 'CSS'];
            } else if (fileName.includes('ml') || fileName.includes('ai')) {
              extractedSkills = ['Python', 'Machine Learning', 'PyTorch', 'Statistics'];
            } else if (fileName.includes('back')) {
              extractedSkills = ['Python', 'SQL', 'AWS', 'Docker'];
            } else {
              extractedSkills = ['Python', 'JavaScript', 'Git', 'SQL'];
            }
          }
          
          const skills = generateSkillsWithScores(extractedSkills);
          
          const resumeData: ResumeData = {
            rawText: `Parsed content from ${file.name}`,
            extractedSkills,
            education: [{
              institution: 'University',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              startDate: '2020',
              endDate: '2024',
            }],
            experience: [{
              company: 'Tech Company',
              title: 'Software Intern',
              description: 'Developed web applications and APIs',
              startDate: '2023-06',
              endDate: '2023-08',
            }],
            projects: [{
              name: 'Personal Project',
              description: 'Built a full-stack application',
              technologies: extractedSkills.slice(0, 3),
            }],
            parsedAt: new Date().toISOString(),
          };
          
          const profile: StudentProfile = {
            userId: get().user?.id || '',
            resumeData,
            skills,
            skillGaps: [],
            appliedJobs: [],
            savedCourses: [],
          };
          
          set({ studentProfile: profile, isParsing: false });
          get().logActivity('RESUME_UPLOAD', `Uploaded resume: ${file.name}`);
          
          // Auto-calculate matches
          get().calculateJobMatches();
          get().calculateCourseRecommendations();
          
        } catch {
          set({ isParsing: false, parseError: 'Failed to parse resume' });
        }
      },

      calculateJobMatches: () => {
        const { studentProfile, jobs } = get();
        if (!studentProfile || studentProfile.skills.length === 0) return;
        
        const userSkills = studentProfile.skills.map(s => s.name);
        const allSkills = Array.from(new Set([...userSkills, ...jobs.flatMap(j => j.skills)]));
        const userVector = createSkillVector(userSkills, allSkills);
        
        const matchedJobs = jobs.map(job => {
          const jobVector = createSkillVector(job.skills, allSkills);
          const similarity = calculateSimilarity(userVector, jobVector);
          const score = Math.round(similarity * 100);
          
          const matched = job.skills.filter(s => userSkills.includes(s));
          const missing = job.skills.filter(s => !userSkills.includes(s));
          
          return {
            ...job,
            matchScore: score,
            matchedSkills: matched,
            missingSkills: missing,
          };
        });
        
        matchedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        set({ jobs: matchedJobs });
      },

      calculateCourseRecommendations: () => {
        const { studentProfile, courses } = get();
        if (!studentProfile) return;
        
        const skillGaps = studentProfile.skillGaps.length > 0 
          ? studentProfile.skillGaps 
          : ['Python', 'SQL', 'React'];
        
        const scoredCourses = courses.map(course => {
          const relevantSkills = course.skills.filter(s => 
            skillGaps.some(gap => s.toLowerCase().includes(gap.toLowerCase()))
          );
          const relevanceScore = relevantSkills.length;
          
          return {
            ...course,
            relevanceScore,
            targetedSkillGaps: relevantSkills,
          };
        });
        
        scoredCourses.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        set({ courses: scoredCourses });
      },

      getRecommendationExplanation: (itemId: string, itemType: 'job' | 'course') => {
        const { studentProfile, jobs, courses } = get();
        if (!studentProfile) return { matched: [], missing: [], reason: '' };
        
        const userSkills = studentProfile.skills.map(s => s.name);
        
        if (itemType === 'job') {
          const job = jobs.find(j => j.id === itemId);
          if (!job) return { matched: [], missing: [], reason: '' };
          
          const matched = job.skills.filter(s => userSkills.includes(s));
          const missing = job.skills.filter(s => !userSkills.includes(s));
          const reason = matched.length > 0 
            ? `You have ${matched.length} matching skills for this role.`
            : 'This role requires skills you are currently developing.';
          
          return { matched, missing, reason };
        } else {
          const course = courses.find(c => c.id === itemId);
          if (!course) return { matched: [], missing: [], reason: '' };
          
          const relevant = course.skills.filter(s => 
            studentProfile.skillGaps.some(gap => s.toLowerCase().includes(gap.toLowerCase()))
          );
          
          return {
            matched: [],
            missing: relevant,
            reason: `This course teaches skills that would strengthen your profile: ${relevant.join(', ')}.`,
          };
        }
      },

      applyToJob: (jobId: string) => {
        const { studentProfile } = get();
        if (!studentProfile) return;
        
        const updated = {
          ...studentProfile,
          appliedJobs: [...studentProfile.appliedJobs, jobId],
        };
        set({ studentProfile: updated });
        get().logActivity('JOB_APPLY', `Applied to job ${jobId}`);
      },

      saveCourse: (courseId: string) => {
        const { studentProfile } = get();
        if (!studentProfile) return;
        
        const updated = {
          ...studentProfile,
          savedCourses: [...studentProfile.savedCourses, courseId],
        };
        set({ studentProfile: updated });
        get().logActivity('COURSE_SAVE', `Saved course ${courseId}`);
      },

      updateCandidateStatus: (candidateId: string, status: Candidate['status']) => {
        const { candidates } = get();
        const updated = candidates.map(c => 
          c.id === candidateId ? { ...c, status } : c
        );
        set({ candidates: updated });
        get().logActivity('CANDIDATE_STATUS', `Updated candidate ${candidateId} to ${status}`);
      },

      postJob: (job: Omit<Job, 'id' | 'postedAt'>) => {
        const newJob: Job = {
          ...job,
          id: uuidv4(),
          postedAt: new Date().toISOString().split('T')[0],
        };
        set(state => ({ jobs: [newJob, ...state.jobs] }));
        get().logActivity('JOB_POST', `Posted job: ${job.title}`);
      },

      searchCandidates: (query: string, filters: { skills?: string[]; minScore?: number }) => {
        const { candidates } = get();
        return candidates.filter(c => {
          const matchesQuery = !query || 
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.role.toLowerCase().includes(query.toLowerCase());
          
          const matchesSkills = !filters.skills || filters.skills.length === 0 ||
            filters.skills.every(skill => 
              c.skills.some(s => s.name.toLowerCase().includes(skill.toLowerCase()))
            );
          
          const matchesScore = !filters.minScore || c.matchScore >= filters.minScore;
          
          return matchesQuery && matchesSkills && matchesScore;
        });
      },

      getSystemStats: () => {
        const { candidates, jobs, courses, activityLogs } = get();
        
        // Count skill occurrences
        const skillCounts: Record<string, number> = {};
        candidates.forEach(c => {
          c.skills.forEach(s => {
            skillCounts[s.name] = (skillCounts[s.name] || 0) + 1;
          });
        });
        
        const topSkills = Object.entries(skillCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        return {
          totalUsers: candidates.length + 2,
          totalStudents: candidates.length,
          totalRecruiters: 2,
          totalResumes: candidates.length,
          totalJobs: jobs.length,
          totalCourses: courses.length,
          topSkills,
          recentActivity: activityLogs.slice(-10).reverse(),
        };
      },

      logActivity: (action: string, details: string) => {
        const { user, activityLogs } = get();
        const log: ActivityLog = {
          id: uuidv4(),
          action,
          userId: user?.id || 'system',
          userName: user?.name || 'System',
          details,
          timestamp: new Date().toISOString(),
        };
        set({ activityLogs: [...activityLogs, log] });
      },
    }),
    {
      name: 'esencelab-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        studentProfile: state.studentProfile,
        activityLogs: state.activityLogs,
      }),
    }
  )
);
