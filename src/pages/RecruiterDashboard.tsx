import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Search, Users, Briefcase, MapPin, Mail, Phone, Plus } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  college: string;
  skills: string[];
  matchScore: number;
  status: string;
  experience: string;
  location: string;
}

interface Job {
  id: string;
  title: string;
  applicants: number;
  views: number;
  status: string;
}

const INDIAN_CANDIDATES: Candidate[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 9876543210', role: 'SDE', college: 'IIT Bombay', skills: ['Python', 'DSA', 'ML'], matchScore: 94, status: 'new', experience: 'Fresher', location: 'Mumbai' },
  { id: '2', name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91 9876543211', role: 'Frontend Developer', college: 'NIT Trichy', skills: ['React', 'TypeScript', 'CSS'], matchScore: 89, status: 'screening', experience: '1 year', location: 'Chennai' },
  { id: '3', name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91 9876543212', role: 'Backend Developer', college: 'IIIT Bangalore', skills: ['Java', 'Spring', 'PostgreSQL'], matchScore: 91, status: 'interview', experience: '2 years', location: 'Bangalore' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha.reddy@email.com', phone: '+91 9876543213', role: 'Data Analyst', college: 'IIT Delhi', skills: ['Python', 'SQL', 'Tableau'], matchScore: 87, status: 'new', experience: 'Fresher', location: 'Delhi' },
  { id: '5', name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 9876543214', role: 'Full Stack Developer', college: 'BITS Pilani', skills: ['Node.js', 'React', 'MongoDB'], matchScore: 92, status: 'hired', experience: '3 years', location: 'Hyderabad' },
];

const MY_JOBS: Job[] = [
  { id: '1', title: 'SDE I', applicants: 45, views: 234, status: 'active' },
  { id: '2', title: 'Frontend Developer', applicants: 28, views: 156, status: 'active' },
  { id: '3', title: 'Backend Developer', applicants: 32, views: 189, status: 'closed' },
];

export function RecruiterDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = INDIAN_CANDIDATES.filter((c: Candidate) => {
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-500/20 text-gray-400';
      case 'screening': return 'bg-gray-500/20 text-gray-400';
      case 'interview': return 'bg-gray-500/20 text-gray-400';
      case 'hired': return 'bg-white/20 text-white';
      case 'rejected': return 'bg-gray-700/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div>
      <Header title={`Hi, ${user?.name?.split(' ')[0] || 'Recruiter'}`} />
      
      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-500">Applicants</p>
            <p className="text-lg sm:text-xl font-bold text-white">{INDIAN_CANDIDATES.length}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-500">Active Jobs</p>
            <p className="text-lg sm:text-xl font-bold text-white">{MY_JOBS.filter(j => j.status === 'active').length}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-500">Hired</p>
            <p className="text-lg sm:text-xl font-bold text-white">{INDIAN_CANDIDATES.filter(c => c.status === 'hired').length}</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-white" />
              <h2 className="font-medium text-white text-sm">Job Postings</h2>
            </div>
            <button className="bg-white text-black text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1">
              <Plus className="w-3 h-3" /> Post
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MY_JOBS.map((job: Job) => (
              <div key={job.id} className="p-3 bg-[#111] rounded-lg">
                <h3 className="font-medium text-white text-sm">{job.title}</h3>
                <p className="text-xs text-gray-500">{job.applicants} applicants</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates..."
            className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white"
          />
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-white" />
            <h2 className="font-medium text-white text-sm">Candidates</h2>
            <span className="text-xs text-gray-500 ml-auto">{filteredCandidates.length}</span>
          </div>
          
          <div className="space-y-2">
            {filteredCandidates.map((candidate: Candidate) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-[#111] rounded-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center text-black text-sm font-bold shrink-0">
                      {candidate.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-white text-sm">{candidate.name}</h3>
                      <p className="text-xs text-gray-500">{candidate.role} • {candidate.experience}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {candidate.college}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.skills.map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 bg-[#222] text-gray-400 text-[10px] rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center gap-2 sm:items-end">
                    <span className={`px-2 py-0.5 text-[10px] rounded capitalize ${getStatusClasses(candidate.status)}`}>
                      {candidate.status}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] bg-white text-black rounded font-medium">
                      {candidate.matchScore}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-3 pt-3 border-t border-[#222]">
                  <button className="flex items-center gap-1 text-xs text-white hover:text-gray-300">
                    <Mail className="w-3 h-3" /> Email
                  </button>
                  <button className="flex items-center gap-1 text-xs text-white hover:text-gray-300">
                    <Phone className="w-3 h-3" /> Call
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
