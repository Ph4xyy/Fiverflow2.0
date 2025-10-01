import { useEffect, useRef } from 'react';

/**
 * Hook pour créer un useEffect debounced qui évite les appels multiples
 */
export const useDebouncedEffect = (
  effect: () => void,
  deps: any[],
  delay: number = 500
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      effect();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);
};

export default useDebouncedEffect;