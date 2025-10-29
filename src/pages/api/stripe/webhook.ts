import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id);

  const userId = session.metadata?.userId;
  const priceId = session.metadata?.priceId;

  if (!userId || !priceId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Déterminer le plan basé sur le priceId
  let planName = 'Launch'; // Plan par défaut
  if (priceId === 'price_1SLqlIKF06h9za4ci2OnSIW0') {
    planName = 'Boost';
  } else if (priceId === 'price_1SLqlhKF06h9za4cQ3qEQdO5') {
    planName = 'Scale';
  }

  // Mettre à jour le profil utilisateur
  await supabase
    .from('user_profiles')
    .update({ subscription_plan: planName })
    .eq('user_id', userId);

  console.log(`Updated user ${userId} to plan ${planName}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.created:', subscription.id);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  // Trouver l'utilisateur par customer ID
  const { data: user } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Déterminer le plan
  let planName = 'Launch';
  if (priceId === 'price_1SLqlIKF06h9za4ci2OnSIW0') {
    planName = 'Boost';
  } else if (priceId === 'price_1SLqlhKF06h9za4cQ3qEQdO5') {
    planName = 'Scale';
  }

  // Mettre à jour l'abonnement dans Supabase
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: user.user_id,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

  // Mettre à jour le plan dans le profil
  await supabase
    .from('user_profiles')
    .update({ subscription_plan: planName })
    .eq('user_id', user.user_id);

  console.log(`Created subscription for user ${user.user_id} with plan ${planName}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id);

  const customerId = subscription.customer as string;

  // Trouver l'utilisateur
  const { data: user } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Mettre à jour l'abonnement
  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Si l'abonnement est annulé ou expiré, revenir au plan Launch
  if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
    await supabase
      .from('user_profiles')
      .update({ subscription_plan: 'Launch' })
      .eq('user_id', user.user_id);
  }

  console.log(`Updated subscription for user ${user.user_id} to status ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id);

  const customerId = subscription.customer as string;

  // Trouver l'utilisateur
  const { data: user } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Marquer l'abonnement comme supprimé
  await supabase
    .from('user_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  // Revenir au plan Launch
  await supabase
    .from('user_profiles')
    .update({ subscription_plan: 'Launch' })
    .eq('user_id', user.user_id);

  console.log(`Deleted subscription for user ${user.user_id}, reverted to Launch plan`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id);
  // Logique pour les paiements réussis
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id);
  // Logique pour les échecs de paiement
}
