import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserProfile {
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
}

interface AdminUser {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    // GET /admin-users - List users with pagination and filters
    if (method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const search = url.searchParams.get('search') || ''
      const role = url.searchParams.get('role') || ''
      const subscription_plan = url.searchParams.get('subscription_plan') || ''
      const sort_by = url.searchParams.get('sort_by') || 'created_at'
      const sort_order = url.searchParams.get('sort_order') || 'desc'

      let query = supabaseClient
        .from('user_profiles')
        .select(`
          *,
          transactions:transactions(count),
          last_transaction:transactions(created_at)
        `)
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range((page - 1) * limit, page * limit - 1)

      // Apply filters
      if (search) {
        query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      if (role) {
        query = query.eq('role', role)
      }
      if (subscription_plan) {
        query = query.eq('subscription_plan', subscription_plan)
      }

      const { data: users, error: usersError, count } = await query

      if (usersError) {
        throw new Error(`Failed to fetch users: ${usersError.message}`)
      }

      // Get total count for pagination
      const { count: totalCount } = await supabaseClient
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      return new Response(
        JSON.stringify({
          users: users || [],
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            pages: Math.ceil((totalCount || 0) / limit)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH /admin-users - Update user role or subscription
    if (method === 'PATCH') {
      const body = await req.json()
      const { user_id, role, subscription_plan, subscription_started_at, subscription_expires_at } = body

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'user_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updates: any = {}
      if (role) updates.role = role
      if (subscription_plan !== undefined) updates.subscription_plan = subscription_plan
      if (subscription_started_at) updates.subscription_started_at = subscription_started_at
      if (subscription_expires_at) updates.subscription_expires_at = subscription_expires_at

      // Update user profile
      const { data: updatedUser, error: updateError } = await supabaseClient
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user_id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`)
      }

      // Log the admin action
      const { error: logError } = await supabaseClient
        .from('admin_actions_log')
        .insert({
          admin_user_id: user.id,
          target_user_id: user_id,
          action_type: role ? 'role_change' : 'subscription_change',
          payload: updates
        })

      if (logError) {
        console.error('Failed to log admin action:', logError)
      }

      return new Response(
        JSON.stringify({ user: updatedUser }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})