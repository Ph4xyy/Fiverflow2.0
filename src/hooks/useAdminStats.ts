import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface AdminStats {
  totals: {
    allTimeUsers: number;
    newUsersInRange: number;
    adminsAllTime: number;
    totalOrders: number;
    totalInvoices: number;
    totalClients: number;
    totalTasks: number;
    totalTimeEntries: number;
    totalReferrals: number;
    totalRevenue: number;
  };
  plans: {
    free: number;
    pro: number;
  };
  revenue: {
    total: number;
    fromOrders: number;
    fromInvoices: number;
    fromReferrals: number;
    currency: string;
  };
  subscriptions: {
    total: number;
    active: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    created_at: string;
    role: string | null;
    current_plan: string;
  }>;
  recentOrders: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    created_at: string;
    client_name: string;
  }>;
  recentInvoices: Array<{
    id: string;
    number: string;
    total: number;
    status: string;
    created_at: string;
    client_name: string;
  }>;
  topReferrers: Array<{
    id: string;
    email: string | null;
    name: string | null;
    referral_count: number;
    total_earnings: number;
  }>;
  platformStats: {
    totalClients: number;
    topPlatforms: Array<{
      platform: string;
      count: number;
    }>;
  };
}

export const useAdminStats = (startDate: string, endDate: string) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const safeNumber = (n: any) => (typeof n === 'number' && !Number.isNaN(n) ? n : Number(n) || 0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const startISO = new Date(`${startDate}T00:00:00.000Z`).toISOString();
        const endISO = new Date(`${endDate}T23:59:59.999Z`).toISOString();

        console.log('🔍 Loading ADMIN stats from:', startISO, 'to:', endISO);

        // ===== UTILISER LA FONCTION ADMIN COMPLÈTE =====
        const { data: adminStatsData, error: adminStatsErr } = await supabase
          .rpc('get_complete_admin_stats', {
            start_date: startISO,
            end_date: endISO
          });

        if (adminStatsErr) {
          console.warn('Complete admin function not available, falling back to direct queries:', adminStatsErr);
          // Fallback to direct queries if admin function doesn't exist
        } else if (adminStatsData) {
          console.log('📊 Using complete admin stats function:', adminStatsData);
          // Utiliser les données de la fonction admin si disponible
          const stats = adminStatsData;
          
          const finalStats: AdminStats = {
            totals: {
              allTimeUsers: stats.users.total,
              newUsersInRange: stats.users.new_period,
              adminsAllTime: stats.users.admins,
              totalOrders: stats.orders,
              totalInvoices: stats.invoices,
              totalClients: stats.clients,
              totalTasks: stats.tasks,
              totalTimeEntries: stats.time_entries,
              totalReferrals: 0, // Pas dans la fonction pour l'instant
              totalRevenue: stats.revenue.orders + stats.revenue.invoices + stats.revenue.subscriptions
            },
            plans: {
              free: stats.plans.free,
              pro: stats.plans.pro
            },
            revenue: {
              total: stats.revenue.orders + stats.revenue.invoices + stats.revenue.subscriptions,
              fromOrders: stats.revenue.orders,
              fromInvoices: stats.revenue.invoices,
              fromReferrals: 0, // Pas dans la fonction pour l'instant
              currency: 'USD'
            },
            subscriptions: {
              total: stats.subscriptions.total,
              active: stats.subscriptions.active,
              monthlyRevenue: stats.subscriptions.monthly_revenue,
              yearlyRevenue: stats.subscriptions.yearly_revenue
            },
            recentUsers: [], // Pas dans la fonction pour l'instant
            recentOrders: [],
            recentInvoices: [],
            topReferrers: [],
            platformStats: {
              totalClients: stats.clients,
              topPlatforms: []
            }
          };

          console.log('📊 GLOBAL Admin stats loaded from function:', finalStats);
          setStats(finalStats);
          return;
        }

        // ===== UTILISATEURS (avec politiques admin) =====
        const [
          { data: usersAll, error: usersAllErr },
          { data: usersRange, error: usersRangeErr }
        ] = await Promise.all([
          supabase.from('users').select('id, email, name, role, current_plan, created_at'),
          supabase.from('users').select('id, email, name, role, current_plan, created_at')
            .gte('created_at', startISO)
            .lte('created_at', endISO)
        ]);

        if (usersAllErr) throw usersAllErr;
        if (usersRangeErr) throw usersRangeErr;

        const allTimeUsers = usersAll?.length ?? 0;
        const newUsersInRange = usersRange?.length ?? 0;
        const adminsAllTime = (usersAll ?? []).filter(u => u.role === 'admin').length;

        console.log('👑 Admins found:', (usersAll ?? []).filter(u => u.role === 'admin'));

        // Répartition des plans (TOUS les utilisateurs, pas seulement la période)
        const allUsers = usersAll ?? [];
        const freeUsers = allUsers.filter(u => u.current_plan === 'free').length;
        const proUsers = allUsers.filter(u => u.current_plan === 'pro' || u.current_plan === 'excellence').length;

        // Utilisateurs récents (tous)
        const { data: recentUsersData, error: recentUsersErr } = await supabase
          .from('users')
          .select('id, email, name, role, current_plan, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentUsersErr) throw recentUsersErr;

        // ===== COMMANDES (avec politiques admin) =====
        const { data: ordersData, error: ordersErr } = await supabase
          .from('orders')
          .select(`
            id, title, amount, status, created_at,
            clients!inner(name)
          `);

        if (ordersErr) throw ordersErr;

        const totalOrders = ordersData?.length ?? 0;
        const totalOrdersRevenue = (ordersData ?? []).reduce((sum, order) => 
          sum + safeNumber(order.amount), 0);

        // Commandes récentes
        const recentOrders = (ordersData ?? [])
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map((order: any) => ({
            id: order.id,
            title: order.title,
            amount: safeNumber(order.amount),
            status: order.status,
            created_at: order.created_at,
            client_name: order.clients?.name || 'Client inconnu'
          }));

        // ===== FACTURES (avec politiques admin) =====
        const { data: invoicesData, error: invoicesErr } = await supabase
          .from('invoices')
          .select(`
            id, number, total, status, created_at,
            clients!inner(name)
          `);

        if (invoicesErr) throw invoicesErr;

        const totalInvoices = invoicesData?.length ?? 0;
        const totalInvoicesRevenue = (invoicesData ?? []).reduce((sum, invoice) => 
          sum + safeNumber(invoice.total), 0);

        // Factures récentes
        const recentInvoices = (invoicesData ?? [])
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map((invoice: any) => ({
            id: invoice.id,
            number: invoice.number,
            total: safeNumber(invoice.total),
            status: invoice.status,
            created_at: invoice.created_at,
            client_name: invoice.clients?.name || 'Client inconnu'
          }));

        // ===== CLIENTS (avec politiques admin) =====
        const { data: clientsData, error: clientsErr } = await supabase
          .from('clients')
          .select('id, platform');

        if (clientsErr) throw clientsErr;

        const totalClients = clientsData?.length ?? 0;

        // Top plateformes
        const platformCounts = (clientsData ?? []).reduce((acc: Record<string, number>, client) => {
          acc[client.platform] = (acc[client.platform] || 0) + 1;
          return acc;
        }, {});

        const topPlatforms = Object.entries(platformCounts)
          .map(([platform, count]) => ({ platform, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // ===== TÂCHES ET TEMPS (avec politiques admin) =====
        const [
          { data: tasksData, error: tasksErr },
          { data: timeEntriesData, error: timeEntriesErr }
        ] = await Promise.all([
          supabase.from('tasks').select('id'),
          supabase.from('time_entries').select('id, duration_minutes')
        ]);

        if (tasksErr) throw tasksErr;
        if (timeEntriesErr) throw timeEntriesErr;

        const totalTasks = tasksData?.length ?? 0;
        const totalTimeEntries = timeEntriesData?.length ?? 0;

        // ===== REFERRALS (avec politiques admin) =====
        const { data: referralsData, error: referralsErr } = await supabase
          .from('referrals')
          .select(`
            referrer_id,
            users!referrals_referrer_id_fkey(id, email, name)
          `)
          .gte('created_at', startISO)
          .lte('created_at', endISO);

        if (referralsErr) throw referralsErr;

        const totalReferrals = referralsData?.length ?? 0;

        // Calculer les top referrers
        const referrerCounts = new Map<string, { user: any; count: number }>();
        (referralsData ?? []).forEach((ref: any) => {
          const referrerId = ref.referrer_id;
          const user = ref.users;
          
          if (!referrerCounts.has(referrerId)) {
            referrerCounts.set(referrerId, { user, count: 0 });
          }
          referrerCounts.get(referrerId)!.count++;
        });

        const topReferrers = Array.from(referrerCounts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map(item => ({
            id: item.user?.id || 'unknown',
            email: item.user?.email || null,
            name: item.user?.name || null,
            referral_count: item.count,
            total_earnings: item.count * 10 // Estimation basique
          }));

        // ===== ABONNEMENTS =====
        let subscriptionStats = {
          total: 0,
          active: 0,
          monthlyRevenue: 0,
          yearlyRevenue: 0
        };

        try {
          const { data: subscriptionsData, error: subscriptionsErr } = await supabase
            .from('subscriptions')
            .select('id, amount, billing_cycle, is_active');

          if (!subscriptionsErr && subscriptionsData) {
            subscriptionStats = {
              total: subscriptionsData.length,
              active: subscriptionsData.filter(s => s.is_active).length,
              monthlyRevenue: subscriptionsData
                .filter(s => s.billing_cycle === 'monthly' && s.is_active)
                .reduce((sum, s) => sum + safeNumber(s.amount), 0),
              yearlyRevenue: subscriptionsData
                .filter(s => s.billing_cycle === 'yearly' && s.is_active)
                .reduce((sum, s) => sum + safeNumber(s.amount), 0)
            };
          }
        } catch (e) {
          console.warn('Subscriptions table not available:', e);
        }

        // ===== REVENUS =====
        const totalRevenue = totalOrdersRevenue + totalInvoicesRevenue + subscriptionStats.monthlyRevenue + subscriptionStats.yearlyRevenue;

        const finalStats: AdminStats = {
          totals: {
            allTimeUsers,
            newUsersInRange,
            adminsAllTime,
            totalOrders,
            totalInvoices,
            totalClients,
            totalTasks,
            totalTimeEntries,
            totalReferrals,
            totalRevenue
          },
          plans: {
            free: freeUsers,
            pro: proUsers
          },
          revenue: {
            total: totalRevenue,
            fromOrders: totalOrdersRevenue,
            fromInvoices: totalInvoicesRevenue,
            fromReferrals: topReferrers.reduce((sum, ref) => sum + ref.total_earnings, 0),
            currency: 'USD'
          },
          subscriptions: subscriptionStats,
          recentUsers: recentUsersData ?? [],
          recentOrders,
          recentInvoices,
          topReferrers,
          platformStats: {
            totalClients,
            topPlatforms
          }
        };

        console.log('📊 GLOBAL Admin stats loaded:', finalStats);
        setStats(finalStats);

      } catch (err: any) {
        console.error('❌ Error loading admin stats:', err);
        setError(err.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, startDate, endDate]);

  return { stats, loading, error };
};
