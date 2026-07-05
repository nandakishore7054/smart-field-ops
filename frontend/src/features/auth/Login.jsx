import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth-context';

function validateLoginForm(formState) {
  const errors = {};

  if (!formState.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!formState.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const { user, login, isAuthenticated } = useAuth();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    if (user?.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    if (user?.role === 'dispatcher') return <Navigate to="/admin/dispatch-board" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLoginForm(formState);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');

    try {
      const payload = await login({
        email: formState.email.trim(),
        password: formState.password,
      });
      let nextRoute = '/admin/dashboard';
      if (payload.user?.role === 'worker') nextRoute = '/worker/dashboard';
      if (payload.user?.role === 'dispatcher') nextRoute = '/admin/dispatch-board';
      
      navigate(nextRoute, { replace: true });
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Smart Field Ops</p>
          <h1 className="text-3xl font-semibold text-white">Sign in</h1>
          <p className="text-sm text-slate-400">Use your account to manage field operations.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Email</span>
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState({ ...formState, email: event.target.value })}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              placeholder="you@example.com"
            />
            {errors.email ? <p className="text-sm text-rose-400">{errors.email}</p> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formState.password}
                onChange={(event) => setFormState({ ...formState, password: event.target.value })}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {errors.password ? <p className="text-sm text-rose-400">{errors.password}</p> : null}
            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className="text-sm text-sky-400 hover:text-sky-300">
                Forgot Password?
              </Link>
            </div>
          </label>

          {serverMessage ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{serverMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            No account yet?{' '}
            <Link to="/register" className="font-semibold text-sky-300 hover:text-sky-200">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}