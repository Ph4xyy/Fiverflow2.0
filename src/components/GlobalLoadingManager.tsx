import React, { useEffect, useState, useRef } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { SmartLoadingScreen } from './SmartLoadingScreen';

interface GlobalLoadingManagerProps {
  children: React.ReactNode;
}

/**
 * Composant qui gère l'affichage global du loading de manière intelligente
 * Version optimisée avec délais et timeouts pour éviter les flashs
 */
export const GlobalLoadingManager: React.FC<GlobalLoadingManagerProps> = ({ children }) => {
  // Safe loading context access
  let loadingContext: { loading: any; isLoading: () => boolean } | null = null;
  
  try {
    loadingContext = useLoading();
  } catch (error) {
    console.warn('GlobalLoadingManager: LoadingProvider not available, skipping global loading management');
    // If LoadingProvider is not available, just render children
    return <>{children}</>;
  }

  const { loading, isLoading } = loadingContext;
  const [showGlobalLoading, setShowGlobalLoading] = useState(false);
  const timeoutRef = useRef<number>();
  const delayTimeoutRef = useRef<number>();

  useEffect(() => {
    const isAnyLoading = isLoading();
    
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }

    if (isAnyLoading) {
      // Délai avant d'afficher le loading global (évite les flashs rapides)
      delayTimeoutRef.current = window.setTimeout(() => {
        setShowGlobalLoading(true);
        
        // Timeout de sécurité après 12 secondes
        timeoutRef.current = window.setTimeout(() => {
          console.warn('🚨 GlobalLoadingManager: Loading timeout (12s), forcing stop');
          setShowGlobalLoading(false);
        }, 12000);
      }, 300); // 300ms de délai pour éviter les flashs
    } else {
      // Arrêter le loading immédiatement
      setShowGlobalLoading(false);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [loading, isLoading]);

  if (showGlobalLoading) {
    return (
      <SmartLoadingScreen 
        message="Loading application..." 
        delay={0} // Pas de délai supplémentaire ici car on a déjà géré le délai
        minDisplayTime={500} // 500ms minimum d'affichage pour le loading global
      />
    );
  }

  return <>{children}</>;
};

export default GlobalLoadingManager;
