import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { socket } from '../../app/socket';

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

    function handleSubmissionCreated({ submission, task }) {
      // In this event, we might not get a 'notification' object directly if it's broad to 'admin' room
      // Wait, in submissions.service.js we don't emit the notification object. We just emit the submission.
      // I should update submissions.service.js to emit a message or I can just generate one here.
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.addEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl z-50">
          <div className="border-b border-slate-700 bg-slate-900 px-4 py-3">
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-400">No notifications.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => markAsRead(notification._id)}
                  className={`cursor-pointer border-b border-slate-700/50 p-4 transition hover:bg-slate-700 ${
                    notification.isRead ? 'opacity-70' : 'bg-slate-750'
                  }`}
                >
                  <p className={`text-sm ${notification.isRead ? 'text-slate-300' : 'font-medium text-white'}`}>
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
