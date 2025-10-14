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
  
    // Timeout de sécurité : si Supabase bloque, on débloque après 10s
    const timeout = setTimeout(() => {
      console.warn('⚠️ Session check timeout — forcing reset');
      isCheckingRef.current = false;
    }, 10000);
  
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
  
      if (error) {
        console.log('🔄 SessionManager: Session check failed:', error.message);
  
        if (error.message.includes('refresh_token') || error.message.includes('expired')) {
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshData.session) {
              window.dispatchEvent(new CustomEvent('ff:session:refreshed', { 
                detail: { userId: refreshData.session.user?.id } 
              }));
            }
          } catch (refreshErr) {
            console.log('❌ Token refresh error:', refreshErr);
          }
        }
      }
  
    } catch (err) {
      console.log('❌ Session check error:', err);
    } finally {
      clearTimeout(timeout);       // Stop le timeout
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
      return;
    }

    // 🔥 Vérification immédiate seulement si nécessaire
    // Ne pas vérifier automatiquement pour éviter les délais
    
    // 🔥 Vérifier la session toutes les 5 minutes (moins intrusif)
    sessionCheckIntervalRef.current = window.setInterval(() => {
      checkAndRefreshSession();
    }, 5 * 60 * 1000); // Réduit de 2min à 5min

    // 🔥 Écouter les changements de visibilité de manière moins intrusive
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
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
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]); // 🔥 FIXED: Remove checkAndRefreshSession from dependencies to prevent infinite loops

  return {
    checkAndRefreshSession
  };
};
