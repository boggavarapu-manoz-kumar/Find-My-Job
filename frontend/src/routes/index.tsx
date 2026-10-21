import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { LandingPage } from '../features/jobs/LandingPage';
import { JobListingsPage } from '../features/jobs/JobListingsPage';
import { JobDetailPage } from '../features/jobs/JobDetailPage';
import { LoginPage } from '../features/admin/LoginPage';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobListingsPage />} />
        <Route path="/jobs/:slug" element={<JobDetailPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/jobs" replace />}
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <div className="text-center py-20 space-y-3">
              <h2 className="text-2xl font-bold text-ink-900">404 - Page Not Found</h2>
              <p className="text-ink-500 text-sm">The requested URL could not be found.</p>
            </div>
          }
        />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;
