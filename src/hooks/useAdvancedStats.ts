import { useState, useEffect } from 'react'
import { advancedStatsService, AdvancedStats } from '../services/advancedStatsService'
import toast from 'react-hot-toast'

export const useAdvancedStats = () => {
  const [stats, setStats] = useState<AdvancedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await advancedStatsService.getAdvancedStats()
      setStats(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques')
      toast.error('Erreur lors du chargement des statistiques avancées')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const refetch = () => {
    fetchStats()
  }

  return {
    stats,
    loading,
    error,
    refetch
  }
}
