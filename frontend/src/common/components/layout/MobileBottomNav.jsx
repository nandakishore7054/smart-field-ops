import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, CalendarClock, Settings } from 'lucide-react';
import { cn } from '../ui/utils';

const workerNavItems = [
  { to: '/worker/dashboard', label: 'Tasks', icon: LayoutDashboard },
  { to: '/worker/check-in', label: 'Check In', icon: MapPin },
  { to: '/worker/my-availability', label: 'Availability', icon: CalendarClock },
  { to: '/worker/settings', label: 'Settings', icon: Settings },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface/90 px-2 pb-safe pt-2 backdrop-blur-md lg:hidden">
      {workerNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-16 gap-1 p-1 rounded-lg transition-colors",
            isActive 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
