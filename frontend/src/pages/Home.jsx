import { Link } from 'react-router-dom';
import { useAuth } from '../app/auth-context';

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-slate-300">
          Restoring session...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16">
        <section className="w-full rounded-[2rem] border border-slate-700/60 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Smart Field Ops</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Field workforce management foundation is ready.</h1>
          <p className="mt-4 max-w-2xl text-slate-400">
            Sign in or create an account to verify the authentication flow, session persistence, and JWT refresh handling.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 hover:bg-sky-400">
              Sign in
            </Link>
            <Link to="/register" className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-100 hover:border-sky-300">
              Create account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16">
      <section className="w-full rounded-[2rem] border border-slate-700/60 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Signed in</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Welcome back, {user?.name || 'user'}.</h1>
        <div className="mt-6 grid gap-3 rounded-3xl border border-slate-700 bg-slate-950/70 p-5 text-sm text-slate-300 sm:grid-cols-2">
          <div>
            <span className="block text-slate-500">Email</span>
            <span>{user?.email || 'Unknown'}</span>
          </div>
          <div>
            <span className="block text-slate-500">Role</span>
            <span>{user?.role || 'Unknown'}</span>
          </div>
          <div>
            <span className="block text-slate-500">Status</span>
            <span>{user?.status || 'Unknown'}</span>
          </div>
          <div>
            <span className="block text-slate-500">User ID</span>
            <span className="break-all">{user?._id || 'Unknown'}</span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={logout}
            className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-100 hover:border-rose-400 hover:text-rose-200"
          >
            Sign out
          </button>
          <Link to="/login" className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-slate-100 hover:bg-slate-700">
            Open login screen
          </Link>
        </div>
      </section>
    </main>
  );
}