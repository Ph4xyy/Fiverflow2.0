import { useEffect, useRef } from 'react';

/**
 * Hook pour créer un useEffect throttlé qui évite les appels multiples
 */
export const useThrottledEffect = (
  effect: () => void,
  deps: any[],
  delay: number = 1000
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastRunRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;

    if (timeSinceLastRun >= delay) {
      // Exécuter immédiatement si assez de temps s'est écoulé
      effect();
      lastRunRef.current = now;
    } else {
      // Programmer l'exécution pour plus tard
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        effect();
        lastRunRef.current = Date.now();
      }, delay - timeSinceLastRun);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);
};

export default useThrottledEffect;
