import React from 'react';

/**
 * Composant de navigation ultra-optimisé
 * Élimine complètement tous les délais et loading states
 */
export const InstantNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 🔥 NAVIGATION ULTRA-INSTANTANÉE
  // Pas de loading, pas de délai, rendu immédiat
  return <>{children}</>;
};

/**
 * Hook pour navigation instantanée
 * Remplace tous les hooks de loading avec une version instantanée
 */
export const useInstantNavigation = () => {
  return {
    loading: false, // Jamais de loading
    isReady: true, // Toujours prêt
    isLoading: () => false, // Jamais en cours de chargement
    startLoading: () => {}, // Pas d'action
    stopLoading: () => {}, // Pas d'action
  };
};

export default InstantNavigation;
