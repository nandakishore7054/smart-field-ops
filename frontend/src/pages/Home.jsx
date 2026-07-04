import { Link } from 'react-router-dom';
import { useAuth } from '../app/auth-context';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-slate-300">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">Smart Field Ops</span>
        </div>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              to={user.role === 'worker' ? '/worker/dashboard' : user.role === 'dispatcher' ? '/admin/dispatch-board' : '/admin/dashboard'} 
              className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-sky-500 transition">Sign In</Link>
              <Link to="/register" className="rounded-full bg-slate-900 dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition">
                Create Account
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <section className="w-full max-w-5xl px-6 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Field operations, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">simplified.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            A modern workforce management system for creating tasks, dispatching workers, verifying proofs, and tracking real-time analytics.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-white hover:bg-sky-400 transition shadow-lg shadow-sky-500/20">
                Start for free
              </Link>
              <Link to="/login" className="w-full sm:w-auto rounded-full border border-slate-300 dark:border-slate-700 px-8 py-4 text-lg font-semibold hover:border-sky-500 hover:text-sky-500 transition">
                Sign in to your account
              </Link>
            </div>
          )}
        </section>

        <section className="w-full bg-white dark:bg-slate-900/50 py-24 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Real-time Dispatch', desc: 'Assign tasks and get instant socket-based updates on worker progress.' },
                { title: 'Proof of Work', desc: 'Workers submit photos and GPS coordinates for irrefutable verification.' },
                { title: 'Offline Ready', desc: 'Progressive Web App (PWA) capabilities allow workers to view tasks without signal.' },
                { title: 'Role Based Access', desc: 'Secure environments tailored for Admins, Dispatchers, and Field Workers.' },
                { title: 'Live Analytics', desc: 'Monitor task completion rates, worker performance, and bottlenecks instantly.' },
                { title: 'Dark Mode Support', desc: 'Easy on the eyes with complete light, dark, and system theme synchronization.' },
              ].map((feature, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="w-10 h-10 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 text-center text-sm text-slate-500 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <p>&copy; {new Date().getFullYear()} Smart Field Operations. Built with MongoDB, Express, React, Node (MERN).</p>
      </footer>
    </div>
  );
}