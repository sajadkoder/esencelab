export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  name: string;
  score: number;
  category: 'technical' | 'soft' | 'domain';
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Experience {
  company: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface ResumeData {
  rawText: string;
  extractedSkills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  parsedAt: string;
}

export interface StudentProfile {
  userId: string;
  resumeData: ResumeData;
  skills: Skill[];
  skillGaps: string[];
  appliedJobs: string[];
  savedCourses: string[];
  targetRole?: string;
  skillGapPriorities?: SkillGapPriority[];
}

export interface SkillGapPriority {
  skill: string;
  priority: number;
  reason: string;
}

export interface Job {
  id: string;
  employer_id?: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  description: string;
  requirements: string[];
  skills: string[];
  salaryRange?: string;
  salary_min?: number;
  salary_max?: number;
  postedAt: string;
  postedBy: string;
  status?: 'active' | 'closed' | 'draft';
  matchScore?: number;
  missingSkills?: string[];
  matchedSkills?: string[];
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string;
  skills: string[];
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  image_url?: string;
  rating?: number;
  relevanceScore?: number;
  targetedSkillGaps?: string[];
}

export interface Candidate {
  id: string;
  userId?: string;
  user_id?: string;
  name: string;
  email: string;
  role: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  resume_url?: string;
  matchScore: number;
  appliedAt: string;
  status: 'new' | 'screening' | 'interview' | 'hired' | 'rejected';
  created_at?: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
  job?: Job;
  candidate?: Candidate;
}

export interface RecommendationExplanation {
  itemId: string;
  itemType: 'job' | 'course';
  matchedSkills: string[];
  missingSkills: string[];
  relevanceScore: number;
  reason: string;
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalRecruiters: number;
  totalResumes: number;
  totalJobs: number;
  totalCourses: number;
  topSkills: { name: string; count: number }[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'job_match' | 'course_recommendation' | 'application_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface TargetRole {
  id: string;
  name: string;
  requiredSkills: string[];
  category: string;
}

// Demo data
export const DEMO_USERS: { email: string; password: string; name: string; role: UserRole }[] = [
  { email: 'student@demo.com', password: 'demo', name: 'Alex Chen', role: 'student' },
  { email: 'recruiter@demo.com', password: 'demo', name: 'Sarah Miller', role: 'employer' },
  { email: 'admin@demo.com', password: 'demo', name: 'Admin User', role: 'admin' },
];

export const SAMPLE_JOBS: Job[] = [
  {
    id: '1',
    title: 'Software Engineer Intern',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'internship',
    description: 'Build scalable web applications using modern technologies. Work with a team of experienced engineers.',
    requirements: ['Currently enrolled in CS program', 'Python or JavaScript experience', 'Git knowledge'],
    skills: ['Python', 'JavaScript', 'React', 'Git', 'SQL'],
    salaryRange: '$30-40/hr',
    postedAt: '2026-01-15',
    postedBy: 'recruiter@techcorp.com',
  },
  {
    id: '2',
    title: 'Data Analyst',
    company: 'DataFlow',
    location: 'New York, NY',
    type: 'full-time',
    description: 'Analyze large datasets to drive business decisions. Create dashboards and reports.',
    requirements: ['BS in Statistics or related field', 'SQL proficiency', 'Data visualization skills'],
    skills: ['SQL', 'Python', 'Pandas', 'Tableau', 'Excel'],
    salaryRange: '$70k-90k',
    postedAt: '2026-01-18',
    postedBy: 'recruiter@dataflow.com',
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'WebScale',
    location: 'Remote',
    type: 'full-time',
    description: 'Create beautiful, responsive user interfaces. Collaborate with designers and backend engineers.',
    requirements: ['3+ years experience', 'React expertise', 'CSS/SASS proficiency'],
    skills: ['React', 'TypeScript', 'CSS', 'HTML', 'Figma'],
    salaryRange: '$100k-140k',
    postedAt: '2026-01-20',
    postedBy: 'recruiter@webscale.com',
  },
  {
    id: '4',
    title: 'Machine Learning Engineer',
    company: 'AI Labs',
    location: 'Boston, MA',
    type: 'full-time',
    description: 'Build and deploy ML models at scale. Research and implement cutting-edge algorithms.',
    requirements: ['MS/PhD in CS or related field', 'PyTorch/TensorFlow experience', 'Strong math background'],
    skills: ['Python', 'PyTorch', 'TensorFlow', 'ML', 'Statistics'],
    salaryRange: '$130k-180k',
    postedAt: '2026-01-22',
    postedBy: 'recruiter@ailabs.com',
  },
  {
    id: '5',
    title: 'Backend Engineer',
    company: 'CloudSystems',
    location: 'Austin, TX',
    type: 'full-time',
    description: 'Design and build scalable backend services. Work with microservices architecture.',
    requirements: ['5+ years backend experience', 'Go or Python proficiency', 'Database design skills'],
    skills: ['Go', 'Python', 'PostgreSQL', 'Redis', 'AWS'],
    salaryRange: '$120k-160k',
    postedAt: '2026-01-25',
    postedBy: 'recruiter@cloudsystems.com',
  },
];

export const SAMPLE_COURSES: Course[] = [
  {
    id: '1',
    title: 'Advanced Python for Data Science',
    provider: 'DataCamp',
    description: 'Master Python libraries for data analysis and visualization.',
    skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
    duration: '4 weeks',
    level: 'intermediate',
    url: 'https://datacamp.com',
  },
  {
    id: '2',
    title: 'SQL for Data Analysis',
    provider: 'Mode Analytics',
    description: 'Learn SQL queries for extracting and analyzing data.',
    skills: ['SQL', 'Database Design', 'Query Optimization'],
    duration: '3 weeks',
    level: 'beginner',
    url: 'https://mode.com',
  },
  {
    id: '3',
    title: 'React Patterns and Best Practices',
    provider: 'Frontend Masters',
    description: 'Advanced React concepts including hooks, context, and performance.',
    skills: ['React', 'Hooks', 'Context', 'Performance'],
    duration: '6 weeks',
    level: 'advanced',
    url: 'https://frontendmasters.com',
  },
  {
    id: '4',
    title: 'Machine Learning Fundamentals',
    provider: 'Coursera',
    description: 'Comprehensive introduction to ML algorithms and applications.',
    skills: ['ML', 'Python', 'Scikit-learn', 'Statistics'],
    duration: '12 weeks',
    level: 'intermediate',
    url: 'https://coursera.org',
  },
  {
    id: '5',
    title: 'System Design Interview',
    provider: 'Educative',
    description: 'Learn to design scalable distributed systems.',
    skills: ['System Design', 'Architecture', 'Scalability'],
    duration: '8 weeks',
    level: 'advanced',
    url: 'https://educative.io',
  },
];

export const SAMPLE_CANDIDATES: Candidate[] = [
  {
    id: '1',
    userId: 's1',
    name: 'Jordan Lee',
    email: 'jordan@demo.com',
    role: 'Frontend Developer',
    skills: [
      { name: 'React', score: 92, category: 'technical' },
      { name: 'TypeScript', score: 88, category: 'technical' },
      { name: 'CSS', score: 85, category: 'technical' },
    ],
    education: [{ institution: 'UC Berkeley', degree: 'BS', field: 'Computer Science', startDate: '2020', endDate: '2024' }],
    experience: [{ company: 'StartupX', title: 'Frontend Intern', description: 'Built React components', startDate: '2023', endDate: '2023' }],
    matchScore: 94,
    appliedAt: '2026-01-20',
    status: 'screening',
  },
  {
    id: '2',
    userId: 's2',
    name: 'Morgan Smith',
    email: 'morgan@demo.com',
    role: 'Data Analyst',
    skills: [
      { name: 'Python', score: 90, category: 'technical' },
      { name: 'SQL', score: 87, category: 'technical' },
      { name: 'Tableau', score: 82, category: 'technical' },
    ],
    education: [{ institution: 'NYU', degree: 'BS', field: 'Statistics', startDate: '2019', endDate: '2023' }],
    experience: [{ company: 'BankCo', title: 'Data Intern', description: 'Analyzed financial data', startDate: '2022', endDate: '2023' }],
    matchScore: 89,
    appliedAt: '2026-01-22',
    status: 'new',
  },
  {
    id: '3',
    userId: 's3',
    name: 'Casey Park',
    email: 'casey@demo.com',
    role: 'ML Engineer',
    skills: [
      { name: 'Python', score: 95, category: 'technical' },
      { name: 'PyTorch', score: 88, category: 'technical' },
      { name: 'Statistics', score: 85, category: 'domain' },
    ],
    education: [{ institution: 'MIT', degree: 'MS', field: 'Computer Science', startDate: '2021', endDate: '2023' }],
    experience: [{ company: 'Research Lab', title: 'Research Assistant', description: 'Published ML papers', startDate: '2022', endDate: '2023' }],
    matchScore: 91,
    appliedAt: '2026-01-25',
    status: 'interview',
  },
];
