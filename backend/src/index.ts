import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { SupabaseStore } from './supabaseStore';
import {
  CAREER_ROLES,
  buildRecommendationExplanation,
  buildRoadmap,
  calculateResumeStrength,
  deriveProgressDelta,
  generateLearningPlan,
  generateMockInterview,
  generateWeeklyPlanner,
  getRoleExplorerData,
  SkillStatus,
} from './careerEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'esencelab-demo-secret';

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter for auth routes (max 15 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});

// Setup multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const PDF_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'applications/vnd.pdf',
  'text/pdf',
]);

const sanitizeUploadFilename = (fileName: string) =>
  path
    .basename(fileName)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');

const isLikelyPdfFile = (file: Express.Multer.File) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = String(file.mimetype || '').toLowerCase();
  const acceptableMime = PDF_MIME_TYPES.has(mime) || mime === '' || mime === 'application/octet-stream';
  return ext === '.pdf' && acceptableMime;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${sanitizeUploadFilename(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!isLikelyPdfFile(file)) {
      cb(new Error('Only PDF files are allowed.'));
      return;
    }
    cb(null, true);
  },
});

const resumeUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (error: any) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: error.message || 'Invalid upload payload.' });
    }
    return res.status(400).json({ message: error?.message || 'Invalid upload payload.' });
  });
};

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';
const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo123', 10);

// In-memory data store for demo
const db: any = {
  profiles: [
    { id: '1', email: 'student@esencelab.com', passwordHash: DEMO_PASSWORD_HASH, name: 'Sajad', role: 'student', avatarUrl: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', email: 'recruiter@esencelab.com', passwordHash: DEMO_PASSWORD_HASH, name: 'adwaith', role: 'employer', avatarUrl: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '3', email: 'admin@esencelab.com', passwordHash: DEMO_PASSWORD_HASH, name: 'Admin User', role: 'admin', avatarUrl: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ],
  jobs: [
    { id: '1', employerId: '2', title: 'Software Engineer', company: 'Tech Corp', location: 'Bangalore, India', description: 'We are looking for a skilled software engineer', requirements: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL'], skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL'], salaryMin: 80000, salaryMax: 120000, jobType: 'full_time', status: 'active', createdAt: new Date() },
    { id: '2', employerId: '2', title: 'Data Scientist', company: 'Data Inc', location: 'Hyderabad, India', description: 'Join our data science team', requirements: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'], skills: ['Python', 'Machine Learning', 'TensorFlow'], salaryMin: 100000, salaryMax: 150000, jobType: 'full_time', status: 'active', createdAt: new Date() },
    { id: '3', employerId: '2', title: 'Frontend Developer', company: 'Web Solutions', location: 'Remote', description: 'Build beautiful web applications', requirements: ['React', 'TypeScript', 'CSS', 'HTML'], skills: ['React', 'TypeScript', 'CSS'], salaryMin: 60000, salaryMax: 90000, jobType: 'full_time', status: 'active', createdAt: new Date() },
    { id: '4', employerId: '2', title: 'Backend Developer', company: 'API Solutions', location: 'Chennai, India', description: 'Build scalable backend services', requirements: ['Node.js', 'Python', 'PostgreSQL'], skills: ['Node.js', 'Python', 'PostgreSQL'], salaryMin: 70000, salaryMax: 110000, jobType: 'full_time', status: 'active', createdAt: new Date() },
    { id: '5', employerId: '2', title: 'DevOps Engineer', company: 'Cloud Systems', location: 'Bangalore, India', description: 'Manage cloud infrastructure', requirements: ['AWS', 'Docker', 'Kubernetes'], skills: ['AWS', 'Docker', 'Kubernetes'], salaryMin: 90000, salaryMax: 140000, jobType: 'full_time', status: 'active', createdAt: new Date() },
  ],
  candidates: [
    { id: '1', userId: '1', name: 'Sajad', email: 'student@esencelab.com', role: 'Software Developer', skills: JSON.stringify(['Python', 'JavaScript', 'React', 'Node.js', 'SQL']), education: JSON.stringify([{ institution: 'SNGCET', degree: 'B.Tech', field: 'Computer Science', year: '2025' }]), experience: JSON.stringify([]), matchScore: 85, status: 'new', createdAt: new Date() },
  ],
  applications: [] as any[],
  courses: [
    { id: '1', title: 'Complete Python Bootcamp', description: 'Learn Python from scratch', provider: 'Udemy', url: 'https://udemy.com', skills: ['Python', 'Django'], duration: '22 hours', level: 'beginner', rating: 4.5 },
    { id: '2', title: 'React - The Complete Guide', description: 'Master React.js', provider: 'Udemy', url: 'https://udemy.com', skills: ['React', 'Redux'], duration: '40 hours', level: 'intermediate', rating: 4.6 },
    { id: '3', title: 'Machine Learning A-Z', description: 'Learn ML Algorithms', provider: 'Udemy', url: 'https://udemy.com', skills: ['Python', 'Machine Learning'], duration: '44 hours', level: 'intermediate', rating: 4.5 },
    { id: '4', title: 'Node.js Developer Course', description: 'Build real-world apps', provider: 'Udemy', url: 'https://udemy.com', skills: ['Node.js', 'Express'], duration: '37 hours', level: 'intermediate', rating: 4.7 },
  ],
  resumes: [] as any[],
  recommendations: [] as any[],
  resumeScores: [] as any[],
  skillProgress: [] as any[],
  learningPlans: [] as any[],
  mockInterviewSessions: [] as any[],
  savedJobs: [] as any[],
  careerPreferences: [{ userId: '1', roleId: 'backend_developer', updatedAt: new Date() }] as any[],
};

const supabaseStore = new SupabaseStore();

db.jobs = db.jobs.map((job: any) => ({
  ...job,
  updatedAt: job.updatedAt || job.createdAt || new Date(),
}));
db.courses = db.courses.map((course: any) => ({
  ...course,
  createdAt: course.createdAt || new Date(),
  updatedAt: course.updatedAt || new Date(),
}));
db.candidates = db.candidates.map((candidate: any) => ({
  ...candidate,
  updatedAt: candidate.updatedAt || candidate.createdAt || new Date(),
}));
db.resumeScores = (db.resumeScores || []).map((entry: any) => ({
  ...entry,
  createdAt: entry.createdAt || new Date(),
}));
db.skillProgress = (db.skillProgress || []).map((entry: any) => ({
  ...entry,
  createdAt: entry.createdAt || new Date(),
  updatedAt: entry.updatedAt || new Date(),
}));
db.learningPlans = (db.learningPlans || []).map((entry: any) => ({
  ...entry,
  createdAt: entry.createdAt || new Date(),
  updatedAt: entry.updatedAt || new Date(),
}));
db.mockInterviewSessions = (db.mockInterviewSessions || []).map((entry: any) => ({
  ...entry,
  createdAt: entry.createdAt || new Date(),
}));
db.savedJobs = (db.savedJobs || []).map((entry: any) => ({
  ...entry,
  createdAt: entry.createdAt || new Date(),
}));
db.careerPreferences = (db.careerPreferences || []).map((entry: any) => ({
  ...entry,
  updatedAt: entry.updatedAt || new Date(),
}));

type CanonicalRole = 'student' | 'recruiter' | 'admin';
type SupportedRole = CanonicalRole | 'employer';
type RequestWithAuth = Request & { authToken?: string; profile?: any };

const resetTokens = new Map<string, { userId: string; expiresAt: number }>();
const revokedTokens = new Set<string>();

const toStorageRole = (inputRole: unknown): SupportedRole => {
  const normalized = String(inputRole || '')
    .trim()
    .toLowerCase();
  if (normalized === 'recruiter') return 'employer';
  if (normalized === 'employer') return 'employer';
  if (normalized === 'admin') return 'admin';
  return 'student';
};

const toCanonicalRole = (inputRole: unknown): CanonicalRole => {
  const normalized = String(inputRole || '')
    .trim()
    .toLowerCase();
  if (normalized === 'recruiter' || normalized === 'employer') return 'recruiter';
  if (normalized === 'admin') return 'admin';
  return 'student';
};

const roleMatches = (inputRole: unknown, requiredRole: CanonicalRole) => {
  return toCanonicalRole(inputRole) === requiredRole;
};

const roleFilterMatches = (inputRole: unknown, filterRole: string) => {
  const normalized = filterRole.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === 'employer' || normalized === 'recruiter') {
    return roleMatches(inputRole, 'recruiter');
  }
  if (normalized === 'admin') return roleMatches(inputRole, 'admin');
  if (normalized === 'student') return roleMatches(inputRole, 'student');
  return false;
};

const sanitizeUser = (profile: any) => ({
  id: profile.id,
  email: profile.email,
  name: profile.name,
  role: profile.role,
  canonicalRole: toCanonicalRole(profile.role),
  avatarUrl: profile.avatarUrl,
  isActive: profile.isActive,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

const createToken = (userId: string) =>
  jwt.sign(
    {
      userId,
      sessionId: crypto.randomUUID(),
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const parseBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !value) return null;
  return value;
};

const verifyToken = (token: string) => {
  if (revokedTokens.has(token)) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

const getProfileFromAuth = (req: Request) => {
  const token = parseBearerToken(req);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const profile = db.profiles.find((p: any) => p.id === decoded.userId);
  if (!profile || profile.isActive === false) return null;

  return profile;
};

const requireAuth = (req: RequestWithAuth, res: Response, next: NextFunction) => {
  const token = parseBearerToken(req);
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

  const profile = db.profiles.find((entry: any) => entry.id === decoded.userId);
  if (!profile || profile.isActive === false) {
    return res.status(401).json({ message: 'User not found or disabled' });
  }

  req.authToken = token;
  req.profile = profile;
  return next();
};

const requireRoles = (...roles: CanonicalRole[]) => {
  return (req: RequestWithAuth, res: Response, next: NextFunction) => {
    const profile = req.profile;
    if (!profile) return res.status(401).json({ message: 'Not authenticated' });

    const authorized = roles.some((role) => roleMatches(profile.role, role));
    if (!authorized) return res.status(403).json({ message: 'Not authorized' });
    return next();
  };
};

const toStorageApplicationStatus = (status: unknown): 'pending' | 'shortlisted' | 'interview' | 'rejected' => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'applied' || normalized === 'pending') return 'pending';
  if (normalized === 'offer' || normalized === 'shortlisted') return 'shortlisted';
  if (normalized === 'interviewing' || normalized === 'interview') return 'interview';
  return 'rejected';
};

const toTrackerApplicationStatus = (status: unknown): 'applied' | 'interviewing' | 'offer' | 'rejected' => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'pending' || normalized === 'applied') return 'applied';
  if (normalized === 'interview' || normalized === 'interviewing') return 'interviewing';
  if (normalized === 'shortlisted' || normalized === 'offer') return 'offer';
  return 'rejected';
};

const withTrackerStatus = (application: any) => ({
  ...application,
  trackerStatus: toTrackerApplicationStatus(application?.status),
  storageStatus: application?.status || 'pending',
});

const withApplicationDetails = (applications: any[]) => {
  return applications.map((application) => {
    const job = db.jobs.find((entry: any) => entry.id === application.jobId);
    const student = db.profiles.find((entry: any) => entry.id === application.candidateId);
    const resume = db.resumes.find((entry: any) => entry.userId === application.candidateId);
    return {
      ...withTrackerStatus(application),
      job,
      student: student ? sanitizeUser(student) : null,
      resume,
      createdAt: application.appliedAt || application.createdAt,
    };
  });
};

const toSkillList = (value: any): string[] => {
  if (Array.isArray(value)) return value.map((entry) => String(entry)).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((entry) => String(entry)).filter(Boolean);
    } catch {
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);
};

const normalizeSkillList = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value : toSkillList(value as any);
  const unique = new Map<string, string>();
  for (const item of raw) {
    const cleaned = String(item || '').trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (!unique.has(key)) unique.set(key, cleaned);
  }
  return Array.from(unique.values());
};

const normalizeResumeParsedData = (value: any, profile: any) => {
  const safe = value && typeof value === 'object' ? value : {};
  const parsedSkills = normalizeSkillList(safe.skills);

  return {
    name: safe.name ? String(safe.name) : profile?.name || '',
    email: safe.email ? String(safe.email) : profile?.email || '',
    phone: safe.phone ? String(safe.phone) : null,
    summary: safe.summary ? String(safe.summary) : null,
    skills: parsedSkills,
    education: Array.isArray(safe.education) ? safe.education : [],
    experience: Array.isArray(safe.experience) ? safe.experience : [],
    projects: Array.isArray(safe.projects) ? safe.projects : [],
    organizations: normalizeStringArray(safe.organizations),
    dates: normalizeStringArray(safe.dates),
  };
};

const buildProcessedFileUrl = (userId: string, fileName: string) => {
  const safeName = sanitizeUploadFilename(fileName || 'resume.pdf');
  return `processed://resumes/${userId}/${Date.now()}-${safeName}`;
};

const safeDeleteTempFile = async (filePath?: string) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // Ignore cleanup errors for temp uploads.
  }
};

const getCareerPreference = (userId: string) => {
  const preference = db.careerPreferences.find((entry: any) => entry.userId === userId);
  const roleId = preference?.roleId || CAREER_ROLES[0].id;
  return CAREER_ROLES.some((entry) => entry.id === roleId) ? roleId : CAREER_ROLES[0].id;
};

const setCareerPreference = (userId: string, roleId: string) => {
  const safeRoleId = CAREER_ROLES.some((entry) => entry.id === roleId) ? roleId : CAREER_ROLES[0].id;
  const idx = db.careerPreferences.findIndex((entry: any) => entry.userId === userId);
  const record = {
    userId,
    roleId: safeRoleId,
    updatedAt: new Date(),
  };
  if (idx >= 0) db.careerPreferences[idx] = record;
  else db.careerPreferences.push(record);
  return safeRoleId;
};

const getStudentResumeSkills = (userId: string) => {
  const candidate = db.candidates.find((entry: any) => entry.userId === userId);
  const resume = db.resumes.find((entry: any) => entry.userId === userId);
  return Array.from(
    new Set([
      ...toSkillList(candidate?.skills),
      ...toSkillList(resume?.skills),
      ...toSkillList(resume?.parsedData?.skills),
    ])
  );
};

const getStudentRoadmap = (userId: string, roleId?: string) => {
  const safeRoleId = roleId || getCareerPreference(userId);
  const resumeSkills = getStudentResumeSkills(userId);
  const records = db.skillProgress
    .filter((entry: any) => entry.userId === userId && entry.roleId === safeRoleId)
    .map((entry: any) => ({
      skillName: String(entry.skillName),
      status: entry.status as SkillStatus,
    }));
  return buildRoadmap(safeRoleId, resumeSkills, records);
};

const getLatestResumeScore = (userId: string) => {
  const history = db.resumeScores
    .filter((entry: any) => entry.userId === userId)
    .sort((left: any, right: any) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  return history[0] || null;
};

const ensureResumeScoreHistory = async (userId: string) => {
  const resume = db.resumes.find((entry: any) => entry.userId === userId);
  if (!resume) return null;

  const roleId = getCareerPreference(userId);
  const latest = getLatestResumeScore(userId);
  const resumeUpdatedAt = new Date(resume.updatedAt || resume.createdAt || Date.now());
  const latestCreatedAt = latest ? new Date(latest.createdAt) : null;

  if (latest && latestCreatedAt && latestCreatedAt.getTime() >= resumeUpdatedAt.getTime()) {
    return latest;
  }

  const scorePayload = calculateResumeStrength(resume.parsedData, toSkillList(resume.skills), roleId);
  const record = {
    id: uuidv4(),
    userId,
    roleId,
    score: scorePayload.overallScore,
    sectionScores: scorePayload.sections,
    suggestions: scorePayload.suggestions,
    createdAt: new Date(),
  };
  db.resumeScores.push(record);
  await supabaseStore.upsertResumeScore(record);
  return record;
};

const toHumanReadableImpact = (impact: number) => Math.max(3, Math.min(30, Math.round(impact)));

const jobRequirementText = (job: any) => {
  const requirements = Array.isArray(job.requirements) ? job.requirements.join(', ') : String(job.requirements || '');
  const skills = Array.isArray(job.skills) ? job.skills.join(', ') : String(job.skills || '');
  return `${job.title || ''}. ${job.description || ''}. Requirements: ${requirements}. Skills: ${skills}`.trim();
};

const tokenizeSkillTerms = (skills: string[]) =>
  skills
    .flatMap((skill) => String(skill).toLowerCase().split(/[^a-z0-9+#.]+/g))
    .map((token) => token.trim())
    .filter(Boolean);

const computeTfIdfCosine = (resumeSkills: string[], requiredSkills: string[]) => {
  const docA = tokenizeSkillTerms(resumeSkills);
  const docB = tokenizeSkillTerms(requiredSkills);
  if (docA.length === 0 || docB.length === 0) return 0;

  const documents = [docA, docB];
  const vocab = Array.from(new Set([...docA, ...docB]));
  const idf = new Map<string, number>();
  for (const term of vocab) {
    const docFreq = documents.reduce((count, doc) => count + (doc.includes(term) ? 1 : 0), 0);
    idf.set(term, Math.log((documents.length + 1) / (docFreq + 1)) + 1);
  }

  const vectorize = (doc: string[]) => {
    const termCount = new Map<string, number>();
    for (const term of doc) {
      termCount.set(term, (termCount.get(term) || 0) + 1);
    }
    const docLength = doc.length || 1;
    return vocab.map((term) => {
      const tf = (termCount.get(term) || 0) / docLength;
      return tf * (idf.get(term) || 0);
    });
  };

  const a = vectorize(docA);
  const b = vectorize(docB);
  const dot = a.reduce((sum, entry, idx) => sum + entry * b[idx], 0);
  const magA = Math.sqrt(a.reduce((sum, entry) => sum + entry * entry, 0));
  const magB = Math.sqrt(b.reduce((sum, entry) => sum + entry * entry, 0));
  if (magA === 0 || magB === 0) return 0;
  return Math.max(0, Math.min(1, dot / (magA * magB)));
};

const toDisplaySkill = (skill: string) =>
  skill
    .split(' ')
    .map((segment) =>
      segment.length <= 3
        ? segment.toUpperCase()
        : segment.charAt(0).toUpperCase() + segment.slice(1)
    )
    .join(' ');

const localMatchScore = (resumeSkills: string[], requiredSkills: string[]) => {
  const normalizedResume = Array.from(
    new Set(resumeSkills.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean))
  );
  const requiredDisplayMap = new Map<string, string>();
  for (const rawSkill of requiredSkills) {
    const normalized = String(rawSkill).trim().toLowerCase();
    if (!normalized) continue;
    if (!requiredDisplayMap.has(normalized)) {
      requiredDisplayMap.set(normalized, toDisplaySkill(String(rawSkill).trim()));
    }
  }
  const normalizedRequired = Array.from(requiredDisplayMap.keys());
  const resumeSet = new Set(normalizedResume);
  const matched = normalizedRequired.filter((skill) => resumeSet.has(skill));
  const missing = normalizedRequired.filter((skill) => !resumeSet.has(skill));

  const exactCoverage = normalizedRequired.length > 0 ? matched.length / normalizedRequired.length : 0;
  const semanticSimilarity = computeTfIdfCosine(normalizedResume, normalizedRequired);
  const blendedScore = exactCoverage * 0.65 + semanticSimilarity * 0.35;
  const matchScore = Math.round(Math.max(0, Math.min(1, blendedScore)) * 100);

  const matchQuality =
    matchScore >= 75
      ? 'Strong alignment between profile and required skills.'
      : matchScore >= 50
        ? 'Moderate alignment. Upskilling in missing areas is recommended.'
        : 'Low alignment. Focus on building core required skills.';

  return {
    matchScore,
    matchedSkills: matched.map((skill) => requiredDisplayMap.get(skill) || toDisplaySkill(skill)),
    missingSkills: missing.map((skill) => requiredDisplayMap.get(skill) || toDisplaySkill(skill)),
    explanation: matchQuality,
  };
};

const getMatchInsights = async (resumeSkills: string[], job: any) => {
  const sanitizedSkills = resumeSkills.map((entry) => String(entry).trim()).filter(Boolean);
  const requiredSkills = toSkillList(job.skills?.length ? job.skills : job.requirements);
  const requirementsText = jobRequirementText(job);

  try {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/ai/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeSkills: sanitizedSkills,
        jobRequirements: requirementsText,
        jobRequiredSkills: requiredSkills,
        includeExplanation: true,
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI match failed with status ${aiResponse.status}`);
    const aiData: any = await aiResponse.json();
    const rawScore = Number(aiData.matchScore || 0);
    const normalizedScore = rawScore > 1 ? rawScore / 100 : rawScore;
    return {
      matchScore: Math.round(Math.max(0, Math.min(1, normalizedScore)) * 100),
      matchedSkills: Array.isArray(aiData.matchedSkills) ? aiData.matchedSkills : [],
      missingSkills: Array.isArray(aiData.missingSkills) ? aiData.missingSkills : [],
      explanation: aiData.explanation || null,
    };
  } catch {
    return localMatchScore(sanitizedSkills, requiredSkills);
  }
};

const pruneExpiredResetTokens = () => {
  const now = Date.now();
  for (const [token, value] of resetTokens.entries()) {
    if (value.expiresAt <= now) resetTokens.delete(token);
  }
};

// Auth Routes
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || '');
  const name = String(req.body?.name || '').trim();
  const safeRole = toStorageRole(req.body?.role);

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = db.profiles.find((p: any) => p.email?.toLowerCase() === email);
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);

  const profile = {
    id: uuidv4(),
    email,
    passwordHash,
    name,
    role: safeRole,
    avatarUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.profiles.push(profile);
  await supabaseStore.upsertUser(profile);

  const token = createToken(profile.id);
  res.status(201).json({ token, user: sanitizeUser(profile) });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const profile = db.profiles.find((p: any) => p.email?.toLowerCase() === email);
  if (!profile || profile.isActive === false) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = profile.passwordHash
    ? await bcrypt.compare(password, profile.passwordHash)
    : password === 'demo123';
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = createToken(profile.id);
  res.json({ token, user: sanitizeUser(profile) });
});

app.get('/api/auth/me', requireAuth, (req: RequestWithAuth, res) => {
  res.json({ user: sanitizeUser(req.profile) });
});

app.post('/api/auth/logout', requireAuth, (req: RequestWithAuth, res) => {
  if (req.authToken) revokedTokens.add(req.authToken);
  res.json({ message: 'Logged out successfully' });
});

app.put('/api/auth/profile', requireAuth, async (req: RequestWithAuth, res) => {
  const profile = req.profile;
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : undefined;
  const avatarUrl = typeof req.body?.avatarUrl === 'string' ? req.body.avatarUrl.trim() : undefined;

  if (name !== undefined && name.length === 0) {
    return res.status(400).json({ message: 'name cannot be empty' });
  }

  if (name !== undefined) profile.name = name;
  if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl || null;
  profile.updatedAt = new Date();
  await supabaseStore.upsertUser(profile);

  res.json({ user: sanitizeUser(profile) });
});

app.put('/api/auth/password', authLimiter, requireAuth, async (req: RequestWithAuth, res) => {
  const profile = req.profile;
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });

  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword and newPassword are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
  }

  const isValid = profile.passwordHash
    ? await bcrypt.compare(currentPassword, profile.passwordHash)
    : currentPassword === 'demo123';
  if (!isValid) return res.status(401).json({ message: 'Current password is invalid' });

  profile.passwordHash = await bcrypt.hash(newPassword, 10);
  profile.updatedAt = new Date();
  await supabaseStore.upsertUser(profile);

  res.json({ message: 'Password updated successfully' });
});

app.post('/api/auth/password/forgot', authLimiter, (req, res) => {
  pruneExpiredResetTokens();
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const profile = db.profiles.find((entry: any) => entry.email?.toLowerCase() === email);
  if (profile && profile.isActive !== false) {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000;
    resetTokens.set(token, { userId: profile.id, expiresAt });

    return res.json({
      message: 'Password reset token generated for demo mode',
      resetToken: token,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  }

  return res.json({ message: 'If the account exists, a password reset link was sent.' });
});

app.post('/api/auth/password/reset', authLimiter, async (req, res) => {
  pruneExpiredResetTokens();
  const resetToken = String(req.body?.token || '');
  const newPassword = String(req.body?.newPassword || '');
  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: 'token and newPassword are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
  }

  const tokenPayload = resetTokens.get(resetToken);
  if (!tokenPayload || tokenPayload.expiresAt <= Date.now()) {
    resetTokens.delete(resetToken);
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  const profile = db.profiles.find((entry: any) => entry.id === tokenPayload.userId);
  if (!profile || profile.isActive === false) {
    resetTokens.delete(resetToken);
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  profile.passwordHash = await bcrypt.hash(newPassword, 10);
  profile.updatedAt = new Date();
  resetTokens.delete(resetToken);
  await supabaseStore.upsertUser(profile);

  res.json({ message: 'Password has been reset' });
});

// Users Routes (admin only)
app.get('/api/users', requireAuth, requireRoles('admin'), (req, res) => {

  const { search, role } = req.query;
  let users = [...db.profiles];

  if (search) {
    const searchText = String(search).toLowerCase();
    users = users.filter(
      (entry: any) =>
        entry.name?.toLowerCase().includes(searchText) ||
        entry.email?.toLowerCase().includes(searchText)
    );
  }

  if (role) {
    users = users.filter((entry: any) => roleFilterMatches(entry.role, String(role)));
  }

  res.json({ data: users.map((entry: any) => sanitizeUser(entry)) });
});

app.put('/api/users/:id', requireAuth, requireRoles('admin'), async (req: RequestWithAuth, res) => {
  const profile = req.profile;
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });

  const idx = db.profiles.findIndex((entry: any) => entry.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });

  if (req.params.id === profile.id && req.body.isActive === false) {
    return res.status(400).json({ message: 'You cannot deactivate your own account' });
  }

  const updates = { ...req.body };
  if (updates.role) {
    updates.role = toStorageRole(updates.role);
  }

  db.profiles[idx] = { ...db.profiles[idx], ...updates, updatedAt: new Date() };
  await supabaseStore.upsertUser(db.profiles[idx]);
  res.json({ data: sanitizeUser(db.profiles[idx]) });
});

app.delete('/api/users/:id', requireAuth, requireRoles('admin'), async (req: RequestWithAuth, res) => {
  const profile = req.profile;
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (req.params.id === profile.id) return res.status(400).json({ message: 'You cannot delete your own account' });

  const idx = db.profiles.findIndex((entry: any) => entry.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });

  db.profiles.splice(idx, 1);
  db.candidates = db.candidates.filter((entry: any) => entry.userId !== req.params.id);
  db.resumes = db.resumes.filter((entry: any) => entry.userId !== req.params.id);
  db.applications = db.applications.filter((entry: any) => entry.candidateId !== req.params.id);
  db.recommendations = db.recommendations.filter((entry: any) => entry.userId !== req.params.id);
  db.resumeScores = db.resumeScores.filter((entry: any) => entry.userId !== req.params.id);
  db.skillProgress = db.skillProgress.filter((entry: any) => entry.userId !== req.params.id);
  db.learningPlans = db.learningPlans.filter((entry: any) => entry.userId !== req.params.id);
  db.mockInterviewSessions = db.mockInterviewSessions.filter((entry: any) => entry.userId !== req.params.id);
  db.savedJobs = db.savedJobs.filter((entry: any) => entry.userId !== req.params.id);
  db.careerPreferences = db.careerPreferences.filter((entry: any) => entry.userId !== req.params.id);
  await supabaseStore.deleteUser(req.params.id);
  await supabaseStore.deleteCandidatesByUser(req.params.id);
  await supabaseStore.deleteResumesByUser(req.params.id);
  await supabaseStore.deleteApplicationsByCandidate(req.params.id);
  await supabaseStore.deleteRecommendationsByUser(req.params.id);
  await supabaseStore.deleteResumeScoresByUser(req.params.id);
  await supabaseStore.deleteSkillProgressByUser(req.params.id);
  await supabaseStore.deleteLearningPlansByUser(req.params.id);
  await supabaseStore.deleteMockInterviewSessionsByUser(req.params.id);
  await supabaseStore.deleteSavedJobsByUser(req.params.id);
  await supabaseStore.deleteCareerPreference(req.params.id);

  res.json({ message: 'User deleted' });
});

// Resume Upload Route
app.post(
  '/api/resume/upload',
  requireAuth,
  requireRoles('student'),
  resumeUploadMiddleware,
  async (req: RequestWithAuth, res) => {
    const profile = req.profile;
    if (!profile) return res.status(401).json({ message: 'Not authenticated' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const shouldReplaceExisting = String(req.body?.replaceExisting ?? 'true').toLowerCase() !== 'false';
    const existingResumeIndex = db.resumes.findIndex((entry: any) => entry.userId === profile.id);
    if (existingResumeIndex >= 0 && !shouldReplaceExisting) {
      await safeDeleteTempFile(req.file.path);
      return res.status(409).json({
        message: 'A resume already exists. Set replaceExisting=true to replace it.',
      });
    }

    const fallbackParsedData = normalizeResumeParsedData(
      {
        name: profile.name,
        email: profile.email,
        phone: null,
        summary: null,
        education: [],
        experience: [],
        projects: [],
        skills: [],
      },
      profile
    );
    let parsedData = fallbackParsedData;
    let skills: string[] = normalizeSkillList(fallbackParsedData.skills);

    try {
      try {
        const fileBuffer = await fs.promises.readFile(req.file.path);
        const formData = new FormData();
        formData.append('file', new Blob([fileBuffer], { type: 'application/pdf' }), req.file.originalname);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const aiResponse = await fetch(`${AI_SERVICE_URL}/ai/parse-resume`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });

          if (aiResponse.ok) {
            const aiData: any = await aiResponse.json();
            parsedData = normalizeResumeParsedData(aiData?.parsedData, profile);
            skills = normalizeSkillList(aiData?.skills?.length ? aiData.skills : parsedData.skills);
            parsedData.skills = skills;
          } else {
            console.warn('AI parsing failed with status', aiResponse.status);
          }
        } finally {
          clearTimeout(timeout);
        }
      } catch (aiError) {
        console.warn('AI service unavailable, using fallback parsing');
        console.warn(aiError);
      }

      const replaced = existingResumeIndex >= 0;
      const resume = {
        id: replaced ? db.resumes[existingResumeIndex].id : uuidv4(),
        userId: profile.id,
        fileUrl: buildProcessedFileUrl(profile.id, req.file.originalname),
        fileName: req.file.originalname,
        parsedData,
        skills,
        createdAt: replaced ? db.resumes[existingResumeIndex].createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (replaced) {
        db.resumes[existingResumeIndex] = resume;
      } else {
        db.resumes.push(resume);
      }
      await supabaseStore.upsertResume(resume);

      let candidate = db.candidates.find((entry: any) => entry.userId === profile.id);
      if (candidate) {
        candidate.skills = JSON.stringify(skills);
        candidate.education = JSON.stringify(parsedData.education || []);
        candidate.experience = JSON.stringify(parsedData.experience || []);
        candidate.parsedData = parsedData;
        candidate.updatedAt = new Date();
        await supabaseStore.upsertCandidate(candidate);
      } else {
        candidate = {
          id: uuidv4(),
          userId: profile.id,
          name: profile.name,
          email: profile.email,
          role: 'Student',
          skills: JSON.stringify(skills),
          education: JSON.stringify(parsedData.education || []),
          experience: JSON.stringify(parsedData.experience || []),
          parsedData,
          matchScore: 0,
          status: 'new',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.candidates.push(candidate);
        await supabaseStore.upsertCandidate(candidate);
      }

      const latestScore = await ensureResumeScoreHistory(profile.id);

      return res.status(replaced ? 200 : 201).json({ data: { ...resume, latestScore, replaced } });
    } catch (error: any) {
      console.error('Resume upload error:', error);
      return res.status(500).json({ message: error.message || 'Failed to upload resume' });
    } finally {
      await safeDeleteTempFile(req.file.path);
    }
  }
);

// Get my resume
app.get('/api/resume', requireAuth, requireRoles('student'), (req: RequestWithAuth, res) => {
  const profile = req.profile;
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });

  const resume = db.resumes.find((r: any) => r.userId === profile.id);
  if (!resume) return res.status(404).json({ message: 'No resume found' });

  const latestScore = getLatestResumeScore(profile.id);
  res.json({ data: { ...resume, latestScore } });
});

// Delete resume
app.delete('/api/resume/:id', requireAuth, requireRoles('student'), async (req: RequestWithAuth, res) => {
  const profile = req.profile;
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });

  const idx = db.resumes.findIndex((r: any) => r.id === req.params.id && r.userId === profile.id);
  if (idx === -1) return res.status(404).json({ message: 'Resume not found' });

  db.resumes.splice(idx, 1);
  await supabaseStore.deleteResume(req.params.id);
  res.json({ message: 'Resume deleted' });
});

// Jobs Routes
app.get('/api/jobs', (req, res) => {
  const { search, jobType, location, status, limit, my } = req.query;
  let jobs = [...db.jobs];

  if (search) {
    const s = (search as string).toLowerCase();
    jobs = jobs.filter((j: any) => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.description.toLowerCase().includes(s));
  }
  if (jobType) jobs = jobs.filter((j: any) => j.jobType === jobType);
  if (location) jobs = jobs.filter((j: any) => j.location.toLowerCase().includes((location as string).toLowerCase()));
  if (status && status !== 'all') jobs = jobs.filter((j: any) => j.status === status);
  else if (!status) jobs = jobs.filter((j: any) => j.status === 'active');

  if (my === 'true') {
    const profile = getProfileFromAuth(req);
    if (profile && roleMatches(profile.role, 'recruiter')) {
      jobs = jobs.filter((j: any) => j.employerId === profile.id);
    }
  }

  jobs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (limit) {
    const n = Number(limit);
    if (!Number.isNaN(n) && n > 0) jobs = jobs.slice(0, n);
  }

  res.json({ data: { jobs } });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = db.jobs.find((j: any) => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json({ data: job });
});

app.post('/api/jobs', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (!profile || !(roleMatches(profile.role, 'recruiter') || roleMatches(profile.role, 'admin'))) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const title = String(req.body?.title || '').trim();
  const company = String(req.body?.company || '').trim();
  const description = String(req.body?.description || '').trim();
  const experienceLevel = String(req.body?.experienceLevel || 'mid').trim().toLowerCase();

  const requirements = Array.isArray(req.body.requirements)
    ? normalizeSkillList(req.body.requirements)
    : String(req.body.requirements || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  const skills = normalizeSkillList(
    Array.isArray(req.body.skills) && req.body.skills.length > 0 ? req.body.skills : requirements
  );
  if (!title || !company || !description || skills.length === 0) {
    return res.status(400).json({
      message: 'title, company, description, and required skills are required',
    });
  }

  const safeJobType = ['full_time', 'part_time', 'internship', 'contract'].includes(req.body.jobType)
    ? req.body.jobType
    : 'full_time';
  const safeStatus = ['active', 'closed'].includes(req.body.status) ? req.body.status : 'active';
  const safeExperienceLevel = ['entry', 'junior', 'mid', 'senior', 'lead'].includes(experienceLevel)
    ? experienceLevel
    : 'mid';

  const job = {
    ...req.body,
    title,
    company,
    description,
    id: uuidv4(),
    employerId: profile.id,
    requirements,
    skills,
    experienceLevel: safeExperienceLevel,
    jobType: safeJobType,
    status: safeStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.jobs.push(job);
  await supabaseStore.upsertJob(job);
  res.status(201).json({ data: job });
});

app.put('/api/jobs/:id', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });

  const idx = db.jobs.findIndex((j: any) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Job not found' });

  const current = db.jobs[idx];
  if (!roleMatches(profile.role, 'admin') && current.employerId !== profile.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const title =
    req.body?.title !== undefined ? String(req.body.title).trim() : String(current.title || '').trim();
  const company =
    req.body?.company !== undefined ? String(req.body.company).trim() : String(current.company || '').trim();
  const description =
    req.body?.description !== undefined
      ? String(req.body.description).trim()
      : String(current.description || '').trim();
  const location =
    req.body?.location !== undefined ? String(req.body.location).trim() : String(current.location || '');
  const requestedRequirements =
    req.body?.requirements !== undefined ? req.body.requirements : current.requirements;
  const requirements = normalizeSkillList(requestedRequirements);
  const requestedSkills = req.body?.skills !== undefined ? req.body.skills : current.skills;
  const skills = normalizeSkillList(Array.isArray(requestedSkills) ? requestedSkills : requirements);

  if (!title || !company || !description || skills.length === 0) {
    return res.status(400).json({
      message: 'title, company, description, and required skills are required',
    });
  }

  const requestedExperienceLevel =
    req.body?.experienceLevel !== undefined
      ? String(req.body.experienceLevel).trim().toLowerCase()
      : String(current.experienceLevel || 'mid').trim().toLowerCase();
  const safeExperienceLevel = ['entry', 'junior', 'mid', 'senior', 'lead'].includes(requestedExperienceLevel)
    ? requestedExperienceLevel
    : 'mid';
  const requestedJobType = req.body?.jobType !== undefined ? String(req.body.jobType) : current.jobType;
  const safeJobType = ['full_time', 'part_time', 'internship', 'contract'].includes(requestedJobType)
    ? requestedJobType
    : 'full_time';
  const requestedStatus = req.body?.status !== undefined ? String(req.body.status) : current.status;
  const safeStatus = ['active', 'closed'].includes(requestedStatus) ? requestedStatus : 'active';
  const salaryMin =
    req.body?.salaryMin !== undefined && req.body?.salaryMin !== null && req.body?.salaryMin !== ''
      ? Number(req.body.salaryMin)
      : current.salaryMin ?? null;
  const salaryMax =
    req.body?.salaryMax !== undefined && req.body?.salaryMax !== null && req.body?.salaryMax !== ''
      ? Number(req.body.salaryMax)
      : current.salaryMax ?? null;

  db.jobs[idx] = {
    ...current,
    title,
    company,
    description,
    location,
    requirements,
    skills,
    experienceLevel: safeExperienceLevel,
    jobType: safeJobType,
    status: safeStatus,
    salaryMin: Number.isFinite(salaryMin) ? salaryMin : null,
    salaryMax: Number.isFinite(salaryMax) ? salaryMax : null,
    employerId: current.employerId,
    updatedAt: new Date(),
  };
  await supabaseStore.upsertJob(db.jobs[idx]);
  res.json({ data: db.jobs[idx] });
});

app.delete('/api/jobs/:id', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });

  const idx = db.jobs.findIndex((j: any) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Job not found' });

  if (!roleMatches(profile.role, 'admin') && db.jobs[idx].employerId !== profile.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  db.jobs.splice(idx, 1);
  db.applications = db.applications.filter((entry: any) => entry.jobId !== req.params.id);
  await supabaseStore.deleteJob(req.params.id);
  await supabaseStore.deleteApplicationsByJob(req.params.id);
  res.json({ message: 'Job deleted' });
});

// Candidates Routes
app.get('/api/candidates', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (!(roleMatches(profile.role, 'recruiter') || roleMatches(profile.role, 'admin'))) return res.status(403).json({ message: 'Not authorized' });

  const candidates = db.candidates.map((candidate: any) => ({
    ...candidate,
    skills: JSON.parse(candidate.skills || '[]'),
    education: JSON.parse(candidate.education || '[]'),
    experience: JSON.parse(candidate.experience || '[]'),
  }));

  res.json({ data: candidates });
});

app.get('/api/candidates/:id', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (!(roleMatches(profile.role, 'recruiter') || roleMatches(profile.role, 'admin'))) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const candidate = db.candidates.find((c: any) => c.id === req.params.id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  const latestResumeScore = getLatestResumeScore(candidate.userId);
  const resume = db.resumes.find((entry: any) => entry.userId === candidate.userId) || null;
  res.json({
    data: {
      ...candidate,
      skills: JSON.parse(candidate.skills || '[]'),
      education: JSON.parse(candidate.education || '[]'),
      experience: JSON.parse(candidate.experience || '[]'),
      latestResumeScore,
      resume,
    },
  });
});

app.post('/api/candidates', requireAuth, requireRoles('recruiter', 'admin'), async (req, res) => {
  const candidate = { ...req.body, id: uuidv4(), status: 'new', matchScore: 0, createdAt: new Date() };
  db.candidates.push(candidate);
  await supabaseStore.upsertCandidate(candidate);
  res.status(201).json({ data: candidate });
});

app.put('/api/candidates/:id', requireAuth, requireRoles('recruiter', 'admin'), async (req, res) => {
  const idx = db.candidates.findIndex((c: any) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Candidate not found' });
  db.candidates[idx] = { ...db.candidates[idx], ...req.body, updatedAt: new Date() };
  await supabaseStore.upsertCandidate(db.candidates[idx]);
  res.json({ data: db.candidates[idx] });
});

// Applications Routes
app.get('/api/applications', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (!(roleMatches(profile.role, 'recruiter') || roleMatches(profile.role, 'admin'))) return res.status(403).json({ message: 'Not authorized' });

  const { status } = req.query;
  let applications = [...db.applications];

  if (roleMatches(profile.role, 'recruiter')) {
    const myJobIds = db.jobs.filter((job: any) => job.employerId === profile.id).map((job: any) => job.id);
    applications = applications.filter((entry: any) => myJobIds.includes(entry.jobId));
  }

  if (status) {
    applications = applications.filter((entry: any) => entry.status === status);
  }

  applications.sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  res.json({ data: withApplicationDetails(applications) });
});

app.get('/api/applications/my', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });

  const myApps = db.applications
    .filter((a: any) => a.candidateId === profile.id)
    .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  res.json({ data: withApplicationDetails(myApps) });
});

app.post('/api/applications', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const { jobId, notes } = req.body;
  if (!jobId) return res.status(400).json({ message: 'jobId is required' });

  const existing = db.applications.find((a: any) => a.jobId === jobId && a.candidateId === profile.id);
  if (existing) return res.status(400).json({ message: 'Already applied' });

  const job = db.jobs.find((j: any) => j.id === jobId);
  if (!job || job.status !== 'active') return res.status(404).json({ message: 'Job not found or inactive' });

  const candidate = db.candidates.find((c: any) => c.userId === profile.id);

  let matchScore = 0;
  let matchedSkills: string[] = [];
  let missingSkills: string[] = [];
  let explanation: string | null = null;
  if (job && candidate) {
    const candidateSkills = toSkillList(candidate.skills);
    const insights = await getMatchInsights(candidateSkills, job);
    matchScore = insights.matchScore;
    matchedSkills = insights.matchedSkills;
    missingSkills = insights.missingSkills;
    explanation = insights.explanation;
  }

  const application = {
    id: uuidv4(),
    jobId,
    candidateId: profile.id,
    status: 'pending',
    matchScore,
    matchedSkills,
    missingSkills,
    explanation,
    notes: notes ? String(notes) : '',
    appliedAt: new Date(),
    updatedAt: new Date(),
  };
  db.applications.push(application);
  await supabaseStore.upsertApplication(application);
  res.status(201).json({ data: withApplicationDetails([application])[0] });
});

app.put('/api/applications/:id/status', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (!(roleMatches(profile.role, 'recruiter') || roleMatches(profile.role, 'admin'))) return res.status(403).json({ message: 'Not authorized' });

  const idx = db.applications.findIndex((a: any) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Application not found' });

  const { status, notes } = req.body;
  if (!['pending', 'shortlisted', 'interview', 'rejected', 'applied', 'interviewing', 'offer'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const record = db.applications[idx];
  const job = db.jobs.find((entry: any) => entry.id === record.jobId);
  if (roleMatches(profile.role, 'recruiter') && (!job || job.employerId !== profile.id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  db.applications[idx] = {
    ...record,
    status: toStorageApplicationStatus(status),
    notes: typeof notes === 'string' ? notes : record.notes || '',
    updatedAt: new Date(),
  };
  await supabaseStore.upsertApplication(db.applications[idx]);
  res.json({ data: withApplicationDetails([db.applications[idx]])[0] });
});

// Recommendation Routes
app.get('/api/recommendations', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });
  const requestedLimit = Number(req.query.limit || 3);
  const recommendationLimit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(10, Math.floor(requestedLimit)))
    : 3;

  const candidate = db.candidates.find((entry: any) => entry.userId === profile.id);
  const resume = db.resumes.find((entry: any) => entry.userId === profile.id);
  const resumeSkills = Array.from(
    new Set([
      ...toSkillList(candidate?.skills),
      ...toSkillList(resume?.skills),
      ...toSkillList(resume?.parsedData?.skills),
    ])
  );

  if (resumeSkills.length === 0) {
    return res.json({
      data: {
        generatedAt: new Date(),
        recommendedJobs: [],
        missingSkills: [],
        recommendedCourses: [],
      },
    });
  }

  const activeJobs = db.jobs.filter((job: any) => job.status === 'active');
  const scoredJobs = await Promise.all(
    activeJobs.map(async (job: any) => {
      const insights = await getMatchInsights(resumeSkills, job);
      const requiredSkills = toSkillList(job.skills?.length ? job.skills : job.requirements);
      const explanation = buildRecommendationExplanation(resumeSkills, requiredSkills);
      return {
        job,
        matchScore: insights.matchScore,
        requiredSkills,
        matchedSkills: insights.matchedSkills,
        missingSkills: insights.missingSkills,
        explanation: insights.explanation || explanation.summary,
        shortSummary: (insights.explanation || explanation.summary || '').slice(0, 180),
        explanationMeta: {
          summary: explanation.summary,
          matchedCount: explanation.matchedCount,
          totalRequired: explanation.totalRequired,
          improvementImpacts: explanation.improvementImpacts.map((entry) => ({
            ...entry,
            impact: toHumanReadableImpact(entry.impact),
          })),
        },
      };
    })
  );

  const recommendedJobs = scoredJobs
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, recommendationLimit);

  const missingSkills = Array.from(
    new Set(
      recommendedJobs
        .slice(0, 5)
        .flatMap((entry) => entry.missingSkills)
        .map((entry) => entry.toLowerCase())
    )
  );

  const recommendedCourses = db.courses
    .map((course: any) => {
      const courseSkills = toSkillList(course.skills).map((entry) => entry.toLowerCase());
      const matchedMissing = missingSkills.filter((skill) => courseSkills.includes(skill));
      return {
        ...course,
        matchedMissingSkills: matchedMissing,
        relevanceScore: matchedMissing.length,
      };
    })
    .filter((course: any) => course.relevanceScore > 0)
    .sort((left: any, right: any) => right.relevanceScore - left.relevanceScore || (right.rating || 0) - (left.rating || 0))
    .slice(0, 6);

  db.recommendations = db.recommendations.filter((entry: any) => entry.userId !== profile.id);
  await supabaseStore.deleteRecommendationsByUser(profile.id);
  const now = new Date();
  for (const recommendation of recommendedJobs) {
    const recommendationRecord = {
      id: uuidv4(),
      userId: profile.id,
      jobId: recommendation.job.id,
      matchScore: recommendation.matchScore,
      matchedSkills: recommendation.matchedSkills,
      missingSkills: recommendation.missingSkills,
      explanation: recommendation.explanation,
      explanationMeta: recommendation.explanationMeta,
      createdAt: now,
    };
    db.recommendations.push(recommendationRecord);
    await supabaseStore.upsertRecommendation(recommendationRecord);
  }

  res.json({
    data: {
      generatedAt: now,
      recommendedJobs,
      missingSkills,
      recommendedCourses,
      summary: recommendedJobs.length
        ? `You are matching ${recommendedJobs[0].explanationMeta?.matchedCount || 0} out of ${recommendedJobs[0].explanationMeta?.totalRequired || 0
        } key skills for your top role.`
        : 'Upload your resume to start receiving recommendations.',
    },
  });
});

// Career Growth Routes (student-focused)
app.get('/api/career/roles', (_req, res) => {
  res.json({ data: getRoleExplorerData() });
});

app.post('/api/career/target-role', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const requestedRoleId = String(req.body?.roleId || '');
  const safeRoleId = setCareerPreference(profile.id, requestedRoleId);
  res.json({ data: { roleId: safeRoleId } });
});

app.get('/api/career/overview', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const roleId = getCareerPreference(profile.id);
  const role = CAREER_ROLES.find((entry) => entry.id === roleId) || CAREER_ROLES[0];
  await ensureResumeScoreHistory(profile.id);

  const history = db.resumeScores
    .filter((entry: any) => entry.userId === profile.id)
    .sort((left: any, right: any) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .slice(-12);
  const latestScore = history[history.length - 1] || null;

  const roadmap = getStudentRoadmap(profile.id, roleId);
  const completedSkills = roadmap.filter((entry) => entry.status === 'completed').length;
  const inProgressSkills = roadmap.filter((entry) => entry.status === 'in_progress').length;

  const myApplications = db.applications
    .filter((entry: any) => entry.candidateId === profile.id)
    .sort((left: any, right: any) => new Date(left.appliedAt).getTime() - new Date(right.appliedAt).getTime());
  const mySavedJobs = db.savedJobs.filter((entry: any) => entry.userId === profile.id);
  const applicationStatusCounts = myApplications.reduce(
    (acc: any, entry: any) => {
      const trackerStatus = toTrackerApplicationStatus(entry.status);
      acc[trackerStatus] += 1;
      return acc;
    },
    { saved: mySavedJobs.length, applied: 0, interviewing: 0, offer: 0, rejected: 0 }
  );
  const appProgress =
    myApplications.length >= 2
      ? Math.max(0, Math.round((myApplications[myApplications.length - 1].matchScore || 0) - (myApplications[0].matchScore || 0)))
      : 0;

  const weeklyPlanner = generateWeeklyPlanner(roadmap);
  const missingSkills = roadmap
    .filter((entry) => entry.status !== 'completed')
    .map((entry) => entry.skill)
    .slice(0, 3);

  res.json({
    data: {
      roleId,
      role,
      latestScore,
      scoreHistory: history,
      roadmap,
      weeklyPlanner,
      progress: {
        resumeImprovement: deriveProgressDelta(
          history.map((entry: any) => ({
            score: Number(entry.score || 0),
            createdAt: new Date(entry.createdAt),
          }))
        ),
        skillsCompleted: completedSkills,
        skillsInProgress: inProgressSkills,
        totalSkills: roadmap.length,
        jobsMatchedImprovement: appProgress,
      },
      applicationStatusCounts,
      missingSkills,
    },
  });
});

app.get('/api/career/roadmap', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const roleId = String(req.query.roleId || getCareerPreference(profile.id));
  const roadmap = getStudentRoadmap(profile.id, roleId);
  const role = CAREER_ROLES.find((entry) => entry.id === roleId) || CAREER_ROLES[0];
  res.json({ data: { role, roadmap } });
});

app.put('/api/career/roadmap/skill', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const roleId = String(req.body?.roleId || getCareerPreference(profile.id));
  const skillName = String(req.body?.skillName || '').trim();
  const status = String(req.body?.status || 'missing') as SkillStatus;
  if (!skillName) return res.status(400).json({ message: 'skillName is required' });
  if (!['completed', 'in_progress', 'missing'].includes(status)) {
    return res.status(400).json({ message: 'Invalid skill status' });
  }

  const idx = db.skillProgress.findIndex(
    (entry: any) =>
      entry.userId === profile.id &&
      entry.roleId === roleId &&
      String(entry.skillName).toLowerCase() === skillName.toLowerCase()
  );
  const record = {
    id: idx >= 0 ? db.skillProgress[idx].id : uuidv4(),
    userId: profile.id,
    roleId,
    skillName,
    status,
    updatedAt: new Date(),
    createdAt: idx >= 0 ? db.skillProgress[idx].createdAt : new Date(),
  };
  if (idx >= 0) db.skillProgress[idx] = record;
  else db.skillProgress.push(record);
  await supabaseStore.upsertSkillProgress(record);

  const roadmap = getStudentRoadmap(profile.id, roleId);
  res.json({ data: { roadmap } });
});

app.get('/api/career/learning-plan', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const roleId = String(req.query.roleId || getCareerPreference(profile.id));
  const durationDays = Number(req.query.durationDays) === 60 ? 60 : 30;
  const existing = db.learningPlans
    .filter(
      (entry: any) =>
        entry.userId === profile.id && entry.roleId === roleId && Number(entry.durationDays) === durationDays
    )
    .sort((left: any, right: any) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())[0];

  if (existing) {
    return res.json({ data: existing });
  }

  const roadmap = getStudentRoadmap(profile.id, roleId);
  const planData = generateLearningPlan(roleId, roadmap, durationDays as 30 | 60);
  const record = {
    id: uuidv4(),
    userId: profile.id,
    roleId,
    durationDays,
    planData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.learningPlans.push(record);
  await supabaseStore.upsertLearningPlan(record);
  return res.json({ data: record });
});

app.post('/api/career/learning-plan', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const roleId = String(req.body?.roleId || getCareerPreference(profile.id));
  const durationDays = Number(req.body?.durationDays) === 60 ? 60 : 30;
  const roadmap = getStudentRoadmap(profile.id, roleId);
  const planData = generateLearningPlan(roleId, roadmap, durationDays as 30 | 60);
  const idx = db.learningPlans.findIndex(
    (entry: any) =>
      entry.userId === profile.id && entry.roleId === roleId && Number(entry.durationDays) === durationDays
  );
  const record = {
    id: idx >= 0 ? db.learningPlans[idx].id : uuidv4(),
    userId: profile.id,
    roleId,
    durationDays,
    planData,
    createdAt: idx >= 0 ? db.learningPlans[idx].createdAt : new Date(),
    updatedAt: new Date(),
  };
  if (idx >= 0) db.learningPlans[idx] = record;
  else db.learningPlans.push(record);
  await supabaseStore.upsertLearningPlan(record);
  res.json({ data: record });
});

app.get('/api/career/mock-interview', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const roleId = String(req.query.roleId || getCareerPreference(profile.id));
  const pack = generateMockInterview(roleId);
  res.json({ data: pack });
});

app.post('/api/career/mock-interview/session', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const roleId = String(req.body?.roleId || getCareerPreference(profile.id));
  const question = String(req.body?.question || '').trim();
  const answer = String(req.body?.answer || '').trim();
  const rating = Number(req.body?.rating || 0);
  if (!question || !answer) {
    return res.status(400).json({ message: 'question and answer are required' });
  }

  const session = {
    id: uuidv4(),
    userId: profile.id,
    roleId,
    question,
    answer,
    rating: Number.isFinite(rating) ? rating : 0,
    createdAt: new Date(),
  };
  db.mockInterviewSessions.push(session);
  await supabaseStore.upsertMockInterviewSession(session);

  res.status(201).json({ data: session });
});

app.get('/api/career/mock-interview/sessions', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const sessions = db.mockInterviewSessions
    .filter((entry: any) => entry.userId === profile.id)
    .sort((left: any, right: any) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 30);
  res.json({ data: sessions });
});

app.get('/api/career/job-tracker', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const saved = db.savedJobs
    .filter((entry: any) => entry.userId === profile.id)
    .map((entry: any) => ({
      ...entry,
      job: db.jobs.find((job: any) => job.id === entry.jobId) || null,
    }))
    .filter((entry: any) => entry.job !== null);
  const applications = withApplicationDetails(
    db.applications.filter((entry: any) => entry.candidateId === profile.id)
  );
  const statusCounts = applications.reduce(
    (acc: any, entry: any) => {
      acc[entry.trackerStatus] = (acc[entry.trackerStatus] || 0) + 1;
      return acc;
    },
    { saved: saved.length, applied: 0, interviewing: 0, offer: 0, rejected: 0 }
  );
  res.json({
    data: {
      savedJobs: saved.sort(
        (left: any, right: any) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      ),
      applications: applications.sort(
        (left: any, right: any) =>
          new Date(right.appliedAt || right.createdAt || Date.now()).getTime() -
          new Date(left.appliedAt || left.createdAt || Date.now()).getTime()
      ),
      statusCounts,
    },
  });
});

app.post('/api/career/job-tracker/save', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const jobId = String(req.body?.jobId || '');
  if (!jobId) return res.status(400).json({ message: 'jobId is required' });
  const job = db.jobs.find((entry: any) => entry.id === jobId && entry.status === 'active');
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const exists = db.savedJobs.find((entry: any) => entry.userId === profile.id && entry.jobId === jobId);
  if (exists) return res.json({ data: exists });

  const record = {
    id: uuidv4(),
    userId: profile.id,
    jobId,
    createdAt: new Date(),
  };
  db.savedJobs.push(record);
  await supabaseStore.upsertSavedJob(record);
  res.status(201).json({ data: record });
});

app.delete('/api/career/job-tracker/save/:jobId', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const idx = db.savedJobs.findIndex(
    (entry: any) => entry.userId === profile.id && entry.jobId === req.params.jobId
  );
  if (idx === -1) return res.status(404).json({ message: 'Saved job not found' });
  const record = db.savedJobs[idx];
  db.savedJobs.splice(idx, 1);
  await supabaseStore.deleteSavedJob(record.id);
  res.json({ message: 'Saved job removed' });
});

app.put('/api/career/job-tracker/application/:applicationId', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const idx = db.applications.findIndex(
    (entry: any) => entry.id === req.params.applicationId && entry.candidateId === profile.id
  );
  if (idx === -1) return res.status(404).json({ message: 'Application not found' });

  const updates: any = {};
  if (typeof req.body?.notes === 'string') updates.notes = req.body.notes;
  if (typeof req.body?.status === 'string') {
    const normalized = String(req.body.status).trim().toLowerCase();
    if (
      ['pending', 'shortlisted', 'interview', 'rejected', 'applied', 'interviewing', 'offer'].includes(
        normalized
      )
    ) {
      updates.status = toStorageApplicationStatus(normalized);
    }
  }
  db.applications[idx] = {
    ...db.applications[idx],
    ...updates,
    updatedAt: new Date(),
  };
  await supabaseStore.upsertApplication(db.applications[idx]);
  res.json({ data: withApplicationDetails([db.applications[idx]])[0] });
});

app.delete('/api/career/job-tracker/application/:applicationId', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  const idx = db.applications.findIndex(
    (entry: any) => entry.id === req.params.applicationId && entry.candidateId === profile.id
  );
  if (idx === -1) return res.status(404).json({ message: 'Application not found' });

  const removed = db.applications[idx];
  db.applications.splice(idx, 1);
  await supabaseStore.deleteApplication(removed.id);
  res.json({ message: 'Application removed from tracker' });
});

app.get('/api/jobs/:id/candidate-matches', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (!(roleMatches(profile.role, 'recruiter') || roleMatches(profile.role, 'admin'))) return res.status(403).json({ message: 'Not authorized' });

  const job = db.jobs.find((entry: any) => entry.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (roleMatches(profile.role, 'recruiter') && job.employerId !== profile.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const matches = await Promise.all(
    db.candidates.map(async (candidate: any) => {
      const candidateSkills = toSkillList(candidate.skills);
      const insights = await getMatchInsights(candidateSkills, job);
      const student = db.profiles.find((entry: any) => entry.id === candidate.userId);
      const application = db.applications.find(
        (entry: any) => entry.jobId === job.id && entry.candidateId === candidate.userId
      );

      return {
        candidateId: candidate.id,
        studentId: candidate.userId,
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        skills: candidateSkills,
        matchScore: insights.matchScore,
        matchedSkills: insights.matchedSkills,
        missingSkills: insights.missingSkills,
        explanation: insights.explanation,
        hasApplied: !!application,
        applicationStatus: application?.status || null,
        student,
      };
    })
  );

  matches.sort((left, right) => right.matchScore - left.matchScore);
  res.json({ data: matches });
});

// Courses Routes
app.get('/api/courses', (_req, res) => {
  const courses = [...db.courses].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ data: courses });
});

app.get('/api/courses/:id', (req, res) => {
  const course = db.courses.find((c: any) => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json({ data: course });
});

app.post('/api/courses', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

  const { title, description, provider, url } = req.body;
  if (!title || !description || !provider || !url) {
    return res.status(400).json({ message: 'title, description, provider and url are required' });
  }

  const course = { ...req.body, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() };
  db.courses.push(course);
  await supabaseStore.upsertCourse(course);
  res.status(201).json({ data: course });
});

app.put('/api/courses/:id', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

  const idx = db.courses.findIndex((entry: any) => entry.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Course not found' });

  db.courses[idx] = { ...db.courses[idx], ...req.body, updatedAt: new Date() };
  await supabaseStore.upsertCourse(db.courses[idx]);
  res.json({ data: db.courses[idx] });
});

app.delete('/api/courses/:id', async (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.status(401).json({ message: 'Not authenticated' });
  if (profile.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

  const idx = db.courses.findIndex((entry: any) => entry.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Course not found' });

  db.courses.splice(idx, 1);
  await supabaseStore.deleteCourse(req.params.id);
  res.json({ message: 'Course deleted' });
});

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const profile = getProfileFromAuth(req);
  if (!profile) return res.json({ data: {} });

  if (profile.role === 'student') {
    const myApps = db.applications.filter((a: any) => a.candidateId === profile.id);
    res.json({
      data: {
        myApplications: myApps.length,
        shortlisted: myApps.filter((a: any) => a.status === 'shortlisted').length,
        interviews: myApps.filter((a: any) => a.status === 'interview').length,
        pending: myApps.filter((a: any) => a.status === 'pending').length
      }
    });
  } else if (roleMatches(profile.role, 'recruiter')) {
    const myJobs = db.jobs.filter((j: any) => j.employerId === profile.id);
    const myApps = db.applications.filter((a: any) => myJobs.some((j: any) => j.id === a.jobId));
    res.json({
      data: {
        postedJobs: myJobs.length,
        totalApplications: myApps.length,
        interviewsScheduled: myApps.filter((a: any) => a.status === 'interview').length,
        shortlisted: myApps.filter((a: any) => a.status === 'shortlisted').length
      }
    });
  } else {
    res.json({
      data: {
        totalUsers: db.profiles.length,
        totalJobs: db.jobs.length,
        totalApplications: db.applications.length,
        totalCandidates: db.candidates.length,
        totalCourses: db.courses.length,
        totalResumes: db.resumes.length,
      }
    });
  }
});

app.get('/api/admin/monitoring', requireAuth, requireRoles('admin'), (req: RequestWithAuth, res) => {
  const totals = {
    totalUsers: db.profiles.length,
    totalStudents: db.profiles.filter((entry: any) => roleMatches(entry.role, 'student')).length,
    totalRecruiters: db.profiles.filter((entry: any) => roleMatches(entry.role, 'recruiter')).length,
    totalAdmins: db.profiles.filter((entry: any) => roleMatches(entry.role, 'admin')).length,
    totalResumes: db.resumes.length,
    totalJobs: db.jobs.length,
    activeJobs: db.jobs.filter((entry: any) => entry.status === 'active').length,
    closedJobs: db.jobs.filter((entry: any) => entry.status === 'closed').length,
    totalApplications: db.applications.length,
  };

  res.json({ data: totals });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend API is running',
    dataProvider: supabaseStore.isActive() ? 'supabase' : 'memory',
  });
});

const seedSupabaseFromMemory = async () => {
  if (!supabaseStore.isActive()) return;
  for (const profile of db.profiles) {
    await supabaseStore.upsertUser(profile);
  }
  for (const job of db.jobs) {
    await supabaseStore.upsertJob(job);
  }
  for (const course of db.courses) {
    await supabaseStore.upsertCourse(course);
  }
  for (const resume of db.resumes) {
    await supabaseStore.upsertResume(resume);
  }
  for (const candidate of db.candidates) {
    await supabaseStore.upsertCandidate(candidate);
  }
  for (const application of db.applications) {
    await supabaseStore.upsertApplication(application);
  }
  for (const recommendation of db.recommendations) {
    await supabaseStore.upsertRecommendation(recommendation);
  }
  for (const score of db.resumeScores) {
    await supabaseStore.upsertResumeScore(score);
  }
  for (const progress of db.skillProgress) {
    await supabaseStore.upsertSkillProgress(progress);
  }
  for (const plan of db.learningPlans) {
    await supabaseStore.upsertLearningPlan(plan);
  }
  for (const session of db.mockInterviewSessions) {
    await supabaseStore.upsertMockInterviewSession(session);
  }
  for (const saved of db.savedJobs) {
    await supabaseStore.upsertSavedJob(saved);
  }
  for (const preference of db.careerPreferences) {
    await supabaseStore.upsertCareerPreference(preference);
  }
};

const startServer = async () => {
  const bootstrap = await supabaseStore.bootstrap(db);
  if (bootstrap.mode === 'supabase' && bootstrap.loaded) {
    console.log('Loaded runtime data from Supabase.');
  } else if (supabaseStore.isActive()) {
    console.log('Supabase mode enabled, using in-memory defaults and seeding Supabase.');
    await seedSupabaseFromMemory();
  } else {
    console.log('Using in-memory data provider.');
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

void startServer();

export default app;
