import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { PageContainer } from '../../components/ui/PageContainer';
import { PrimaryButton } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export const CandidateLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/candidate/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Please enter both your username/email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({ usernameOrEmail: usernameOrEmail.trim(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Invalid credentials. Please verify your login details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer size="narrow" className="py-12 sm:py-20">
      <div className="max-w-md mx-auto bg-canvas-card border border-canvas-border rounded-card p-6 sm:p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">Candidate Sign In</h1>
          <p className="text-xs text-ink-500">Access your saved positions and application history</p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="usernameOrEmail">
              Username or Email
            </label>
            <div className="relative">
              <input
                id="usernameOrEmail"
                type="text"
                autoComplete="username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <User className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <Lock className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <PrimaryButton
            type="submit"
            size="md"
            className="w-full mt-2 font-semibold"
            disabled={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </PrimaryButton>
        </form>

        <div className="pt-4 border-t border-canvas-border text-center text-xs text-ink-500">
          Don&apos;t have an account?{' '}
          <Link to="/candidate/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create a free candidate profile
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};
