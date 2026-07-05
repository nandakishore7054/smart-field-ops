import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../app/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formState, setFormState] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  function validateResetForm() {
    const nextErrors = {};

    if (!formState.password) {
      nextErrors.password = 'Password is required.';
    } else if (formState.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long.';
    }

    if (formState.password !== formState.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateResetForm();
    setErrors(nextErrors);
    setServerMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: formState.password,
      });

      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successfully. Please sign in with your new password.' },
      });
    } catch (err) {
      setServerMessage(err.response?.data?.message || 'Unable to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) return null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Smart Field Ops</p>
          <h1 className="text-3xl font-semibold text-white">Create New Password</h1>
          <p className="text-sm text-slate-400">Please enter your new password below.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">New Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formState.password}
                onChange={(event) => setFormState({ ...formState, password: event.target.value })}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="At least 8 characters"
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
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Confirm New Password</span>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formState.confirmPassword}
                onChange={(event) => setFormState({ ...formState, confirmPassword: event.target.value })}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="Repeat password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {errors.confirmPassword ? <p className="text-sm text-rose-400">{errors.confirmPassword}</p> : null}
          </label>

          {serverMessage ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{serverMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </section>
    </main>
  );
}
