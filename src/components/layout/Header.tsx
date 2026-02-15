import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="lg:pl-72">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus-within:border-indigo-500/50 transition-colors">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 w-48"
            />
          </div>

          {/* Actions */}
          {actions}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-card p-4"
                >
                  <h3 className="font-semibold text-white mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-sm text-white">New job matching your profile</p>
                      <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-sm text-white">Application status updated</p>
                      <p className="text-xs text-slate-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

export function PageHeader({ 
  title, 
  subtitle, 
  actionLabel, 
  onAction 
}: { 
  title: string; 
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
