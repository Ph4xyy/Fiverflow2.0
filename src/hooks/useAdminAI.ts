import { useState, useCallback } from 'react'
import { AdminService, AIResponse } from '../services/adminService'

export interface UseAdminAIReturn {
  generateInsights: (prompt: string, context?: string) => Promise<AIResponse>
  loading: boolean
  error: string | null
  lastResponse: AIResponse | null
}

export function useAdminAI(): UseAdminAIReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null)

  const generateInsights = useCallback(async (prompt: string, context?: string): Promise<AIResponse> => {
    try {
      setLoading(true)
      setError(null)
      
      const response: AIResponse = await AdminService.generateAIInsights(prompt, context)
      setLastResponse(response)
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI insights'
      setError(errorMessage)
      console.error('Error generating AI insights:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    generateInsights,
    loading,
    error,
    lastResponse
  }
}
