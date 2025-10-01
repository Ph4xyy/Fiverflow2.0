import { useCallback, useRef, useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';

interface UseOptimizedLoadingOptions {
  key: string;
  initialLoading?: boolean;
  timeout?: number;
  onLoadingChange?: (loading: boolean) => void;
}

/**
 * Hook optimisé pour gérer les états de chargement
 * Évite les rechargements visuels répétitifs et les états de chargement infinis
 */
export const useOptimizedLoading = (options: UseOptimizedLoadingOptions) => {
  const { key, initialLoading = false, timeout = 8000, onLoadingChange } = options;
  const { setLoading, loading } = useLoading();
  const timeoutRef = useRef<number>();
  const lastSetTimeRef = useRef<number>(0);

  const setLoadingState = useCallback((value: boolean) => {
    const now = Date.now();
    
    // Debounce rapid changes (less than 100ms apart)
    if (now - lastSetTimeRef.current < 100) {
      return;
    }
    
    lastSetTimeRef.current = now;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set loading state
    setLoading(key as any, value);
    onLoadingChange?.(value);

    // Auto-reset after timeout to prevent infinite loading
    if (value) {
      timeoutRef.current = window.setTimeout(() => {
        setLoading(key as any, false);
        onLoadingChange?.(false);
      }, timeout);
    }
  }, [key, setLoading, timeout, onLoadingChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Initialize loading state
  useEffect(() => {
    if (initialLoading) {
      setLoadingState(true);
    }
  }, [initialLoading, setLoadingState]);

  return {
    loading: loading[key as keyof typeof loading] || false,
    setLoading: setLoadingState,
    isLoading: loading[key as keyof typeof loading] || false
  };
};

/**
 * Hook pour gérer les chargements avec cache
 * Évite les rechargements inutiles des mêmes données
 */
export const useCachedLoading = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    cacheTime?: number;
    staleTime?: number;
    enabled?: boolean;
  } = {}
) => {
  const { cacheTime = 5 * 60 * 1000, staleTime = 2 * 60 * 1000, enabled = true } = options;
  const { setLoading, loading } = useLoading();
  const cacheRef = useRef<{
    data: T | null;
    timestamp: number;
    isStale: boolean;
  }>({
    data: null,
    timestamp: 0,
    isStale: false
  });

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return cacheRef.current.data;

    const now = Date.now();
    const cache = cacheRef.current;
    
    // Return cached data if still fresh and not forced
    if (!force && cache.data && (now - cache.timestamp) < staleTime) {
      return cache.data;
    }

    // Set loading state
    setLoading(key as any, true);

    try {
      const data = await fetchFn();
      
      // Update cache
      cacheRef.current = {
        data,
        timestamp: now,
        isStale: false
      };

      return data;
    } catch (error) {
      console.error(`Error fetching data for ${key}:`, error);
      throw error;
    } finally {
      setLoading(key as any, false);
    }
  }, [key, fetchFn, enabled, staleTime, setLoading]);

  // Mark as stale after cacheTime
  useEffect(() => {
    if (cacheRef.current.data) {
      const timer = setTimeout(() => {
        cacheRef.current.isStale = true;
      }, cacheTime);
      
      return () => clearTimeout(timer);
    }
  }, [cacheTime]);

  return {
    data: cacheRef.current.data,
    loading: loading[key as keyof typeof loading] || false,
    fetchData,
    isStale: cacheRef.current.isStale,
    clearCache: () => {
      cacheRef.current = { data: null, timestamp: 0, isStale: false };
    }
  };
};
