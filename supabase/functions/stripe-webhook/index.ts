import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Function to update referral status and create commission
async function processReferralCommission(customerId: string, subscriptionAmount: number) {
  try {
    console.log(`💰 Processing referral commission for customer ${customerId}`);
    
    // Get the user ID from the customer
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .maybeSingle();
    
    if (customerError || !customerData) {
      console.log('❌ Customer not found in database');
      return;
    }
    
    const userId = customerData.user_id;
    
    // Check if this user was referred using the referrals table
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('referrer_id, subscription_status')
      .eq('referred_id', userId)
      .maybeSingle();
    
    if (referralError) {
      console.error('❌ Error checking referral:', referralError);
      return;
    }
    
    if (!referralData) {
      console.log('ℹ️ User has no referrer, skipping commission');
      return;
    }
    
    const referrerId = referralData.referrer_id;
    
    // Check if commission already exists for this subscription
    const { data: existingCommission, error: existingError } = await supabase
      .from('referral_logs')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('referred_user_id', userId)
      .maybeSingle();
    
    if (existingError) {
      console.error('❌ Error checking existing commission:', existingError);
      return;
    }
    
    if (existingCommission) {
      console.log('ℹ️ Commission already exists for this referral, skipping');
      return;
    }
    
    // Update referral status to 'paid'
    const { error: referralUpdateError } = await supabase
      .from('referrals')
      .update({ subscription_status: 'paid' })
      .eq('referred_id', userId);
    
    if (referralUpdateError) {
      console.error('❌ Error updating referral status:', referralUpdateError);
    } else {
      console.log('✅ Referral status updated to paid');
    }
    
    // Calculate 20% commission
    const commissionAmount = subscriptionAmount * 0.20;
    
    // Create referral commission log
    const { error: commissionError } = await supabase
      .from('referral_logs')
      .insert({
        referrer_id: referrerId,
        referred_user_id: userId,
        amount_earned: commissionAmount,
        date: new Date().toISOString()
      });
    
    if (commissionError) {
      console.error('❌ Error creating referral commission:', commissionError);
    } else {
      console.log(`✅ Referral commission created: $${commissionAmount} for referrer ${referrerId}`);
    }
    
  } catch (error) {
    console.error('💥 Error processing referral commission:', error);
  }
}

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
        } = stripeData as Stripe.Checkout.Session;

        // Insert the order into the stripe_orders table
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed', // assuming we want to mark it as completed since payment is successful
        });

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }
        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
      return;
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
    
    // Process referral commission if subscription is active and not in trial
    if (subscription.status === 'active' && !subscription.trial_end) {
      // Get the subscription amount from the price
      const price = subscription.items.data[0].price;
      const subscriptionAmount = price.unit_amount ? price.unit_amount / 100 : 0; // Convert from cents
      
      if (subscriptionAmount > 0) {
        await processReferralCommission(customerId, subscriptionAmount);
      }
    }
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}