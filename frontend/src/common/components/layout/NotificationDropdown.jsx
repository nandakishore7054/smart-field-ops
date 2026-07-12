import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../../app/api';
import { socket } from '../../../app/socket';
import { Bell, Check, BellRing } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../ui/utils';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      try {
        const response = await api.get('/notifications');
        if (isMounted) {
          setNotifications(response.data?.data?.notifications || []);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }
    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleTaskCreated({ notification }) {
      if (notification) {
        setNotifications((prev) => [notification, ...prev]);
        toast.success(notification.message);
      }
    }

    function handleSubmissionCreated({ task }) {
      const message = `Worker has submitted proof for task: ${task.title}`;
      const newNotif = {
        _id: `temp-${Date.now()}`,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      toast.success(message);
    }

    function handleTaskVerified({ notification }) {
      if (notification) {
        setNotifications((prev) => [notification, ...prev]);
        toast.success(notification.message);
      }
    }

    socket.on('task:created', handleTaskCreated);
    socket.on('submission:created', handleSubmissionCreated);
    socket.on('task:verified', handleTaskVerified);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('submission:created', handleSubmissionCreated);
      socket.off('task:verified', handleTaskVerified);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  async function markAsRead(id) {
    if (id.startsWith('temp-')) {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      return;
    }

    try {
      await api.patch(`/notifications/${id}/read`, { isRead: true });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  async function markAllAsRead() {
    const unread = notifications.filter(n => !n.isRead);
    if (!unread.length) return;

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      await Promise.all(unread.map(n => {
        if (!n._id.startsWith('temp-')) {
          return api.patch(`/notifications/${n._id}/read`, { isRead: true });
        }
        return Promise.resolve();
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          isOpen ? "bg-surface-muted text-foreground" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-destructive ring-2 ring-background" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-dropdown z-50 overflow-hidden origin-top-right flex flex-col max-h-[32rem]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/30">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <EmptyState
                  icon={BellRing}
                  title="All caught up!"
                  description="You have no new notifications right now."
                  className="min-h-[200px]"
                />
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => markAsRead(notification._id)}
                      className={cn(
                        "p-4 cursor-pointer transition-colors hover:bg-surface-hover flex gap-3 items-start",
                        notification.isRead ? "opacity-60" : "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex-shrink-0 h-2 w-2 rounded-full",
                        notification.isRead ? "bg-transparent" : "bg-primary"
                      )} />
                      <div className="flex-1 space-y-1">
                        <p className={cn(
                          "text-sm leading-tight",
                          notification.isRead ? "text-muted-foreground" : "font-medium text-foreground"
                        )}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
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
