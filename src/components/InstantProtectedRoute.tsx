import React from 'react';
import { useGlobalAuth } from '../contexts/GlobalAuthProvider';
import { Navigate } from 'react-router-dom';

interface InstantProtectedRouteProps {
  children: React.ReactNode;
  /** Set to true if this route requires admin role */
  requireAdmin?: boolean;
}

/**
 * InstantProtectedRoute - Protection des routes avec authentification instantanée
 * Utilise le nouveau GlobalAuthProvider pour une navigation sans flash
 */
const InstantProtectedRoute: React.FC<InstantProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isAdmin, authReady, authLoading } = useGlobalAuth();

  // Si l'authentification n'est pas encore prête, ne pas afficher de contenu
  if (!authReady && authLoading) {
    return null;
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    console.log('🛡️ InstantProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Si la route nécessite des droits admin et l'utilisateur n'est pas admin
  if (requireAdmin && !isAdmin) {
    console.log('🛡️ InstantProtectedRoute: Admin access required, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // L'utilisateur est authentifié et a les bonnes permissions
  console.log('🛡️ InstantProtectedRoute: Access granted for user:', user.id);
  return <>{children}</>;
};

export default InstantProtectedRoute;