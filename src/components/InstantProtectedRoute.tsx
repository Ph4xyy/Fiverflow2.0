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
 * Version optimisée de ProtectedRoute :
 * - Navigation instantanée (pas de rechargement entre pages)
 * - Vérifie la session sans bloquer le rendu
 */
const InstantProtectedRoute: React.FC<InstantProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, role, roleLoading, isReady } = useInstantAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 3000); // 3s max d'attente avant de forcer la redirection
    return () => clearTimeout(timeout);
  }, []);

  console.log('⚡ InstantProtectedRoute:', {
    user: user?.id,
    loading,
    roleLoading,
    isReady,
    role,
    loadingTimeout,
    requireAdmin
  });

  // ✅ Si on a déjà un utilisateur connu, on affiche la page instantanément
  if (user) {
    if (requireAdmin && role !== 'admin') {
      console.log('❌ InstantProtectedRoute: User not admin');
      return <Navigate to="/not-authorized" replace />;
    }

    console.log('✅ InstantProtectedRoute: User authenticated');
    return <>{children}</>;
  }

  // ⚡ Si on est encore en train de vérifier, on ne montre rien (pas de reload)
  if (loading && !loadingTimeout) {
    console.log('⏳ InstantProtectedRoute: Waiting for auth check...');
    return <></>;
  }

  // 🚨 Si après 3s toujours rien → login
  if (!user && loadingTimeout) {
    console.warn('🚨 InstantProtectedRoute: Timeout — redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Cas par défaut (si user null dès le départ)
  if (!user) {
    console.log('❌ InstantProtectedRoute: No user — redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default InstantProtectedRoute;