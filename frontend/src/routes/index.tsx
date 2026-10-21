import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { LandingPage } from '../features/jobs/LandingPage';
import { JobListingsPage } from '../features/jobs/JobListingsPage';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AuthAwareRoot } from '../components/layout/AuthAwareRoot';

// Route-level code-splitting: heavy pages are loaded asynchronously on-demand
const JobDetailPage = lazy(() => import('../features/jobs/JobDetailPage').then(m => ({ default: m.JobDetailPage })));
const CategoriesPage = lazy(() => import('../features/jobs/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const AboutPage = lazy(() => import('../features/jobs/AboutPage').then(m => ({ default: m.AboutPage })));
const LoginPage = lazy(() => import('../features/admin/LoginPage').then(m => ({ default: m.LoginPage })));
const AdminDashboardPage = lazy(() => import('../features/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const CandidateLoginPage = lazy(() => import('../features/candidate/CandidateLoginPage').then(m => ({ default: m.CandidateLoginPage })));
const CandidateRegisterPage = lazy(() => import('../features/candidate/CandidateRegisterPage').then(m => ({ default: m.CandidateRegisterPage })));
const CandidateDashboardPage = lazy(() => import('../features/candidate/CandidateDashboardPage').then(m => ({ default: m.CandidateDashboardPage })));

const PageFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Root — auth-aware redirect */}
          <Route path="/" element={<AuthAwareRoot />} />
          <Route path="/home" element={<LandingPage />} />

          {/* Public Pages */}
          <Route path="/jobs" element={<JobListingsPage />} />
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Candidate Auth */}
          <Route path="/candidate/login" element={<CandidateLoginPage />} />
          <Route path="/candidate/register" element={<CandidateRegisterPage />} />

          {/* Protected Candidate Portal */}
          <Route
            path="/candidate"
            element={<Navigate to="/candidate/dashboard" replace />}
          />
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRole="ROLE_CANDIDATE">
                <CandidateDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Login — accessible at /admin/login, not surfaced in public nav */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/jobs" replace />}
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute allowedRole="ROLE_ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="text-center py-24 space-y-4">
                <p className="text-7xl font-bold text-ink-100">404</p>
                <h2 className="text-2xl font-bold text-ink-900">Page Not Found</h2>
                <p className="text-ink-500 text-sm">The page you're looking for doesn't exist or has been moved.</p>
                <a href="/jobs" className="inline-block mt-4 px-5 py-2.5 rounded-button bg-ink-900 text-white text-sm font-medium hover:bg-ink-800 transition-colors">
                  Browse Jobs →
                </a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </MainLayout>
  );
};

export default AppRoutes;
