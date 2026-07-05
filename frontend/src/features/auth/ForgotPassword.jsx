import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../app/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setServerMessage('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setServerMessage(err.response?.data?.message || 'Unable to process request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Smart Field Ops</p>
          <h1 className="text-3xl font-semibold text-white">Reset Password</h1>
          <p className="text-sm text-slate-400">Enter your email to receive a reset link.</p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="rounded-2xl bg-sky-500/10 px-4 py-4 border border-sky-500/20">
              <p className="text-sky-300 font-medium">Reset link sent!</p>
              <p className="text-sm text-slate-400 mt-2">Check your email for the password reset link.</p>
            </div>
            <Link to="/login" className="inline-block font-semibold text-sky-300 hover:text-sky-200">
              Return to login
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                placeholder="you@example.com"
              />
              {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            </label>

            {serverMessage ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{serverMessage}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
            
            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-slate-300">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
