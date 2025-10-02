import { useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook pour gérer les sessions de manière robuste
 * Évite les pertes de session lors des changements d'onglet
 */
export const useSessionManager = () => {
  const { user } = useAuth();
  const sessionCheckIntervalRef = useRef<number>();
  const lastSessionCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  const checkAndRefreshSession = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || isCheckingRef.current) {
      return;
    }

    isCheckingRef.current = true;
    const now = Date.now();

    try {
      // Vérifier la session actuelle
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('🔄 SessionManager: Session check failed:', error.message);
        
        // Si erreur de refresh token, essayer de rafraîchir
        if (error.message.includes('refresh_token') || error.message.includes('expired')) {
          console.log('🔄 SessionManager: Attempting token refresh...');
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshData.session) {
              console.log('✅ SessionManager: Token refreshed successfully');
              window.dispatchEvent(new CustomEvent('ff:session:refreshed', { 
                detail: { userId: refreshData.session.user?.id } 
              }));
            } else {
              console.log('❌ SessionManager: Token refresh failed:', refreshError?.message);
            }
          } catch (refreshErr) {
            console.log('❌ SessionManager: Token refresh error:', refreshErr);
          }
        }
      } else if (session) {
        // Vérifier si la session expire bientôt (dans les 5 prochaines minutes)
        const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
        if (expiresAt) {
          const timeUntilExpiry = expiresAt.getTime() - now;
          if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
            console.log('🔄 SessionManager: Session expires soon, refreshing...');
            try {
              await supabase.auth.refreshSession();
              console.log('✅ SessionManager: Proactive refresh completed');
            } catch (refreshErr) {
              console.log('❌ SessionManager: Proactive refresh failed:', refreshErr);
            }
          }
        }
      } else {
        console.log('🔄 SessionManager: No active session found');
      }
    } catch (err) {
      console.log('❌ SessionManager: Session check error:', err);
    } finally {
      isCheckingRef.current = false;
      lastSessionCheckRef.current = now;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      // Nettoyer les intervalles si pas d'utilisateur
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = undefined;
      }
      return;
    }

    // Vérifier la session immédiatement
    checkAndRefreshSession();

    // Vérifier la session toutes les 2 minutes
    sessionCheckIntervalRef.current = window.setInterval(() => {
      checkAndRefreshSession();
    }, 2 * 60 * 1000);

    // Écouter les changements de visibilité pour vérifier la session
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastSessionCheckRef.current;
        // Vérifier seulement si ça fait plus de 30 secondes
        if (timeSinceLastCheck > 30 * 1000) {
          checkAndRefreshSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, checkAndRefreshSession]);

  return {
    checkAndRefreshSession
  };
};
