import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Créer le client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface StripeEvent {
  id: string
  type: string
  data: {
    object: any
  }
}

interface PaymentIntent {
  id: string
  amount: number
  currency: string
  customer: string
  status: string
  metadata?: {
    order_id?: string
    subscription_id?: string
  }
}

interface Invoice {
  id: string
  customer: string
  amount_paid: number
  currency: string
  subscription?: string
  status: string
}

interface Subscription {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  metadata?: {
    order_id?: string
  }
}

serve(async (req) => {
  // Gérer les CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier que c'est une requête POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    // Récupérer le body et les headers
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return new Response('Missing stripe-signature header', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    let event: StripeEvent
    try {
      event = JSON.parse(body)
    } catch (err) {
      console.error('Invalid JSON:', err)
      return new Response('Invalid JSON', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    console.log('🎯 Referral webhook received:', event.type, event.id)

    // Traiter les événements de paiement pour les commissions
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as PaymentIntent)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object as Invoice)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Subscription)
        break

      case 'payment_intent.payment_failed':
      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Subscription)
        break

      default:
        console.log('Unhandled referral event type:', event.type)
    }

    return new Response(JSON.stringify({ 
      received: true, 
      event_type: event.type,
      processed: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Referral webhook error:', error)
    return new Response(JSON.stringify({ 
      error: 'Referral webhook processing failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/**
 * Gérer un paiement réussi - Créer une commission de parrainage
 */
async function handlePaymentSuccess(paymentIntent: PaymentIntent) {
  try {
    console.log('💰 Payment succeeded - Creating referral commission:', {
      payment_id: paymentIntent.id,
      amount: paymentIntent.amount,
      customer: paymentIntent.customer
    })

    // Trouver l'utilisateur par son customer_id Stripe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, referred_by, stripe_customer_id')
      .eq('stripe_customer_id', paymentIntent.customer)
      .single()

    if (userError || !user) {
      console.log('User not found for customer:', paymentIntent.customer)
      return
    }

    // Vérifier si l'utilisateur a un parrain
    if (!user.referred_by) {
      console.log('No referrer found for user:', user.id)
      return
    }

    // Calculer la commission (20% du montant)
    const amountInEuros = paymentIntent.amount / 100 // Convertir de centimes en euros
    const commissionAmount = amountInEuros * 0.20 // 20% de commission
    const commissionPercentage = 20.00

    console.log('🎯 Creating referral commission:', {
      referrer_id: user.referred_by,
      referred_id: user.id,
      amount: commissionAmount,
      percentage: commissionPercentage,
      payment_reference: paymentIntent.id
    })

    // Créer la commission de parrainage
    const { data: commission, error: commissionError } = await supabase
      .from('referral_commissions')
      .insert({
        referrer_id: user.referred_by,
        referred_id: user.id,
        amount: commissionAmount,
        percentage: commissionPercentage,
        status: 'pending',
        payment_method: 'stripe',
        payment_reference: paymentIntent.id,
        order_id: paymentIntent.metadata?.order_id || null,
        subscription_id: paymentIntent.metadata?.subscription_id || null
      })
      .select()
      .single()

    if (commissionError) {
      console.error('Failed to create referral commission:', commissionError)
      return
    }

    // Mettre à jour les statistiques du parrain
    const { error: statsError } = await supabase
      .from('profiles')
      .update({
        referral_earnings: supabase.raw('referral_earnings + ?', [commissionAmount]),
        total_referrals: supabase.raw('total_referrals + 1')
      })
      .eq('id', user.referred_by)

    if (statsError) {
      console.error('Failed to update referrer stats:', statsError)
    }

    console.log('✅ Referral commission created successfully:', {
      commission_id: commission.id,
      amount: commissionAmount,
      referrer_id: user.referred_by
    })

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

/**
 * Gérer un paiement d'abonnement réussi
 */
async function handleInvoicePaymentSuccess(invoice: Invoice) {
  try {
    console.log('💳 Invoice payment succeeded - Creating referral commission:', {
      invoice_id: invoice.id,
      amount: invoice.amount_paid,
      customer: invoice.customer
    })

    // Trouver l'utilisateur par son customer_id Stripe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, referred_by, stripe_customer_id')
      .eq('stripe_customer_id', invoice.customer)
      .single()

    if (userError || !user || !user.referred_by) {
      console.log('No referrer found for invoice payment')
      return
    }

    // Calculer la commission (20% du montant)
    const amountInEuros = invoice.amount_paid / 100 // Convertir de centimes en euros
    const commissionAmount = amountInEuros * 0.20 // 20% de commission
    const commissionPercentage = 20.00

    // Créer la commission de parrainage
    const { data: commission, error: commissionError } = await supabase
      .from('referral_commissions')
      .insert({
        referrer_id: user.referred_by,
        referred_id: user.id,
        amount: commissionAmount,
        percentage: commissionPercentage,
        status: 'pending',
        payment_method: 'stripe',
        payment_reference: invoice.id,
        subscription_id: invoice.subscription || null
      })
      .select()
      .single()

    if (commissionError) {
      console.error('Failed to create referral commission for invoice:', commissionError)
      return
    }

    // Mettre à jour les statistiques du parrain
    await supabase
      .from('profiles')
      .update({
        referral_earnings: supabase.raw('referral_earnings + ?', [commissionAmount]),
        total_referrals: supabase.raw('total_referrals + 1')
      })
      .eq('id', user.referred_by)

    console.log('✅ Referral commission created for invoice:', {
      commission_id: commission.id,
      amount: commissionAmount,
      referrer_id: user.referred_by
    })

  } catch (error) {
    console.error('Error handling invoice payment success:', error)
  }
}

/**
 * Gérer la mise à jour d'un abonnement
 */
async function handleSubscriptionUpdate(subscription: Subscription) {
  try {
    console.log('🔄 Subscription updated:', {
      subscription_id: subscription.id,
      status: subscription.status,
      customer: subscription.customer
    })

    // Si l'abonnement est actif, créer une commission
    if (subscription.status === 'active') {
      // Trouver l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, referred_by, stripe_customer_id')
        .eq('stripe_customer_id', subscription.customer)
        .single()

      if (userError || !user || !user.referred_by) {
        console.log('No referrer found for subscription')
        return
      }

      // Pour les abonnements, on utilise un montant par défaut
      // Vous pouvez récupérer le prix réel depuis l'API Stripe si nécessaire
      const subscriptionAmount = 29.99 // Montant par défaut en euros
      const commissionAmount = subscriptionAmount * 0.20 // 20% de commission

      const { data: commission, error: commissionError } = await supabase
        .from('referral_commissions')
        .insert({
          referrer_id: user.referred_by,
          referred_id: user.id,
          amount: commissionAmount,
          percentage: 20.00,
          status: 'pending',
          payment_method: 'stripe',
          payment_reference: subscription.id,
          subscription_id: subscription.id
        })
        .select()
        .single()

      if (commissionError) {
        console.error('Failed to create referral commission for subscription:', commissionError)
        return
      }

      // Mettre à jour les statistiques du parrain
      await supabase
        .from('profiles')
        .update({
          referral_earnings: supabase.raw('referral_earnings + ?', [commissionAmount]),
          total_referrals: supabase.raw('total_referrals + 1')
        })
        .eq('id', user.referred_by)

      console.log('✅ Referral commission created for subscription:', {
        commission_id: commission.id,
        amount: commissionAmount,
        referrer_id: user.referred_by
      })
    }

  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

/**
 * Gérer un échec de paiement - Annuler les commissions
 */
async function handlePaymentFailure(paymentData: any) {
  try {
    console.log('❌ Payment failed - Cancelling commissions:', paymentData.id)

    // Marquer les commissions correspondantes comme annulées
    const { error } = await supabase
      .from('referral_commissions')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('payment_reference', paymentData.id)
      .in('status', ['pending', 'paid'])

    if (error) {
      console.error('Failed to cancel commissions for failed payment:', error)
    } else {
      console.log('✅ Commissions cancelled for failed payment')
    }

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

/**
 * Gérer l'annulation d'un abonnement - Annuler les commissions
 */
async function handleSubscriptionCancellation(subscription: Subscription) {
  try {
    console.log('🚫 Subscription cancelled - Cancelling commissions:', subscription.id)

    // Marquer les commissions correspondantes comme annulées
    const { error } = await supabase
      .from('referral_commissions')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id)
      .in('status', ['pending', 'paid'])

    if (error) {
      console.error('Failed to cancel commissions for cancelled subscription:', error)
    } else {
      console.log('✅ Commissions cancelled for cancelled subscription')
    }

  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}
