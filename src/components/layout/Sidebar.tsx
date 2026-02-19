import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BookOpen, 
  LogOut,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
];

const recruiterLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'My Jobs' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
];

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs & Courses' },
  { to: '/analytics', icon: BarChart3, label: 'Usage' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const links = user?.role === 'student' 
    ? studentLinks 
    : user?.role === 'admin' 
      ? adminLinks 
      : recruiterLinks;

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/80 z-40"
          />
        )}
      </AnimatePresence>

      <aside className="fixed left-0 top-0 h-screen w-[220px] bg-black border-r border-[#222] z-50 flex flex-col transform transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0"
        style={{ willChange: 'transform' }}
      >
        <div className="p-4 border-b border-[#222]">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-bold text-white">Esencelab</span>
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-[#111]'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#222]">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">@{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-[#111] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 h-screen w-[220px] bg-black border-r border-[#222] z-50 flex flex-col"
          >
            <div className="p-4 border-b border-[#222] flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2" onClick={onClose}>
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-black" />
                </div>
                <span className="text-lg font-bold text-white">Esencelab</span>
              </Link>
              <button onClick={onClose} className="p-1 hover:bg-[#111] rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
              {links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-white text-black font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-[#111]'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-[#222]">
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">@{user?.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-[#111] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
