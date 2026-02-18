import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/hooks/useAuth';
import { useCareerChatbot } from '@/hooks/useChatbot';
import { Header } from '@/components/layout/Header';
import { TargetRoleSelector } from '@/components/profile/TargetRoleSelector';
import { aiService } from '@/lib/api';
import { toast } from 'sonner';
import type { TargetRole, ResumeData, AppliedJob, SavedJob, CourseResource } from '@/types';
import { 
  Upload, Briefcase, GraduationCap, Target, 
  Bot, Send, X, 
  CheckCircle, Loader2, Sparkles, ExternalLink, Play, Youtube, FileText, Bookmark, Search, Filter
} from 'lucide-react';

const INDIAN_JOBS = [
  { title: 'SDE I', company: 'Google India', location: 'Bangalore/Hyderabad', salary: '₹25-45 LPA', skills: ['DSA', 'Python', 'System Design'], posted: '2h ago', url: 'https://careers.google.com' },
  { title: 'Software Engineer', company: 'Amazon', location: 'Bangalore', salary: '₹20-40 LPA', skills: ['Java', 'DSA', 'AWS'], posted: '5h ago', url: 'https://amazon.jobs' },
  { title: 'Frontend Developer', company: 'Flipkart', location: 'Bangalore', salary: '₹15-28 LPA', skills: ['React', 'TypeScript', 'CSS'], posted: '1d ago', url: 'https://flipkartcareers.com' },
  { title: 'Backend Developer', company: 'Cred', location: 'Bangalore', salary: '₹22-38 LPA', skills: ['Go', 'PostgreSQL', 'Redis'], posted: '3h ago', url: 'https://cred.club/careers' },
  { title: 'Data Analyst', company: 'Droom', location: 'Gurgaon', salary: '₹8-18 LPA', skills: ['Python', 'SQL', 'Tableau'], posted: '6h ago', url: 'https://droom.in/careers' },
  { title: 'SDE Intern', company: 'Microsoft', location: 'Bangalore/Hyderabad', salary: '₹1-1.5 L/month', skills: ['DSA', 'C++', 'Python'], posted: '12h ago', url: 'https://careers.microsoft.com' },
  { title: 'ML Engineer', company: 'Uber', location: 'Bangalore', salary: '₹30-55 LPA', skills: ['Python', 'ML', 'Spark'], posted: '1d ago', url: 'https://uber.careers' },
  { title: 'Full Stack Developer', company: 'Paytm', location: 'Noida', salary: '₹12-25 LPA', skills: ['React', 'Node.js', 'MongoDB'], posted: '8h ago', url: 'https://paytm.com/careers' },
];

const COURSES: CourseResource[] = [
  // YouTube Channels & Playlists
  { id: 'y1', title: 'DSA for Placements - Complete Course', provider: 'Apna College', type: 'youtube', url: 'https://youtube.com/playlist?list=PLh5p_2jK9jT3wBZ8c7v7vq7w8', duration: '25 hours', rating: 4.8 },
  { id: 'y2', title: 'Full Stack Web Development', provider: 'CodeWithHarry', type: 'youtube', url: 'https://youtube.com/playlist?list=PLu0W_9lI9ah7eT1Ea3D1T', duration: '40 hours', rating: 4.7 },
  { id: 'y3', title: 'Python Tutorial for Beginners', provider: 'Telusko', type: 'youtube', url: 'https://youtube.com/playlist?list=PLl_O5n3C3x0o4pL', duration: '15 hours', rating: 4.6 },
  { id: 'y4', title: 'React JS Complete Tutorial', provider: 'Thapa Technical', type: 'youtube', url: 'https://youtube.com/playlist?list=PLl_Hm2', duration: '20 hours', rating: 4.8 },
  { id: 'y5', title: 'Machine Learning for Beginners', provider: ' Krish Naik', type: 'youtube', url: 'https://youtube.com/playlist?list=PLzEwt', duration: '30 hours', rating: 4.7 },
  { id: 'y6', title: 'SQL & Database Tutorial', provider: 'TechTFQ', type: 'youtube', url: 'https://youtube.com/playlist?list=PLbtx', duration: '8 hours', rating: 4.5 },
  { id: 'y7', title: 'System Design Interview', provider: 'Gaurav Sen', type: 'youtube', url: 'https://youtube.com/playlist?list=PLMCXHdwGn6H_', duration: '12 hours', rating: 4.9 },
  { id: 'y8', title: 'C++ DSA Course', provider: 'Love Babbar', type: 'youtube', url: 'https://youtube.com/playlist?list=PLKNf', duration: '35 hours', rating: 4.8 },
  
  // Indian Platforms
  { id: 'c1', title: 'DSA Self Paced', provider: 'GeeksforGeeks', type: 'course', url: 'https://practice.geeksforgeeks.org/courses', duration: 'Self Paced', rating: 4.6, price: '₹999/year' },
  { id: 'c2', title: 'Full Stack Development', provider: 'Scaler Academy', type: 'course', url: 'https://www.scaler.com/full-stack/', duration: '6 months', rating: 4.7, price: '₹3-4 L' },
  { id: 'c3', title: 'Data Science Masters', provider: 'Newton School', type: 'course', url: 'https://www.newtonschool.co/', duration: '6 months', rating: 4.5, price: '₹2.5 L' },
  { id: 'c4', title: 'DSA & System Design', provider: 'Coding Ninjas', type: 'course', url: 'https://www.codingninjas.com/', duration: '4 months', rating: 4.6, price: '₹2,999' },
  { id: 'c5', title: 'Interview Preparation', provider: 'Preplaced', type: 'course', url: 'https://preplaced.io/', duration: 'Self Paced', rating: 4.4, price: '₹499/month' },
  { id: 'c6', title: 'Python & ML Bootcamp', provider: 'iNeuron', type: 'course', url: 'https://ineuron.ai/', duration: '8 months', rating: 4.7, price: '₹12,999' },
  
  // Practice Platforms
  { id: 'p1', title: 'LeetCode Problems (Top 150)', provider: 'LeetCode', type: 'practice', url: 'https://leetcode.com/problemset/', rating: 4.9 },
  { id: 'p2', title: 'Codeforces Practice', provider: 'Codeforces', type: 'practice', url: 'https://codeforces.com/', rating: 4.8 },
  { id: 'p3', title: 'HackerRank Practice', provider: 'HackerRank', type: 'practice', url: 'https://www.hackerrank.com/', rating: 4.6 },
  { id: 'p4', title: 'CodeChef Practice', provider: 'CodeChef', type: 'practice', url: 'https://www.codechef.com/', rating: 4.5 },
  { id: 'p5', title: 'Striver SDE Sheet', provider: 'TakeUForward', type: 'practice', url: 'https://takeuforward.org/interviews/striver-sde-sheet-problem-list/', rating: 4.9 },
  { id: 'p6', title: '450 DSA Questions', provider: 'Love Babbar', type: 'practice', url: 'https://450dsa.com/', rating: 4.8 },
  
  // Books
  { id: 'b1', title: 'Cracking the Coding Interview', provider: 'Amazon', type: 'book', url: 'https://amzn.in/dp/0984782850', price: '₹450' },
  { id: 'b2', title: 'DSA through C', provider: 'Amazon', type: 'book', url: 'https://amzn.in/dp/8175151674', price: '₹350' },
  { id: 'b3', title: 'Clean Code', provider: 'Amazon', type: 'book', url: 'https://amzn.in/dp/0132350884', price: '₹500' },
  { id: 'b4', title: 'System Design Interview', provider: 'Amazon', type: 'book', url: 'https://amzn.in/dp/B08B3FW5RX', price: '₹400' },
];

const STORAGE_KEY_APPLIED = 'esencelab_applied_jobs';
const STORAGE_KEY_SAVED = 'esencelab_saved_jobs';

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export function StudentDashboard() {
  const { user } = useAuth();
  const { messages, isLoading: chatLoading, sendMessage } = useCareerChatbot();
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedTargetRole, setSelectedTargetRole] = useState<TargetRole | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>(() => 
    loadFromStorage(STORAGE_KEY_APPLIED, [])
  );
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(() => 
    loadFromStorage(STORAGE_KEY_SAVED, [])
  );
  const [jobSearch, setJobSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const locations = ['all', ...new Set(INDIAN_JOBS.map(j => j.location))];
  
  const filteredJobs = INDIAN_JOBS.filter(job => {
    const matchesSearch = jobSearch === '' || 
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(jobSearch.toLowerCase()));
    const matchesLocation = locationFilter === 'all' || job.location.includes(locationFilter);
    return matchesSearch && matchesLocation;
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setIsParsing(true);
      const file = acceptedFiles[0];
      
      try {
        let result;
        
        if (file.name.endsWith('.pdf')) {
          result = await aiService.parseResume(file);
        } else {
          const reader = new FileReader();
          const text = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsText(file);
          });
          result = await aiService.parseResumeText(text);
        }
        
        const parsed: ResumeData = {
          rawText: result.summary || '',
          extractedSkills: result.skills || [],
          education: result.education || [],
          experience: result.experience || [],
          projects: [],
          parsedAt: new Date().toISOString(),
        };
        
        setResumeData(parsed);
        toast.success(`Resume parsed with AI! Found ${parsed.extractedSkills.length} skills`);
        
        if (result.suggested_roles?.length > 0) {
          toast.info(`Suggested roles: ${result.suggested_roles.slice(0, 3).join(', ')}`);
        }
      } catch (error) {
        console.error('Resume parsing error:', error);
        toast.error('Failed to parse resume. Make sure AI service is running on port 8000.');
      } finally {
        setIsParsing(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleApplyJob = (job: typeof INDIAN_JOBS[0]) => {
    const existing = appliedJobs.find(j => j.id === `${job.company}-${job.title}`);
    if (existing) {
      toast.error('Already applied to this job');
      return;
    }
    
    const newApplication: AppliedJob = {
      id: `${job.company}-${job.title}`,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      appliedAt: new Date().toISOString(),
      status: 'applied',
      url: job.url,
    };
    
    const updated = [newApplication, ...appliedJobs];
    setAppliedJobs(updated);
    localStorage.setItem(STORAGE_KEY_APPLIED, JSON.stringify(updated));
    toast.success(`Applied to ${job.title} at ${job.company}!`);
    window.open(job.url, '_blank');
  };

  const handleSaveJob = (job: typeof INDIAN_JOBS[0]) => {
    const existing = savedJobs.find(j => j.id === `${job.company}-${job.title}`);
    if (existing) {
      toast.error('Job already saved');
      return;
    }
    
    const newSaved: SavedJob = {
      id: `${job.company}-${job.title}`,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      skills: job.skills,
      savedAt: new Date().toISOString(),
      url: job.url,
    };
    
    const updated = [newSaved, ...savedJobs];
    setSavedJobs(updated);
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated));
    toast.success('Job saved!');
  };

  const handleRemoveSaved = (id: string) => {
    const updated = savedJobs.filter(j => j.id !== id);
    setSavedJobs(updated);
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated));
    toast.success('Job removed from saved');
  };

  const getStatusColor = (status: AppliedJob['status']) => {
    switch (status) {
      case 'applied': return 'text-blue-400';
      case 'under_review': return 'text-yellow-400';
      case 'interview': return 'text-purple-400';
      case 'offer': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: AppliedJob['status']) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'under_review': return 'Under Review';
      case 'interview': return 'Interview';
      case 'offer': return 'Offer!';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleOpenResource = (resource: CourseResource) => {
    window.open(resource.url, '_blank');
  };

  const youtubeCourses = COURSES.filter(c => c.type === 'youtube');
  const platformCourses = COURSES.filter(c => c.type === 'course');
  const practiceResources = COURSES.filter(c => c.type === 'practice');
  const books = COURSES.filter(c => c.type === 'book');

  return (
    <div>
      <Header 
        title={`Namaste, ${user?.name?.split(' ')[0] || 'Student'}`} 
        subtitle="Your career journey starts here"
      />
      
      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-white" />
              <h2 className="font-medium text-white text-sm">AI Resume Parser</h2>
              <Sparkles className="w-3 h-3 text-gray-500" />
            </div>
            <div 
              {...getRootProps()}
              className={`p-3 sm:p-4 border border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-white bg-[#111]' 
                  : 'border-[#333] hover:border-white'
              }`}
            >
              {isParsing ? (
                <div className="text-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Parsing...</p>
                </div>
              ) : resumeData ? (
                <div className="text-center">
                  <CheckCircle className="w-5 h-5 text-white mx-auto mb-1" />
                  <p className="text-xs text-white font-medium">Parsed!</p>
                  <p className="text-xs text-gray-500">{resumeData.extractedSkills.length} skills</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-white">Drop resume PDF</p>
                </div>
              )}
              <input {...getInputProps()} />
            </div>
            {resumeData?.extractedSkills && (
              <div className="flex flex-wrap gap-1 mt-2">
                {resumeData.extractedSkills.slice(0, 5).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-white text-black text-[10px] sm:text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-white" />
              <h2 className="font-medium text-white text-sm">Target Role</h2>
            </div>
            <TargetRoleSelector 
              selectedRole={selectedTargetRole} 
              onSelect={(role) => {
                setSelectedTargetRole(role);
                toast.success(`Target set to ${role.name}`);
              }}
            />
          </div>
        </div>

        {(appliedJobs.length > 0 || savedJobs.length > 0) && (
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {appliedJobs.length > 0 && (
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-white" />
                  <h2 className="font-medium text-white text-sm">My Applications</h2>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#222] text-gray-400 rounded">{appliedJobs.length}</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {appliedJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 bg-[#111] rounded">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-white font-medium truncate">{job.title}</p>
                        <p className="text-[10px] text-gray-500">{job.company}</p>
                      </div>
                      <span className={`text-[10px] font-medium ${getStatusColor(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {savedJobs.length > 0 && (
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark className="w-4 h-4 text-white" />
                  <h2 className="font-medium text-white text-sm">Saved Jobs</h2>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#222] text-gray-400 rounded">{savedJobs.length}</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 bg-[#111] rounded">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-white font-medium truncate">{job.title}</p>
                        <p className="text-[10px] text-gray-500">{job.company} • {job.salary}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSaved(job.id)}
                        className="text-[10px] text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-white" />
              <h2 className="font-medium text-white text-sm">Jobs in India</h2>
              <span className="text-[10px] sm:text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded ${showFilters ? 'bg-[#222]' : 'hover:bg-[#111]'}`}
            >
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Search jobs, companies, skills..."
                className="w-full bg-[#111] border border-[#222] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500"
              />
            </div>
            {showFilters && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc} className="bg-[#111]">
                    {loc === 'all' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredJobs.slice(0, 6).map((job, idx) => (
              <div key={idx} className="p-3 bg-[#111] rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm truncate">{job.title}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">{job.company} • {job.location}</p>
                    <p className="text-xs text-white font-medium mt-1">{job.salary}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.slice(0, 2).map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-[#222] text-gray-400 text-[10px] rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 self-start sm:self-auto">
                    <button
                      onClick={() => handleApplyJob(job)}
                      className="bg-white text-black text-xs px-3 py-1.5 rounded font-medium hover:bg-gray-200"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => handleSaveJob(job)}
                      className="border border-[#333] text-white text-xs px-2 py-1.5 rounded hover:bg-[#222]"
                    >
                      <Bookmark className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="w-4 h-4 text-red-500" />
            <h2 className="font-medium text-white text-sm">Free YouTube Courses</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {youtubeCourses.slice(0, 8).map((course) => (
              <button
                key={course.id}
                onClick={() => handleOpenResource(course)}
                className="p-2 sm:p-3 bg-[#111] rounded-lg hover:bg-[#222] transition-colors text-left"
              >
                <div className="flex items-center gap-1 mb-1">
                  <Play className="w-3 h-3 text-red-500 fill-red-500" />
                  <span className="text-[10px] text-red-400">YouTube</span>
                </div>
                <h3 className="font-medium text-white text-[10px] sm:text-xs mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-[10px] text-gray-500">{course.provider}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-white" />
            <h2 className="font-medium text-white text-sm">Paid Courses (Indian Platforms)</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {platformCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleOpenResource(course)}
                className="p-2 sm:p-3 bg-[#111] rounded-lg hover:bg-[#222] transition-colors text-left"
              >
                <h3 className="font-medium text-white text-[10px] sm:text-xs mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-[10px] text-gray-500">{course.provider}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] sm:text-xs text-white">{course.price}</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-white" />
            <h2 className="font-medium text-white text-sm">Practice Platforms</h2>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {practiceResources.map((resource) => (
              <button
                key={resource.id}
                onClick={() => handleOpenResource(resource)}
                className="p-2 sm:p-3 bg-[#111] rounded-lg hover:bg-[#222] transition-colors text-center"
              >
                <h3 className="font-medium text-white text-[10px] sm:text-xs mb-1">{resource.provider}</h3>
                <p className="text-[10px] text-gray-500 line-clamp-2">{resource.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-white" />
            <h2 className="font-medium text-white text-sm">Best Books for Placements</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => handleOpenResource(book)}
                className="p-2 sm:p-3 bg-[#111] rounded-lg hover:bg-[#222] transition-colors text-left"
              >
                <h3 className="font-medium text-white text-[10px] sm:text-xs mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">{book.price}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white text-black px-3 py-2 sm:px-4 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors z-50"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Career AI</span>
        </button>

        {showChat && (
          <div className="fixed bottom-16 right-3 sm:bottom-20 sm:right-6 left-3 sm:left-auto sm:w-80 bg-[#0a0a0a] border border-[#222] rounded-lg shadow-xl z-50">
            <div className="flex items-center justify-between p-3 border-b border-[#222]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-white" />
                <span className="font-medium text-white text-sm">Career Assistant</span>
              </div>
              <button onClick={() => setShowChat(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="h-48 sm:h-64 overflow-y-auto p-3 space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-white text-black' : 'bg-[#222] text-white'}`}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-[#222] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask about careers..."
                className="flex-1 bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
              />
              <button
                onClick={handleSendChat}
                disabled={chatLoading}
                className="bg-white text-black px-3 py-2 rounded-lg text-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
