import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth-context';
import AuthLayout from '../../common/layouts/AuthLayout';
import { Input } from '../../common/components/ui/Input';
import { Button } from '../../common/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, User, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <AuthLayout 
      title="Create account" 
      subtitle="Register to start managing field work."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <Input
            type="text"
            value={formState.name}
            onChange={(event) => setFormState({ ...formState, name: event.target.value })}
            placeholder="Ava Johnson"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.name}
          />
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formState.password}
                onChange={(event) => setFormState({ ...formState, password: event.target.value })}
                placeholder="Min 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[9px] text-muted-foreground hover:text-foreground transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Confirm password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formState.confirmPassword}
                onChange={(event) => setFormState({ ...formState, confirmPassword: event.target.value })}
                placeholder="Repeat password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[9px] text-muted-foreground hover:text-foreground transition-colors"
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Role</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Briefcase className="w-4 h-4" />
            </div>
            <select
              value={formState.role}
              onChange={(event) => setFormState({ ...formState, role: event.target.value })}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary pl-10 ${errors.role ? 'border-destructive focus:border-destructive focus:ring-destructive' : 'border-input focus:border-primary'}`}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-destructive mt-1.5">{errors.role}</p>}
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
          className="w-full mt-4"
          size="lg"
        >
          Create account
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}