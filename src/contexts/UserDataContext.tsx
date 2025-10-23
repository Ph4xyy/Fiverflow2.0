/**
 * UserDataContext - ALIAS DE COMPATIBILITÉ vers le nouveau GlobalAuthProvider
 * 
 * Ce fichier maintient la compatibilité avec l'ancien système
 * en redirigeant vers le nouveau GlobalAuthProvider
 */

import React from 'react';
import { useGlobalAuth } from './GlobalAuthProvider';

/**
 * UserDataProvider - ALIAS DE COMPATIBILITÉ
 * Redirige vers le nouveau GlobalAuthProvider
 */
export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ce provider est maintenant un alias vers GlobalAuthProvider
  // Il est maintenu pour la compatibilité mais ne fait rien
  // car GlobalAuthProvider est déjà utilisé dans App.tsx
  return <>{children}</>;
};

/**
 * useUserData - ALIAS DE COMPATIBILITÉ
 * Redirige vers le nouveau useGlobalAuth
 */
export const useUserData = () => {
  const { isAdmin, profileLoading, refreshUserData } = useGlobalAuth();
  
  return {
    role: isAdmin ? 'admin' : 'user',
    loading: profileLoading,
    refreshUserRole: refreshUserData,
  };
};