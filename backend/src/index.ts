import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';

// In-memory data store for demo
const db = {
  profiles: [
    { id: '1', email: 'student@esencelab.com', name: 'Sajad', role: 'student', avatarUrl: null },
    { id: '2', email: 'recruiter@esencelab.com', name: 'Rajesh Kumar', role: 'employer', avatarUrl: null },
    { id: '3', email: 'admin@esencelab.com', name: 'Admin User', role: 'admin', avatarUrl: null },
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
  applications: [],
  courses: [
    { id: '1', title: 'Complete Python Bootcamp', description: 'Learn Python from scratch', provider: 'Udemy', url: 'https://udemy.com', skills: ['Python', 'Django'], duration: '22 hours', level: 'beginner', rating: 4.5 },
    { id: '2', title: 'React - The Complete Guide', description: 'Master React.js', provider: 'Udemy', url: 'https://udemy.com', skills: ['React', 'Redux'], duration: '40 hours', level: 'intermediate', rating: 4.6 },
    { id: '3', title: 'Machine Learning A-Z', description: 'Learn ML Algorithms', provider: 'Udemy', url: 'https://udemy.com', skills: ['Python', 'Machine Learning'], duration: '44 hours', level: 'intermediate', rating: 4.5 },
    { id: '4', title: 'Node.js Developer Course', description: 'Build real-world apps', provider: 'Udemy', url: 'https://udemy.com', skills: ['Node.js', 'Express'], duration: '37 hours', level: 'intermediate', rating: 4.7 },
  ],
  resumes: [] as any[],
};

// Simple JWT-like token
const createToken = (userId: string) => Buffer.from(JSON.stringify({ userId })).toString('base64');
const verifyToken = (token: string) => {
  try { return JSON.parse(Buffer.from(token, 'base64').toString()); } catch { return null; }
};

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role } = req.body;
  const existing = db.profiles.find(p => p.email === email);
  if (existing) return res.status(400).json({ message: 'Email already registered' });
  
  const profile = { id: uuidv4(), email, name, role: role || 'student', avatarUrl: null };
  db.profiles.push(profile);
  
  const token = createToken(profile.id);
  res.status(201).json({ token, user: profile });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const profile = db.profiles.find(p => p.email === email);
  if (!profile) return res.status(401).json({ message: 'Invalid credentials' });
  
  const token = createToken(profile.id);
  res.json({ token, user: { id: profile.id, email: profile.email, name: profile.name, role: profile.role, avatarUrl: profile.avatarUrl } });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid token' });
  
  const profile = db.profiles.find(p => p.id === decoded.userId);
  if (!profile) return res.status(401).json({ message: 'User not found' });
  
  res.json({ user: profile });
});

// Resume Upload Route
app.post('/api/resume/upload', upload.single('file'), async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token || '');
  if (!decoded) return res.status(401).json({ message: 'Not authenticated' });
  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    // Send to AI service for parsing
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path) as any, req.file.originalname);
    
    let parsedData = { name: null, email: null, phone: null, summary: null, education: [], experience: [], skills: [] };
    let skills: string[] = [];
    
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/parse-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      parsedData = aiResponse.data.parsedData;
      skills = aiResponse.data.skills || [];
    } catch (aiError) {
      console.log('AI service unavailable, using fallback parsing');
      // Fallback: just store file info
    }
    
    // Save resume
    const resume = {
      id: uuidv4(),
      userId: decoded.userId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      parsedData,
      skills,
      createdAt: new Date(),
    };
    
    db.resumes.push(resume);
    
    // Create/update candidate profile
    const profile = db.profiles.find(p => p.id === decoded.userId);
    let candidate = db.candidates.find(c => c.userId === decoded.userId);
    
    if (candidate) {
      candidate.skills = JSON.stringify(skills);
      candidate.parsedData = parsedData;
    } else {
      candidate = {
        id: uuidv4(),
        userId: decoded.userId,
        name: profile?.name || 'Unknown',
        email: profile?.email || '',
        role: 'Developer',
        skills: JSON.stringify(skills),
        education: JSON.stringify(parsedData.education || []),
        experience: JSON.stringify(parsedData.experience || []),
        matchScore: 0,
        status: 'new',
        createdAt: new Date(),
      };
      db.candidates.push(candidate);
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.status(201).json({ data: resume });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload resume' });
  }
});

// Get my resume
app.get('/api/resume', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token || '');
  if (!decoded) return res.status(401).json({ message: 'Not authenticated' });
  
  const resume = db.resumes.find(r => r.userId === decoded.userId);
  if (!resume) return res.status(404).json({ message: 'No resume found' });
  
  res.json({ data: resume });
});

// Delete resume
app.delete('/api/resume/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token || '');
  if (!decoded) return res.status(401).json({ message: 'Not authenticated' });
  
  const idx = db.resumes.findIndex(r => r.id === req.params.id && r.userId === decoded.userId);
  if (idx === -1) return res.status(404).json({ message: 'Resume not found' });
  
  db.resumes.splice(idx, 1);
  res.json({ message: 'Resume deleted' });
});

// Jobs Routes
app.get('/api/jobs', (req, res) => {
  const { search, jobType, location, status } = req.query;
  let jobs = [...db.jobs];
  
  if (search) {
    const s = (search as string).toLowerCase();
    jobs = jobs.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s));
  }
  if (jobType) jobs = jobs.filter(j => j.jobType === jobType);
  if (location) jobs = jobs.filter(j => j.location.toLowerCase().includes((location as string).toLowerCase()));
  if (status) jobs = jobs.filter(j => j.status === status);
  else jobs = jobs.filter(j => j.status === 'active');
  
  res.json({ data: { jobs } });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json({ data: job });
});

app.post('/api/jobs', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token || '');
  if (!decoded) return res.status(401).json({ message: 'Not authenticated' });
  
  const profile = db.profiles.find(p => p.id === decoded.userId);
  if (!profile || !['employer', 'admin'].includes(profile.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const job = { ...req.body, id: uuidv4(), employerId: decoded.userId, status: 'active', createdAt: new Date() };
  db.jobs.push(job);
  res.status(201).json({ data: job });
});

app.put('/api/jobs/:id', (req, res) => {
  const idx = db.jobs.findIndex(j => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Job not found' });
  db.jobs[idx] = { ...db.jobs[idx], ...req.body };
  res.json({ data: db.jobs[idx] });
});

app.delete('/api/jobs/:id', (req, res) => {
  const idx = db.jobs.findIndex(j => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Job not found' });
  db.jobs.splice(idx, 1);
  res.json({ message: 'Job deleted' });
});

// Candidates Routes
app.get('/api/candidates', (req, res) => {
  res.json({ data: db.candidates });
});

app.get('/api/candidates/:id', (req, res) => {
  const candidate = db.candidates.find(c => c.id === req.params.id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  res.json({ data: candidate });
});

app.post('/api/candidates', (req, res) => {
  const candidate = { ...req.body, id: uuidv4(), status: 'new', matchScore: 0, createdAt: new Date() };
  db.candidates.push(candidate);
  res.status(201).json({ data: candidate });
});

app.put('/api/candidates/:id', (req, res) => {
  const idx = db.candidates.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Candidate not found' });
  db.candidates[idx] = { ...db.candidates[idx], ...req.body };
  res.json({ data: db.candidates[idx] });
});

// Applications Routes
app.get('/api/applications', (req, res) => {
  res.json({ data: db.applications });
});

app.get('/api/applications/my', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token || '');
  if (!decoded) return res.status(401).json({ message: 'Not authenticated' });
  
  const myApps = db.applications.filter(a => a.candidateId === decoded.userId);
  res.json({ data: myApps });
});

app.post('/api/applications', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token || '');
  if (!decoded) return res.status(401).json({ message: 'Not authenticated' });
  
  const { jobId } = req.body;
  const existing = db.applications.find(a => a.jobId === jobId && a.candidateId === decoded.userId);
  if (existing) return res.status(400).json({ message: 'Already applied' });
  
  const job = db.jobs.find(j => j.id === jobId);
  const candidate = db.candidates.find(c => c.userId === decoded.userId);
  
  // Calculate match score based on skills
  let matchScore = 0;
  if (job && candidate) {
    const jobSkills = job.skills.map((s: string) => s.toLowerCase());
    const candidateSkills = JSON.parse(candidate.skills as string || '[]').map((s: string) => s.toLowerCase());
    const matched = jobSkills.filter((s: string) => candidateSkills.includes(s));
    matchScore = Math.round((matched.length / jobSkills.length) * 100);
  }
  
  const application = { id: uuidv4(), jobId, candidateId: decoded.userId, status: 'pending', matchScore, appliedAt: new Date() };
  db.applications.push(application);
  res.status(201).json({ data: application });
});

app.put('/api/applications/:id/status', (req, res) => {
  const idx = db.applications.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Application not found' });
  db.applications[idx] = { ...db.applications[idx], ...req.body };
  res.json({ data: db.applications[idx] });
});

// Courses Routes
app.get('/api/courses', (req, res) => {
  res.json({ data: db.courses });
});

app.get('/api/courses/:id', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json({ data: course });
});

app.post('/api/courses', (req, res) => {
  const course = { ...req.body, id: uuidv4(), createdAt: new Date() };
  db.courses.push(course);
  res.status(201).json({ data: course });
});

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token || '');
  
  if (!decoded) return res.json({ data: {} });
  
  const profile = db.profiles.find(p => p.id === decoded.userId);
  if (!profile) return res.json({ data: {} });
  
  if (profile.role === 'student') {
    const myApps = db.applications.filter(a => a.candidateId === profile.id);
    res.json({ data: { 
      myApplications: myApps.length,
      shortlisted: myApps.filter(a => a.status === 'shortlisted').length,
      interviews: myApps.filter(a => a.status === 'interview').length,
      pending: myApps.filter(a => a.status === 'pending').length
    }});
  } else if (profile.role === 'employer') {
    const myJobs = db.jobs.filter(j => j.employerId === profile.id);
    const myApps = db.applications.filter(a => myJobs.some(j => j.id === a.jobId));
    res.json({ data: {
      postedJobs: myJobs.length,
      totalApplications: myApps.length,
      interviewsScheduled: myApps.filter(a => a.status === 'interview').length,
      shortlisted: myApps.filter(a => a.status === 'shortlisted').length
    }});
  } else {
    res.json({ data: {
      totalUsers: db.profiles.length,
      totalJobs: db.jobs.length,
      totalApplications: db.applications.length,
      totalCandidates: db.candidates.length,
      totalCourses: db.courses.length
    }});
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
