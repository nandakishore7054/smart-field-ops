import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../ui/utils';

export default function Breadcrumbs({ className }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Helper to format path segments (e.g., 'dispatch-board' -> 'Dispatch Board')
  const formatLabel = (segment) => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (pathnames.length === 0) return null;

  // Determine base route for home icon
  const isWorker = pathnames[0] === 'worker';
  const homeLink = isWorker ? '/worker/dashboard' : '/admin/dashboard';

  return (
    <nav className={cn("hidden md:flex items-center space-x-1 text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
      <Link 
        to={homeLink} 
        className="flex items-center hover:text-foreground transition-colors p-1"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {pathnames.map((value, index) => {
        // Skip first segment (admin/worker) if we want a cleaner look, but let's keep it for context or skip it.
        // Actually, skipping 'admin' or 'worker' might be cleaner.
        if (index === 0 && (value === 'admin' || value === 'worker')) {
          return null; 
        }

        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[200px]" aria-current="page">
                {formatLabel(value)}
              </span>
            ) : (
              <Link to={to} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                {formatLabel(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
