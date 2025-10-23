import React from 'react';

interface InstantProtectedRouteProps {
  children: React.ReactNode;
  /** Set to true if this route requires admin role */
  requireAdmin?: boolean;
}

/**
 * 🔥 AUTHENTIFICATION SUPPRIMÉE - Toutes les routes sont maintenant publiques
 * Version simplifiée sans authentification
 */
const InstantProtectedRoute: React.FC<InstantProtectedRouteProps> = ({ children }) => {
  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Plus de vérification d'auth
  // Auth disabled - allowing access to all routes - log supprimé pour la propreté
  
  return <>{children}</>;
};

export default InstantProtectedRoute;