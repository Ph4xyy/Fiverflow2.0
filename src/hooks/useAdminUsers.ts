import { useState, useEffect, useCallback } from 'react'
import { AdminService, AdminUser, UsersListResponse } from '../services/adminService'

export interface UseAdminUsersOptions {
  page?: number
  limit?: number
  search?: string
  role?: string
  subscription_plan?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface UseAdminUsersReturn {
  users: AdminUser[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  refetch: () => Promise<void>
  updateUserRole: (userId: string, role: string) => Promise<void>
  updateUserSubscription: (
    userId: string, 
    subscription_plan: string,
    subscription_started_at?: string,
    subscription_expires_at?: string
  ) => Promise<void>
  setFilters: (filters: Partial<UseAdminUsersOptions>) => void
}

export function useAdminUsers(initialOptions: UseAdminUsersOptions = {}): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [options, setOptions] = useState<UseAdminUsersOptions>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialOptions
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: UsersListResponse = await AdminService.getUsers(options)
      
      setUsers(response.users)
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [options])

  const refetch = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      setError(null)
      await AdminService.updateUserRole(userId, role)
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.user_id === userId 
            ? { ...user, role }
            : user
        )
      )
      
      // Refetch to ensure data consistency
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role')
      throw err
    }
  }, [refetch])

  const updateUserSubscription = useCallback(async (
    userId: string, 
    subscription_plan: string,
    subscription_started_at?: string,
    subscription_expires_at?: string
  ) => {
    try {
      setError(null)
      await AdminService.updateUserSubscription(
        userId, 
        subscription_plan,
        subscription_started_at,
        subscription_expires_at
      )
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.user_id === userId 
            ? { 
                ...user, 
                subscription_plan,
                subscription_started_at: subscription_started_at || user.subscription_started_at,
                subscription_expires_at: subscription_expires_at || user.subscription_expires_at
              }
            : user
        )
      )
      
      // Refetch to ensure data consistency
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user subscription')
      throw err
    }
  }, [refetch])

  const setFilters = useCallback((filters: Partial<UseAdminUsersOptions>) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      ...filters,
      page: 1 // Reset to first page when filters change
    }))
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    pagination,
    refetch,
    updateUserRole,
    updateUserSubscription,
    setFilters
  }
}
