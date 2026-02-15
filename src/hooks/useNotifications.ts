import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type { Notification } from '@/types';

const STORAGE_KEY = 'esencelab_notifications';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed);
      updateUnreadCount(parsed);
    }
  }, []);

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read && n.userId === userId).length;
    setUnreadCount(count);
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      updateUnreadCount(updated);
      return updated;
    });

    toast(notification.title, {
      description: notification.message,
    });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      updateUnreadCount(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setUnreadCount(0);
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
    setUnreadCount(0);
  }, []);

  const getUserNotifications = useCallback(() => {
    return notifications.filter(n => n.userId === userId);
  }, [notifications, userId]);

  return {
    notifications: getUserNotifications(),
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

export function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string
): Omit<Notification, 'id' | 'createdAt' | 'read'> {
  return {
    userId,
    type,
    title,
    message,
  };
}
