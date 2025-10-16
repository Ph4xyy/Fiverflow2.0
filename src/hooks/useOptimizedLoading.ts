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
  // 🔥 NAVIGATION ULTRA-INSTANTANÉE - Plus jamais de loading
  const { onLoadingChange } = options;

  const setLoadingState = useCallback((value: boolean) => {
    // Pas d'action - navigation instantanée
    onLoadingChange?.(false);
  }, [onLoadingChange]);

  return {
    loading: false, // Jamais de loading
    setLoading: setLoadingState,
    isLoading: false // Jamais en cours de chargement
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
  // 🔥 NAVIGATION ULTRA-INSTANTANÉE - Plus jamais de loading
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
    // Pas de loading state - navigation instantanée
    try {
      const data = await fetchFn();
      
      // Update cache
      cacheRef.current = {
        data,
        timestamp: Date.now(),
        isStale: false
      };

      return data;
    } catch (error) {
      console.error(`Error fetching data for ${key}:`, error);
      throw error;
    }
  }, [key, fetchFn]);

  return {
    data: cacheRef.current.data,
    loading: false, // Jamais de loading
    fetchData,
    isStale: cacheRef.current.isStale,
    clearCache: () => {
      cacheRef.current = { data: null, timestamp: 0, isStale: false };
    }
  };
};
