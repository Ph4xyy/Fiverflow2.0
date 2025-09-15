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

// Stripe transfer fee: $0.25 for US bank accounts
const STRIPE_TRANSFER_FEE = 0.25;

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

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validate payout request using database function
    const { data: validation, error: validationError } = await supabase
      .rpc('validate_payout_request', {
        target_user_id: user.id,
        requested_amount: amount
      });

    if (validationError) {
      console.error('Validation error:', validationError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate payout request' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          error: validation.error,
          available_earnings: validation.available_earnings 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get user's Stripe Connect account
    const { data: payoutDetails, error: payoutDetailsError } = await supabase
      .from('user_payout_details')
      .select('stripe_account_id, payout_enabled')
      .eq('user_id', user.id)
      .maybeSingle();

    if (payoutDetailsError || !payoutDetails?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Payout account not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!payoutDetails.payout_enabled) {
      return new Response(
        JSON.stringify({ error: 'Payout not enabled. Please complete account verification.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Calculate fees and net amount
    const amountFee = STRIPE_TRANSFER_FEE;
    const amountNet = amount - amountFee;

    if (amountNet <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount too small to cover transfer fees' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create payout request in database first
    const { data: payoutRequest, error: createRequestError } = await supabase
      .from('payout_requests')
      .insert({
        user_id: user.id,
        amount_requested: amount,
        amount_fee: amountFee,
        amount_net: amountNet,
        status: 'pending'
      })
      .select()
      .single();

    if (createRequestError) {
      console.error('Error creating payout request:', createRequestError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payout request' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    try {
      // Create Stripe transfer
      const transfer = await stripe.transfers.create({
        amount: Math.round(amountNet * 100), // Convert to cents
        currency: 'usd',
        destination: payoutDetails.stripe_account_id,
        metadata: {
          user_id: user.id,
          payout_request_id: payoutRequest.id,
          type: 'referral_commission'
        }
      });

      // Update payout request with Stripe transfer ID and status
      await supabase
        .from('payout_requests')
        .update({
          stripe_transfer_id: transfer.id,
          status: 'processing',
          processed_at: new Date().toISOString()
        })
        .eq('id', payoutRequest.id);

      // Mark referral logs as paid out
      const { data: unpaidLogs } = await supabase
        .from('referral_logs')
        .select('id, amount_earned')
        .eq('referrer_id', user.id)
        .eq('is_paid_out', false)
        .order('date', { ascending: true });

      if (unpaidLogs) {
        let remainingAmount = amount;
        const logsToUpdate = [];

        for (const log of unpaidLogs) {
          if (remainingAmount <= 0) break;
          
          if (log.amount_earned <= remainingAmount) {
            logsToUpdate.push(log.id);
            remainingAmount -= log.amount_earned;
          }
        }

        if (logsToUpdate.length > 0) {
          await supabase
            .from('referral_logs')
            .update({
              is_paid_out: true,
              payout_request_id: payoutRequest.id
            })
            .in('id', logsToUpdate);
        }
      }

      console.log(`Successfully created transfer ${transfer.id} for user ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          payout_request_id: payoutRequest.id,
          transfer_id: transfer.id,
          amount_requested: amount,
          amount_fee: amountFee,
          amount_net: amountNet,
          status: 'processing'
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );

    } catch (stripeError: any) {
      console.error('Stripe transfer error:', stripeError);
      
      // Update payout request status to failed
      await supabase
        .from('payout_requests')
        .update({
          status: 'failed',
          failure_reason: stripeError.message,
          processed_at: new Date().toISOString()
        })
        .eq('id', payoutRequest.id);

      return new Response(
        JSON.stringify({ 
          error: 'Failed to process payout',
          details: stripeError.message 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error('Payout request error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});