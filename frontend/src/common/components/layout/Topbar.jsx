import React from 'react';
import { Menu, Search } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import { Input } from '../ui/Input';

export default function Topbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md">
      
      <div className="flex items-center gap-4 flex-1">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Placeholder */}
        <div className="hidden md:block w-64">
          <Input 
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Search..."
            className="h-9 bg-surface-muted/50 border-transparent focus:border-border focus:bg-surface transition-all"
          />
        </div>

        <NotificationDropdown />
        <div className="h-6 w-px bg-border hidden sm:block" />
        <UserDropdown />
      </div>

    </header>
  );
}
