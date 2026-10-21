import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { PageContainer } from '../../components/ui/PageContainer';
import { PrimaryButton } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export const CandidateRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await registerCandidate({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/candidate/dashboard', { replace: true });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Registration failed. Username or email may already be registered.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer size="narrow" className="py-12 sm:py-20">
      <div className="max-w-md mx-auto bg-canvas-card border border-canvas-border rounded-card p-6 sm:p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">Create Candidate Account</h1>
          <p className="text-xs text-ink-500">Track applications, save jobs, and get noticed by recruiters</p>
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
            <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="janedoe"
                className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <User className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-canvas border border-canvas-border rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <Mail className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1" htmlFor="password">
              Password (Min 8 characters)
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                autoComplete="new-password"
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
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </PrimaryButton>
        </form>

        <div className="pt-4 border-t border-canvas-border text-center text-xs text-ink-500">
          Already have an account?{' '}
          <Link to="/candidate/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};
