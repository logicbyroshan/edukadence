import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Input, Button, Card, CardBody, Badge } from '../components/ui';
import { Lock, Mail, User, Sparkles, Building2, HeartHandshake, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login(identifier, password);
      toast.success(`Welcome back, ${loggedInUser.first_name || loggedInUser.full_name}!`);

      // Determine redirect destination based on primary role or location state
      const role = loggedInUser.active_membership?.role || (loggedInUser.is_superuser ? 'SUPER_ADMIN' : '');
      const from = location.state?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'CHILD') {
        navigate('/kid', { replace: true });
      } else if (role === 'PARENT') {
        navigate('/parent', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.detail || 'Invalid email or password.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (idVal, passVal) => {
    setIdentifier(idVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to EduKadence</h2>
        <p className="text-xs text-slate-500 mt-1">
          Select a demo role below or enter your credentials.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email or Username"
          type="text"
          required
          placeholder="e.g. principal@littlesprouts.edu or leo.kid"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="username"
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Quick-Fill Demo User Accounts */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Phase 1 Demo Credentials
          </span>
          <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-semibold">
            1-Click Preset
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          <button
            type="button"
            onClick={() => fillDemo('principal@littlesprouts.edu', 'School@12345')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 bg-white transition-all text-left group flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-700">Principal / Admin</span>
              <Badge variant="brand" size="sm">School</Badge>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">principal@littlesprouts.edu</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo('sarah.teacher@littlesprouts.edu', 'Teacher@12345')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 bg-white transition-all text-left group flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-700">Teacher</span>
              <Badge variant="sky" size="sm">Teacher</Badge>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">sarah.teacher@littlesprouts.edu</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo('john.parent@gmail.com', 'Parent@12345')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 bg-white transition-all text-left group flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-700">Parent (Guardian)</span>
              <Badge variant="success" size="sm">Parent</Badge>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">john.parent@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo('leo.kid', 'Kid@12345')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 bg-white transition-all text-left group flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 group-hover:text-amber-800">Child (Kid Mode)</span>
              <Badge variant="kid" size="sm">Kid</Badge>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">leo.kid</span>
          </button>
        </div>

        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => fillDemo('admin@edukadence.com', 'Admin@12345')}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2"
          >
            Log in as Super Admin (admin@edukadence.com)
          </button>
        </div>
      </div>
    </div>
  );
};
