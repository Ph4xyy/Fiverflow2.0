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

  // 🔥 Cache agressif pour éviter les rechargements
  const roleFromSessionCache = sessionStorage.getItem('role');
  const roleFromMeta = user?.app_metadata?.role || user?.user_metadata?.role;
  const roleFromContext = userData?.role;
  
  const effectiveRole = roleFromContext || roleFromMeta || roleFromSessionCache || null;
  const roleLoading = Boolean(userData?.loading);

  // 🔥 Initialisation instantanée
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Si on a déjà un rôle en cache ET un utilisateur, on est prêt immédiatement
      if ((roleFromSessionCache || roleFromMeta) && user) {
        setIsReady(true);
        return;
      }
      
      // Sinon, on attend que l'auth soit terminée
      if (!authLoading && user) {
        setIsReady(true);
      }
    }
  }, [authLoading, user, roleFromSessionCache, roleFromMeta]);

  // 🔥 Marquer comme prêt dès que l'auth est terminée ET qu'on a un utilisateur
  useEffect(() => {
    if (!authLoading && !roleLoading && user) {
      setIsReady(true);
    }
  }, [authLoading, roleLoading, user]);

  // 🔥 Debug logging pour identifier le problème
  console.log('⚡ useInstantAuth:', {
    user: user?.id,
    authLoading,
    roleLoading,
    isReady,
    effectiveRole,
    roleFromSessionCache,
    roleFromMeta,
    roleFromContext
  });

  return {
    user,
    loading: authLoading && !isReady, // Ne montrer loading que si pas encore prêt
    role: effectiveRole,
    roleLoading: roleLoading && !isReady, // Ne montrer loading que si pas encore prêt
    isReady
  };
};
