import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth-context';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'worker', label: 'Worker' },
  { value: 'dispatcher', label: 'Dispatcher' },
];

function validateRegistrationForm(formState) {
  const errors = {};

  if (!formState.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!formState.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!formState.password) {
    errors.password = 'Password is required.';
  } else if (formState.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (formState.password !== formState.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!formState.role) {
    errors.role = 'Role is required.';
  }

  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'worker',
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegistrationForm(formState);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');

    try {
      await register({
        name: formState.name.trim(),
        email: formState.email.trim(),
        password: formState.password,
        role: formState.role,
      });

      navigate('/login', {
        replace: true,
        state: { message: 'Account created successfully. Please sign in.' },
      });
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to create the account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Smart Field Ops</p>
          <h1 className="text-3xl font-semibold text-white">Create account</h1>
          <p className="text-sm text-slate-400">Register to start managing field work.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Full name</span>
            <input
              type="text"
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
              placeholder="Ava Johnson"
            />
            {errors.name ? <p className="text-sm text-rose-400">{errors.name}</p> : null}
          </label>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Password</span>
              <input
                type="password"
                value={formState.password}
                onChange={(event) => setFormState({ ...formState, password: event.target.value })}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="At least 8 characters"
              />
              {errors.password ? <p className="text-sm text-rose-400">{errors.password}</p> : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Confirm password</span>
              <input
                type="password"
                value={formState.confirmPassword}
                onChange={(event) => setFormState({ ...formState, confirmPassword: event.target.value })}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="Repeat password"
              />
              {errors.confirmPassword ? <p className="text-sm text-rose-400">{errors.confirmPassword}</p> : null}
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Role</span>
            <select
              value={formState.role}
              onChange={(event) => setFormState({ ...formState, role: event.target.value })}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role ? <p className="text-sm text-rose-400">{errors.role}</p> : null}
          </label>

          {serverMessage ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{serverMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-sky-300 hover:text-sky-200">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}