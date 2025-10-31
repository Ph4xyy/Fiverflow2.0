import React, { useState } from 'react'
import { useAdvancedStats } from '../../hooks/useAdvancedStats'
import { ExportService } from '../../services/exportService'
import { adminUserService } from '../../services/adminUserService'
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
  Activity,
  Crown,
  Target,
  Clock,
  UserCheck,
  UserX,
  ArrowUp,
  ArrowDown,
  Percent
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminStatsPage: React.FC = () => {
  const { stats, loading, error, refetch } = useAdvancedStats()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num)

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const handleExport = async () => {
    try {
      // Récupérer tous les utilisateurs
      const { users } = await adminUserService.getUsers({ limit: 1000 })
      
      // Préparer les données d'export
      const exportData = {
        users,
        adminRevenue: stats?.adminRevenue || 0,
        totalRevenue: stats?.totalRevenue || 0,
        stats: {
          totalUsers: stats?.totalUsers || 0,
          premiumUsers: stats?.premiumUsers || 0,
          conversionRate: stats?.conversionRate || 0
        }
      }
      
      // Exporter
      ExportService.exportToExcel(exportData, 'stats')
      toast.success('Export Excel généré avec succès !')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const preset = (days: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(today)
    d.setDate(d.getDate() - days)
    return d.toISOString().slice(0, 10)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Activity className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Erreur de chargement</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Statistiques Avancées
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyses complètes et données financières synchronisées
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Utilisateurs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalUsers)}</p>
              <div className="flex items-center mt-2">
                {stats.userGrowthRate >= 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${stats.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(Math.abs(stats.userGrowthRate))}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Utilisateurs Payants */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs Payants</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.premiumUsers)}</p>
              <div className="flex items-center mt-2">
                <Percent className="w-4 h-4 text-indigo-500 mr-1" />
                <span className="text-sm font-medium text-indigo-600">
                  {formatPercentage(stats.conversionRate)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">taux de conversion</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Revenus Mensuels */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus Mensuels</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyRevenue)}</p>
              <div className="flex items-center mt-2">
                {stats.revenueGrowthRate >= 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${stats.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(Math.abs(stats.revenueGrowthRate))}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Revenus Totaux */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus Totaux</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                <Target className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium text-orange-600">
                  {formatCurrency(stats.averageRevenuePerUser)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">par utilisateur</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques Secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nouveaux ce mois</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(stats.newUsersThisMonth)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nouveaux cette semaine</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(stats.newUsersThisWeek)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Durée session moy.</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.averageSessionDuration}min</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taux de churn</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatPercentage(stats.churnRate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus par Mois */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Évolution des Revenus</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                labelFormatter={(label) => `Mois: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Répartition par Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.values(stats.planBreakdown)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {Object.values(stats.planBreakdown).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatNumber(value), 'Utilisateurs']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenus par Plan Détaillés */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenus par Plan Payant (Boost/Scale)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Plan Boost - Toujours affiché */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Boost</h4>
              </div>
              <Crown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatNumber(stats?.planBreakdown?.boost?.count || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenus:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(stats?.planBreakdown?.boost?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Prix mensuel:</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">$29.99</span>
              </div>
            </div>
          </div>

          {/* Plan Scale - Toujours affiché */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Scale</h4>
              </div>
              <Crown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatNumber(stats?.planBreakdown?.scale?.count || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenus:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(stats?.planBreakdown?.scale?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Prix mensuel:</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">$99.99</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des Utilisateurs */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Évolution des Utilisateurs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [formatNumber(value), 'Utilisateurs']}
              labelFormatter={(label) => `Mois: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AdminStatsPage