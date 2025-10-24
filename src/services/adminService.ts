import { supabase } from '../lib/supabase'

export interface AdminUser {
  id: string
  user_id: string
  username: string
  display_name: string
  email: string
  role: string
  subscription_plan: string | null
  subscription_started_at: string | null
  subscription_expires_at: string | null
  total_spent: number
  created_at: string
  updated_at: string
  transaction_count: number
  last_transaction: string | null
}

export interface AdminStats {
  totals: {
    allTimeUsers: number
    newUsersInRange: number
    totalRevenue: number
    revenueInRange: number
    totalClients: number
    totalOrders: number
    totalInvoices: number
    totalTasks: number
    totalTimeEntries: number
    adminsAllTime: number
  }
  plans: {
    free: number
    pro: number
  }
  revenue: {
    fromInvoices: number
    fromOrders: number
  }
  subscriptions: {
    total: number
    active: number
    monthlyRevenue: number
    yearlyRevenue: number
  }
  platformStats: {
    totalClients: number
    topPlatforms: Array<{
      platform: string
      count: number
    }>
  }
  recentUsers: Array<{
    id: string
    name: string
    email: string
    role: string
    current_plan: string
    created_at: string
  }>
  recentOrders: Array<{
    id: string
    title: string
    client_name: string
    amount: number
    status: string
    created_at: string
  }>
  recentInvoices: Array<{
    id: string
    number: string
    client_name: string
    total: number
    status: string
    created_at: string
  }>
  topReferrers: Array<{
    id: string
    name: string
    email: string
    referral_count: number
    total_earnings: number
  }>
}

export interface UsersListResponse {
  users: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface AIResponse {
  summary: string
  insights: string[]
  recommendations: string[]
}

export class AdminService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No active session')
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  // Users management
  static async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    role?: string
    subscription_plan?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  } = {}): Promise<UsersListResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.search) searchParams.set('search', params.search)
    if (params.role) searchParams.set('role', params.role)
    if (params.subscription_plan) searchParams.set('subscription_plan', params.subscription_plan)
    if (params.sort_by) searchParams.set('sort_by', params.sort_by)
    if (params.sort_order) searchParams.set('sort_order', params.sort_order)

    return this.makeRequest<UsersListResponse>(`admin-users?${searchParams.toString()}`)
  }

  static async getUserById(userId: string): Promise<AdminUser> {
    return this.makeRequest<AdminUser>(`admin-users/${userId}`)
  }

  static async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    return this.makeRequest<AdminUser>(`admin-users`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, role })
    })
  }

  static async updateUserSubscription(
    userId: string, 
    subscription_plan: string,
    subscription_started_at?: string,
    subscription_expires_at?: string
  ): Promise<AdminUser> {
    return this.makeRequest<AdminUser>(`admin-users`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        user_id: userId, 
        subscription_plan,
        subscription_started_at,
        subscription_expires_at
      })
    })
  }

  // Statistics
  static async getStats(params: {
    start_date?: string
    end_date?: string
  } = {}): Promise<AdminStats> {
    const searchParams = new URLSearchParams()
    
    if (params.start_date) searchParams.set('start_date', params.start_date)
    if (params.end_date) searchParams.set('end_date', params.end_date)

    return this.makeRequest<AdminStats>(`admin-stats?${searchParams.toString()}`)
  }

  static async getTransactions(params: {
    start_date?: string
    end_date?: string
    plan?: string
    status?: string
    page?: number
    limit?: number
  } = {}): Promise<{
    transactions: Array<{
      id: string
      user_id: string
      stripe_payment_id: string
      amount_cents: number
      currency: string
      plan: string
      status: string
      created_at: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const searchParams = new URLSearchParams()
    
    if (params.start_date) searchParams.set('start_date', params.start_date)
    if (params.end_date) searchParams.set('end_date', params.end_date)
    if (params.plan) searchParams.set('plan', params.plan)
    if (params.status) searchParams.set('status', params.status)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())

    return this.makeRequest(`admin-stats/transactions?${searchParams.toString()}`)
  }

  // AI Assistant
  static async generateAIInsights(prompt: string, context?: string): Promise<AIResponse> {
    return this.makeRequest<AIResponse>('admin-ai', {
      method: 'POST',
      body: JSON.stringify({ prompt, context })
    })
  }

  // Export functions
  static async exportUsers(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No active session')
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Export failed')
    }

    return response.blob()
  }

  static async exportTransactions(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No active session')
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Export failed')
    }

    return response.blob()
  }
}
