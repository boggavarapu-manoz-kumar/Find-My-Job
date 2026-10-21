import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { LandingPage } from '../features/jobs/LandingPage';
import { JobListingsPage } from '../features/jobs/JobListingsPage';
import { JobDetailPage } from '../features/jobs/JobDetailPage';
import { CategoriesPage } from '../features/jobs/CategoriesPage';
import { AboutPage } from '../features/jobs/AboutPage';
import { LoginPage } from '../features/admin/LoginPage';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { CandidateLoginPage } from '../features/candidate/CandidateLoginPage';
import { CandidateRegisterPage } from '../features/candidate/CandidateRegisterPage';
import { CandidateDashboardPage } from '../features/candidate/CandidateDashboardPage';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AuthAwareRoot } from '../components/layout/AuthAwareRoot';

export const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
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
    </MainLayout>
  );
};

export default AppRoutes;
