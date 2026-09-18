import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Input, Button, Card, CardBody, Badge } from '../components/ui';
import { Lock, Mail, User, Sparkles, Building2, HeartHandshake, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('STAFF'); // 'STAFF' | 'PARENT' | 'KID'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
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
      const errMsg = err.response?.data?.error?.message || err.response?.data?.detail || 'Invalid email, username, or password.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (activeTab === 'KID') return 'Enter your child username (e.g. leo.kid)';
    if (activeTab === 'PARENT') return 'Enter your parent email address';
    return 'Enter your educator or admin email';
  };

  const getIcon = () => {
    if (activeTab === 'KID') return <User className="w-4 h-4 text-amber-500" />;
    if (activeTab === 'PARENT') return <HeartHandshake className="w-4 h-4 text-blue-500" />;
    return <Mail className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-5">
      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Sign in to EduKadence</h2>
        <p className="text-xs text-slate-500 font-medium">
          Access your school management, parent connect, or kid learning world.
        </p>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-center">
        <button
          type="button"
          onClick={() => { setActiveTab('STAFF'); setError(null); }}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'STAFF'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Staff</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('PARENT'); setError(null); }}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'PARENT'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Parent</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('KID'); setError(null); }}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'KID'
              ? 'bg-white text-amber-800 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Student</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium animate-in fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={activeTab === 'KID' ? 'Student Username' : 'Email or Username'}
          type="text"
          required
          placeholder={getPlaceholder()}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          leftIcon={getIcon()}
          autoComplete="username"
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => toast.info('Please reach out to your school administrator to reset your credentials.')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Production Security Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>256-Bit Encrypted Multi-Tenant SaaS Platform</span>
      </div>
    </div>
  );
};
