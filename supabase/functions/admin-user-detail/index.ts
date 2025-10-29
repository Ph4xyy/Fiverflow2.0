import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserDetail {
  id: string;
  email: string;
  full_name: string;
  username: string;
  role: string;
  subscription_plan: string;
  total_spent: number;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  last_login_at: string;
  login_count: number;
  transactions: any[];
  admin_actions: any[];
  subscription_details: any;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify admin access
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('role, is_admin')
      .eq('user_id', user.id)
      .single()

    if (profileError || (!profile?.is_admin && profile?.role !== 'admin')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user ID from URL
    const url = new URL(req.url)
    const userId = url.pathname.split('/').pop()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch user profile
    const { data: userProfile, error: userError } = await supabaseClient
      .from('user_profiles')
      .select(`
        *,
        auth.users!inner(email)
      `)
      .eq('user_id', userId)
      .single()

    if (userError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch user transactions
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Fetch admin actions on this user
    const { data: adminActions, error: actionsError } = await supabaseClient
      .from('admin_actions_log')
      .select(`
        *,
        admin_user:user_profiles!admin_actions_log_admin_user_id_fkey(full_name, username)
      `)
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch subscription details
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    const userDetail: UserDetail = {
      id: userProfile.user_id,
      email: userProfile.auth?.users?.email || '',
      full_name: userProfile.full_name || '',
      username: userProfile.username || '',
      role: userProfile.role || 'member',
      subscription_plan: userProfile.subscription_plan || 'lunch',
      total_spent: userProfile.total_spent || 0,
      is_banned: userProfile.is_banned || false,
      ban_reason: userProfile.ban_reason,
      created_at: userProfile.created_at,
      last_login_at: userProfile.last_login_at,
      login_count: userProfile.login_count || 0,
      transactions: transactions || [],
      admin_actions: adminActions || [],
      subscription_details: subscription || null,
    }

    return new Response(
      JSON.stringify(userDetail),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

