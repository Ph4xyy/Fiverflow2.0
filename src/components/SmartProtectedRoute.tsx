import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { SmartLoadingScreen } from './SmartLoadingScreen';
import { useSmartLoading } from '../hooks/useSmartLoading';

interface SmartProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Version intelligente de ProtectedRoute qui évite les flashs de loading
 * Utilise un système de cache et de délais pour une navigation fluide
 */
const SmartProtectedRoute: React.FC<SmartProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading: authLoading, authReady } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  const location = useLocation();
  const hasCheckedRef = useRef(false);
  
  const { 
    isLoading, 
    loadingMessage, 
    startLoading, 
    stopLoading 
  } = useSmartLoading({
    defaultDelay: 100, // Délai très court pour les routes protégées
    defaultMessage: 'Verifying access...',
    timeout: 5000 // 5s timeout pour les routes protégées
  });

  // Debug logging
  console.log('🛡️ SmartProtectedRoute:', {
    user: user?.id,
    authLoading,
    userDataLoading,
    authReady,
    role: userData?.role,
    isLoading,
    requireAdmin,
    pathname: location.pathname
  });

  // Gérer le loading intelligent
  useEffect(() => {
    if (authLoading || userDataLoading) {
      // Démarrer le loading seulement si on n'a pas encore vérifié
      if (!hasCheckedRef.current) {
        startLoading('Checking authentication...');
      }
    } else {
      // Arrêter le loading quand tout est prêt
      stopLoading();
      hasCheckedRef.current = true;
    }
  }, [authLoading, userDataLoading, startLoading, stopLoading]);

  // Reset hasCheckedRef quand on change de route
  useEffect(() => {
    hasCheckedRef.current = false;
  }, [location.pathname]);

  // Si pas encore prêt et on affiche le loading
  if ((authLoading || userDataLoading) && isLoading) {
    return <SmartLoadingScreen message={loadingMessage} />;
  }

  // Si pas encore prêt mais pas de loading (cas de timeout)
  if (authLoading || userDataLoading) {
    return <SmartLoadingScreen message="Finalizing authentication..." />;
  }

  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    console.log('❌ SmartProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Vérifier les permissions admin si nécessaire
  if (requireAdmin && userData?.role !== 'admin') {
    console.log('❌ SmartProtectedRoute: User not admin, redirecting to not-authorized');
    return <Navigate to="/not-authorized" replace />;
  }

  // Tout est OK, afficher le contenu
  console.log('✅ SmartProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};

export default SmartProtectedRoute;
