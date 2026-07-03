import { NavLink, Outlet } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';

const navItems = [{ to: '/admin/dashboard', label: 'Dashboard' }];

function navLinkClassName({ isActive }) {
  return [
    'rounded-2xl px-4 py-3 text-sm font-medium transition',
    isActive ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <aside className="border-b border-slate-800 bg-slate-900/80 px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Smart Field Ops</p>
          <h1 className="mt-2 text-2xl font-semibold">Admin Console</h1>
        </div>

        <nav className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClassName} end>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-slate-800 bg-slate-900/60 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Role-based access</p>
              <p className="text-lg font-semibold text-white">Operations management</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300">
                Admin / Dispatcher
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