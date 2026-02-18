import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Users, Briefcase, BookOpen, BarChart3, TrendingUp, MapPin, Shield } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  location: string;
  status: string;
  joinedAt: string;
}

interface Stats {
  totalUsers: number;
  students: number;
  recruiters: number;
  jobs: number;
  applications: number;
  courses: number;
}

const INDIAN_USERS: User[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@iitb.ac.in', role: 'student', college: 'IIT Bombay', location: 'Mumbai', status: 'active', joinedAt: '2024-01-15' },
  { id: '2', name: 'Priya Patel', email: 'priya@nitt.edu', role: 'student', college: 'NIT Trichy', location: 'Chennai', status: 'active', joinedAt: '2024-01-18' },
  { id: '3', name: 'TechCorp India', email: 'hr@techcorp.in', role: 'recruiter', location: 'Bangalore', status: 'active', joinedAt: '2024-01-10' },
  { id: '4', name: 'Amit Kumar', email: 'amit@iiitb.ac.in', role: 'student', college: 'IIIT Bangalore', location: 'Bangalore', status: 'active', joinedAt: '2024-01-20' },
  { id: '5', name: 'Flipkart', email: 'careers@flipkart.com', role: 'recruiter', location: 'Bangalore', status: 'active', joinedAt: '2024-01-05' },
  { id: '6', name: 'Sneha Reddy', email: 'sneha@iitd.ac.in', role: 'student', college: 'IIT Delhi', location: 'Delhi', status: 'active', joinedAt: '2024-01-22' },
];

const STATS: Stats = {
  totalUsers: 1250,
  students: 1100,
  recruiters: 150,
  jobs: 85,
  applications: 3450,
  courses: 42,
};

const TOP_COLLEGES = [
  { name: 'IIT Bombay', users: 120 },
  { name: 'IIT Delhi', users: 98 },
  { name: 'NIT Trichy', users: 85 },
  { name: 'BITS Pilani', users: 72 },
  { name: 'IIIT Bangalore', users: 65 },
];

const TOP_LOCATIONS = [
  { name: 'Bangalore', count: 450 },
  { name: 'Delhi NCR', count: 320 },
  { name: 'Mumbai', count: 280 },
  { name: 'Chennai', count: 180 },
  { name: 'Hyderabad', count: 150 },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');

  return (
    <div className="min-h-screen">
      <Header title="Admin Dashboard" />
      
      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
          {(['overview', 'users', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-[#111] text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Users</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{STATS.totalUsers}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Jobs</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{STATS.jobs}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Courses</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{STATS.courses}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Applications</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{STATS.applications}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Students</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{STATS.students}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Recruiters</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{STATS.recruiters}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <h3 className="font-medium text-white text-sm mb-3">Top Colleges</h3>
                <div className="space-y-2">
                  {TOP_COLLEGES.map((college, idx) => (
                    <div key={college.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{idx + 1}</span>
                        <span className="text-xs sm:text-sm text-white">{college.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{college.users} users</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
                <h3 className="font-medium text-white text-sm mb-3">Top Locations</h3>
                <div className="space-y-2">
                  {TOP_LOCATIONS.map((loc) => (
                    <div key={loc.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-xs sm:text-sm text-white">{loc.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{loc.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white text-sm">Recent Users</h3>
              <span className="text-xs text-gray-500">{INDIAN_USERS.length}</span>
            </div>
            <div className="space-y-2">
              {INDIAN_USERS.map((user) => (
                <div key={user.id} className="p-3 bg-[#111] rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm text-white font-medium">{user.name}</h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.college && <p className="text-[10px] text-gray-500">{user.college}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-11 sm:ml-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${user.role === 'recruiter' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                        {user.role}
                      </span>
                      <span className="text-[10px] text-gray-500">{user.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
            <h3 className="font-medium text-white text-sm mb-4">Platform Analytics</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#111] rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Monthly Active Users</p>
                <p className="text-2xl font-bold text-white">892</p>
                <p className="text-xs text-green-500 mt-1">+12% from last month</p>
              </div>
              <div className="p-4 bg-[#111] rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Job Applications</p>
                <p className="text-2xl font-bold text-white">3,450</p>
                <p className="text-xs text-green-500 mt-1">+8% from last month</p>
              </div>
              <div className="p-4 bg-[#111] rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Successful Placements</p>
                <p className="text-2xl font-bold text-white">156</p>
                <p className="text-xs text-green-500 mt-1">+15% from last month</p>
              </div>
              <div className="p-4 bg-[#111] rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Course Completions</p>
                <p className="text-2xl font-bold text-white">2,340</p>
                <p className="text-xs text-green-500 mt-1">+20% from last month</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
