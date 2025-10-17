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
  const { user, role } = useInstantAuth();
  const location = useLocation();

  // Navigation instantanée sans délai
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;

  // 🔥 SUPPRESSION COMPLÈTE - Plus de code mort
};

export default InstantProtectedRoute;