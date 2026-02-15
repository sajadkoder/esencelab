import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, Trash2, Briefcase, BookOpen, Info } from 'lucide-react';
import { useState } from 'react';

interface NotificationsDropdownProps {
  userId?: string;
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'job_match':
        return <Briefcase className="w-4 h-4 text-indigo-400" />;
      case 'course_recommendation':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-80 glass-card max-h-96 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex gap-1">
                <button
                  onClick={markAllAsRead}
                  className="p-1 rounded hover:bg-white/10 text-xs text-indigo-400"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={clearNotifications}
                  className="p-1 rounded hover:bg-white/10 text-xs text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.slice(0, 20).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                        !notification.read ? 'bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-white/5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
