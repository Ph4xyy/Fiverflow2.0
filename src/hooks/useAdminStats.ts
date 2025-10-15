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
    totalRevenue: number;
  };
  plans: {
    free: number;
    pro: number;
  };
  revenue: {
    total: number;
    fromInvoices: number;
    fromReferrals: number;
    currency: string;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    created_at: string;
    role: string | null;
    is_pro: boolean;
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

        console.log('🔍 Loading admin stats from:', startISO, 'to:', endISO);

        // ===== UTILISATEURS =====
        const [
          { data: usersAll, error: usersAllErr },
          { data: usersRange, error: usersRangeErr }
        ] = await Promise.all([
          supabase.from('users').select('id, email, name, role, is_pro, created_at'),
          supabase.from('users').select('id, email, name, role, is_pro, created_at')
            .gte('created_at', startISO)
            .lte('created_at', endISO)
        ]);

        if (usersAllErr) throw usersAllErr;
        if (usersRangeErr) throw usersRangeErr;

        const allTimeUsers = usersAll?.length ?? 0;
        const newUsersInRange = usersRange?.length ?? 0;
        const adminsAllTime = (usersAll ?? []).filter(u => u.role === 'admin').length;

        // Répartition des plans
        const freeUsers = (usersRange ?? []).filter(u => !u.is_pro).length;
        const proUsers = (usersRange ?? []).filter(u => u.is_pro).length;

        // Utilisateurs récents (tous)
        const { data: recentUsersData, error: recentUsersErr } = await supabase
          .from('users')
          .select('id, email, name, role, is_pro, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentUsersErr) throw recentUsersErr;

        // ===== COMMANDES =====
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

        // ===== FACTURES =====
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

        // ===== CLIENTS =====
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

        // ===== TÂCHES ET TEMPS =====
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

        // ===== REFERRALS =====
        const { data: referralsData, error: referralsErr } = await supabase
          .from('referrals')
          .select(`
            referrer_id,
            users!referrals_referrer_id_fkey(id, email, name)
          `)
          .gte('created_at', startISO)
          .lte('created_at', endISO);

        if (referralsErr) throw referralsErr;

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

        // ===== REVENUS =====
        const totalRevenue = totalOrdersRevenue + totalInvoicesRevenue;

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
            totalRevenue
          },
          plans: {
            free: freeUsers,
            pro: proUsers
          },
          revenue: {
            total: totalRevenue,
            fromInvoices: totalInvoicesRevenue,
            fromReferrals: topReferrers.reduce((sum, ref) => sum + ref.total_earnings, 0),
            currency: 'USD'
          },
          recentUsers: recentUsersData ?? [],
          recentOrders,
          recentInvoices,
          topReferrers,
          platformStats: {
            totalClients,
            topPlatforms
          }
        };

        console.log('📊 Admin stats loaded:', finalStats);
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
