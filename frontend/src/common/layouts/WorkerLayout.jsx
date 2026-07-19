import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import { LocationProvider } from '../contexts/LocationContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, CalendarClock, Settings } from 'lucide-react';
import { cn } from '../components/ui/utils';

export default function WorkerLayout() {
  const workerNavItems = [
    { to: '/worker/dashboard', label: 'Tasks', icon: LayoutDashboard },
    { to: '/worker/check-in', label: 'Check In', icon: MapPin },
    { to: '/worker/my-availability', label: 'Availability', icon: CalendarClock },
    { to: '/worker/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <LocationProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        
        {/* Desktop Sidebar (Workers get a simple sidebar on Desktop instead of mobile nav) */}
        <aside className="hidden lg:flex w-64 border-r border-border bg-surface flex-col flex-shrink-0 z-30">
           <div className="flex items-center h-16 px-6 border-b border-border bg-surface-muted/30">
              <span className="font-bold tracking-tight text-lg text-primary">OpsGrid</span>
           </div>
           <nav className="flex-1 px-3 py-6 space-y-1">
             {workerNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </NavLink>
              ))}
           </nav>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Topbar />
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 custom-scrollbar">
            <Outlet />
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </LocationProvider>
  );
}