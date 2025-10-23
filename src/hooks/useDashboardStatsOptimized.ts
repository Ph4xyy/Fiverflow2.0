/**
 * useDashboardStatsOptimized - Hook optimisé pour les statistiques du dashboard
 * Utilise React Query pour la persistance en mémoire et la navigation instantanée
 */

import { useQuery } from '@tanstack/react-query';
import { useGlobalAuth } from '../contexts/GlobalAuthProvider';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface DashboardStats {
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  recentClients: any[];
  recentOrders: any[];
  monthlyRevenue: number;
  weeklyRevenue: number;
  averageOrderValue: number;
}

// Clés de requête pour React Query
const QUERY_KEYS = {
  dashboardStats: (userId: string) => ['dashboard', 'stats', userId] as const,
};

/**
 * Hook optimisé pour récupérer les statistiques du dashboard
 */
export const useDashboardStatsOptimized = () => {
  const { user, authReady } = useGlobalAuth();

  const query = useQuery({
    queryKey: user ? QUERY_KEYS.dashboardStats(user.id) : ['dashboard', 'stats', 'null'],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user || !isSupabaseConfigured || !supabase) {
        throw new Error('User not authenticated or Supabase not configured');
      }

      console.log('🔄 [DashboardStats] Loading dashboard statistics for user:', user.id);

      // Exécuter toutes les requêtes en parallèle pour optimiser les performances
      const [
        clientsResult,
        ordersResult,
        revenueResult,
        recentClientsResult,
        recentOrdersResult
      ] = await Promise.allSettled([
        // Nombre total de clients
        supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),

        // Commandes avec statistiques
        supabase
          .from('orders')
          .select('id, amount, status, created_at, clients!inner(user_id)')
          .eq('clients.user_id', user.id),

        // Revenus mensuels et hebdomadaires
        supabase
          .rpc('get_user_revenue_stats', { user_uuid: user.id }),

        // Clients récents
        supabase
          .from('clients')
          .select('id, name, platform, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),

        // Commandes récentes
        supabase
          .from('orders')
          .select('id, title, amount, status, deadline, created_at, clients!inner(name, platform, user_id)')
          .eq('clients.user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Traiter les résultats des clients
      const totalClients = clientsResult.status === 'fulfilled' && !clientsResult.value.error
        ? clientsResult.value.count || 0
        : 0;

      // Traiter les résultats des commandes
      const orders = ordersResult.status === 'fulfilled' && !ordersResult.value.error
        ? ordersResult.value.data || []
        : [];

      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;

      // Calculer le revenu total
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (parseFloat(order.amount) || 0);
      }, 0);

      // Calculer la valeur moyenne des commandes
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Traiter les revenus mensuels/hebdomadaires
      const revenueStats = revenueResult.status === 'fulfilled' && !revenueResult.value.error
        ? revenueResult.value.data || []
        : [];

      const monthlyRevenue = revenueStats.find(stat => stat.period === 'monthly')?.revenue || 0;
      const weeklyRevenue = revenueStats.find(stat => stat.period === 'weekly')?.revenue || 0;

      // Traiter les clients récents
      const recentClients = recentClientsResult.status === 'fulfilled' && !recentClientsResult.value.error
        ? recentClientsResult.value.data || []
        : [];

      // Traiter les commandes récentes
      const recentOrders = recentOrdersResult.status === 'fulfilled' && !recentOrdersResult.value.error
        ? recentOrdersResult.value.data || []
        : [];

      const stats: DashboardStats = {
        totalClients,
        totalOrders,
        totalRevenue,
        completedOrders,
        pendingOrders,
        recentClients,
        recentOrders,
        monthlyRevenue,
        weeklyRevenue,
        averageOrderValue
      };

      console.log('✅ [DashboardStats] Statistics loaded successfully:', stats);
      return stats;
    },
    enabled: !!user && authReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    stats: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    isStale: query.isStale,
    dataUpdatedAt: query.dataUpdatedAt,
  };
};

export default useDashboardStatsOptimized;
