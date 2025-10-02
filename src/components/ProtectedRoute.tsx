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
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  // 🔥 Timeout de sécurité pour éviter les chargements infinis
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 8000); // 8 secondes max

    return () => clearTimeout(timeout);
  }, []);

  // Show loading screen while authentication is in progress
  if ((loading || roleLoading) && !loadingTimeout) {
    return (
      <OptimizedLoadingScreen 
        message="Checking session..." 
        showSpinner={true}
      />
    );
  }

  // 🔥 Si timeout, forcer la vérification
  if (loadingTimeout && (loading || roleLoading)) {
    console.warn('🚨 ProtectedRoute: Loading timeout, forcing check');
    // Forcer la vérification en redirigeant vers login si pas d'utilisateur
    if (!user) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
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
