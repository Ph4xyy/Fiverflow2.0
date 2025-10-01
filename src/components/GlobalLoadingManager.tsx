import React, { useEffect, useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { OptimizedLoadingScreen } from './OptimizedLoadingScreen';

interface GlobalLoadingManagerProps {
  children: React.ReactNode;
}

/**
 * Composant qui gère l'affichage global du loading
 * Évite les rechargements visuels répétitifs en utilisant un système de cache
 */
export const GlobalLoadingManager: React.FC<GlobalLoadingManagerProps> = ({ children }) => {
  const { loading, isLoading } = useLoading();
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const timeoutRef = React.useRef<number>();

  // Détermine quel message de chargement afficher en fonction du contexte
  const getLoadingMessage = () => {
    if (loading.auth) return 'Authenticating...';
    if (loading.role) return 'Loading user data...';
    if (loading.subscription) return 'Loading subscription...';
    if (loading.data) return 'Loading data...';
    return 'Loading...';
  };

  // Gère l'affichage du loading avec un délai pour éviter les flashs
  useEffect(() => {
    const isCurrentlyLoading = isLoading();
    const message = getLoadingMessage();

    if (isCurrentlyLoading) {
      setLoadingMessage(message);
      
      // Délai de 200ms avant d'afficher le loading pour éviter les flashs
      timeoutRef.current = window.setTimeout(() => {
        setShowLoading(true);
      }, 200);
    } else {
      // Masquer immédiatement quand le loading se termine
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowLoading(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading.auth, loading.role, loading.subscription, loading.data, isLoading]);

  // N'affiche le loading que si nécessaire et avec un délai
  if (!showLoading) {
    return <>{children}</>;
  }

  return (
    <>
      <OptimizedLoadingScreen 
        message={loadingMessage}
        showSpinner={true}
      />
      {/* Masquer le contenu pendant le chargement pour éviter les flashs */}
      <div style={{ display: 'none' }}>
        {children}
      </div>
    </>
  );
};

export default GlobalLoadingManager;
