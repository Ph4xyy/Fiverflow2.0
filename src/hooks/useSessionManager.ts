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
    let timeoutId: number | undefined;
  
    // Timeout de sécurité : si Supabase bloque, on débloque après 10s
    timeoutId = window.setTimeout(() => {
      console.warn('⚠️ SessionManager: Session check timeout (10s) — forcing reset');
      isCheckingRef.current = false;
      lastSessionCheckRef.current = now;
    }, 10000);
  
    try {
      // Créer une promesse avec timeout pour getSession
      const getSessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('getSession timeout')), 8000); // 8s timeout pour getSession
      });
      
      const { data: { session }, error } = await Promise.race([getSessionPromise, timeoutPromise]) as any;
  
      if (error) {
        console.log('🔄 SessionManager: Session check failed:', error.message);
  
        if (error.message.includes('refresh_token') || error.message.includes('expired')) {
          try {
            // Créer une promesse avec timeout pour refreshSession
            const refreshPromise = supabase.auth.refreshSession();
            const refreshTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('refreshSession timeout')), 8000); // 8s timeout pour refreshSession
            });
            
            const { data: refreshData, error: refreshError } = await Promise.race([refreshPromise, refreshTimeoutPromise]) as any;
            
            if (!refreshError && refreshData.session) {
              console.log('✅ SessionManager: Session refreshed successfully');
              window.dispatchEvent(new CustomEvent('ff:session:refreshed', { 
                detail: { userId: refreshData.session.user?.id } 
              }));
            }
          } catch (refreshErr) {
            console.log('❌ Token refresh error:', refreshErr);
          }
        }
      } else if (session) {
        console.log('✅ SessionManager: Session is valid');
      }
  
    } catch (err) {
      console.log('❌ SessionManager: Session check error:', err);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      isCheckingRef.current = false; // Toujours débloquer
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
      // Reset isCheckingRef quand pas d'utilisateur
      isCheckingRef.current = false;
      return;
    }

    // Protection contre les états infinis
    if (isCheckingRef.current) {
      console.warn('⚠️ SessionManager: Already checking, skipping setup');
      return;
    }

    // 🔥 Vérification immédiate seulement si nécessaire
    // Ne pas vérifier automatiquement pour éviter les délais
    
    // 🔥 Vérifier la session toutes les 5 minutes (moins intrusif)
    sessionCheckIntervalRef.current = window.setInterval(() => {
      // Protection supplémentaire contre les checks multiples
      if (!isCheckingRef.current) {
        checkAndRefreshSession();
      }
    }, 5 * 60 * 1000); // Réduit de 2min à 5min

    // 🔥 Écouter les changements de visibilité de manière moins intrusive
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isCheckingRef.current) {
        const timeSinceLastCheck = Date.now() - lastSessionCheckRef.current;
        // 🔥 Vérifier seulement si ça fait plus de 2 minutes (moins intrusif)
        if (timeSinceLastCheck > 2 * 60 * 1000) {
          checkAndRefreshSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = undefined;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Ne pas reset isCheckingRef ici car on pourrait interrompre une vérification légitime
    };
  }, [user?.id]); // 🔥 FIXED: Remove checkAndRefreshSession from dependencies to prevent infinite loops

  return {
    checkAndRefreshSession
  };
};
