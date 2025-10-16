import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface LoadingState {
  isActive: boolean;
  message: string;
  startTime: number;
}

/**
 * Hook intelligent pour gérer le loading avec optimisations
 * - Évite les flashs rapides avec un délai
 * - Gère un cache des pages visitées
 * - Timeout automatique pour éviter les états infinis
 */
export const useSmartLoading = (options?: {
  defaultDelay?: number;
  defaultMessage?: string;
  timeout?: number;
}) => {
  const location = useLocation();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isActive: false,
    message: options?.defaultMessage || 'Loading...',
    startTime: 0
  });

  const visitedPagesRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<number>();
  const delayTimeoutRef = useRef<number>();

  const defaultDelay = options?.defaultDelay || 150; // 150ms par défaut
  const timeout = options?.timeout || 10000; // 10s timeout par défaut

  // Marquer la page actuelle comme visitée
  useEffect(() => {
    visitedPagesRef.current.add(location.pathname);
  }, [location.pathname]);

  const startLoading = useCallback((message?: string) => {
    // Si on a déjà visité cette page, ne pas afficher de loader
    if (visitedPagesRef.current.has(location.pathname)) {
      return;
    }

    const startTime = Date.now();
    
    // Clear any existing timeouts
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Délai avant d'afficher le loader
    delayTimeoutRef.current = window.setTimeout(() => {
      setLoadingState({
        isActive: true,
        message: message || options?.defaultMessage || 'Loading...',
        startTime
      });

      // Timeout de sécurité
      timeoutRef.current = window.setTimeout(() => {
        console.warn('🚨 useSmartLoading: Loading timeout reached, stopping loading');
        stopLoading();
      }, timeout);
    }, defaultDelay);
  }, [location.pathname, defaultDelay, timeout, options?.defaultMessage]);

  const stopLoading = useCallback(() => {
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoadingState(prev => ({
      ...prev,
      isActive: false
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message
    }));
  }, []);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Nettoyer le loading quand on change de page
  useEffect(() => {
    stopLoading();
  }, [location.pathname, stopLoading]);

  return {
    isLoading: loadingState.isActive,
    loadingMessage: loadingState.message,
    startLoading,
    stopLoading,
    updateMessage,
    // Fonction pour forcer le loading (ignore le cache)
    forceStartLoading: useCallback((message?: string) => {
      const startTime = Date.now();
      
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setLoadingState({
        isActive: true,
        message: message || options?.defaultMessage || 'Loading...',
        startTime
      });

      timeoutRef.current = window.setTimeout(() => {
        console.warn('🚨 useSmartLoading: Force loading timeout reached');
        stopLoading();
      }, timeout);
    }, [timeout, stopLoading, options?.defaultMessage])
  };
};

export default useSmartLoading;
