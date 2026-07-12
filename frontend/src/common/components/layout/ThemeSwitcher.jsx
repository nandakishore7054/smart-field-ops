import React from 'react';
import { useTheme } from '../../../app/theme-context';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../ui/utils';

export default function ThemeSwitcher({ className }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex items-center space-x-1 rounded-full border border-border bg-surface p-1 shadow-sm", className)}>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "rounded-full p-1.5 text-sm transition-colors",
          theme === 'light'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
        )}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "rounded-full p-1.5 text-sm transition-colors",
          theme === 'dark'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
        )}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "rounded-full p-1.5 text-sm transition-colors",
          theme === 'system'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
        )}
        title="System Preference"
        aria-label="System Preference"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
