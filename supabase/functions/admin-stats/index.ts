import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatsOverview {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      'https://your-project.supabase.co', // Remplacez par votre URL Supabase
      'your_supabase_anon_key', // Remplacez par votre clé anon
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || !['admin', 'moderator'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin or moderator role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const method = req.method

    // GET /admin-stats - Get overview statistics
    if (method === 'GET') {
      const startDate = url.searchParams.get('start_date')
      const endDate = url.searchParams.get('end_date')

      // Use the database function to get stats
      const { data: stats, error: statsError } = await supabaseClient
        .rpc('get_admin_stats', {
          p_start_date: startDate,
          p_end_date: endDate
        })

      if (statsError) {
        throw new Error(`Failed to fetch stats: ${statsError.message}`)
      }

      // Get additional data for the overview
      const [
        { data: recentUsers },
        { data: recentOrders },
        { data: recentInvoices },
        { data: platformStats },
        { data: topReferrers }
      ] = await Promise.all([
        // Recent users
        supabaseClient
          .from('user_profiles')
          .select('id, display_name as name, email, role, subscription_plan as current_plan, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Recent orders
        supabaseClient
          .from('orders')
          .select('id, title, client_name, amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Recent invoices
        supabaseClient
          .from('invoices')
          .select('id, number, client_name, total, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Platform statistics
        supabaseClient
          .from('clients')
          .select('platform')
          .not('platform', 'is', null),
        
        // Top referrers
        supabaseClient
          .from('user_profiles')
          .select(`
            id, display_name as name, email,
            referral_count,
            total_earnings
          `)
          .not('referral_count', 'is', null)
          .gt('referral_count', 0)
          .order('referral_count', { ascending: false })
          .limit(10)
      ])

      // Process platform stats
      const platformCounts: { [key: string]: number } = {}
      if (platformStats) {
        platformStats.forEach((client: any) => {
          if (client.platform) {
            platformCounts[client.platform] = (platformCounts[client.platform] || 0) + 1
          }
        })
      }

      const topPlatforms = Object.entries(platformCounts)
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const result: StatsOverview = {
        ...stats,
        platformStats: {
          totalClients: platformStats?.length || 0,
          topPlatforms
        },
        recentUsers: recentUsers || [],
        recentOrders: recentOrders || [],
        recentInvoices: recentInvoices || [],
        topReferrers: topReferrers || []
      }

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin-stats function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
