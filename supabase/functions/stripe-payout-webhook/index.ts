import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_PAYOUT_WEBHOOK_SECRET')!;
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

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // Get the raw body
    const body = await req.text();

    // Verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);

    EdgeRuntime.waitUntil(handlePayoutEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing payout webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handlePayoutEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      
      case 'transfer.updated':
        await handleTransferUpdated(event.data.object as Stripe.Transfer);
        break;
      
      case 'transfer.failed':
        await handleTransferFailed(event.data.object as Stripe.Transfer);
        break;
      
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      
      default:
        console.log(`Unhandled payout event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling payout event ${event.type}:`, error);
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  console.log(`Transfer created: ${transfer.id}`);
  
  const payoutRequestId = transfer.metadata?.payout_request_id;
  if (!payoutRequestId) {
    console.log('No payout request ID in transfer metadata');
    return;
  }

  // Update payout request status
  const { error } = await supabase
    .from('payout_requests')
    .update({
      status: 'processing',
      stripe_transfer_id: transfer.id,
      processed_at: new Date(transfer.created * 1000).toISOString()
    })
    .eq('id', payoutRequestId);

  if (error) {
    console.error('Error updating payout request for transfer created:', error);
  } else {
    console.log(`Updated payout request ${payoutRequestId} to processing`);
  }
}

async function handleTransferUpdated(transfer: Stripe.Transfer) {
  console.log(`Transfer updated: ${transfer.id}, status: ${transfer.status}`);
  
  const payoutRequestId = transfer.metadata?.payout_request_id;
  if (!payoutRequestId) {
    console.log('No payout request ID in transfer metadata');
    return;
  }

  let status: string;
  switch (transfer.status) {
    case 'paid':
      status = 'completed';
      break;
    case 'failed':
      status = 'failed';
      break;
    case 'canceled':
      status = 'cancelled';
      break;
    default:
      status = 'processing';
  }

  // Update payout request status
  const { error } = await supabase
    .from('payout_requests')
    .update({
      status: status as any,
      processed_at: new Date().toISOString(),
      ...(transfer.failure_message && { failure_reason: transfer.failure_message })
    })
    .eq('id', payoutRequestId);

  if (error) {
    console.error('Error updating payout request for transfer updated:', error);
  } else {
    console.log(`Updated payout request ${payoutRequestId} to ${status}`);
  }

  // If transfer failed, mark referral logs as not paid out
  if (status === 'failed') {
    await supabase
      .from('referral_logs')
      .update({
        is_paid_out: false,
        payout_request_id: null
      })
      .eq('payout_request_id', payoutRequestId);
  }
}

async function handleTransferFailed(transfer: Stripe.Transfer) {
  console.log(`Transfer failed: ${transfer.id}`);
  
  const payoutRequestId = transfer.metadata?.payout_request_id;
  if (!payoutRequestId) {
    console.log('No payout request ID in transfer metadata');
    return;
  }

  // Update payout request status to failed
  const { error } = await supabase
    .from('payout_requests')
    .update({
      status: 'failed',
      failure_reason: transfer.failure_message || 'Transfer failed',
      processed_at: new Date().toISOString()
    })
    .eq('id', payoutRequestId);

  if (error) {
    console.error('Error updating payout request for transfer failed:', error);
  }

  // Mark referral logs as not paid out
  await supabase
    .from('referral_logs')
    .update({
      is_paid_out: false,
      payout_request_id: null
    })
    .eq('payout_request_id', payoutRequestId);

  console.log(`Marked payout request ${payoutRequestId} as failed and reset referral logs`);
}

async function handleAccountUpdated(account: Stripe.Account) {
  console.log(`Account updated: ${account.id}`);
  
  // Find user with this Stripe account
  const { data: payoutDetails, error: findError } = await supabase
    .from('user_payout_details')
    .select('user_id')
    .eq('stripe_account_id', account.id)
    .maybeSingle();

  if (findError || !payoutDetails) {
    console.log(`No user found for Stripe account ${account.id}`);
    return;
  }

  const isVerified = account.details_submitted && 
                    account.charges_enabled && 
                    account.payouts_enabled;

  // Update user's payout details
  const { error: updateError } = await supabase
    .from('user_payout_details')
    .update({
      account_status: isVerified ? 'verified' : 'pending',
      payout_enabled: isVerified,
      bank_account_last4: account.external_accounts?.data[0]?.last4 || null,
      bank_account_country: account.country || null,
    })
    .eq('user_id', payoutDetails.user_id);

  if (updateError) {
    console.error('Error updating user payout details:', updateError);
  } else {
    console.log(`Updated payout details for user ${payoutDetails.user_id}, verified: ${isVerified}`);
  }
}