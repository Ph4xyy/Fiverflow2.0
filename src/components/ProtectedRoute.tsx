import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOptimizedAuth } from '../hooks/useOptimizedAuth';
import { OptimizedLoadingScreen } from './OptimizedLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Set to true if this route requires admin role */
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, role, roleLoading } = useOptimizedAuth();
  const location = useLocation();

  // Show loading screen while authentication is in progress
  if (loading || roleLoading) {
    return (
      <OptimizedLoadingScreen 
        message="Checking session..." 
        showSpinner={true}
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
