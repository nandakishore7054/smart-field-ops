import { useTheme } from '../../app/theme-context';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2 rounded-full border border-slate-700 bg-slate-900 p-1 dark:border-slate-700 dark:bg-slate-800">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-full p-2 text-sm transition ${
          theme === 'light'
            ? 'bg-sky-500 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-300'
        }`}
        title="Light Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`rounded-full p-2 text-sm transition ${
          theme === 'dark'
            ? 'bg-sky-500 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-300'
        }`}
        title="Dark Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`rounded-full p-2 text-sm transition ${
          theme === 'system'
            ? 'bg-sky-500 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-300'
        }`}
        title="System Preference"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      </button>
    </div>
  );
}
