// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Layout, { pageBgClass, cardClass } from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Users,
  UserCheck,
  Shield,
  Crown,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar as CalendarIcon,
  RefreshCw,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

type PlanKey = 'free' | 'trial' | 'pro' | 'excellence';

interface AdminStats {
  totals: {
    allTimeUsers: number;
    newUsersInRange: number;
    adminsAllTime: number;
  };
  plans: Record<PlanKey, number>;
  revenue: {
    total: number;
    fromSubscriptions: number;
    fromInvoices: number;
    fromOther: number;
    currency: string;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    created_at: string;
    role: string | null;
    plan?: PlanKey | null;
  }>;
  topReferrers: Array<{
    id: string;
    email: string | null;
    name: string | null;
    referral_count: number;
    total_earnings: number;
  }>;
}

const mockStats: AdminStats = {
  totals: { allTimeUsers: 1287, newUsersInRange: 42, adminsAllTime: 2 },
  plans: { free: 820, trial: 0, pro: 320, excellence: 112 },
  revenue: { total: 4823.5, fromSubscriptions: 4410, fromInvoices: 270, fromOther: 143.5, currency: 'EUR' },
  recentUsers: [
    { id: '1', email: 'alice@example.com', name: 'Alice Martin', created_at: '2025-08-07T10:00:00Z', role: 'user', plan: 'pro' },
    { id: '2', email: 'bob@example.com', name: 'Bob Dupont', created_at: '2025-08-05T15:20:00Z', role: 'user', plan: 'free' },
    { id: '3', email: 'charlie@example.com', name: 'Charlie Leroy', created_at: '2025-08-02T09:10:00Z', role: 'user', plan: 'free' },
    { id: '4', email: 'dora@example.com', name: 'Dora Lamy', created_at: '2025-08-01T12:45:00Z', role: 'user', plan: 'excellence' },
    { id: '5', email: 'evan@example.com', name: 'Evan Picard', created_at: '2025-07-31T19:30:00Z', role: 'user', plan: 'free' },
  ],
  topReferrers: [
    { id: 'r1', email: 'ref1@example.com', name: 'Top Referrer', referral_count: 11, total_earnings: 210 },
    { id: 'r2', email: 'ref2@example.com', name: 'Second Ref', referral_count: 7, total_earnings: 140 },
    { id: 'r3', email: 'ref3@example.com', name: 'Third Ref', referral_count: 5, total_earnings: 93 },
  ],
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [working, setWorking] = useState(false);
  const [stats, setStats] = useState<AdminStats>(mockStats);

  const startISO = useMemo(() => new Date(`${startDate}T00:00:00.000Z`).toISOString(), [startDate]);
  const endISO = useMemo(() => new Date(`${endDate}T23:59:59.999Z`).toISOString(), [endDate]);

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const preset = (days: number) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(today); d.setDate(d.getDate() - days);
    setStartDate(d.toISOString().slice(0,10));
    setEndDate(today.toISOString().slice(0,10));
  };

  const safeNumber = (n: any) => (typeof n === 'number' && !Number.isNaN(n) ? n : Number(n) || 0);

  const loadAll = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setStats(mockStats);
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // ---------- USERS ----------
      const [{ data: usersAll, error: usersAllErr }, { data: usersRange, error: usersRangeErr }] = await Promise.all([
        supabase.from('users').select('id, role'),
        supabase.from('users').select('id').gte('created_at', startISO).lte('created_at', endISO),
      ]);
      if (usersAllErr) throw usersAllErr;
      if (usersRangeErr) throw usersRangeErr;

      const allTimeUsers = usersAll?.length ?? 0;
      const adminsAllTime = (usersAll ?? []).filter(u => (u as any).role === 'admin').length;
      const newUsersInRange = usersRange?.length ?? 0;

      // Plans (fallback sans trial_end ni table subscriptions) -> is_pro = pro / sinon free
      const { data: usersRangeFull } = await supabase
        .from('users')
        .select('id, email, name, created_at, role, is_pro')
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      const plans: Record<PlanKey, number> = { free: 0, trial: 0, pro: 0, excellence: 0 };
      (usersRangeFull ?? []).forEach((u: any) => {
        if (u.is_pro) plans.pro += 1; else plans.free += 1;
      });

      // Récents
      const { data: recentUsersData, error: recentErr } = await supabase
        .from('users')
        .select('id, email, name, created_at, role, is_pro')
        .order('created_at', { ascending: false })
        .limit(5);
      if (recentErr) console.warn('Recent users warning:', recentErr?.message);

      const recentUsers =
        (recentUsersData ?? []).map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          created_at: u.created_at,
          role: u.role ?? null,
          plan: u.is_pro ? ('pro' as PlanKey) : ('free' as PlanKey),
        })) ?? [];

      // ---------- REVENUE ----------
      let fromSubscriptions = 0;
      let fromInvoices = 0;
      let fromOther = 0; // on ne la calcule plus ici (pas de table)
      const currency = 'EUR'; // défaut

      // 1) payments (amount, created_at)
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('amount, created_at')
          .gte('created_at', startISO)
          .lte('created_at', endISO);
        if (error) throw error;
        if (data?.length) {
          fromSubscriptions += data.reduce((acc: number, p: any) => acc + safeNumber(p.amount), 0);
        }
      } catch (e: any) {
        console.warn('payments not usable:', e?.message || e);
      }

      // 2) subscription_invoices (amount_paid, paid_at)
      try {
        const { data, error } = await supabase
          .from('subscription_invoices')
          .select('amount_paid, paid_at')
          .gte('paid_at', startISO)
          .lte('paid_at', endISO);
        if (error) throw error;
        if (data?.length) {
          fromSubscriptions += data.reduce((acc: number, p: any) => acc + safeNumber(p.amount_paid), 0);
        }
      } catch (e: any) {
        console.warn('subscription_invoices not usable:', e?.message || e);
      }

      // 3) invoice_payments (amount, paid_at) — sans currency
      try {
        const { data, error } = await supabase
          .from('invoice_payments')
          .select('amount, paid_at')
          .gte('paid_at', startISO)
          .lte('paid_at', endISO);
        if (error) throw error;
        if (data?.length) {
          fromInvoices += data.reduce((acc: number, p: any) => acc + safeNumber(p.amount), 0);
        }
      } catch (e: any) {
        console.warn('invoice_payments not usable:', e?.message || e);
      }

      // ---------- Referrers ----------
      let topReferrers: AdminStats['topReferrers'] = [];
      try {
        const { data: logs } = await supabase
          .from('referral_logs')
          .select(
            `
            referrer_id,
            amount_earned,
            created_at,
            users!referral_logs_referrer_id_fkey (
              id, email, name
            )
          `
          )
          .gte('created_at', startISO)
          .lte('created_at', endISO);

        if (logs && logs.length) {
          const map = new Map<string, { id: string; email: string | null; name: string | null; referral_count: number; total_earnings: number }>();
          logs.forEach((l: any) => {
            const refId = l.referrer_id as string;
            const info = l.users ?? {};
            if (!map.has(refId)) {
              map.set(refId, {
                id: refId,
                email: info.email ?? null,
                name: info.name ?? null,
                referral_count: 0,
                total_earnings: 0,
              });
            }
            const entry = map.get(refId)!;
            entry.referral_count += 1;
            entry.total_earnings += safeNumber(l.amount_earned);
          });
          topReferrers = Array.from(map.values()).sort((a, b) => b.total_earnings - a.total_earnings).slice(0, 5);
        }
      } catch (e: any) {
        console.warn('referral_logs not usable:', e?.message || e);
        topReferrers = mockStats.topReferrers;
      }

      const revenue = {
        total: fromSubscriptions + fromInvoices + fromOther,
        fromSubscriptions,
        fromInvoices,
        fromOther,
        currency,
      };

      setStats({
        totals: { allTimeUsers, newUsersInRange, adminsAllTime },
        plans,
        revenue,
        recentUsers,
        topReferrers,
      });
    } catch (err: any) {
      console.error('💥 Admin load error', err?.message || err);
      toast.error("Erreur lors du chargement des stats Admin");
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const refetchWithRange = async () => {
    setWorking(true);
    await loadAll();
    setWorking(false);
  };

  const formatCurrency = (amount: number, currency = stats.revenue.currency) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getInitials = (name: string | null, email?: string | null) => {
    if (name && name.trim().length) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (email && email.length) return email.slice(0, 2).toUpperCase();
    return 'US';
  };

  return (
    <Layout>
      <div className={`space-y-4 sm:space-y-6 p-4 sm:p-0 ${pageBgClass}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Administration</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Tableau de bord — vue globale & période</p>
            </div>
          </div>

          {/* Date filters */}
          <div className={`${cardClass} px-3 py-2 border border-gray-200 dark:border-slate-700 flex items-center gap-2`}>
            <CalendarIcon className="text-gray-600 dark:text-gray-300" size={16} />
            <input
              type="date"
              className="bg-transparent text-sm text-gray-900 dark:text-white outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
            <span className="text-gray-500 dark:text-gray-400 text-sm">→</span>
            <input
              type="date"
              className="bg-transparent text-sm text-gray-900 dark:text-white outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().slice(0,10)}
            />
            <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mx-1" />
            <button
              onClick={() => preset(7)}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
              title="7 derniers jours"
            >
              7d
            </button>
            <button
              onClick={() => preset(30)}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
              title="30 derniers jours"
            >
              30d
            </button>
            <button
              onClick={() => preset(90)}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
              title="90 derniers jours"
            >
              90d
            </button>
            <button
              onClick={refetchWithRange}
              disabled={working || loading}
              className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-1"
              title="Rafraîchir"
            >
              <RefreshCw size={14} className={working ? 'animate-spin' : ''} />
              Update
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs (Total)</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totals.allTimeUsers}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
          </div>

          <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Nouveaux (période)</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.totals.newUsersInRange}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
          </div>

          <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Admins (Total)</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.totals.adminsAllTime}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                <Shield className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
            </div>
          </div>

          <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Revenu (période)</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {formatCurrency(stats.revenue.total)}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 sm:p-3 rounded-lg">
                <DollarSign className="text-orange-600 dark:text-orange-400" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Plan breakdown */}
        <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Répartition des plans (période)</h2>
            <Filter className="text-gray-400 dark:text-gray-500" size={18} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-lg p-4 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Free</div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.plans.free}</div>
            </div>
            <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200/70 dark:border-blue-900/40">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-300">Trial</div>
              <div className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.plans.trial}</div>
            </div>
            <div className="rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200/70 dark:border-purple-900/40">
              <div className="text-xs font-medium text-purple-600 dark:text-purple-300">Pro</div>
              <div className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.plans.pro}</div>
            </div>
            <div className="rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/70 dark:border-amber-900/40">
              <div className="text-xs font-medium text-amber-600 dark:text-amber-300">Excellence</div>
              <div className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.plans.excellence}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg p-3 bg-white/70 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Abonnements</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(stats.revenue.fromSubscriptions)} (période)</div>
            </div>
            <div className="rounded-lg p-3 bg-white/70 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Factures</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(stats.revenue.fromInvoices)} (période)</div>
            </div>
            <div className="rounded-lg p-3 bg-white/70 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Autres revenus</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(stats.revenue.fromOther)} (période)</div>
            </div>
          </div>
        </div>

        {/* Recent Users & Top Referrers */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Utilisateurs récents</h2>
              <UserCheck className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <div className="space-y-3">
              {stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white flex items-center justify-center text-xs font-semibold">
                      {getInitials(u.name, u.email)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {u.name || u.email || 'Utilisateur'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(u.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.role === 'admin' && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        Admin
                      </span>
                    )}
                    {u.plan && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 capitalize">
                        {u.plan}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Top Parrains (période)</h2>
              <BarChart3 className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <div className="space-y-3">
              {stats.topReferrers.length ? (
                stats.topReferrers.map((r, idx) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center justify-center text-xs font-semibold">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {r.name || r.email || 'Referrer'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{r.referral_count} filleuls</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      {formatCurrency(r.total_earnings)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucun parrainage sur la période</p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* DEBUT - SYSTEME D'AJOUT D'ABONNEMENTS */}

<div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
      Créer un abonnement
    </h2>
    <Crown className="text-yellow-500" size={20} />
  </div>

  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const userId = formData.get("userId") as string;
      const plan = formData.get("plan") as PlanKey;
      const startDate = formData.get("startDate") as string;
      const endDate = formData.get("endDate") as string;

      if (!userId || !plan || !startDate || !endDate) {
        toast.error("Tous les champs sont obligatoires");
        return;
      }

      try {
        const { error } = await supabase.from("subscriptions").insert([
          {
            user_id: userId,
            plan,
            start_date: startDate,
            end_date: endDate,
          },
        ]);
        if (error) throw error;
        toast.success("Abonnement créé !");
        form.reset();
      } catch (err: any) {
        console.error(err);
        toast.error("Erreur lors de la création");
      }
    }}
    className="space-y-4"
  >
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        ID utilisateur
      </label>
      <input
        type="text"
        name="userId"
        placeholder="uuid utilisateur"
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Plan
      </label>
      <select
        name="plan"
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="free">Free</option>
        <option value="trial">Trial</option>
        <option value="pro">Pro</option>
        <option value="excellence">Excellence</option>
      </select>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date de début
        </label>
        <input
          type="date"
          name="startDate"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date de fin
        </label>
        <input
          type="date"
          name="endDate"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>

    <button
      type="submit"
      className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm"
    >
      Créer l’abonnement
    </button>
  </form>
</div>


        {/* FIN - SYSTEME D'AJOUT D'ABONNEMENTS */}


        <div className="text-xs text-gray-500 dark:text-gray-400">
          * Le calcul s’adapte à votre schéma : si une colonne/table est absente, elle est ignorée. Vous pouvez m’envoyer le schéma réel pour avoir des stats 100% précises (plans, revenus, etc.).
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className={`${cardClass} px-4 py-3 border border-gray-200 dark:border-slate-700 flex items-center gap-2`}>
            <RefreshCw className="animate-spin" size={16} />
            <span className="text-sm text-gray-800 dark:text-gray-200">Chargement…</span>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
