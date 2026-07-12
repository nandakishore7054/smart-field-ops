import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth-context';
import AuthLayout from '../../common/layouts/AuthLayout';
import { Input } from '../../common/components/ui/Input';
import { Button } from '../../common/components/ui/Button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            type="email"
            value={formState.email}
            onChange={(event) => setFormState({ ...formState, email: event.target.value })}
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formState.password}
              onChange={(event) => setFormState({ ...formState, password: event.target.value })}
              placeholder="Enter your password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[9px] text-muted-foreground hover:text-foreground transition-colors"
              tabIndex="-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {serverMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-destructive/10 px-4 py-3 border border-destructive/20 text-sm text-destructive"
            >
              {serverMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-2"
          size="lg"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-hover transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}