import React, { useEffect, useState } from 'react';
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
  const [, setRefreshKey] = useState(0);

  const effectiveRole = role;

  // Listen for session refresh to re-evaluate access (debounced)
  useEffect(() => {
    let refreshTimeout: number | undefined;
    const onRefreshed = () => {
      console.log('🔄 ProtectedRoute: Session refreshed, re-evaluating access...');
      // Debounced re-evaluation to avoid multiple rapid updates
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 150);
    };
    
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      window.removeEventListener('ff:session:refreshed', onRefreshed as any);
    };
  }, []);

  if (loading || roleLoading) {
    console.log('🔄 ProtectedRoute: Loading state - auth:', loading, 'role:', roleLoading);
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

  if (requireAdmin && effectiveRole !== 'admin') {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
