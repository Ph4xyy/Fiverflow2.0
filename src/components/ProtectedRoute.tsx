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

  // 🔥 SUPPRESSION COMPLÈTE DES TIMEOUTS - Navigation instantanée
  // Plus de timeout, navigation immédiate

  // 🔥 NAVIGATION ULTRA-INSTANTANÉE - Plus jamais de loading screen
  console.log('⚡ ProtectedRoute: Instant check - no delays');

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
