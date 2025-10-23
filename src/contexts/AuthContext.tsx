/**
 * AuthContext - ALIAS DE COMPATIBILITÉ vers le nouveau GlobalAuthProvider
 * 
 * Ce fichier maintient la compatibilité avec l'ancien système
 * en redirigeant vers le nouveau GlobalAuthProvider
 */

import React from 'react';
import { useGlobalAuth } from './GlobalAuthProvider';

/**
 * AuthProvider - ALIAS DE COMPATIBILITÉ
 * Redirige vers le nouveau GlobalAuthProvider
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Ce provider est maintenant un alias vers GlobalAuthProvider
  // Il est maintenu pour la compatibilité mais ne fait rien
  // car GlobalAuthProvider est déjà utilisé dans App.tsx
  return <>{children}</>;
}

/**
 * useAuth - ALIAS DE COMPATIBILITÉ
 * Redirige vers le nouveau useGlobalAuth
 */
export function useAuth() {
  return useGlobalAuth();
}