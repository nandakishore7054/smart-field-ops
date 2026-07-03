import { NavLink, Outlet } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';

const navItems = [{ to: '/worker/dashboard', label: 'Tasks' }];

function navLinkClassName({ isActive }) {
  return [
    'flex-1 rounded-2xl px-4 py-3 text-center text-sm font-medium transition',
    isActive ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');
}

export default function WorkerLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 px-4 py-4 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Smart Field Ops</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Worker Dashboard</h1>
            <p className="text-sm text-slate-400">Your assigned work in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <div className="hidden sm:block rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300">
              Mobile first
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 pb-24 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex gap-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClassName} end>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}