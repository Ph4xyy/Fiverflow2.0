import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SmartLoadingScreen } from './SmartLoadingScreen';

/**
 * Composant de redirection racine ultra-optimisé
 * Évite les flashs de loading avec un délai intelligent
 */
const SmartRootRedirect: React.FC = () => {
  const { user, loading: authLoading, authReady } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const timeoutRef = useRef<number>();
  const loadingTimeoutRef = useRef<number>();

  console.log('🚀 SmartRootRedirect:', {
    user: user?.id,
    authLoading,
    authReady,
    showLoading,
    shouldRedirect
  });

  useEffect(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Si l'auth est encore en cours, attendre un peu avant de décider
    if (authLoading) {
      // Afficher le loading après 100ms seulement si nécessaire
      loadingTimeoutRef.current = window.setTimeout(() => {
        setShowLoading(true);
        
        // Timeout de sécurité après 3s
        timeoutRef.current = window.setTimeout(() => {
          console.warn('🚨 SmartRootRedirect: Auth timeout, forcing redirect');
          setShouldRedirect(true);
          setShowLoading(false);
        }, 3000);
      }, 100);
    } else {
      // Auth terminé, rediriger immédiatement
      setShouldRedirect(true);
      setShowLoading(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [authLoading]);

  // Si on doit rediriger
  if (shouldRedirect || (!authLoading && authReady)) {
    const target = user ? '/dashboard' : '/login';
    console.log('🚀 SmartRootRedirect: Redirecting to', target, {
      user: !!user,
      authLoading,
      authReady,
      shouldRedirect
    });
    return <Navigate to={target} replace />;
  }

  // Afficher le loading si nécessaire
  if (showLoading && authLoading) {
    return (
      <SmartLoadingScreen 
        message="Initializing application..." 
        delay={0} // Pas de délai supplémentaire ici
        minDisplayTime={200}
      />
    );
  }

  // État initial - pas de loading visible
  return null;
};

export default SmartRootRedirect;
