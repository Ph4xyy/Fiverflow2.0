// src/pages/StatsPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout, { cardClass } from '@/components/Layout';
import PlanRestrictedPage from '@/components/PlanRestrictedPage';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { DollarSign, ShoppingCart, Users, Clock, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Period = '7d' | '30d' | '90d';

const periodOptions: { label: string; value: Period }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

const parseNum = (v: any) => (typeof v === 'number' ? v : parseFloat(v) || 0);
const toDate = (v: any) => (v ? new Date(v) : null);
const daysBetween = (a: Date, b: Date) => Math.abs((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
const normStatus = (s: any) => (s ? String(s).toLowerCase() : '');

const StatsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { restrictions, loading: planLoading, checkAccess } = usePlanRestrictions();

  const [period, setPeriod] = useState<Period>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const { sinceTimestamp, sinceDateOnly } = useMemo(() => {
    const d = new Date();
    if (period === '7d') d.setDate(d.getDate() - 7);
    if (period === '30d') d.setDate(d.getDate() - 30);
    if (period === '90d') d.setDate(d.getDate() - 90);
    const iso = d.toISOString();
    return { sinceTimestamp: iso, sinceDateOnly: iso.slice(0, 10) };
  }, [period]);

  const fetchStatsData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setOffline(true);
      setClients([]);
      setOrders([]);
      return;
    }
    if (!user) return;

    setRefreshing(true);
    setOffline(false);

    try {
      const { data: clientsData, error: clientsErr } = await supabase
        .from('clients')
        .select('id,name,platform,created_at,user_id')
        .eq('user_id', user.id);

      if (clientsErr) throw clientsErr;
      const safeClients = clientsData || [];
      setClients(safeClients);

      const clientIds = safeClients.map((c) => c.id);
      if (clientIds.length === 0) {
        setOrders([]);
        return;
      }

      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .in('client_id', clientIds)
        .or(
          [
            `created_at.gte.${sinceTimestamp}`,
            `start_date.gte.${sinceDateOnly}`,
            `completion_date.gte.${sinceDateOnly}`,
          ].join(',')
        );

      if (ordersErr) throw ordersErr;
      setOrders(ordersData || []);
    } catch (e) {
      console.warn('[Stats] fetch error:', e);
      setOffline(true);
      setClients([]);
      setOrders([]);
    } finally {
      setRefreshing(false);
    }
  }, [user, sinceTimestamp, sinceDateOnly]);

  useEffect(() => {
    if (authLoading) return;
    if (!user && !authLoading) {
      setClients([]);
      setOrders([]);
      return;
    }
    fetchStatsData();
    const i = setInterval(fetchStatsData, 30000);
    return () => clearInterval(i);
  }, [fetchStatsData, user, authLoading]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    const channel = supabase
      .channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStatsData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchStatsData)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchStatsData]);

  // Derived data
  const clientsById: Record<string, any> = clients.reduce((acc, c) => ((acc[c.id] = c), acc), {} as Record<string, any>);
  const isDone = (o: any) => ['completed', 'delivered', 'paid', 'done'].includes(normStatus(o.status));

  const completedOrders = orders.filter(isDone);
  const pendingOrders = orders.filter((o) => !isDone(o));

  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseNum(o.amount), 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + parseNum(o.amount), 0);

  const deliveryDurations = completedOrders
    .map((o) => {
      const start = toDate(o.start_date) || toDate(o.created_at);
      const end = toDate(o.completion_date);
      return start && end ? daysBetween(start, end) : null;
    })
    .filter((v): v is number => v !== null);
  const averageDeliveryTime = deliveryDurations.length
    ? deliveryDurations.reduce((a, b) => a + b, 0) / deliveryDurations.length
    : 0;

  const earningsByPlatform = orders.reduce<Record<string, number>>((acc, o) => {
    const cl = clientsById[o.client_id];
    const platform = cl?.platform || 'Unknown';
    acc[platform] = (acc[platform] || 0) + parseNum(o.amount);
    return acc;
  }, {});
  const totalForBreakdown = Object.values(earningsByPlatform).reduce((a, b) => a + b, 0) || 1;

  const revenueByClient: Record<string, number> = orders.reduce((acc, o) => {
    const id = o.client_id;
    if (!id) return acc;
    acc[id] = (acc[id] || 0) + parseNum(o.amount);
    return acc;
  }, {} as Record<string, number>);

  const topClients = Object.entries(revenueByClient)
    .map(([clientId, revenue]) => ({ name: clientsById[clientId]?.name ?? 'Unknown', revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const recentActivities = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.start_date || b.completion_date).getTime() -
        new Date(a.created_at || a.start_date || a.completion_date).getTime()
    )
    .slice(0, 5)
    .map((o) => ({
      label: o.title || o.description || `${clientsById[o.client_id]?.name ?? 'Order'} • ${o.status ?? ''}`,
      created_at: o.created_at || o.start_date || o.completion_date,
    }));

  const trendMap = completedOrders.reduce<Record<string, number>>((acc, o) => {
    const d = toDate(o.completion_date);
    if (!d) return acc;
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString();
    acc[key] = (acc[key] || 0) + parseNum(o.amount);
    return acc;
  }, {});
  const completionTrendData = Object.entries(trendMap).map(([date, revenue]) => ({ date, revenue }));

  // Access gating
  if (planLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-3 text-gray-600 dark:text-gray-400">Checking your access…</p>
        </div>
      </Layout>
    );
  }

  const hasAccess = !!(restrictions?.isAdmin || checkAccess('stats'));
  if (!hasAccess) {
    return (
      <PlanRestrictedPage
        feature="stats"
        currentPlan={restrictions?.plan || 'free'}
        isTrialActive={restrictions?.isTrialActive}
        trialDaysRemaining={restrictions?.trialDaysRemaining}
      />
    );
  }

  // Render
  return (
    <Layout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Statistics</h1>
          <div className="flex items-center gap-3">
            {offline && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                Offline preview: Supabase non accessible
              </span>
            )}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="border rounded-lg p-2 text-sm bg-white text-gray-900 dark:bg-slate-800 dark:text-white"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchStatsData}
              className="p-2 border rounded-lg bg-white text-gray-900 dark:bg-slate-800 dark:text-white"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI CARDS (use same container bg as Dashboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${pendingRevenue.toFixed(2)}</p>
              </div>
              <ShoppingCart className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageDeliveryTime.toFixed(1)} days</p>
              </div>
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            </div>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
              </div>
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-500" />
            </div>
          </div>
        </div>

        {/* Revenue Breakdown + Completion Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(earningsByPlatform).map(([platform, amount], idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{platform}</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 mx-4 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 dark:bg-green-500"
                      style={{ width: `${(amount / totalForBreakdown) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">${amount.toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(earningsByPlatform).length === 0 && (
                <p className="text-sm text-gray-500">No data in this period.</p>
              )}
            </div>
          </div>

          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Order Completion Trend</h2>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionTrendData}>
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="revenue">
                    {completionTrendData.map((_, index) => (
                      <Cell key={`cell-${index}`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Clients + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Clients</h2>
            <div className="space-y-3">
              {topClients.length === 0 && <p className="text-sm text-gray-500">No data.</p>}
              {topClients.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{c.name}</span>
                  <span className="text-sm text-gray-900 dark:text-white">${c.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.length === 0 && <p className="text-sm text-gray-500">No recent orders.</p>}
              {recentActivities.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{a.label}</span>
                  <span className="text-sm text-gray-500">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StatsPage;
