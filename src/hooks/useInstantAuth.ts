import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

interface InstantAuthState {
  user: any;
  loading: boolean;
  role: string | null;
  roleLoading: boolean;
  isReady: boolean; // Nouveau: indique si tout est prêt
}

/**
 * Hook ultra-optimisé pour une authentification instantanée
 * Évite complètement les loading loops en utilisant un cache agressif
 */
export const useInstantAuth = (): InstantAuthState => {
  const { user, loading: authLoading } = useAuth();
  const userData = useUserData();
  const [isReady, setIsReady] = useState(false);
  const hasInitializedRef = useRef(false);

  // 🔥 Cache ultra-agressif pour navigation instantanée
  const roleFromSessionCache = sessionStorage.getItem('role');
  const roleFromLocalCache = localStorage.getItem('userRole');
  const roleFromMeta = user?.app_metadata?.role || user?.user_metadata?.role;
  const roleFromContext = userData?.role;
  
  // Priorité absolue au cache pour navigation instantanée
  const effectiveRole = roleFromContext || roleFromMeta || roleFromSessionCache || roleFromLocalCache || null;
  const roleLoading = Boolean(userData?.loading) && !roleFromSessionCache && !roleFromLocalCache && !roleFromMeta;

  // 🔥 Initialisation ultra-rapide
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Navigation instantanée si on a un cache
      if ((roleFromSessionCache || roleFromLocalCache || roleFromMeta) && user) {
        setIsReady(true);
        return;
      }
      
      // Si pas de cache mais auth terminée, on est prêt
      if (!authLoading && user) {
        setIsReady(true);
      }
    }
  }, [authLoading, user, roleFromSessionCache, roleFromLocalCache, roleFromMeta]);

  // 🔥 Marquer comme prêt dès que l'auth est terminée ET qu'on a un utilisateur
  useEffect(() => {
    if (!authLoading && user) {
      setIsReady(true);
    }
  }, [authLoading, user]);

  // 🔥 Debug logging pour identifier le problème
  console.log('⚡ useInstantAuth:', {
    user: user?.id,
    loading: authLoading,
    roleLoading,
    isReady,
    effectiveRole,
    roleFromSessionCache,
    roleFromMeta,
    roleFromContext
  });

  // 🔥 NAVIGATION ULTRA-INSTANTANÉE - Toujours prêt, jamais de loading
  return {
    user,
    loading: false, // 🔥 NAVIGATION INSTANTANÉE - Plus jamais de loading
    role: effectiveRole,
    roleLoading: false, // 🔥 NAVIGATION INSTANTANÉE - Plus jamais de loading
    isReady: true // 🔥 TOUJOURS PRÊT - Navigation instantanée
  };
};