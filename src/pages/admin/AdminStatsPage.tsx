import React, { useState, useMemo } from 'react'
import Layout, { pageBgClass, cardClass } from '../../components/Layout'
import AdminNavigation from '../../components/AdminNavigation'
import { useAdminStats } from '../../hooks/useAdminStats'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminStatsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  )

  const { stats, loading, error, refetch, setDateRange } = useAdminStats({
    start_date: startDate,
    end_date: endDate
  })

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setDateRange(newStartDate, newEndDate)
  }

  const preset = (days: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(today)
    d.setDate(d.getDate() - days)
    handleDateChange(d.toISOString().slice(0, 10), today.toISOString().slice(0, 10))
  }

  const formatCurrency = (amount: number, currency = 'EUR') =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getInitials = (name: string | null, email?: string | null) => {
    if (name && name.trim().length) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    if (email && email.length) return email.slice(0, 2).toUpperCase()
    return 'US'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'in progress':
      case 'pending':
      case 'sent':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200'
    }
  }

  // Chart data preparation
  const revenueData = useMemo(() => {
    if (!stats) return []
    
    return [
      { name: 'Factures', value: stats.revenue.fromInvoices, color: '#3B82F6' },
      { name: 'Commandes', value: stats.revenue.fromOrders, color: '#10B981' }
    ]
  }, [stats])

  const planData = useMemo(() => {
    if (!stats) return []
    
    return [
      { name: 'Free', value: stats.plans.free, color: '#6B7280' },
      { name: 'Pro', value: stats.plans.pro, color: '#8B5CF6' }
    ]
  }, [stats])

  const platformData = useMemo(() => {
    if (!stats?.platformStats?.topPlatforms) return []
    
    return stats.platformStats.topPlatforms.map((platform, index) => ({
      name: platform.platform,
      value: platform.count,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
    }))
  }, [stats])

  const handleExport = async () => {
    try {
      // Implementation for export functionality
      toast.success('Export en cours...')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  if (!stats && !loading) {
    return (
      <Layout>
        <div className={`space-y-4 p-4 ${pageBgClass}`}>
          <div className={`${cardClass} p-6 text-center`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune donnée disponible
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aucune statistique n'est disponible pour la période sélectionnée.
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex min-h-screen">
        <AdminNavigation className="w-64 flex-shrink-0" />
        <div className={`flex-1 space-y-6 p-4 sm:p-6 ${pageBgClass}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Statistiques Détaillées
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Analytics et insights de performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className={`${cardClass} p-4 border border-gray-200 dark:border-slate-700`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-600 dark:text-gray-300" size={16} />
              <input
                type="date"
                className="bg-transparent text-sm text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-slate-600 rounded px-3 py-2"
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value, endDate)}
                max={endDate}
              />
              <span className="text-gray-500 dark:text-gray-400 text-sm">→</span>
              <input
                type="date"
                className="bg-transparent text-sm text-gray-900 dark:text-white outline-none border border-gray-300 dark:border-slate-600 rounded px-3 py-2"
                value={endDate}
                onChange={(e) => handleDateChange(startDate, e.target.value)}
                min={startDate}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="flex items-center gap-2">
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
        </div>

        {/* Error State */}
        {error && (
          <div className={`${cardClass} border border-red-200 dark:border-red-800 p-4`}>
            <div className="flex items-center gap-3">
              <div className="text-red-500" size={20} />
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

        {/* Stats Overview */}
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
                      Abonnements Actifs
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {stats.subscriptions.active.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sur {stats.subscriptions.total} total
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                    <TrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                </div>
              </div>

              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-4 sm:p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      MRR
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {formatCurrency(stats.subscriptions.monthlyRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Revenus mensuels
                    </p>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 sm:p-3 rounded-lg">
                    <Activity className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue Distribution */}
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-6`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Répartition des Revenus
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Plan Distribution */}
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-6`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Répartition des Plans
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={planData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Platform Stats */}
            {platformData.length > 0 && (
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-6`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Plateformes Clients
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-6`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Utilisateurs Récents
                </h3>
                <div className="space-y-3">
                  {stats.recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white flex items-center justify-center text-xs font-semibold">
                          {getInitials(user.name, user.email)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || user.email || 'Utilisateur'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(user.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.current_plan === 'pro' || user.current_plan === 'excellence' ? 'Pro' : 'Free'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className={`${cardClass} border border-gray-200 dark:border-slate-700 p-6`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Commandes Récentes
                </h3>
                <div className="space-y-3">
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                          {order.client_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.client_name} • {formatDate(order.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(order.amount)}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </Layout>
  )
}

export default AdminStatsPage
