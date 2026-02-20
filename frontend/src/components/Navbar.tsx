'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Menu, X, LayoutDashboard, Briefcase, GraduationCap, Settings } from 'lucide-react';

function GraduationCapLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
      <path d="M22 10v6"></path>
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
    </svg>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'student':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/jobs', label: 'Jobs', icon: Briefcase },
          { href: '/courses', label: 'Courses', icon: GraduationCap },
        ];
      case 'employer':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/jobs', label: 'My Jobs', icon: Briefcase },
          { href: '/applicants', label: 'Applicants', icon: UsersIcon },
        ];
      case 'admin':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/users', label: 'Users', icon: UsersIcon },
          { href: '/courses', label: 'Courses', icon: GraduationCap },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <GraduationCapLogo className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-black">EsenceLab</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-1.5 text-gray-600 hover:text-black transition-colors font-medium"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-black" />
                </div>
                <span className="font-medium">{user?.name}</span>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center space-x-2 text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
