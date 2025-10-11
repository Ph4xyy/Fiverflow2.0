import { useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthResilienceConfig {
  onSessionRestored: (session: Session) => void;
  onSessionLost: () => void;
  maxRetries?: number;
  baseDelay?: number;
}

/**
 * Hook de résilience pour gérer la persistance de session Supabase
 * avec backoff exponentiel, détection online/offline et sync storage
 */
export const useAuthResilience = (config: AuthResilienceConfig) => {
  const { onSessionRestored, onSessionLost, maxRetries = 5, baseDelay = 1000 } = config;
  
  const isRefreshingRef = useRef(false);
  const retryCountRef = useRef(0);
  const lastRefreshAttemptRef = useRef(0);
  const isOnlineRef = useRef(navigator.onLine);
  const mountedRef = useRef(true);

  // Détection de l'état online/offline
  useEffect(() => {
    const handleOnline = () => {
      console.log('[AuthResilience] Network online');
      isOnlineRef.current = true;
      // Tenter un refresh immédiat après retour online
      attemptSessionRefresh(true);
    };

    const handleOffline = () => {
      console.log('[AuthResilience] Network offline');
      isOnlineRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fonction de refresh avec backoff exponentiel et retry
  const attemptSessionRefresh = useCallback(async (force: boolean = false) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[AuthResilience] Supabase not configured');
      return null;
    }

    // Ne pas tenter si offline
    if (!isOnlineRef.current) {
      console.log('[AuthResilience] Skipping refresh - offline');
      return null;
    }

    // Debounce - minimum 2 secondes entre tentatives (sauf si forcé)
    const now = Date.now();
    if (!force && now - lastRefreshAttemptRef.current < 2000) {
      console.log('[AuthResilience] Skipping refresh - too soon');
      return null;
    }

    // Éviter les refreshes simultanés
    if (isRefreshingRef.current) {
      console.log('[AuthResilience] Skipping refresh - already in progress');
      return null;
    }

    lastRefreshAttemptRef.current = now;
    isRefreshingRef.current = true;

    try {
      console.log('[AuthResilience] Attempting session refresh (retry:', retryCountRef.current, ')');

      // Étape 1 : Essayer getSession d'abord
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (!sessionError && sessionData.session) {
        const session = sessionData.session;
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const fiveMinutes = 5 * 60 * 1000;

        console.log('[AuthResilience] Session found:', {
          userId: session.user.id,
          expiresAt: expiresAt.toISOString(),
          isExpired: expiresAt < now,
          expiresIn: Math.round((expiresAt.getTime() - now.getTime()) / 1000) + 's'
        });

        // Si la session est expirée ou expire bientôt (< 5 min)
        if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
          console.log('[AuthResilience] Session expired or expiring soon, refreshing token...');
          
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

          if (!refreshError && refreshData.session) {
            console.log('[AuthResilience] ✅ Token refreshed successfully');
            retryCountRef.current = 0; // Reset retry count on success
            if (mountedRef.current) {
              onSessionRestored(refreshData.session);
            }
            return refreshData.session;
          } else {
            console.error('[AuthResilience] ❌ Token refresh failed:', refreshError?.message);
            
            // Retry avec backoff exponentiel
            if (retryCountRef.current < maxRetries) {
              const delay = baseDelay * Math.pow(2, retryCountRef.current);
              console.log(`[AuthResilience] Retrying in ${delay}ms...`);
              retryCountRef.current++;
              
              setTimeout(() => {
                attemptSessionRefresh(true);
              }, delay);
            } else {
              console.error('[AuthResilience] ❌ Max retries reached, session lost');
              retryCountRef.current = 0;
              if (mountedRef.current) {
                onSessionLost();
              }
            }
            return null;
          }
        } else {
          // Session encore valide
          console.log('[AuthResilience] ✅ Session still valid');
          retryCountRef.current = 0;
          if (mountedRef.current) {
            onSessionRestored(session);
          }
          return session;
        }
      } else {
        // Pas de session trouvée, essayer refreshSession quand même
        console.warn('[AuthResilience] No session found, attempting refresh...');
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (!refreshError && refreshData.session) {
          console.log('[AuthResilience] ✅ Session restored via refresh');
          retryCountRef.current = 0;
          if (mountedRef.current) {
            onSessionRestored(refreshData.session);
          }
          return refreshData.session;
        } else {
          console.error('[AuthResilience] ❌ Failed to restore session:', refreshError?.message);
          
          // Retry avec backoff
          if (retryCountRef.current < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCountRef.current);
            console.log(`[AuthResilience] Retrying in ${delay}ms...`);
            retryCountRef.current++;
            
            setTimeout(() => {
              attemptSessionRefresh(true);
            }, delay);
          } else {
            console.error('[AuthResilience] ❌ Max retries reached, session lost');
            retryCountRef.current = 0;
            if (mountedRef.current) {
              onSessionLost();
            }
          }
          return null;
        }
      }
    } catch (err) {
      console.error('[AuthResilience] ❌ Unexpected error:', err);
      
      // Retry sur erreur inattendue
      if (retryCountRef.current < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCountRef.current);
        console.log(`[AuthResilience] Retrying after error in ${delay}ms...`);
        retryCountRef.current++;
        
        setTimeout(() => {
          attemptSessionRefresh(true);
        }, delay);
      } else {
        retryCountRef.current = 0;
      }
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onSessionRestored, onSessionLost, maxRetries, baseDelay]);

  // Listener pour visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mountedRef.current) {
        console.log('[AuthResilience] 👁️ Page visible, checking session...');
        attemptSessionRefresh(false);
      } else {
        console.log('[AuthResilience] 🔒 Page hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attemptSessionRefresh]);

  // Listener pour focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      if (mountedRef.current) {
        console.log('[AuthResilience] 🎯 Window focused, checking session...');
        attemptSessionRefresh(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [attemptSessionRefresh]);

  // Synchronisation du storage entre onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Détecter les changements dans le storage d'auth Supabase
      if (e.key && e.key.includes('fiverflow.auth')) {
        console.log('[AuthResilience] 🔄 Storage changed in another tab, syncing...');
        // Attendre un peu pour laisser Supabase se synchroniser
        setTimeout(() => {
          attemptSessionRefresh(true);
        }, 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [attemptSessionRefresh]);

  // Refresh périodique (toutes les 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && mountedRef.current && isOnlineRef.current) {
        console.log('[AuthResilience] ⏰ Periodic check...');
        attemptSessionRefresh(false);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [attemptSessionRefresh]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { attemptSessionRefresh };
};

