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
  const { loading, isLoading } = useLoading();
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
