import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook intelligent pour gérer le loading avec optimisations
 * 🔥 VERSION ULTRA-INSTANTANÉE - Plus jamais de loading
 */
export const useSmartLoading = (options?: {
  defaultDelay?: number;
  defaultMessage?: string;
  timeout?: number;
}) => {
  // 🔥 NAVIGATION ULTRA-INSTANTANÉE - Plus jamais de loading
  const location = useLocation();

  const startLoading = useCallback((message?: string) => {
    // Pas d'action - navigation instantanée
  }, []);

  const stopLoading = useCallback(() => {
    // Pas d'action - navigation instantanée
  }, []);

  const updateMessage = useCallback((message: string) => {
    // Pas d'action - navigation instantanée
  }, []);

  return {
    isLoading: false, // Jamais de loading
    loadingMessage: '',
    startLoading,
    stopLoading,
    updateMessage,
    // Fonction pour forcer le loading (ignore le cache)
    forceStartLoading: useCallback((message?: string) => {
      // Pas d'action - navigation instantanée
    }, [])
  };
};

export default useSmartLoading;