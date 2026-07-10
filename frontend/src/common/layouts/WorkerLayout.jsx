import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAuth } from '../../app/auth-context';
import { socket } from '../../app/socket';
import { LocationProvider } from '../contexts/LocationContext';

function navLinkClassName({ isActive }) {
  return [
    'flex-1 rounded-2xl px-4 py-3 text-center text-sm font-medium transition',
    isActive ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
  ].join(' ');
}

export default function WorkerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  const navItems = [
    { to: '/worker/dashboard', label: 'Tasks' },
    { to: '/worker/check-in', label: 'Check In' },
    { to: '/worker/my-availability', label: 'Availability' },
    { to: '/worker/settings', label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <LocationProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-4 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-500 dark:text-sky-300">Smart Field Ops</p>
              <h1 className="text-2xl font-semibold mt-1">Dashboard</h1>
            </div>

            <nav className="hidden lg:flex items-center gap-2 mx-8 flex-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => [
                  'rounded-xl px-4 py-2 text-sm font-medium transition',
                  isActive ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
                ].join(' ')} end>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <NotificationDropdown />
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-1.5 text-sm">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-slate-700 dark:text-slate-300">{user?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="hidden sm:block rounded-xl px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 pb-24 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 backdrop-blur lg:hidden flex gap-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClassName} end>
              {item.label}
            </NavLink>
          ))}
          <button 
            onClick={handleLogout}
            className="flex-1 rounded-2xl px-4 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition"
          >
            Sign out
          </button>
        </nav>
      </div>
    </LocationProvider>
  );
}