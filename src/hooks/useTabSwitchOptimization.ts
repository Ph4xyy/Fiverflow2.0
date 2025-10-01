import { useEffect, useRef, useState } from 'react';

/**
 * Hook pour optimiser les rechargements lors des changements d'onglet
 * Évite les chargements inutiles quand l'utilisateur revient sur l'onglet
 */
export const useTabSwitchOptimization = () => {
  const [isTabVisible, setIsTabVisible] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());
  const refreshTimeoutRef = useRef<number>();

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsTabVisible(isVisible);
      
      if (isVisible) {
        // L'onglet redevient visible
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        // Ne recharger que si l'onglet a été inactif pendant plus de 5 minutes
        if (timeSinceLastActivity > 5 * 60 * 1000) {
          lastActivityRef.current = Date.now();
          // DISABLED: Déclencher un refresh silencieux sans loading
          // window.dispatchEvent(new CustomEvent('ff:tab:refocus', { 
          //   detail: { shouldRefresh: true } 
          // }));
          console.log('🔄 Tab refocus detected but refresh disabled to prevent infinite loops');
        }
      } else {
        // L'onglet devient invisible, enregistrer le timestamp
        lastActivityRef.current = Date.now();
      }
    };

    const handleFocus = () => {
      lastActivityRef.current = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTabVisible,
    shouldRefresh: (minInactiveMinutes = 5) => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      return timeSinceLastActivity > minInactiveMinutes * 60 * 1000;
    }
  };
};
