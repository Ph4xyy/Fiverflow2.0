/**
 * Edge Function pour traiter les webhooks Stripe
 * Crée automatiquement les commissions de parrainage lors des paiements
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Vérifier la signature du webhook Stripe
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Missing stripe-signature header', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Récupérer le body de la requête
    const body = await req.text()
    
    // Vérifier la signature avec la clé secrète Stripe
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { 
        status: 500,
        headers: corsHeaders 
      })
    }

    // Parser l'événement Stripe
    const event = JSON.parse(body)
    console.log('🎯 Processing Stripe webhook event:', event.type)

    // Traiter l'événement selon son type
    let commissionCreated = false

    switch (event.type) {
      case 'checkout.session.completed':
        commissionCreated = await handleCheckoutSessionCompleted(event.data.object, supabaseClient)
        break

      case 'invoice.payment_succeeded':
        commissionCreated = await handleInvoicePaymentSucceeded(event.data.object, supabaseClient)
        break

      case 'customer.subscription.created':
        commissionCreated = await handleSubscriptionCreated(event.data.object, supabaseClient)
        break

      case 'customer.subscription.updated':
        commissionCreated = await handleSubscriptionUpdated(event.data.object, supabaseClient)
        break

      default:
        console.log('ℹ️ Unhandled event type:', event.type)
        return new Response('Event type not handled', { 
          status: 200,
          headers: corsHeaders 
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        commissionCreated,
        eventType: event.type 
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Traiter une session de checkout complétée
 */
async function handleCheckoutSessionCompleted(session: any, supabase: any): Promise<boolean> {
  try {
    const userId = session.metadata?.user_id
    const amount = session.amount_total / 100 // Convertir de centimes en euros
    const subscriptionId = session.subscription

    if (!userId || !amount) {
      console.log('❌ Missing user_id or amount in session')
      return false
    }

    console.log('🎯 Creating commission for checkout session:', { userId, amount, subscriptionId })

    // Récupérer l'ID du profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, referred_by')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.log('❌ User profile not found:', userId)
      return false
    }

    if (!profile.referred_by) {
      console.log('ℹ️ User has no referrer, no commission to create')
      return false
    }

    // Créer la commission via la fonction SQL
    const { data: commissionId, error: commissionError } = await supabase.rpc(
      'create_referral_commission',
      {
        p_referrer_id: profile.referred_by,
        p_referred_id: profile.id,
        p_amount: amount,
        p_order_id: null,
        p_subscription_id: subscriptionId
      }
    )

    if (commissionError) {
      console.error('❌ Error creating commission:', commissionError)
      return false
    }

    console.log('✅ Commission created successfully:', commissionId)
    return true

  } catch (error) {
    console.error('❌ Error handling checkout session completed:', error)
    return false
  }
}

/**
 * Traiter un paiement d'invoice réussi
 */
async function handleInvoicePaymentSucceeded(invoice: any, supabase: any): Promise<boolean> {
  try {
    const subscriptionId = invoice.subscription
    const amount = invoice.amount_paid / 100 // Convertir de centimes en euros
    const customerId = invoice.customer

    if (!subscriptionId || !amount) {
      console.log('❌ Missing subscription_id or amount in invoice')
      return false
    }

    // Récupérer l'utilisateur via le customer_id
    const userId = await getUserIdFromCustomerId(customerId, supabase)
    if (!userId) {
      console.log('❌ User not found for customer:', customerId)
      return false
    }

    console.log('🎯 Creating commission for invoice payment:', { userId, amount, subscriptionId })

    // Récupérer l'ID du profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, referred_by')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.log('❌ User profile not found:', userId)
      return false
    }

    if (!profile.referred_by) {
      console.log('ℹ️ User has no referrer, no commission to create')
      return false
    }

    // Créer la commission via la fonction SQL
    const { data: commissionId, error: commissionError } = await supabase.rpc(
      'create_referral_commission',
      {
        p_referrer_id: profile.referred_by,
        p_referred_id: profile.id,
        p_amount: amount,
        p_order_id: null,
        p_subscription_id: subscriptionId
      }
    )

    if (commissionError) {
      console.error('❌ Error creating commission:', commissionError)
      return false
    }

    console.log('✅ Commission created successfully:', commissionId)
    return true

  } catch (error) {
    console.error('❌ Error handling invoice payment succeeded:', error)
    return false
  }
}

/**
 * Traiter une souscription créée
 */
async function handleSubscriptionCreated(subscription: any, supabase: any): Promise<boolean> {
  try {
    const customerId = subscription.customer
    const subscriptionId = subscription.id
    const amount = subscription.items?.data?.[0]?.price?.unit_amount / 100

    if (!customerId || !subscriptionId || !amount) {
      console.log('❌ Missing required data in subscription')
      return false
    }

    // Récupérer l'utilisateur via le customer_id
    const userId = await getUserIdFromCustomerId(customerId, supabase)
    if (!userId) {
      console.log('❌ User not found for customer:', customerId)
      return false
    }

    console.log('🎯 Creating commission for subscription created:', { userId, amount, subscriptionId })

    // Récupérer l'ID du profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, referred_by')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.log('❌ User profile not found:', userId)
      return false
    }

    if (!profile.referred_by) {
      console.log('ℹ️ User has no referrer, no commission to create')
      return false
    }

    // Créer la commission via la fonction SQL
    const { data: commissionId, error: commissionError } = await supabase.rpc(
      'create_referral_commission',
      {
        p_referrer_id: profile.referred_by,
        p_referred_id: profile.id,
        p_amount: amount,
        p_order_id: null,
        p_subscription_id: subscriptionId
      }
    )

    if (commissionError) {
      console.error('❌ Error creating commission:', commissionError)
      return false
    }

    console.log('✅ Commission created successfully:', commissionId)
    return true

  } catch (error) {
    console.error('❌ Error handling subscription created:', error)
    return false
  }
}

/**
 * Traiter une souscription mise à jour
 */
async function handleSubscriptionUpdated(subscription: any, supabase: any): Promise<boolean> {
  try {
    // Seulement traiter si la souscription devient active
    if (subscription.status !== 'active') {
      console.log('ℹ️ Subscription not active, skipping commission')
      return false
    }

    const customerId = subscription.customer
    const subscriptionId = subscription.id
    const amount = subscription.items?.data?.[0]?.price?.unit_amount / 100

    if (!customerId || !subscriptionId || !amount) {
      console.log('❌ Missing required data in subscription update')
      return false
    }

    // Récupérer l'utilisateur via le customer_id
    const userId = await getUserIdFromCustomerId(customerId, supabase)
    if (!userId) {
      console.log('❌ User not found for customer:', customerId)
      return false
    }

    console.log('🎯 Creating commission for subscription updated:', { userId, amount, subscriptionId })

    // Récupérer l'ID du profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, referred_by')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.log('❌ User profile not found:', userId)
      return false
    }

    if (!profile.referred_by) {
      console.log('ℹ️ User has no referrer, no commission to create')
      return false
    }

    // Créer la commission via la fonction SQL
    const { data: commissionId, error: commissionError } = await supabase.rpc(
      'create_referral_commission',
      {
        p_referrer_id: profile.referred_by,
        p_referred_id: profile.id,
        p_amount: amount,
        p_order_id: null,
        p_subscription_id: subscriptionId
      }
    )

    if (commissionError) {
      console.error('❌ Error creating commission:', commissionError)
      return false
    }

    console.log('✅ Commission created successfully:', commissionId)
    return true

  } catch (error) {
    console.error('❌ Error handling subscription updated:', error)
    return false
  }
}

/**
 * Récupérer l'ID utilisateur depuis le customer_id Stripe
 */
async function getUserIdFromCustomerId(customerId: string, supabase: any): Promise<string | null> {
  try {
    console.log('🔍 Looking up user for customer:', customerId)
    
    // Chercher l'utilisateur par customer_id Stripe
    // Note: Vous devrez adapter cette requête selon votre structure de données
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (error || !data) {
      console.log('❌ User not found for customer:', customerId)
      return null
    }

    return data.user_id

  } catch (error) {
    console.error('❌ Error getting user ID from customer ID:', error)
    return null
  }
}