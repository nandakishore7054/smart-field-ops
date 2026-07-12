import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/auth-context';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { cn } from '../ui/utils';
import ThemeSwitcher from './ThemeSwitcher';

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigateToSettings = () => {
    const route = user?.role === 'worker' ? '/worker/settings' : '/admin/settings';
    navigate(route);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface hover:bg-surface-hover hover:border-primary/50 transition-colors p-1 pr-3"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover shadow-sm" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <span className="font-medium text-sm text-foreground hidden sm:inline-block max-w-[120px] truncate">
          {user?.name || 'User'}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200 hidden sm:block", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface shadow-dropdown z-50 overflow-hidden origin-top-right"
          >
            <div className="p-4 border-b border-border bg-surface-muted/30">
              <p className="font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
                {user?.role}
              </div>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={navigateToSettings}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground hover:bg-surface-hover hover:text-primary transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Account Settings
              </button>
            </div>

            <div className="p-2 border-t border-border">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeSwitcher />
              </div>
            </div>

            <div className="p-2 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
