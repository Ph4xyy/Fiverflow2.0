import { useEffect, useRef } from 'react';
import { useGlobalAuth } from '../contexts/GlobalAuthProvider';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Hook pour précharger les données des pages principales
 * - Se déclenche dès que l'utilisateur est connecté
 * - Cache les données pour navigation instantanée
 * - Fonctionne en arrière-plan
 */
export const usePreloadData = () => {
  const { user, authReady } = useGlobalAuth();
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !authReady || !isSupabaseConfigured || !supabase) {
      return;
    }

    const preloadKey = `preload-${user.id}`;
    
    // Éviter le double préchargement
    if (preloadedRef.current.has(preloadKey)) {
      return;
    }

    console.log('🚀 [PreloadData] Starting background data preload for user:', user.id);
    preloadedRef.current.add(preloadKey);

    const preloadAllData = async () => {
      try {
        // Précharger les données des clients
        const clientsPromise = supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .limit(50); // Limite pour éviter de surcharger

        // Précharger les commandes récentes
        const ordersPromise = supabase
          .from('orders')
          .select('id, title, amount, status, deadline, created_at, clients!inner(name, platform, user_id)')
          .eq('clients.user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        // Précharger les tâches récentes
        const tasksPromise = supabase
          .from('tasks')
          .select('id, title, description, status, priority, due_date, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        // Précharger le profil utilisateur
        const profilePromise = supabase
          .from('users')
          .select('name, role, created_at')
          .eq('id', user.id)
          .single();

        // Exécuter toutes les requêtes en parallèle
        const [clientsResult, ordersResult, tasksResult, profileResult] = await Promise.allSettled([
          clientsPromise,
          ordersPromise,
          tasksPromise,
          profilePromise
        ]);

        // Mettre en cache les résultats
        if (clientsResult.status === 'fulfilled' && !clientsResult.value.error) {
          const cacheKey = `clients-${user.id}`;
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: clientsResult.value.data,
            timestamp: Date.now()
          }));
          console.log('✅ [PreloadData] Clients cached:', clientsResult.value.data?.length || 0);
        }

        if (ordersResult.status === 'fulfilled' && !ordersResult.value.error) {
          const cacheKey = `orders-${user.id}`;
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: ordersResult.value.data,
            timestamp: Date.now()
          }));
          console.log('✅ [PreloadData] Orders cached:', ordersResult.value.data?.length || 0);
        }

        if (tasksResult.status === 'fulfilled' && !tasksResult.value.error) {
          const cacheKey = `tasks-${user.id}`;
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: tasksResult.value.data,
            timestamp: Date.now()
          }));
          console.log('✅ [PreloadData] Tasks cached:', tasksResult.value.data?.length || 0);
        }

        if (profileResult.status === 'fulfilled' && !profileResult.value.error) {
          const cacheKey = `profile-${user.id}`;
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: profileResult.value.data,
            timestamp: Date.now()
          }));
          console.log('✅ [PreloadData] Profile cached');
        }

        console.log('🎉 [PreloadData] All data preloaded successfully');
      } catch (error) {
        console.error('❌ [PreloadData] Error during preload:', error);
      }
    };

    // 🔥 NAVIGATION INSTANTANÉE - Plus de délai, préchargement immédiat
    preloadAllData();
  }, [user?.id, authReady]);

  // Nettoyer le cache quand l'utilisateur change
  useEffect(() => {
    return () => {
      if (user?.id) {
        preloadedRef.current.delete(`preload-${user.id}`);
      }
    };
  }, [user?.id]);
};

/**
 * Fonction utilitaire pour récupérer les données en cache
 */
export const getCachedData = <T>(key: string, maxAge = 5 * 60 * 1000): T | null => {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age > maxAge) {
      sessionStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cached data:', error);
    return null;
  }
};

/**
 * Fonction utilitaire pour mettre en cache les données
 */
export const setCachedData = <T>(key: string, data: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};
