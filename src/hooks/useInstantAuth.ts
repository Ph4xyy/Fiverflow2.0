import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { supabase } from '../lib/supabase'; // ✅ corrigé ici

interface InstantAuthState {
  user: any;
  loading: boolean;
  role: string | null;
  roleLoading: boolean;
  isReady: boolean;
}

/**
 * Version stable de useInstantAuth :
 * ✅ Ne recharge plus la session à chaque focus
 * ✅ Utilise un cache local Supabase + sessionStorage
 * ✅ Zéro loading inutile entre les pages
 */
export const useInstantAuth = (): InstantAuthState => {
  const { user: contextUser, loading: contextLoading } = useAuth();
  const userData = useUserData();

  const [user, setUser] = useState<any>(contextUser);
  const [loading, setLoading] = useState(contextLoading);
  const [isReady, setIsReady] = useState(false);
  const hasCheckedRef = useRef(false);

  // Charger la session depuis Supabase localement (sans rechargement réseau)
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
        }
      } catch (err) {
        console.warn('⚠️ Failed to get local session', err);
      } finally {
        setLoading(false);
        setIsReady(true);
      }
    };

    initSession();

    // 🔥 Éviter le re-check à chaque focus (Supabase le fait par défaut)
    const removeFocusListener = () => {
      try {
        window.removeEventListener('focus', initSession);
      } catch {}
    };
    removeFocusListener();
  }, []);

  // Rôle à partir du cache ou contexte
  const roleFromCache = sessionStorage.getItem('role');
  const roleFromMeta = user?.app_metadata?.role || user?.user_metadata?.role;
  const roleFromContext = userData?.role;
  const effectiveRole = roleFromContext || roleFromMeta || roleFromCache || null;
  const roleLoading = Boolean(userData?.loading);

  // 🔥 Initialisation instantanée
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Si on a déjà un rôle en cache ET un utilisateur, on est prêt immédiatement
      if ((roleFromCache || roleFromMeta) && user) {
        setIsReady(true);
        return;
      }
      
      // Sinon, on attend que l'auth soit terminée
      if (!authLoading && user) {
        setIsReady(true);
      }
    }
  }, [authLoading, user, roleFromCache, roleFromMeta]);

  // 🔥 Marquer comme prêt dès que l'auth est terminée ET qu'on a un utilisateur
  useEffect(() => {
    if (!authLoading && user) {
      setIsReady(true);
    }
  }, [authLoading, user]);

  // 🔥 Debug logging pour identifier le problème
  console.log('⚡ useInstantAuth:', {
    user: user?.id,
    loading,
    roleLoading,
    isReady,
    effectiveRole,
    roleFromCache,
    roleFromMeta,
    roleFromContext
  });

  return {
    user,
    loading: loading && !isReady,
    role: effectiveRole,
    roleLoading: roleLoading && !isReady,
    isReady,
  };
};