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

  // 🔥 Debug logging pour identifier le problème
  console.log('🛡️ ProtectedRoute:', {
    user: user?.id,
    loading,
    roleLoading,
    role,
    loadingTimeout,
    requireAdmin
  });

  // 🔥 Timeout de sécurité réduit pour une authentification plus fluide
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⏰ ProtectedRoute: Timeout reached');
      setLoadingTimeout(true);
    }, 3000); // Réduit de 8s à 3s

    return () => clearTimeout(timeout);
  }, []);

  // Show loading screen while authentication is in progress
  if ((loading || roleLoading) && !loadingTimeout) {
    console.log('⏳ ProtectedRoute: Showing loading screen');
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
      console.log('❌ ProtectedRoute: No user after timeout, redirecting to login');
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
