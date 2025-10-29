import { useState, useEffect, useCallback } from 'react'
import { AdminService, AdminStats } from '../services/adminService'

export interface UseAdminStatsOptions {
  start_date?: string
  end_date?: string
}

export interface UseAdminStatsReturn {
  stats: AdminStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setDateRange: (startDate: string, endDate: string) => void
}

export function useAdminStats(options: UseAdminStatsOptions = {}): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateOptions, setDateOptions] = useState<UseAdminStatsOptions>(options)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: AdminStats = await AdminService.getStats(dateOptions)
      setStats(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }, [dateOptions])

  const refetch = useCallback(async () => {
    await fetchStats()
  }, [fetchStats])

  const setDateRange = useCallback((startDate: string, endDate: string) => {
    setDateOptions(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }))
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch,
    setDateRange
  }
}