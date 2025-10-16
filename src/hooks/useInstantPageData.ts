import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface InstantPageDataOptions<T> {
  fetchFn: () => Promise<T>;
  cacheKey?: string;
  cacheTime?: number; // Durée du cache en ms
  staleTime?: number; // Temps avant que les données soient considérées comme obsolètes
  enabled?: boolean;
}

/**
 * Hook ultra-optimisé pour les données de page
 * - Cache agressif pour éviter les rechargements
 * - Pas d'état de chargement initial
 * - Navigation instantanée
 */
export function useInstantPageData<T>(options: InstantPageDataOptions<T>) {
  const {
    fetchFn,
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
    enabled = true
  } = options;

  const { user, authReady } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  
  const cacheRef = useRef<{
    data: T | null;
    timestamp: number;
    userId: string | null;
  }>({
    data: null,
    timestamp: 0,
    userId: null
  });

  const fetchTimeoutRef = useRef<number>();

  // 🔥 Fonction de récupération des données avec cache
  const fetchData = useCallback(async (force = false) => {
    if (!enabled || !user || !authReady) return;

    const now = Date.now();
    const cache = cacheRef.current;
    
    // Vérifier si on a des données en cache et si elles sont encore valides
    if (!force && cache.data && cache.userId === user.id) {
      const age = now - cache.timestamp;
      
      // Si les données sont fraîches, les retourner immédiatement
      if (age < staleTime) {
        console.log(`🔥 [${cacheKey}] Using fresh cached data (age: ${age}ms)`);
        setData(cache.data);
        setIsStale(false);
        return cache.data;
      }
      
      // Si les données sont obsolètes mais pas expirées, les retourner et rafraîchir en arrière-plan
      if (age < cacheTime) {
        console.log(`⚡ [${cacheKey}] Using stale cached data, refreshing in background (age: ${age}ms)`);
        setData(cache.data);
        setIsStale(true);
        
        // Rafraîchir en arrière-plan
        fetchData(true);
        return cache.data;
      }
    }

    // Pas de données en cache ou expirées, fetch immédiatement
    console.log(`📡 [${cacheKey}] Fetching fresh data...`);
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      // Mettre à jour le cache
      cacheRef.current = {
        data: result,
        timestamp: now,
        userId: user.id
      };

      setData(result);
      setIsLoading(false);
      setIsStale(false);
      
      console.log(`✅ [${cacheKey}] Data fetched and cached successfully`);
      return result;
    } catch (err) {
      console.error(`❌ [${cacheKey}] Error fetching data:`, err);
      setError(err as Error);
      setIsLoading(false);
      
      // En cas d'erreur, retourner les données en cache si disponibles
      if (cache.data && cache.userId === user.id) {
        console.log(`🔄 [${cacheKey}] Returning stale data due to error`);
        setData(cache.data);
        setIsStale(true);
        return cache.data;
      }
      
      throw err;
    }
  }, [fetchFn, enabled, user, authReady, cacheKey, staleTime, cacheTime]);

  // 🔥 Initialisation avec cache immédiat
  useEffect(() => {
    if (!enabled || !user || !authReady) return;

    // Vérifier le cache immédiatement
    const now = Date.now();
    const cache = cacheRef.current;
    
    if (cache.data && cache.userId === user.id) {
      const age = now - cache.timestamp;
      
      // Si on a des données en cache, les utiliser immédiatement
      if (age < cacheTime) {
        console.log(`⚡ [${cacheKey}] Initializing with cached data (age: ${age}ms)`);
        setData(cache.data);
        setIsStale(age >= staleTime);
        
        // Si les données sont obsolètes, rafraîchir en arrière-plan
        if (age >= staleTime) {
          fetchData(true);
        }
        return;
      }
    }

    // Pas de cache valide, fetch immédiatement
    fetchData();
  }, [user?.id, authReady, enabled]);

  // 🔥 Nettoyage du cache quand l'utilisateur change
  useEffect(() => {
    if (user?.id !== cacheRef.current.userId) {
      console.log(`🧹 [${cacheKey}] Clearing cache for new user`);
      cacheRef.current = { data: null, timestamp: 0, userId: null };
      setData(null);
      setIsStale(false);
      setError(null);
    }
  }, [user?.id, cacheKey]);

  // 🔥 Marquer les données comme obsolètes après staleTime
  useEffect(() => {
    if (data && !isStale) {
      const timer = setTimeout(() => {
        setIsStale(true);
        console.log(`⏰ [${cacheKey}] Data marked as stale`);
      }, staleTime);
      
      return () => clearTimeout(timer);
    }
  }, [data, isStale, staleTime, cacheKey]);

  // 🔥 Fonction pour forcer le rafraîchissement
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // 🔥 Fonction pour vider le cache
  const clearCache = useCallback(() => {
    console.log(`🧹 [${cacheKey}] Manually clearing cache`);
    cacheRef.current = { data: null, timestamp: 0, userId: null };
    setData(null);
    setIsStale(false);
    setError(null);
  }, [cacheKey]);

  return {
    data,
    error,
    isLoading,
    isStale,
    refresh,
    clearCache,
    // 🔥 Fonctions utilitaires pour la navigation instantanée
    hasData: !!data,
    isReady: !!data || !!error, // Prêt si on a des données ou une erreur
  };
}

/**
 * Hook spécialisé pour les listes avec pagination instantanée
 */
export function useInstantListData<T>(options: InstantPageDataOptions<T[]>) {
  const baseHook = useInstantPageData(options);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = useCallback(async () => {
    if (!hasMore || baseHook.isLoading) return;
    
    try {
      // Ici vous pouvez implémenter la logique de pagination
      // Pour l'instant, on simule juste
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more data:', error);
    }
  }, [hasMore, baseHook.isLoading]);
  
  return {
    ...baseHook,
    page,
    hasMore,
    loadMore,
  };
}
