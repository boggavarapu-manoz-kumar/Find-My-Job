import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LandingPage } from '../../features/jobs/LandingPage';

/**
 * AuthAwareRoot — Centralised route-resolution for "/".
 *
 * Rules:
 *  - While auth state is being restored (isLoading), render a minimal spinner
 *    so we don't flash the landing page to an authenticated candidate.
 *  - Authenticated candidates → /jobs
 *  - Authenticated admins → /admin/jobs
 *  - Anonymous visitors → public LandingPage
 */
export const AuthAwareRoot: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-ink-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'ROLE_ADMIN') {
      return <Navigate to="/admin/jobs" replace />;
    }
    // Candidates land on the job listings page
    return <Navigate to="/jobs" replace />;
  }

  // Anonymous visitor → marketing landing page
  return <LandingPage />;
};

export default AuthAwareRoot;
