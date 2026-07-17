import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  MapPin, 
  CalendarClock, 
  ClipboardCheck, 
  Navigation, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../../../app/auth-context';
import { cn } from '../ui/utils';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/dispatch-board', label: 'Dispatch Board', icon: Map },
    ]
  },
  {
    title: 'Management',
    adminOnly: true,
    items: [
      { to: '/admin/users', label: 'User Management', icon: Users },
      { to: '/admin/geofences', label: 'Geofences', icon: MapPin },
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/availability', label: 'Availability', icon: CalendarClock },
      { to: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
      { to: '/admin/tracking', label: 'Live Tracking', icon: Navigation },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  }
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  // Sidebar content (Shared between Desktop and Mobile)
  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
      {/* Logo Area */}
      <div className={cn(
        "flex items-center h-16 flex-shrink-0 px-4 transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap font-bold text-foreground tracking-tight"
              >
                FieldIntel
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-surface-hover text-muted-foreground transition-colors",
            isCollapsed && "absolute -right-3 top-5 bg-surface border border-border shadow-sm hover:text-foreground z-50"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Toggle */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {navGroups.map((group, groupIdx) => {
          if (group.adminOnly && user?.role !== 'admin') return null;
          
          return (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2"
                >
                  {group.title}
                </motion.p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileOpen(false)} // Close on mobile click
                  className={({ isActive }) => cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 hidden px-2 py-1 bg-foreground text-background text-xs rounded-md shadow-lg group-hover:block z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="hidden lg:block relative z-30 h-screen border-r border-border bg-surface flex-shrink-0"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border lg:hidden shadow-2xl"
            >
              {/* Force not collapsed on mobile */}
              <div className="h-full" style={{ width: '100%' }}>
                 <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
