import React, { useEffect, useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { OptimizedLoadingScreen } from './OptimizedLoadingScreen';

interface GlobalLoadingManagerProps {
  children: React.ReactNode;
}

/**
 * Composant qui gère l'affichage global du loading
 * Version simplifiée pour éviter les conflits
 */
export const GlobalLoadingManager: React.FC<GlobalLoadingManagerProps> = ({ children }) => {
  // Pour l'instant, on retourne simplement les enfants
  // Le loading sera géré par les composants individuels
  return <>{children}</>;
};

export default GlobalLoadingManager;
