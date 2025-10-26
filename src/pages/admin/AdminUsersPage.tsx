import React, { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import UserDetailModal from '../../components/UserDetailModal'
import { useAdminUsers } from '../../hooks/useAdminUsers'
import { AdminUser } from '../../services/adminUserService'
import {
  Users,
  Search,
  Filter,
  Download,
  Edit,
  Mail,
  Calendar,
  DollarSign,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  TrendingUp,
  Activity,
  CreditCard,
  UserCheck,
  UserX,
  Clock,
  Target,
  Crown
} from 'lucide-react'
import { ExportService } from '../../services/exportService'
import { advancedStatsService } from '../../services/advancedStatsService'
import toast from 'react-hot-toast'

interface UserStats {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  totalRevenue: number
  monthlyRevenue: number
  avgRevenuePerUser: number
  conversionRate: number
  planBreakdown: Record<string, { name: string; count: number; revenue: number }>
}

const AdminUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview')

  const {
    users,
    roles,
    subscriptionPlans,
    loading,
    error,
    pagination,
    refetch,
    updateUserRole,
    updateUserSubscription,
    setFilters
  } = useAdminUsers({
    search: searchTerm,
    role: roleFilter,
    subscription_plan: planFilter,
    sort_by: sortBy,
    sort_order: sortOrder
  })

  // Calculer les statistiques utilisateur
  const userStats: UserStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    premiumUsers: users.filter(u => u.subscription_plan && (u.subscription_plan === 'boost' || u.subscription_plan === 'scale')).length,
    totalRevenue: users.reduce((sum, u) => sum + (u.total_spent || 0), 0),
    monthlyRevenue: users.reduce((sum, u) => sum + (u.monthly_spent || 0), 0),
    avgRevenuePerUser: users.length > 0 ? users.reduce((sum, u) => sum + (u.total_spent || 0), 0) / users.length : 0,
    conversionRate: users.length > 0 ? (users.filter(u => u.subscription_plan && (u.subscription_plan === 'boost' || u.subscription_plan === 'scale')).length / users.length) * 100 : 0,
    planBreakdown: {}
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters({ search: value })
  }

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role)
    setFilters({ role })
  }

  const handlePlanFilter = (plan: string) => {
    setPlanFilter(plan)
    setFilters({ subscription_plan: plan })
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setFilters({ sort_by: field, sort_order: sortOrder })
  }

  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      switch (action) {
        case 'role':
          await updateUserRole(userId, data.role)
          toast.success('Rôle utilisateur mis à jour')
          break
        case 'subscription':
          await updateUserSubscription(userId, data.plan)
          toast.success('Abonnement utilisateur mis à jour')
          break
        default:
          break
      }
      refetch()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Email', 'Nom', 'Rôle', 'Plan', 'Créé le', 'Dernière activité', 'Total dépensé'].join(','),
      ...users.map(user => [
        user.id,
        user.email,
        user.full_name || '',
        user.role || 'user',
        user.subscription_plan || 'free',
        new Date(user.created_at).toLocaleDateString(),
        user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'Jamais',
        user.total_spent || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Export des utilisateurs téléchargé')
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <UserCheck className="w-4 h-4 text-red-500" />
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  const getPlanBadge = (plan: string) => {
    const plans = {
      free: { label: 'Gratuit', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      launch: { label: 'Launch', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      boost: { label: 'Boost', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      scale: { label: 'Scale', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      admin: { label: 'Admin', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
    }
    const planInfo = plans[plan as keyof typeof plans] || plans.free
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${planInfo.color}`}>
        {planInfo.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const handleExportGlobal = async () => {
    try {
      // Récupérer les statistiques avancées
      const stats = await advancedStatsService.getAdvancedStats()
      
      // Préparer les données d'export
      const exportData = {
        users: filteredUsers,
        adminRevenue: stats.adminRevenue,
        totalRevenue: stats.totalRevenue,
        stats: {
          totalUsers: stats.totalUsers,
          premiumUsers: stats.premiumUsers,
          conversionRate: stats.conversionRate
        }
      }
      
      // Exporter
      ExportService.exportToExcel(exportData, 'global')
      toast.success('Export global généré avec succès !')
    } catch (error) {
      toast.error('Erreur lors de l\'export global')
    }
  }

  const handleExportUser = async (user: AdminUser) => {
    try {
      // Récupérer les statistiques avancées
      const stats = await advancedStatsService.getAdvancedStats()
      
      // Préparer les données d'export pour un utilisateur spécifique
      const exportData = {
        users: [user], // Seulement cet utilisateur
        adminRevenue: stats.adminRevenue,
        totalRevenue: stats.totalRevenue,
        stats: {
          totalUsers: stats.totalUsers,
          premiumUsers: stats.premiumUsers,
          conversionRate: stats.conversionRate
        }
      }
      
      // Exporter avec le nom d'utilisateur
      const username = user.full_name || user.email.split('@')[0]
      ExportService.exportToExcel(exportData, 'user', username)
      toast.success(`Export pour ${username} généré avec succès !`)
    } catch (error) {
      toast.error('Erreur lors de l\'export utilisateur')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des Utilisateurs
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administration complète des utilisateurs et statistiques détaillées
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              disabled={loading}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportGlobal}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter Global
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'detailed'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Détails utilisateurs
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {userStats.activeUsers} actifs
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs Premium</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.premiumUsers}</p>
                  </div>
                  <Crown className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    {userStats.conversionRate.toFixed(1)}% conversion
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus Totaux</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(userStats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {formatCurrency(userStats.monthlyRevenue)} ce mois
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Panier Moyen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(userStats.avgRevenuePerUser)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-orange-600 dark:text-orange-400">
                    Par utilisateur
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activité Récente</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.last_activity ? formatDate(user.last_activity) : 'Jamais actif'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPlanBadge(user.subscription_plan || 'free')}
                      {getRoleIcon(user.role || 'user')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Tab */}
        {activeTab === 'detailed' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Email, nom..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Tous les rôles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan
                  </label>
                  <select
                    value={planFilter}
                    onChange={(e) => handlePlanFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Tous les plans</option>
                    {subscriptionPlans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trier par
                  </label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-')
                      setSortBy(field)
                      setSortOrder(order as 'asc' | 'desc')
                      setFilters({ sort_by: field, sort_order: order as 'asc' | 'desc' })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="created_at-desc">Plus récent</option>
                    <option value="created_at-asc">Plus ancien</option>
                    <option value="email-asc">Email A-Z</option>
                    <option value="email-desc">Email Z-A</option>
                    <option value="total_spent-desc">Plus gros dépensier</option>
                    <option value="total_spent-asc">Moins gros dépensier</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {!loading && !error && (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Plan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Revenus
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Dernière activité
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.full_name || 'Non renseigné'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(user.role || 'user')}
                                <span className="text-sm text-gray-900 dark:text-white capitalize">
                                  {user.role || 'user'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getPlanBadge(user.subscription_plan || 'free')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {formatCurrency(user.total_spent || 0)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatCurrency(user.monthly_spent || 0)} ce mois
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {user.last_activity ? formatDate(user.last_activity) : 'Jamais'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Créé le {formatDate(user.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowUserModal(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const newRole = user.role === 'admin' ? 'user' : 'admin'
                                    handleUserAction(user.user_id, 'role', { role: newRole })
                                  }}
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleExportUser(user)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Exporter cet utilisateur"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} utilisateurs
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Page {pagination.page} sur {pagination.pages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800 p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={20} />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Erreur de chargement
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false)
          setSelectedUser(null)
        }}
        onUpdate={handleUserAction}
        roles={roles}
        subscriptionPlans={subscriptionPlans}
      />
    </AdminLayout>
  )
}

export default AdminUsersPage