import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAuth } from '../../app/auth-context';

function navLinkClassName({ isActive }) {
  return [
    'rounded-2xl px-4 py-3 text-sm font-medium transition',
    isActive ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
  ].join(' ');
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/dispatch-board', label: 'Dispatch Board' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin/users', label: 'User Management' });
  }

  navItems.push({ to: '/admin/availability', label: 'Availability' });

  navItems.push({ to: '/admin/settings', label: 'Settings' });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 lg:flex">
      <aside className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r flex flex-col justify-between">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-500 dark:text-sky-300">Smart Field Ops</p>
              <h1 className="mt-2 text-2xl font-semibold">Console</h1>
            </div>
            <div className="lg:hidden">
              <ThemeSwitcher />
            </div>
          </div>

          <nav className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible mb-6">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName} end>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="hidden lg:block">
          <div className="mb-4">
            <ThemeSwitcher />
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-4 py-4 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Role-based access</p>
              <p className="text-lg font-semibold capitalize">{user?.role} Workspace</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-1.5 text-sm">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-slate-700 dark:text-slate-300 hidden sm:inline-block">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}