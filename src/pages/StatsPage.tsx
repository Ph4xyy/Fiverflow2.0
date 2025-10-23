// src/pages/StatsPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout, { cardClass } from '../components/Layout';
import PlanRestrictedPage from '../components/PlanRestrictedPage';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useDashboardStats } from '../hooks/useDashboardStats';

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
  const { stats, loading: statsLoading, error: statsError, refetch } = useDashboardStats();

  const [period, setPeriod] = useState<Period>('30d');
  const [customStart, setCustomStart] = useState<string>(''); // YYYY-MM-DD
  const [customEnd, setCustomEnd] = useState<string>(''); // YYYY-MM-DD
  const [appliedCustom, setAppliedCustom] = useState<{ start: string; end: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

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

  // Utiliser les données du hook useDashboardStats
  const clients = stats?.recentOrders.map(o => ({ id: o.id, name: o.client_name })) || [];
  const orders = stats?.recentOrders.map(o => ({ 
    id: o.id, 
    title: o.title, 
    status: o.status, 
    budget: 0, // Les données détaillées ne sont pas dans recentOrders
    created_at: o.created_at 
  })) || [];

  // Utiliser les données du hook directement
  const totalRevenue = stats?.totalRevenue || 0;
  const pendingRevenue = stats?.pendingRevenue || 0;
  const averageDeliveryTime = stats?.averageDeliveryTime || 0;
  const completionRate = stats?.completionRate || 0;
  const averageOrderValue = stats?.averageOrderValue || 0;
  const orderVolume = stats?.totalOrders || 0;
  const pendingOrdersCount = orderVolume - Math.round((completionRate / 100) * orderVolume);

  // Utiliser les données du hook pour les graphiques
  const pieData = stats?.ordersByStatus.map(s => ({ name: s.status, value: s.count })) || [];
  const topClients = stats?.topClients || [];
  const allStatuses = stats?.ordersByStatus.map(s => s.status) || [];

  // Recent Activity
  const recentActivities = stats?.recentOrders.map(o => ({
    label: o.title,
    created_at: o.created_at,
  })) || [];

  // Utiliser les données du hook pour les graphiques
  const lineRevenueData = stats?.monthlyRevenue.map(m => ({ date: m.month, revenue: m.revenue })) || [];
  const areaCumulativeData = lineRevenueData.map((row, index) => {
    const cumulative = lineRevenueData.slice(0, index + 1).reduce((sum, r) => sum + r.revenue, 0);
    return { date: row.date, cumulative };
  });
  const stackedData = stats?.ordersByStatus.map(s => ({ date: s.status, [s.status]: s.count })) || [];

  const periodOptions: { label: string; value: Period }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Custom…', value: 'custom' },
  ];

  // -------------------- ACCESS --------------------
  if (planLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="ml-3 text-gray-400">{'Loading...'}</p>
        </div>
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

  if (statsError) {
    return (
      <div className="p-6 text-center">
          <p className="text-red-400 font-semibold">Error loading statistics</p>
          <p className="text-sm text-slate-400 mt-1">{statsError}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
          <p className="text-gray-400">No statistics available</p>
        </div>
    );
  }

  // -------------------- RENDER --------------------
  return (
    <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
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
                    className="inline-flex items-center px-3 py-2 rounded-lg text-white bg-gradient-to-r from-[#9c68f2] to-[#422ca5] hover:from-[#8a5cf0] hover:to-[#3a2590] transition"
                  >
                    {'Apply'}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={refetch}
              className="inline-flex items-center px-3 py-2 rounded-lg text-white bg-gradient-to-r from-[#9c68f2] to-[#422ca5] hover:from-[#8a5cf0] hover:to-[#3a2590] transition"
            >
              <RefreshCw className={`mr-2 ${statsLoading ? 'animate-spin' : ''}`} size={16} />
              {'Refresh'}
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className={`${cardClass} p-4`}>
            <div className="relative">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{'Total Revenue'}</p>
                <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(totalRevenue)}</p>
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <DollarSign size={20} className="text-gray-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{'Avg. order value:'} {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(averageOrderValue)}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="relative">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{'Pending Revenue'}</p>
                <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(pendingRevenue)}</p>
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <ShoppingCart size={20} className="text-gray-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{'Open orders:'} {pendingOrdersCount}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="relative">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{'Avg. Delivery Time'}</p>
                <p className="text-2xl font-bold text-white">{averageDeliveryTime.toFixed(1)} {'days'}</p>
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <Clock size={20} className="text-gray-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{'Based on completed orders'}</p>
          </div>

          <div className={`${cardClass} p-4`}>
            <div className="relative">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{'Completion Rate'}</p>
                <p className="text-2xl font-bold text-white">{completionRate}%</p>
              </div>
              <div className="absolute top-0 right-0 opacity-50">
                <Target size={20} className="text-gray-400" />
              </div>
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
                    contentStyle={{ 
                      background: '#1e2938', 
                      border: '1px solid #35414e', 
                      color: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    itemStyle={{ color: '#ffffff', fontSize: '14px' }}
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
                    contentStyle={{ 
                      background: '#1e2938', 
                      border: '1px solid #35414e', 
                      color: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    itemStyle={{ color: '#ffffff', fontSize: '14px' }}
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
                    contentStyle={{ 
                      background: '#1e2938', 
                      border: '1px solid #35414e', 
                      color: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    itemStyle={{ color: '#ffffff', fontSize: '14px' }}
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
                    contentStyle={{ 
                      background: '#1e2938', 
                      border: '1px solid #35414e', 
                      color: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    itemStyle={{ color: '#ffffff', fontSize: '14px' }}
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

        {/* ADDITIONAL STATISTICS ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Client Growth Trend */}
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-blue-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Client Growth Trend'}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">New Clients This Month</span>
                <span className="text-lg font-bold text-white">{stats?.totalClients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Growth Rate</span>
                <span className="text-lg font-bold text-emerald-400">+{stats?.clientsGrowth || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Retention Rate</span>
                <span className="text-lg font-bold text-blue-400">{completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Order Performance */}
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Target className="text-purple-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Order Performance'}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total Orders</span>
                <span className="text-lg font-bold text-white">{orderVolume}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Avg. Order Value</span>
                <span className="text-lg font-bold text-purple-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(averageOrderValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pending Orders</span>
                <span className="text-lg font-bold text-amber-400">{pendingOrdersCount}</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="text-green-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Revenue Breakdown'}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total Revenue</span>
                <span className="text-lg font-bold text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pending Revenue</span>
                <span className="text-lg font-bold text-amber-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(pendingRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Revenue Growth</span>
                <span className="text-lg font-bold text-emerald-400">+{stats?.revenueGrowth || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* PERFORMANCE METRICS ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Delivery Performance */}
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="text-orange-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Delivery Performance'}</h2>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="90%"
                  data={[{ name: 'Avg Delivery', value: averageDeliveryTime }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" fill="#f59e0b" cornerRadius={8} />
                  <Legend
                    content={() => (
                      <div className="text-center mt-2 text-slate-300">
                        <span className="text-2xl font-bold text-white">{averageDeliveryTime.toFixed(1)}</span>
                        <div className="text-xs text-slate-400">Days Average</div>
                      </div>
                    )}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className={`${cardClass} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="text-indigo-400" size={18} />
              <h2 className="text-lg font-semibold text-white">{'Order Status Distribution'}</h2>
            </div>
            <div className="space-y-3">
              {pieData.map((status, index) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                const total = pieData.reduce((sum, item) => sum + item.value, 0);
                const percentage = total > 0 ? Math.round((status.value / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm text-slate-300 capitalize">{status.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{status.value}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
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
  );
};

export default StatsPage;
