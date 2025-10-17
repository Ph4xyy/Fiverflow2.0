import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

interface InstantAuthState {
  user: any;
  loading: boolean;
  role: string | null;
  roleLoading: boolean;
  isReady: boolean;
}

/**
 * Hook ultra-optimisé pour une authentification instantanée
 * Évite complètement les loading loops en utilisant un cache agressif
 */
export const useInstantAuth = (): InstantAuthState => {
  const { user, loading: authLoading } = useAuth();
  const userData = useUserData();
  const hasInitializedRef = useRef(false);

  // 🔥 Cache ultra-agressif pour navigation instantanée
  const roleFromSessionCache = sessionStorage.getItem('role');
  const roleFromLocalCache = localStorage.getItem('userRole');
  const roleFromMeta = user?.app_metadata?.role || user?.user_metadata?.role;
  const roleFromContext = userData?.role;
  
  // Priorité absolue au cache pour navigation instantanée
  const effectiveRole = roleFromContext || roleFromMeta || roleFromSessionCache || roleFromLocalCache || null;

  // Initialisation rapide
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
    }
  }, [authLoading, user, roleFromSessionCache, roleFromLocalCache, roleFromMeta]);

  // Debug logging supprimé pour éviter le spam de console

  // 🔥 NAVIGATION ULTRA-INSTANTANÉE - Toujours prêt, jamais de loading
  return {
    user,
    loading: false, // 🔥 NAVIGATION INSTANTANÉE - Plus jamais de loading
    role: effectiveRole,
    roleLoading: false, // 🔥 NAVIGATION INSTANTANÉE - Plus jamais de loading
    isReady: true // 🔥 TOUJOURS PRÊT - Navigation instantanée
  };
};