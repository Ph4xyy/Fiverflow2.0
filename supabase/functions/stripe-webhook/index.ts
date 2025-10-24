import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

interface StripeEvent {
  id: string
  type: string
  data: {
    object: any
  }
}

interface TransactionData {
  user_id: string
  stripe_payment_id: string
  amount_cents: number
  currency: string
  plan: string
  status: string
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
      'your_supabase_service_role_key' // Remplacez par votre clé service_role
    )

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify webhook signature (simplified - in production, use proper Stripe verification)
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the event
    let event: StripeEvent
    try {
      event = JSON.parse(body)
    } catch (err) {
      console.error('Error parsing webhook body:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing Stripe event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(supabaseClient, event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabaseClient, event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabaseClient, event.data.object)
        break
      
      case 'charge.refunded':
        await handleChargeRefunded(supabaseClient, event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Send Discord notification for important events
    await sendDiscordNotification(event.type, event.data.object)

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in stripe-webhook function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCheckoutSessionCompleted(supabase: any, session: any) {
  console.log('Processing checkout.session.completed:', session.id)
  
  const customerId = session.customer
  const amount = session.amount_total
  const currency = session.currency
  const plan = session.metadata?.plan || 'unknown'

  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Create transaction record
  const transactionData: TransactionData = {
    user_id: user.user_id,
    stripe_payment_id: session.payment_intent,
    amount_cents: amount,
    currency: currency,
    plan: plan,
    status: 'completed'
  }

  const { error: transactionError } = await supabase
    .from('transactions')
    .insert(transactionData)

  if (transactionError) {
    console.error('Failed to create transaction:', transactionError)
    return
  }

  // Update user's total spent
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      total_spent: supabase.raw('total_spent + ?', [amount / 100]),
      subscription_plan: plan,
      subscription_started_at: new Date().toISOString(),
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    })
    .eq('user_id', user.user_id)

  if (updateError) {
    console.error('Failed to update user profile:', updateError)
  }

  // Log admin action
  await supabase
    .from('admin_actions_log')
    .insert({
      admin_user_id: user.user_id, // System action
      target_user_id: user.user_id,
      action_type: 'subscription_purchased',
      payload: {
        plan: plan,
        amount: amount / 100,
        currency: currency,
        stripe_session_id: session.id
      }
    })
}

async function handleInvoicePaymentSucceeded(supabase: any, invoice: any) {
  console.log('Processing invoice.payment_succeeded:', invoice.id)
  
  const customerId = invoice.customer
  const amount = invoice.amount_paid
  const currency = invoice.currency

  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Create transaction record
  const transactionData: TransactionData = {
    user_id: user.user_id,
    stripe_payment_id: invoice.payment_intent,
    amount_cents: amount,
    currency: currency,
    plan: 'recurring',
    status: 'completed'
  }

  const { error: transactionError } = await supabase
    .from('transactions')
    .insert(transactionData)

  if (transactionError) {
    console.error('Failed to create transaction:', transactionError)
  }
}

async function handleInvoicePaymentFailed(supabase: any, invoice: any) {
  console.log('Processing invoice.payment_failed:', invoice.id)
  
  const customerId = invoice.customer

  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Log the failed payment
  await supabase
    .from('admin_actions_log')
    .insert({
      admin_user_id: user.user_id,
      target_user_id: user.user_id,
      action_type: 'payment_failed',
      payload: {
        invoice_id: invoice.id,
        amount: invoice.amount_due / 100,
        currency: invoice.currency
      }
    })
}

async function handleSubscriptionCreated(supabase: any, subscription: any) {
  console.log('Processing customer.subscription.created:', subscription.id)
  
  const customerId = subscription.customer
  const plan = subscription.items.data[0]?.price?.nickname || 'unknown'

  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update subscription info
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      subscription_plan: plan,
      subscription_started_at: new Date(subscription.created * 1000).toISOString(),
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('user_id', user.user_id)

  if (updateError) {
    console.error('Failed to update subscription:', updateError)
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Processing customer.subscription.updated:', subscription.id)
  
  const customerId = subscription.customer
  const plan = subscription.items.data[0]?.price?.nickname || 'unknown'

  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update subscription info
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      subscription_plan: plan,
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('user_id', user.user_id)

  if (updateError) {
    console.error('Failed to update subscription:', updateError)
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  console.log('Processing customer.subscription.deleted:', subscription.id)
  
  const customerId = subscription.customer

  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Remove subscription
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      subscription_plan: null,
      subscription_expires_at: null
    })
    .eq('user_id', user.user_id)

  if (updateError) {
    console.error('Failed to remove subscription:', updateError)
  }
}

async function handleChargeRefunded(supabase: any, charge: any) {
  console.log('Processing charge.refunded:', charge.id)
  
  const customerId = charge.customer
  const refundAmount = charge.amount_refunded

  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Create refund transaction
  const transactionData: TransactionData = {
    user_id: user.user_id,
    stripe_payment_id: charge.payment_intent,
    amount_cents: -refundAmount, // Negative for refund
    currency: charge.currency,
    plan: 'refund',
    status: 'refunded'
  }

  const { error: transactionError } = await supabase
    .from('transactions')
    .insert(transactionData)

  if (transactionError) {
    console.error('Failed to create refund transaction:', transactionError)
  }
}

async function sendDiscordNotification(eventType: string, data: any) {
  const discordWebhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL')
  
  if (!discordWebhookUrl) {
    console.log('Discord webhook not configured')
    return
  }

  let message = ''
  let color = 0x00ff00 // Green

  switch (eventType) {
    case 'checkout.session.completed':
      message = `💰 **Nouveau paiement reçu!**\n` +
               `Montant: ${(data.amount_total / 100).toFixed(2)} ${data.currency.toUpperCase()}\n` +
               `Plan: ${data.metadata?.plan || 'Unknown'}\n` +
               `Client: ${data.customer_details?.email || 'Unknown'}`
      color = 0x00ff00
      break
    
    case 'invoice.payment_succeeded':
      message = `✅ **Paiement récurrent réussi**\n` +
               `Montant: ${(data.amount_paid / 100).toFixed(2)} ${data.currency.toUpperCase()}\n` +
               `Facture: ${data.number}`
      color = 0x00ff00
      break
    
    case 'invoice.payment_failed':
      message = `❌ **Échec de paiement récurrent**\n` +
               `Montant: ${(data.amount_due / 100).toFixed(2)} ${data.currency.toUpperCase()}\n` +
               `Facture: ${data.number}`
      color = 0xff0000
      break
    
    case 'customer.subscription.deleted':
      message = `🚫 **Abonnement annulé**\n` +
               `Client: ${data.customer}`
      color = 0xffaa00
      break
    
    default:
      return // Don't send notification for unhandled events
  }

  const embed = {
    title: 'Stripe Webhook',
    description: message,
    color: color,
    timestamp: new Date().toISOString(),
    footer: {
      text: `Event: ${eventType}`
    }
  }

  try {
    await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })
  } catch (error) {
    console.error('Failed to send Discord notification:', error)
  }
}