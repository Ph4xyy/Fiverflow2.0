import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useInstantAuth } from '../hooks/useInstantAuth';


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

  // 🔥 Debug logging pour identifier le problème
  console.log('⚡ InstantProtectedRoute:', {
    user: user?.id,
    loading,
    roleLoading,
    isReady,
    role,
    requireAdmin
  });

  // 🔥 SUPPRESSION COMPLÈTE DES TIMEOUTS - Navigation instantanée
  // Plus de timeout, navigation immédiate

  // 🔥 NAVIGATION ULTRA-INSTANTANÉE - Vérification immédiate sans délai
  console.log('⚡ InstantProtectedRoute: Instant check - no delays');
  if (!user) {
    console.log('❌ InstantProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && role !== 'admin') {
    console.log('❌ InstantProtectedRoute: User not admin, redirecting to not-authorized');
    return <Navigate to="/not-authorized" replace />;
  }

  console.log('✅ InstantProtectedRoute: User authenticated, rendering children instantly');
  return <>{children}</>;

  // 🔥 SUPPRESSION COMPLÈTE - Plus de code mort
};

export default InstantProtectedRoute;