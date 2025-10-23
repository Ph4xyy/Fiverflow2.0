import React, { useState, useMemo } from 'react';
import Layout, { pageBgClass, cardClass } from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import AdminSubscriptionManager from '../../components/AdminSubscriptionManager';
import UserDetailedStats from '../../components/UserDetailedStats';
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
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedUserForStats, setSelectedUserForStats] = useState<string | null>(null);
  const [showUserStats, setShowUserStats] = useState(false);

  const { stats, loading, error } = useAdminStats(startDate, endDate);

  const startISO = useMemo(() => new Date(`${startDate}T00:00:00.000Z`).toISOString(), [startDate]);
  const endISO = useMemo(() => new Date(`${endDate}T23:59:59.999Z`).toISOString(), [endDate]);

  const preset = (days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    setStartDate(d.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  };

  const formatCurrency = (amount: number, currency = 'USD') =>
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

  const handleViewUserStats = (userId: string) => {
    setSelectedUserForStats(userId);
    setShowUserStats(true);
  };

  const handleCloseUserStats = () => {
    setShowUserStats(false);
    setSelectedUserForStats(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'in progress':
      case 'pending':
      case 'sent':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200';
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className={`space-y-4 p-4 ${pageBgClass}`}>
          <div className={`${cardClass} p-6 text-center`}>
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Vous devez être connecté pour accéder au tableau de bord administrateur.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Administration
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Tableau de bord global — Données synchronisées en temps réel
              </p>
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
              max={new Date().toISOString().slice(0, 10)}
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
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className={`${cardClass} border border-red-200 dark:border-red-800 p-4`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erreur de chargement
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="animate-spin text-indigo-600" size={24} />
              <span className="text-gray-600 dark:text-gray-400">
                Chargement des statistiques...
              </span>
            </div>
          </div>
        )}

        {/* Main Stats */}
        {stats && !loading && (
          <>
            {/* KPIs Principaux */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Utilisateurs (Total)
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.totals.allTimeUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      +{stats.totals.newUsersInRange} cette période
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
                    <Users className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Administrateurs
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {stats.totals.adminsAllTime}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Accès complet
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                    <Shield className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Revenus (Total)
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {formatCurrency(stats.totals.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Toutes sources
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg">
                    <DollarSign className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Clients Actifs
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {stats.totals.totalClients.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Plateformes diverses
                    </p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 sm:p-3 rounded-lg">
                    <UserCheck className="text-orange-600 dark:text-orange-400" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs Secondaires */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Commandes
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {stats.totals.totalOrders.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tous statuts
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
                    <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Factures
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {stats.totals.totalInvoices.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Générées
                    </p>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 sm:p-3 rounded-lg">
                    <CalendarIcon className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tâches
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                      {stats.totals.totalTasks.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Créées
                    </p>
                  </div>
                  <div className="bg-teal-100 dark:bg-teal-900/30 p-2 sm:p-3 rounded-lg">
                    <CheckCircle className="text-teal-600 dark:text-teal-400" size={20} />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      Entrées Temps
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {stats.totals.totalTimeEntries.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enregistrées
                    </p>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-2 sm:p-3 rounded-lg">
                    <Clock className="text-amber-600 dark:text-amber-400" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Répartition des Plans Globale */}
            <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Répartition des Plans (GLOBALE)
                </h2>
                <Filter className="text-gray-400 dark:text-gray-500" size={18} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-lg p-4 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Free Users</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.plans.free.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {((stats.plans.free / (stats.plans.free + stats.plans.pro)) * 100).toFixed(1)}% du total
                  </div>
                </div>
                <div className="rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200/70 dark:border-purple-900/40">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-300">Pro Users</div>
                  <div className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.plans.pro.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                    {((stats.plans.pro / (stats.plans.free + stats.plans.pro)) * 100).toFixed(1)}% du total
                  </div>
                </div>
                <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200/70 dark:border-blue-900/40">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-300">Revenus Factures</div>
                  <div className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(stats.revenue.fromInvoices)}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    {stats.totals.totalInvoices} factures
                  </div>
                </div>
                <div className="rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border border-green-200/70 dark:border-green-900/40">
                  <div className="text-xs font-medium text-green-600 dark:text-green-300">Revenus Commandes</div>
                  <div className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(stats.revenue.fromOrders)}
                  </div>
                  <div className="text-xs text-green-500 dark:text-green-400 mt-1">
                    {stats.totals.totalOrders} commandes
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques Abonnements */}
            <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Statistiques Abonnements
                </h2>
                <Crown className="text-yellow-500" size={20} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/70 dark:border-yellow-900/40">
                  <div className="text-xs font-medium text-yellow-600 dark:text-yellow-300">Total Abonnements</div>
                  <div className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {stats.subscriptions.total.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/70 dark:border-emerald-900/40">
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-300">Abonnements Actifs</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {stats.subscriptions.active.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                    {stats.subscriptions.total > 0 ? ((stats.subscriptions.active / stats.subscriptions.total) * 100).toFixed(1) : 0}% d'activation
                  </div>
                </div>
                <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200/70 dark:border-blue-900/40">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-300">Revenus Mensuels</div>
                  <div className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(stats.subscriptions.monthlyRevenue)}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    Par mois
                  </div>
                </div>
                <div className="rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200/70 dark:border-purple-900/40">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-300">Revenus Annuels</div>
                  <div className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {formatCurrency(stats.subscriptions.yearlyRevenue)}
                  </div>
                  <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                    Par an
                  </div>
                </div>
              </div>
            </div>

            {/* Top Plateformes */}
            <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Top Plateformes Clients
                </h2>
                <Activity className="text-gray-400 dark:text-gray-500" size={18} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.platformStats.topPlatforms.map((platform, index) => (
                  <div key={platform.platform} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {platform.platform}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {platform.count} client{platform.count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {((platform.count / stats.platformStats.totalClients) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilisateurs Récents */}
            <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Utilisateurs Récents
                </h2>
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
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(u.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          Admin
                        </span>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        u.current_plan === 'pro' || u.current_plan === 'excellence'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200'
                      }`}>
                        {u.current_plan === 'pro' || u.current_plan === 'excellence' ? 'Pro' : 'Free'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commandes et Factures Récentes */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Commandes Récentes
                  </h2>
                  <BarChart3 className="text-gray-400 dark:text-gray-500" size={20} />
                </div>
                <div className="space-y-3">
                  {stats.recentOrders.length ? (
                    stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                            {order.client_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {order.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.client_name} • {formatDate(order.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {formatCurrency(order.amount)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aucune commande récente
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Factures Récentes
                  </h2>
                  <CalendarIcon className="text-gray-400 dark:text-gray-500" size={20} />
                </div>
                <div className="space-y-3">
                  {stats.recentInvoices.length ? (
                    stats.recentInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">
                            {invoice.client_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {invoice.number}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {invoice.client_name} • {formatDate(invoice.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(invoice.total)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aucune facture récente
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Referrers */}
            {stats.topReferrers.length > 0 && (
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Top Parrains (période)
                  </h2>
                  <TrendingUp className="text-gray-400 dark:text-gray-500" size={20} />
                </div>
                <div className="space-y-3">
                  {stats.topReferrers.map((r, idx) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center justify-center text-xs font-semibold">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {r.name || r.email || 'Referrer'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {r.referral_count} filleul{r.referral_count > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-700 dark:text-green-300">
                        {formatCurrency(r.total_earnings)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gestion des Abonnements */}
            <AdminSubscriptionManager startDate={startDate} endDate={endDate} />

            {/* Footer Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
              <p>
                📊 Données synchronisées depuis Supabase • 
                Période: {new Date(startISO).toLocaleDateString('fr-FR')} → {new Date(endISO).toLocaleDateString('fr-FR')} • 
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </>
        )}

        {/* Modal de Statistiques Détaillées */}
        {selectedUserForStats && (
          <UserDetailedStats
            userId={selectedUserForStats}
            isOpen={showUserStats}
            onClose={handleCloseUserStats}
          />
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;