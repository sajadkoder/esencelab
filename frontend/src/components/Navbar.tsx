'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
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
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/jobs', label: 'Jobs' },
          { href: '/courses', label: 'Courses' },
          { href: '/resume', label: 'Resume' },
          { href: '/applications', label: 'Applications' },
        ];
      case 'employer':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/jobs', label: 'Jobs' },
          { href: '/applicants', label: 'Applicants' },
        ];
      case 'admin':
        return [
          { href: '/dashboard', label: 'Overview' },
          { href: '/jobs', label: 'Jobs' },
          { href: '/users', label: 'Users' },
          { href: '/applicants', label: 'Applicants' },
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Logo className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-primary">Esencelab</span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg relative
                    ${isActive ? 'text-primary bg-black/5' : 'text-secondary hover:text-primary hover:bg-black/[0.03]'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Profile */}
          <div className="hidden md:flex items-center" ref={profileRef}>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2.5 rounded-full pl-1.5 pr-3 py-1 transition-colors hover:bg-black/5"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm text-primary max-w-[120px] truncate">{user?.name}</span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border bg-white py-2 text-primary shadow-lg shadow-black/5"
                  >
                    <div className="border-b border-border px-4 py-3 mb-1">
                      <p className="font-medium truncate text-sm">{user?.name}</p>
                      <p className="text-xs text-secondary capitalize mt-0.5">{user?.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center space-x-3 text-red-500 transition-colors text-sm"
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
            className="md:hidden p-2 text-primary rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl font-medium transition-colors text-sm
                      ${isActive ? 'text-primary bg-black/5' : 'text-secondary hover:bg-black/5 hover:text-primary'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-border my-2 pt-2"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium flex items-center space-x-3 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
