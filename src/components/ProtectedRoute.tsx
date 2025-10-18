import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Set to true if this route requires admin role */
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Toutes les routes sont maintenant publiques
  // Le site fonctionne sans authentification pour une base plus simple
  
  console.log('🛡️ ProtectedRoute: Auth disabled - allowing access to all routes');
  
  return <>{children}</>;
};

export default ProtectedRoute;
