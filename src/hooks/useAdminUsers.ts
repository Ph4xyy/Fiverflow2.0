import { useState, useEffect } from 'react'
import { adminUserService, AdminUser, UserRole, SubscriptionPlan } from '../services/adminUserService'
import toast from 'react-hot-toast'

interface UseAdminUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  subscription_plan?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

interface UseAdminUsersReturn {
  users: AdminUser[]
  roles: UserRole[]
  subscriptionPlans: SubscriptionPlan[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  } | null
  refetch: () => Promise<void>
  updateUserRole: (userId: string, role: string) => Promise<void>
  updateUserSubscription: (userId: string, plan: string) => Promise<void>
  setFilters: (filters: Partial<UseAdminUsersParams>) => void
}

export const useAdminUsers = (params: UseAdminUsersParams = {}): UseAdminUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    pages: number
  } | null>(null)
  const [filters, setFilters] = useState<UseAdminUsersParams>(params)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Récupérer les utilisateurs, rôles et plans en parallèle
      const [usersResult, rolesResult, plansResult] = await Promise.all([
        adminUserService.getUsers(filters),
        adminUserService.getRoles(),
        adminUserService.getSubscriptionPlans()
      ])

      setUsers(usersResult.users)
      setPagination(usersResult.pagination)
      setRoles(rolesResult)
      setSubscriptionPlans(plansResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchData()
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      console.log('🔄 useAdminUsers - updateUserRole:', { userId, role })
      await adminUserService.updateUserRole(userId, role)
      console.log('✅ useAdminUsers - Role updated successfully')
      toast.success('Rôle utilisateur mis à jour avec succès !')
      await refetch() // Forcer le rechargement complet
    } catch (err) {
      console.error('❌ useAdminUsers - Error updating role:', err)
      toast.error('Erreur lors de la mise à jour du rôle')
      throw err
    }
  }

  const updateUserSubscription = async (userId: string, plan: string) => {
    try {
      console.log('🔄 useAdminUsers - updateUserSubscription:', { userId, plan })
      await adminUserService.updateUserSubscription(userId, plan)
      console.log('✅ useAdminUsers - Subscription updated successfully')
      toast.success('Abonnement utilisateur mis à jour avec succès !')
      await refetch() // Forcer le rechargement complet
    } catch (err) {
      console.error('❌ useAdminUsers - Error updating subscription:', err)
      toast.error('Erreur lors de la mise à jour de l\'abonnement')
      throw err
    }
  }

  const handleSetFilters = (newFilters: Partial<UseAdminUsersParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  return {
    users,
    roles,
    subscriptionPlans,
    loading,
    error,
    pagination,
    refetch,
    updateUserRole,
    updateUserSubscription,
    setFilters: handleSetFilters
  }
}