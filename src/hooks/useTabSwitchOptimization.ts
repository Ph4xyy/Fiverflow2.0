import { useEffect, useRef, useState } from 'react';

/**
 * Hook pour optimiser les rechargements lors des changements d'onglet
 * Évite les chargements inutiles quand l'utilisateur revient sur l'onglet
 * 🔥 Version améliorée avec gestion des sessions et refresh tokens
 */
export const useTabSwitchOptimization = () => {
  const [isTabVisible, setIsTabVisible] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());
  const refreshTimeoutRef = useRef<number>();
  const sessionCheckTimeoutRef = useRef<number>();

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsTabVisible(isVisible);
      
      if (isVisible) {
        // L'onglet redevient visible
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        // 🔥 Vérifier la session seulement si l'onglet a été inactif pendant plus de 5 minutes
        if (timeSinceLastActivity > 5 * 60 * 1000) {
          lastActivityRef.current = Date.now();
          
          // 🔥 Vérification silencieuse de la session sans déclencher de loading
          sessionCheckTimeoutRef.current = window.setTimeout(async () => {
            try {
              const { supabase } = await import('../lib/supabase');
              if (supabase) {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                  console.log('🔄 Tab refocus: Session check failed, attempting refresh');
                  // Essayer de rafraîchir la session
                  try {
                    await supabase.auth.refreshSession();
                  } catch (refreshErr) {
                    console.log('🔄 Tab refocus: Refresh failed, user may need to re-login');
                  }
                } else if (!session) {
                  console.log('🔄 Tab refocus: No session found, user may need to re-login');
                } else {
                  console.log('✅ Tab refocus: Session is valid');
                }
              }
            } catch (err) {
              console.log('🔄 Tab refocus: Session check error:', err);
            }
          }, 100); // Réduit de 500ms à 100ms
        }
      } else {
        // L'onglet devient invisible, enregistrer le timestamp
        lastActivityRef.current = Date.now();
      }
    };

    const handleFocus = () => {
      lastActivityRef.current = Date.now();
    };

    // 🔥 Écouter les événements de refresh de session
    const handleSessionRefresh = () => {
      console.log('🔄 Tab optimization: Session refreshed');
      lastActivityRef.current = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('ff:session:refreshed', handleSessionRefresh);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('ff:session:refreshed', handleSessionRefresh);
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (sessionCheckTimeoutRef.current) {
        clearTimeout(sessionCheckTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTabVisible,
    shouldRefresh: (minInactiveMinutes = 5) => { // Changé de 2 à 5 minutes
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      return timeSinceLastActivity > minInactiveMinutes * 60 * 1000;
    }
  };
};
