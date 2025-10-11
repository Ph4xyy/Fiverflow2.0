// src/pages/StatsPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout, { cardClass } from '../components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

import { supabase, isSupabaseConfigured } from '../lib/supabase';

import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Target,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';

type Period = '7d' | '30d' | '90d' | 'custom';

const parseNum = (v: any) => (typeof v === 'number' ? v : parseFloat(v) || 0);
const toDate = (v: any) => (v ? new Date(v) : null);
const daysBetween = (a: Date, b: Date) => Math.abs((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
const norm = (s: any) => (s ? String(s).toLowerCase() : '');

const COLORS = {
  bgCard: '#0B0E14',
  ring: '#1C2230',
  txtMuted: '#94a3b8',
  txt: '#e5e7eb',
  // palette
  blue: '#3b82f6',
  sky: '#06b6d4',
  green: '#22c55e',
  amber: '#f59e0b',
  purple: '#a78bfa',
  rose: '#f43f5e',
  slate: '#64748b',
};

// Map status categories → colors
const STATUS_COLOR: Record<string, string> = {
  pending: COLORS.amber,
  'in progress': COLORS.blue,
  completed: COLORS.green,
  delivered: COLORS.green,
  paid: COLORS.green,
  done: COLORS.green,
  canceled: COLORS.rose,
};

// -------------------- COMPONENT --------------------
const StatsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const { restrictions, loading: planLoading, checkAccess } = usePlanRestrictions();

  const [period, setPeriod] = useState<Period>('30d');
  const [customStart, setCustomStart] = useState<string>(''); // YYYY-MM-DD
  const [customEnd, setCustomEnd] = useState<string>(''); // YYYY-MM-DD
  const [appliedCustom, setAppliedCustom] = useState<{ start: string; end: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const { sinceTimestamp, sinceDateOnly, daysArray } = useMemo(() => {
    // Determine start and end based on preset or applied custom
    let end = new Date();
    let start = new Date();
    if (period === 'custom' && appliedCustom?.start) {
      start = new Date(appliedCustom.start + 'T00:00:00');
      end = new Date((appliedCustom.end || appliedCustom.start) + 'T00:00:00');
    } else {
      if (period === '7d') start.setDate(end.getDate() - 6);
      if (period === '30d') start.setDate(end.getDate() - 29);
      if (period === '90d') start.setDate(end.getDate() - 89);
    }

    // Build day buckets inclusive
    const days: Date[] = [];
    const cursor = new Date(start);
    // normalize time
    cursor.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    const iso = start.toISOString();
    return { sinceTimestamp: iso, sinceDateOnly: iso.slice(0, 10), daysArray: days };
  }, [period, appliedCustom]);

  // -------------------- DATA FETCH --------------------
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

      // NOTE: garde la même logique que ta version pour préserver la compatibilité
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
  }, [user, authLoading]); // 🔥 FIXED: Remove fetchStatsData from dependencies to prevent infinite loops

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

  // -------------------- DERIVED --------------------
  const clientsById: Record<string, any> = useMemo(
    () => clients.reduce((acc, c) => ((acc[c.id] = c), acc), {} as Record<string, any>),
    [clients]
  );

  const statusDone = (s: string) => ['completed', 'delivered', 'paid', 'done'].includes(norm(s));
  const isDone = (o: any) => statusDone(o.status);

  const completedOrders = useMemo(() => orders.filter(isDone), [orders]);
  const pendingOrders = useMemo(() => orders.filter((o) => !isDone(o)), [orders]);

  const totalRevenue = useMemo(
    () => completedOrders.reduce((sum, o) => sum + parseNum(o.amount), 0),
    [completedOrders]
  );
  const pendingRevenue = useMemo(
    () => pendingOrders.reduce((sum, o) => sum + parseNum(o.amount), 0),
    [pendingOrders]
  );

  const deliveryDurations = useMemo(() => {
    return completedOrders
      .map((o) => {
        const start = toDate(o.start_date) || toDate(o.created_at);
        const end = toDate(o.completion_date);
        return start && end ? daysBetween(start, end) : null;
      })
      .filter((v): v is number => v !== null);
  }, [completedOrders]);

  const averageDeliveryTime = useMemo(() => {
    return deliveryDurations.length
      ? deliveryDurations.reduce((a, b) => a + b, 0) / deliveryDurations.length
      : 0;
  }, [deliveryDurations]);

  const orderVolume = orders.length;
  const completionRate = orderVolume ? Math.round((completedOrders.length / orderVolume) * 100) : 0;
  const averageOrderValue = completedOrders.length
    ? totalRevenue / completedOrders.length
    : 0;

  // Earnings per platform (Pie)
  const earningsByPlatform = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, o) => {
      const cl = clientsById[o.client_id];
      const platform = cl?.platform || 'Unknown';
      acc[platform] = (acc[platform] || 0) + parseNum(o.amount);
      return acc;
    }, {});
  }, [orders, clientsById]);

  const pieData = useMemo(
    () => Object.entries(earningsByPlatform).map(([name, value]) => ({ name, value })),
    [earningsByPlatform]
  );

  // Top Clients
  const revenueByClient: Record<string, number> = useMemo(() => {
    return orders.reduce((acc, o) => {
      const id = o.client_id;
      if (!id) return acc;
      acc[id] = (acc[id] || 0) + parseNum(o.amount);
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const topClients = useMemo(
    () =>
      Object.entries(revenueByClient)
        .map(([clientId, revenue]) => ({ name: clientsById[clientId]?.name ?? 'Unknown', revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    [revenueByClient, clientsById]
  );

  // Recent Activity
  const recentActivities = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.created_at || b.start_date || b.completion_date).getTime() -
          new Date(a.created_at || a.start_date || a.completion_date).getTime()
      )
      .slice(0, 6)
      .map((o) => ({
        label:
          o.title ||
          o.description ||
          `${clientsById[o.client_id]?.name ?? 'Order'} • ${o.status ?? ''}`,
        created_at: o.created_at || o.start_date || o.completion_date,
      }));
  }, [orders, clientsById]);

  // Trend: daily revenue (completed only)
  const byDayRevenue: Record<string, number> = useMemo(() => {
    const m: Record<string, number> = {};
    completedOrders.forEach((o) => {
      const d = toDate(o.completion_date);
      if (!d) return;
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      m[key] = (m[key] || 0) + parseNum(o.amount);
    });
    return m;
  }, [completedOrders]);

  const lineRevenueData = useMemo(() => {
    return daysArray.map((d) => {
      const key = d.toISOString().slice(0, 10);
      return { date: key, revenue: byDayRevenue[key] || 0 };
    });
  }, [daysArray, byDayRevenue]);

  // Cumulative revenue Area
  const areaCumulativeData = useMemo(() => {
    let running = 0;
    return lineRevenueData.map((row) => {
      running += row.revenue;
      return { date: row.date, cumulative: running };
    });
  }, [lineRevenueData]);

  // Stacked bars by status per day (volume)
  const byDayStatus: Record<string, Record<string, number>> = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    orders.forEach((o) => {
      const d = toDate(o.created_at) || toDate(o.start_date) || toDate(o.completion_date);
      if (!d) return;
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      const s = norm(o.status) || 'unknown';
      if (!m[key]) m[key] = {};
      m[key][s] = (m[key][s] || 0) + 1;
    });
    return m;
  }, [orders]);

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    Object.values(byDayStatus).forEach((row) => Object.keys(row).forEach((s) => set.add(s)));
    return Array.from(set);
  }, [byDayStatus]);

  const stackedData = useMemo(() => {
    return daysArray.map((d) => {
      const key = d.toISOString().slice(0, 10);
      const base: any = { date: key };
      const row = byDayStatus[key] || {};
      allStatuses.forEach((s) => (base[s] = row[s] || 0));
      return base;
    });
  }, [daysArray, byDayStatus, allStatuses]);

  const periodOptions: { label: string; value: Period }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Custom…', value: 'custom' },
  ];

  // -------------------- ACCESS --------------------
  if (planLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-3 text-gray-400">{'Loading...'}</p>
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

  // -------------------- RENDER --------------------
  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="text-sky-400" size={22} />
              {'Analytics & Insights'}
            </h1>
            <p className="text-sm text-slate-400">
              {'Real-time stats powered by Supabase. Choose your period and dive in.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {offline && (
              <span className="text-[11px] px-2 py-1 rounded bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20">
                {'Offline preview'}
              </span>
            )}
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="px-3 py-2 text-sm rounded-lg bg-[#0E121A] text-slate-100 ring-1 ring-inset ring-[#1C2230] focus:outline-none"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {period === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg bg-[#0E121A] text-slate-100 ring-1 ring-inset ring-[#1C2230] focus:outline-none"
                  />
                  <span className="text-slate-400">{'to'}</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg bg-[#0E121A] text-slate-100 ring-1 ring-inset ring-[#1C2230] focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!customStart) return;
                      const endVal = customEnd || customStart;
                      // basic validation
                      if (new Date(customStart) > new Date(endVal)) return;
                      setAppliedCustom({ start: customStart, end: endVal });
                      // trigger refresh
                      fetchStatsData();
                    }}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    {'Apply'}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={fetchStatsData}
              className="inline-flex items-center px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
              {'Refresh'}
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{'Total Revenue'}</p>
                <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(totalRevenue)}</p>
              </div>
              <DollarSign className="text-green-400" />
            </div>
            <p className="mt-2 text-xs text-slate-400">{'Avg. order value:'} {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(averageOrderValue)}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{'Pending Revenue'}</p>
                <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(pendingRevenue)}</p>
              </div>
              <ShoppingCart className="text-amber-400" />
            </div>
            <p className="mt-2 text-xs text-slate-400">{'Open orders:'} {pendingOrders.length}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{'Avg. Delivery Time'}</p>
                <p className="text-2xl font-bold text-white">{averageDeliveryTime.toFixed(1)} {'days'}</p>
              </div>
              <Clock className="text-sky-400" />
            </div>
            <p className="mt-2 text-xs text-slate-400">{'Based on completed orders'}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{'Completion Rate'}</p>
                <p className="text-2xl font-bold text-white">{completionRate}%</p>
              </div>
              <Target className="text-purple-400" />
            </div>
            <p className="mt-2 text-xs text-slate-400">{'Total orders:'} {orderVolume}</p>
          </div>
        </div>

        {/* CHARTS ROW 1: Revenue (Line) + Cumulative (Area) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="text-sky-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Daily Revenue'}</h2>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineRevenueData}>
                  <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: COLORS.txtMuted, fontSize: 12 }} />
                  <YAxis tick={{ fill: COLORS.txtMuted, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.ring}`, color: COLORS.txt }}
                    labelStyle={{ color: COLORS.txtMuted }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke={COLORS.sky} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-green-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Cumulative Revenue'}</h2>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaCumulativeData}>
                  <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: COLORS.txtMuted, fontSize: 12 }} />
                  <YAxis tick={{ fill: COLORS.txtMuted, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.ring}`, color: COLORS.txt }}
                    labelStyle={{ color: COLORS.txtMuted }}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke={COLORS.green} fill="#16a34a20" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2: Earnings Breakdown (Pie) + Status Stacked Bars */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <PieIcon className="text-amber-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Earnings by Platform'}</h2>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.ring}`, color: COLORS.txt }}
                    labelStyle={{ color: COLORS.txtMuted }}
                  />
                  <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: COLORS.txtMuted, fontSize: 12 }} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => {
                      const palette = [COLORS.sky, COLORS.green, COLORS.purple, COLORS.amber, COLORS.rose, COLORS.blue, COLORS.slate];
                      return <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="text-purple-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Orders by Status (Daily)'}</h2>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedData} stackOffset="expand">
                  <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: COLORS.txtMuted, fontSize: 12 }} />
                  <YAxis tick={{ fill: COLORS.txtMuted, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: COLORS.bgCard, border: `1px solid ${COLORS.ring}`, color: COLORS.txt }}
                    labelStyle={{ color: COLORS.txtMuted }}
                  />
                  {allStatuses.map((s, idx) => {
                    const c =
                      STATUS_COLOR[s] ||
                      [COLORS.blue, COLORS.green, COLORS.amber, COLORS.purple, COLORS.rose, COLORS.slate][idx % 6];
                    return <Bar key={s} dataKey={s} stackId="s" fill={c} />;
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CARDS: Completion Gauge + Top Clients + Recent Activity */}
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
          {/* Gauge */}
          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold text-white mb-3">{'Completion Gauge'}</h2>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="90%"
                  data={[{ name: 'Completion', value: completionRate }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" fill={COLORS.green} cornerRadius={8} />
                  <Legend
                    content={() => (
                      <div className="text-center mt-2 text-slate-300">
                        <span className="text-3xl font-bold text-white">{completionRate}%</span>
                        <div className="text-xs text-slate-400">{'Orders completed'}</div>
                      </div>
                    )}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Clients */}
          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold text-white mb-3">{'Top Clients'}</h2>
            <div className="space-y-2">
              {topClients.length === 0 && <p className="text-sm text-slate-400">{'No data.'}</p>}
              {topClients.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-[#0E121A] ring-1 ring-inset ring-[#1C2230] px-3 py-2"
                >
                  <span className="text-sm text-slate-300">{c.name}</span>
                  <span className="text-sm text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(c.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${cardClass} p-4`}>
            <h2 className="text-lg font-semibold text-white mb-3">{'Recent Activity'}</h2>
            <div className="space-y-2">
              {recentActivities.length === 0 && <p className="text-sm text-slate-400">{'No recent orders.'}</p>}
              {recentActivities.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-[#0E121A] ring-1 ring-inset ring-[#1C2230] px-3 py-2"
                >
                  <span className="text-sm text-slate-300 truncate max-w-[70%]">{a.label}</span>
                  <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
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
