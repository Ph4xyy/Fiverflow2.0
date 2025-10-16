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

  // 🔥 Debug logging pour identifier le problème
  console.log('⚡ InstantProtectedRoute:', {
    user: user?.id,
    loading,
    roleLoading,
    isReady,
    role,
    loadingTimeout,
    requireAdmin
  });

  // 🔥 Timeout réduit pour éviter de rester bloqué
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('🚨 InstantProtectedRoute: Loading timeout after 2s, forcing check');
      setLoadingTimeout(true);
    }, 2000); // Réduit à 2s pour éviter les blocages

    return () => clearTimeout(timeout);
  }, []);

  // 🔥 Si on a un cache, on peut rediriger immédiatement
  if (isReady && !loading && !roleLoading) {
    console.log('⚡ InstantProtectedRoute: Ready to check user');
    if (!user) {
      console.log('❌ InstantProtectedRoute: No user when ready, redirecting to login');
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requireAdmin && role !== 'admin') {
      console.log('❌ InstantProtectedRoute: User not admin, redirecting to not-authorized');
      return <Navigate to="/not-authorized" replace />;
    }

    console.log('✅ InstantProtectedRoute: User authenticated, rendering children');
    return <>{children}</>;
  }

  // 🔥 Show loading screen seulement si vraiment nécessaire
  if ((loading || roleLoading) && !loadingTimeout) {
    console.log('⏳ InstantProtectedRoute: Showing loading screen');
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