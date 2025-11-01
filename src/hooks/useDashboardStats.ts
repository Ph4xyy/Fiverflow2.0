// src/hooks/useDashboardStats.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DashboardStats {
  // Clients
  totalClients: number;
  newClientsThisMonth: number;
  clientsGrowth: number; // percentage
  
  // Orders
  totalOrders: number;
  ordersThisMonth: number;
  ordersGrowth: number; // percentage
  
  // Revenue
  totalRevenue: number;
  revenueThisMonth: number;
  revenueGrowth: number; // percentage
  pendingRevenue: number;
  
  // Performance
  completionRate: number;
  averageOrderValue: number;
  averageDeliveryTime: number;
  
  // Recent Activity
  recentOrders: Array<{
    id: string;
    title: string;
    client_name: string;
    status: string;
    created_at: string;
  }>;
  
  // Charts data
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  
  topClients: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase not configured - cannot fetch dashboard stats');
      setStats(null);
      setLoading(false);
      setError('Database not configured');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupérer les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, created_at')
        .eq('user_id', user.id);

      if (clientsError) {
        console.warn('Error fetching clients (might be RLS issue or table missing):', clientsError);
        // Ne pas bloquer, continuer avec des données vides
      }

      // Récupérer les commandes (avec une requête plus simple qui ne dépend pas de clients)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, title, status, budget, created_at, start_date, completed_date, client_id')
        .eq('user_id', user.id);

      if (ordersError) {
        console.warn('Error fetching orders (might be RLS issue or table missing):', ordersError);
        // Ne pas bloquer, continuer avec des données vides
      }

      // Récupérer les noms des clients pour les commandes si possible
      let clientNames: Record<string, string> = {};
      if (clientsData && clientsData.length > 0) {
        clientsData.forEach(client => {
          clientNames[client.id] = client.name;
        });
      }

      const clients = clientsData || [];
      // Mapper les commandes avec les noms de clients
      const orders = (ordersData || []).map(order => ({
        ...order,
        clients: { name: clientNames[order.client_id] || 'Unknown Client' }
      }));

      // Calculer les statistiques
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Clients
      const totalClients = clients.length;
      const newClientsThisMonth = clients.filter(c => 
        new Date(c.created_at) >= thisMonth
      ).length;
      const newClientsLastMonth = clients.filter(c => {
        const created = new Date(c.created_at);
        return created >= lastMonth && created < thisMonth;
      }).length;
      const clientsGrowth = newClientsLastMonth > 0 
        ? Math.round(((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100)
        : newClientsThisMonth > 0 ? 100 : 0;

      // Commandes
      const totalOrders = orders.length;
      const ordersThisMonth = orders.filter(o => 
        new Date(o.created_at) >= thisMonth
      ).length;
      const ordersLastMonth = orders.filter(o => {
        const created = new Date(o.created_at);
        return created >= lastMonth && created < thisMonth;
      }).length;
      const ordersGrowth = ordersLastMonth > 0 
        ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
        : ordersThisMonth > 0 ? 100 : 0;

      // Revenus
      const totalRevenue = orders
        .filter(o => ['completed', 'delivered', 'paid'].includes(o.status))
        .reduce((sum, o) => sum + (o.budget || 0), 0);
      
      const revenueThisMonth = orders
        .filter(o => {
          const isCompleted = ['completed', 'delivered', 'paid'].includes(o.status);
          const isThisMonth = new Date(o.created_at) >= thisMonth;
          return isCompleted && isThisMonth;
        })
        .reduce((sum, o) => sum + (o.budget || 0), 0);

      const revenueLastMonth = orders
        .filter(o => {
          const isCompleted = ['completed', 'delivered', 'paid'].includes(o.status);
          const created = new Date(o.created_at);
          return isCompleted && created >= lastMonth && created < thisMonth;
        })
        .reduce((sum, o) => sum + (o.budget || 0), 0);

      const revenueGrowth = revenueLastMonth > 0 
        ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
        : revenueThisMonth > 0 ? 100 : 0;

      const pendingRevenue = orders
        .filter(o => !['completed', 'delivered', 'paid'].includes(o.status))
        .reduce((sum, o) => sum + (o.budget || 0), 0);

      // Performance
      const completedOrders = orders.filter(o => 
        ['completed', 'delivered', 'paid'].includes(o.status)
      );
      const completionRate = totalOrders > 0 
        ? Math.round((completedOrders.length / totalOrders) * 100)
        : 0;

      const averageOrderValue = completedOrders.length > 0
        ? Math.round(totalRevenue / completedOrders.length)
        : 0;

      // Temps de livraison moyen
      const deliveryTimes = completedOrders
        .map(o => {
          const start = o.start_date ? new Date(o.start_date) : new Date(o.created_at);
          const end = o.completed_date ? new Date(o.completed_date) : null;
          return end ? (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) : null;
        })
        .filter(t => t !== null) as number[];

      const averageDeliveryTime = deliveryTimes.length > 0
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
        : 0;

      // Activité récente
      const recentOrders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(o => ({
          id: o.id,
          title: o.title,
          client_name: o.clients?.name || 'Unknown Client',
          status: o.status,
          created_at: o.created_at,
        }));

      // Revenus mensuels (6 derniers mois)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthRevenue = orders
          .filter(o => {
            const isCompleted = ['completed', 'delivered', 'paid'].includes(o.status);
            const created = new Date(o.created_at);
            return isCompleted && created >= month && created <= monthEnd;
          })
          .reduce((sum, o) => sum + (o.budget || 0), 0);
        
        monthlyRevenue.push({
          month: month.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue,
        });
      }

      // Commandes par statut
      const statusCounts: Record<string, number> = {};
      orders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });
      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      }));

      // Top clients
      const clientRevenue: Record<string, { revenue: number; orders: number }> = {};
      orders.forEach(o => {
        const clientName = o.clients?.name || 'Unknown';
        if (!clientRevenue[clientName]) {
          clientRevenue[clientName] = { revenue: 0, orders: 0 };
        }
        clientRevenue[clientName].revenue += o.budget || 0;
        clientRevenue[clientName].orders += 1;
      });

      const topClients = Object.entries(clientRevenue)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const dashboardStats: DashboardStats = {
        totalClients,
        newClientsThisMonth,
        clientsGrowth,
        totalOrders,
        ordersThisMonth,
        ordersGrowth,
        totalRevenue,
        revenueThisMonth,
        revenueGrowth,
        pendingRevenue,
        completionRate,
        averageOrderValue,
        averageDeliveryTime,
        recentOrders,
        monthlyRevenue,
        ordersByStatus,
        topClients,
      };

      setStats(dashboardStats);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
