/**
 * Gestionnaire de webhooks Stripe pour les commissions de parrainage
 * Traite les événements de paiement réussi pour créer automatiquement les commissions
 */

import { ReferralCommissionService } from '../services/referralCommissionService';

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

export class StripeWebhookHandler {
  /**
   * Traiter un événement de webhook Stripe
   */
  static async handleWebhookEvent(event: StripeWebhookEvent): Promise<boolean> {
    try {
      console.log('🎯 Processing Stripe webhook event:', event.type);

      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutSessionCompleted(event.data.object);
        
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSucceeded(event.data.object);
        
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event.data.object);
        
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object);
        
        default:
          console.log('ℹ️ Unhandled event type:', event.type);
          return true;
      }

    } catch (error) {
      console.error('❌ Error handling webhook event:', error);
      return false;
    }
  }

  /**
   * Traiter une session de checkout complétée
   */
  private static async handleCheckoutSessionCompleted(session: any): Promise<boolean> {
    try {
      const userId = session.metadata?.user_id;
      const amount = session.amount_total / 100; // Convertir de centimes en euros
      const subscriptionId = session.subscription;

      if (!userId || !amount) {
        console.log('❌ Missing user_id or amount in session');
        return false;
      }

      console.log('🎯 Creating commission for checkout session:', {
        userId,
        amount,
        subscriptionId
      });

      return await ReferralCommissionService.createCommissionForSubscription(
        userId,
        subscriptionId,
        amount
      );

    } catch (error) {
      console.error('❌ Error handling checkout session completed:', error);
      return false;
    }
  }

  /**
   * Traiter un paiement d'invoice réussi
   */
  private static async handleInvoicePaymentSucceeded(invoice: any): Promise<boolean> {
    try {
      const subscriptionId = invoice.subscription;
      const amount = invoice.amount_paid / 100; // Convertir de centimes en euros
      const customerId = invoice.customer;

      if (!subscriptionId || !amount) {
        console.log('❌ Missing subscription_id or amount in invoice');
        return false;
      }

      // Récupérer l'utilisateur via le customer_id
      const userId = await this.getUserIdFromCustomerId(customerId);
      if (!userId) {
        console.log('❌ User not found for customer:', customerId);
        return false;
      }

      console.log('🎯 Creating commission for invoice payment:', {
        userId,
        amount,
        subscriptionId
      });

      return await ReferralCommissionService.createCommissionForSubscription(
        userId,
        subscriptionId,
        amount
      );

    } catch (error) {
      console.error('❌ Error handling invoice payment succeeded:', error);
      return false;
    }
  }

  /**
   * Traiter une souscription créée
   */
  private static async handleSubscriptionCreated(subscription: any): Promise<boolean> {
    try {
      const customerId = subscription.customer;
      const subscriptionId = subscription.id;
      const amount = subscription.items?.data?.[0]?.price?.unit_amount / 100;

      if (!customerId || !subscriptionId || !amount) {
        console.log('❌ Missing required data in subscription');
        return false;
      }

      // Récupérer l'utilisateur via le customer_id
      const userId = await this.getUserIdFromCustomerId(customerId);
      if (!userId) {
        console.log('❌ User not found for customer:', customerId);
        return false;
      }

      console.log('🎯 Creating commission for subscription created:', {
        userId,
        amount,
        subscriptionId
      });

      return await ReferralCommissionService.createCommissionForSubscription(
        userId,
        subscriptionId,
        amount
      );

    } catch (error) {
      console.error('❌ Error handling subscription created:', error);
      return false;
    }
  }

  /**
   * Traiter une souscription mise à jour
   */
  private static async handleSubscriptionUpdated(subscription: any): Promise<boolean> {
    try {
      // Seulement traiter si la souscription devient active
      if (subscription.status !== 'active') {
        console.log('ℹ️ Subscription not active, skipping commission');
        return true;
      }

      const customerId = subscription.customer;
      const subscriptionId = subscription.id;
      const amount = subscription.items?.data?.[0]?.price?.unit_amount / 100;

      if (!customerId || !subscriptionId || !amount) {
        console.log('❌ Missing required data in subscription update');
        return false;
      }

      // Récupérer l'utilisateur via le customer_id
      const userId = await this.getUserIdFromCustomerId(customerId);
      if (!userId) {
        console.log('❌ User not found for customer:', customerId);
        return false;
      }

      console.log('🎯 Creating commission for subscription updated:', {
        userId,
        amount,
        subscriptionId
      });

      return await ReferralCommissionService.createCommissionForSubscription(
        userId,
        subscriptionId,
        amount
      );

    } catch (error) {
      console.error('❌ Error handling subscription updated:', error);
      return false;
    }
  }

  /**
   * Récupérer l'ID utilisateur depuis le customer_id Stripe
   */
  private static async getUserIdFromCustomerId(customerId: string): Promise<string | null> {
    try {
      // Cette fonction devrait interroger votre base de données
      // pour trouver l'utilisateur correspondant au customer_id Stripe
      // Pour l'instant, on retourne null - à implémenter selon votre structure
      console.log('🔍 Looking up user for customer:', customerId);
      
      // TODO: Implémenter la logique de récupération de l'utilisateur
      // Exemple:
      // const { data } = await supabase
      //   .from('user_profiles')
      //   .select('user_id')
      //   .eq('stripe_customer_id', customerId)
      //   .single();
      // 
      // return data?.user_id || null;
      
      return null;

    } catch (error) {
      console.error('❌ Error getting user ID from customer ID:', error);
      return null;
    }
  }
}







