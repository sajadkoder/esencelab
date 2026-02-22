'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Logo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/jobs', label: 'Jobs' },
          { href: '/career', label: 'Career Explorer' },
          { href: '/progress', label: 'Progress' },
          { href: '/applications', label: 'Applications' },
        ];
      case 'employer':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/jobs', label: 'Jobs' },
          { href: '/candidates', label: 'Candidates' },
        ];
      case 'admin':
        return [
          { href: '/dashboard', label: 'Overview' },
          { href: '/users', label: 'Users' },
          { href: '/courses', label: 'Courses' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-[20px] border-b border-border transition-colors">
      <div className="layout-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Logo className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">Esencelab</span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative ${isActive ? 'text-primary' : 'text-secondary hover:text-primary'}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 rounded-full pl-2 pr-4 py-1.5 transition-colors hover:bg-black/5"
              >
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm text-primary">{user?.name}</span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-white/95 py-2 text-primary shadow-sm backdrop-blur-xl"
                  >
                    <div className="border-b border-border px-4 py-3 mb-2">
                      <p className="font-medium truncate">{user?.name}</p>
                      <p className="text-sm text-secondary capitalize">{user?.role}</p>
                    </div>
                    <Link href="/profile" className="px-4 py-2 hover:bg-black/5 flex items-center space-x-3 transition-colors text-sm">
                      <Settings className="w-4 h-4 text-secondary" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center space-x-3 text-red-500 transition-colors text-sm mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-primary"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-primary hover:bg-black/5 rounded-xl font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-2 pt-2"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium flex items-center space-x-3 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
