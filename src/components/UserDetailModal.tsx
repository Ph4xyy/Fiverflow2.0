import React, { useState } from 'react'
import { AdminUser } from '../../services/adminService'
import {
  X,
  Mail,
  Calendar,
  DollarSign,
  CreditCard,
  UserCheck,
  UserX,
  Settings,
  Activity,
  TrendingUp,
  Clock,
  Target,
  Save,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserDetailModalProps {
  user: AdminUser | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (userId: string, action: string, data: any) => Promise<void>
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<AdminUser>>({})

  if (!isOpen || !user) return null

  const handleEdit = () => {
    setIsEditing(true)
    setEditedUser({
      role: user.role,
      subscription_plan: user.subscription_plan,
      is_active: user.is_active
    })
  }

  const handleSave = async () => {
    try {
      if (editedUser.role !== user.role) {
        await onUpdate(user.id, 'role', { role: editedUser.role })
      }
      if (editedUser.subscription_plan !== user.subscription_plan) {
        await onUpdate(user.id, 'subscription', { plan: editedUser.subscription_plan })
      }
      setIsEditing(false)
      toast.success('Utilisateur mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedUser({})
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <UserCheck className="w-5 h-5 text-red-500" />
      case 'moderator':
        return <UserCheck className="w-5 h-5 text-blue-500" />
      default:
        return <UserX className="w-5 h-5 text-gray-500" />
    }
  }

  const getPlanBadge = (plan: string) => {
    const plans = {
      free: { label: 'Gratuit', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      basic: { label: 'Basique', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      enterprise: { label: 'Entreprise', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
    }
    const planInfo = plans[plan as keyof typeof plans] || plans.free
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${planInfo.color}`}>
        {planInfo.label}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.full_name || 'Utilisateur'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md"
                >
                  Annuler
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Informations de base
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom complet
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {user.full_name || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rôle
                  </label>
                  {isEditing ? (
                    <select
                      value={editedUser.role || user.role}
                      onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="moderator">Modérateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role || 'user')}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {user.role || 'user'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Plan d'abonnement
                  </label>
                  {isEditing ? (
                    <select
                      value={editedUser.subscription_plan || user.subscription_plan}
                      onChange={(e) => setEditedUser({ ...editedUser, subscription_plan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="free">Gratuit</option>
                      <option value="basic">Basique</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Entreprise</option>
                    </select>
                  ) : (
                    getPlanBadge(user.subscription_plan || 'free')
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activité et dates
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de création
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(user.created_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dernière activité
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {user.last_activity ? formatDate(user.last_activity) : 'Jamais'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statut
                  </label>
                  <div className="flex items-center gap-2">
                    {user.is_active ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Actif</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Inactif</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Statistiques financières
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus totaux</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(user.total_spent || 0)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ce mois</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(user.monthly_spent || 0)}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commandes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.total_orders || 0}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {user.username && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Informations supplémentaires
              </h3>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom d'utilisateur
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">@{user.username}</p>
                  </div>
                  {user.referral_code && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Code de parrainage
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{user.referral_code}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
