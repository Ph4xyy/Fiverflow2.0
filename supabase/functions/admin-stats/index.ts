import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatsOverview {
  totalUsers: number
  totalInvoices: number
  totalRevenue: number
  recentUsers: Array<{
    id: string
    full_name: string
    email: string
    role: string
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
    user_id: string
    full_name: string
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
    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://arnuyyyryvbfcvqauqur.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY'
    )

    // For admin operations, we'll use service role key directly
    // No need to verify user session as this is an admin-only function
    // Service role key bypasses all RLS policies

    const url = new URL(req.url)
    const method = req.method

    // GET /admin-stats - Get overview statistics
    if (method === 'GET') {
      try {
        // Get basic stats using simple queries
        const [
          { data: totalUsers, error: usersError },
          { data: totalInvoices, error: invoicesError },
          { data: totalRevenue, error: revenueError },
          { data: recentUsers, error: recentUsersError },
          { data: recentOrders, error: recentOrdersError },
          { data: recentInvoices, error: recentInvoicesError }
        ] = await Promise.all([
          supabaseClient
            .from('user_profiles')
            .select('id', { count: 'exact', head: true }),
          supabaseClient
            .from('invoices')
            .select('id', { count: 'exact', head: true }),
          supabaseClient
            .from('invoices')
            .select('total')
            .eq('status', 'paid'),
          supabaseClient
            .from('user_profiles')
            .select('id, full_name, email, role, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabaseClient
            .from('orders')
            .select('id, title, client_name, amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabaseClient
            .from('invoices')
            .select('id, number, total, status, created_at, clients(name)')
            .order('created_at', { ascending: false })
            .limit(10)
        ])

        // Check for errors
        if (usersError) throw new Error(`Users error: ${usersError.message}`)
        if (invoicesError) throw new Error(`Invoices error: ${invoicesError.message}`)
        if (revenueError) throw new Error(`Revenue error: ${revenueError.message}`)
        if (recentUsersError) throw new Error(`Recent users error: ${recentUsersError.message}`)
        if (recentOrdersError) throw new Error(`Recent orders error: ${recentOrdersError.message}`)
        if (recentInvoicesError) throw new Error(`Recent invoices error: ${recentInvoicesError.message}`)

        // Calculate total revenue
        const revenue = totalRevenue?.reduce((sum: number, invoice: any) => sum + (invoice.total || 0), 0) || 0

        // Transform recentInvoices to include client_name from joined clients
        const transformedInvoices = (recentInvoices || []).map((invoice: any) => ({
          ...invoice,
          client_name: typeof invoice.clients === 'object' && invoice.clients !== null 
            ? invoice.clients.name 
            : 'No Client'
        }))

        const result: StatsOverview = {
          totalUsers: totalUsers?.length || 0,
          totalInvoices: totalInvoices?.length || 0,
          totalRevenue: revenue,
          recentUsers: recentUsers || [],
          recentOrders: recentOrders || [],
          recentInvoices: transformedInvoices,
          topReferrers: [] // Empty for now
        }

        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error fetching stats:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch stats: ' + error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})