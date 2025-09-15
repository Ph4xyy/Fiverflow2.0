import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'FiverFlow Payouts',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get user from auth token
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { action, return_url, refresh_url } = await req.json();

    if (action === 'create_account') {
      // Check if user already has a Stripe Connect account
      const { data: existingAccount } = await supabase
        .from('user_payout_details')
        .select('stripe_account_id, account_status')
        .eq('user_id', user.id)
        .maybeSingle();

      let accountId = existingAccount?.stripe_account_id;

      if (!accountId) {
        // Create new Stripe Connect account
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US', // You might want to make this dynamic based on user's country
          email: user.email,
          capabilities: {
            transfers: { requested: true },
          },
        });

        accountId = account.id;

        // Save account details to database
        await supabase
          .from('user_payout_details')
          .upsert({
            user_id: user.id,
            stripe_account_id: accountId,
            account_status: 'pending',
            payout_enabled: false,
          }, {
            onConflict: 'user_id'
          });
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        return_url: return_url || `${req.headers.get('origin')}/network?setup=success`,
        refresh_url: refresh_url || `${req.headers.get('origin')}/network?setup=refresh`,
        type: 'account_onboarding',
      });

      return new Response(
        JSON.stringify({
          success: true,
          account_id: accountId,
          onboarding_url: accountLink.url,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (action === 'check_status') {
      // Get user's account details
      const { data: payoutDetails } = await supabase
        .from('user_payout_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!payoutDetails?.stripe_account_id) {
        return new Response(
          JSON.stringify({
            success: true,
            account_exists: false,
            payout_enabled: false,
          }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Get account status from Stripe
      const account = await stripe.accounts.retrieve(payoutDetails.stripe_account_id);
      
      const isVerified = account.details_submitted && 
                        account.charges_enabled && 
                        account.payouts_enabled;

      // Update database with current status
      await supabase
        .from('user_payout_details')
        .update({
          account_status: isVerified ? 'verified' : 'pending',
          payout_enabled: isVerified,
          bank_account_last4: account.external_accounts?.data[0]?.last4 || null,
          bank_account_country: account.country || null,
        })
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({
          success: true,
          account_exists: true,
          account_status: isVerified ? 'verified' : 'pending',
          payout_enabled: isVerified,
          bank_account_last4: account.external_accounts?.data[0]?.last4 || null,
          bank_account_country: account.country || null,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Stripe Connect onboarding error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});