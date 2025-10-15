import React, { useEffect, useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { OptimizedLoadingScreen } from './OptimizedLoadingScreen';

interface GlobalLoadingManagerProps {
  children: React.ReactNode;
}

/**
 * Composant qui gère l'affichage global du loading
 * Version améliorée avec gestion des timeouts
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

  useEffect(() => {
    const isAnyLoading = isLoading();
    setShowGlobalLoading(isAnyLoading);
    
    // Auto-hide loading after 15 seconds to prevent infinite loading
    if (isAnyLoading) {
      const timeout = setTimeout(() => {
        setShowGlobalLoading(false);
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [loading, isLoading]);

  if (showGlobalLoading) {
    return (
      <OptimizedLoadingScreen 
        message="Loading application..." 
        showSpinner={true}
      />
    );
  }

  return <>{children}</>;
};

export default GlobalLoadingManager;
