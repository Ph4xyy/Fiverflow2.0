import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useInstantAuth } from '../hooks/useInstantAuth';
import { OptimizedLoadingScreen } from './OptimizedLoadingScreen';

interface InstantProtectedRouteProps {
  children: React.ReactNode;
  /** Set to true if this route requires admin role */
  requireAdmin?: boolean;
}

/**
 * Version ultra-optimisée de ProtectedRoute pour une authentification instantanée
 * Évite complètement les loading loops
 */
const InstantProtectedRoute: React.FC<InstantProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, role, roleLoading, isReady } = useInstantAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  // 🔥 Timeout ultra-court pour une authentification fluide
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 1500); // Réduit à 1.5s

    return () => clearTimeout(timeout);
  }, []);

  // 🔥 Si on a un cache, on peut rediriger immédiatement
  if (isReady && !loading && !roleLoading) {
    if (!user) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requireAdmin && role !== 'admin') {
      return <Navigate to="/not-authorized" replace />;
    }

    return <>{children}</>;
  }

  // 🔥 Show loading screen seulement si vraiment nécessaire
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
    console.warn('🚨 InstantProtectedRoute: Loading timeout, forcing check');
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

export default InstantProtectedRoute;
