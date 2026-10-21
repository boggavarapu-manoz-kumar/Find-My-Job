import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'ROLE_ADMIN' | 'ROLE_CANDIDATE';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole = 'ROLE_ADMIN',
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-ink-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginTarget = allowedRole === 'ROLE_ADMIN' ? '/admin/login' : '/candidate/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // If candidate visits admin route, redirect to candidate dashboard; if admin visits candidate route, redirect to admin
    const fallbackTarget = user?.role === 'ROLE_ADMIN' ? '/admin/jobs' : '/candidate/dashboard';
    return <Navigate to={fallbackTarget} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
