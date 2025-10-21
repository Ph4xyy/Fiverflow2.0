import { ReferralService } from '../services/referralService';
import { supabase } from '../lib/supabase';

/**
 * Gestionnaire des paiements pour le système de parrainage
 * À intégrer avec les webhooks Stripe
 */

export class ReferralPaymentHandler {
  /**
   * Traiter un paiement réussi et créer les commissions
   */
  static async handleSuccessfulPayment(paymentData: {
    customerId: string;
    amount: number;
    currency: string;
    subscriptionId?: string;
    orderId?: string;
    paymentMethod?: string;
    paymentReference?: string;
  }): Promise<boolean> {
    try {
      console.log('🎯 Processing referral commission for payment:', paymentData);

      // 1. Trouver l'utilisateur par son customer_id Stripe
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, referred_by')
        .eq('stripe_customer_id', paymentData.customerId)
        .single();

      if (userError || !user) {
        console.warn('User not found for customer ID:', paymentData.customerId);
        return false;
      }

      // 2. Vérifier si l'utilisateur a un parrain
      if (!user.referred_by) {
        console.log('No referrer found for user:', user.id);
        return true; // Pas d'erreur, juste pas de commission
      }

      // 3. Créer la commission de parrainage
      const commissionId = await ReferralService.createCommission({
        referrer_id: user.referred_by,
        referred_id: user.id,
        amount: paymentData.amount,
        percentage: 20.00, // 20% de commission
        order_id: paymentData.orderId,
        subscription_id: paymentData.subscriptionId
      });

      if (!commissionId) {
        console.error('Failed to create referral commission');
        return false;
      }

      // 4. Marquer la commission comme payée (optionnel selon votre logique)
      // Vous pouvez choisir de la marquer comme 'pending' et la payer plus tard
      const markAsPaid = await ReferralService.markCommissionPaid({
        commission_id: commissionId,
        payment_method: paymentData.paymentMethod || 'stripe',
        payment_reference: paymentData.paymentReference
      });

      if (!markAsPaid) {
        console.warn('Failed to mark commission as paid, but commission was created');
      }

      console.log('✅ Referral commission created successfully:', commissionId);
      return true;

    } catch (error) {
      console.error('❌ Error processing referral commission:', error);
      return false;
    }
  }

  /**
   * Traiter un remboursement et annuler les commissions
   */
  static async handleRefund(paymentData: {
    customerId: string;
    amount: number;
    subscriptionId?: string;
    orderId?: string;
  }): Promise<boolean> {
    try {
      console.log('🔄 Processing referral commission refund:', paymentData);

      // 1. Trouver l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, referred_by')
        .eq('stripe_customer_id', paymentData.customerId)
        .single();

      if (userError || !user || !user.referred_by) {
        return true; // Pas d'erreur, juste pas de commission à annuler
      }

      // 2. Trouver et annuler les commissions correspondantes
      const { data: commissions, error: commissionsError } = await supabase
        .from('referral_commissions')
        .select('id, amount')
        .eq('referrer_id', user.referred_by)
        .eq('referred_id', user.id)
        .in('status', ['pending', 'paid']);

      if (commissionsError || !commissions?.length) {
        console.log('No commissions found to refund');
        return true;
      }

      // 3. Annuler les commissions
      for (const commission of commissions) {
        const { error: updateError } = await supabase
          .from('referral_commissions')
          .update({ 
            status: 'refunded',
            updated_at: new Date().toISOString()
          })
          .eq('id', commission.id);

        if (updateError) {
          console.error('Failed to cancel commission:', commission.id, updateError);
        }
      }

      // 4. Mettre à jour les statistiques du parrain
      const totalRefunded = commissions.reduce((sum, c) => sum + c.amount, 0);
      await supabase
        .from('profiles')
        .update({ 
          referral_earnings: supabase.raw('referral_earnings - ?', [totalRefunded])
        })
        .eq('id', user.referred_by);

      console.log('✅ Referral commissions refunded successfully');
      return true;

    } catch (error) {
      console.error('❌ Error processing referral refund:', error);
      return false;
    }
  }

  /**
   * Traiter l'annulation d'un abonnement
   */
  static async handleSubscriptionCancellation(subscriptionId: string): Promise<boolean> {
    try {
      console.log('🚫 Processing subscription cancellation:', subscriptionId);

      // Trouver et annuler les commissions liées à cet abonnement
      const { data: commissions, error: commissionsError } = await supabase
        .from('referral_commissions')
        .select('id, referrer_id, amount')
        .eq('subscription_id', subscriptionId)
        .in('status', ['pending', 'paid']);

      if (commissionsError || !commissions?.length) {
        return true; // Pas de commissions à annuler
      }

      // Annuler les commissions
      for (const commission of commissions) {
        const { error: updateError } = await supabase
          .from('referral_commissions')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', commission.id);

        if (updateError) {
          console.error('Failed to cancel commission:', commission.id, updateError);
        }
      }

      console.log('✅ Referral commissions cancelled for subscription:', subscriptionId);
      return true;

    } catch (error) {
      console.error('❌ Error processing subscription cancellation:', error);
      return false;
    }
  }

  /**
   * Obtenir les statistiques de parrainage pour un utilisateur
   */
  static async getUserReferralSummary(userId: string): Promise<{
    totalEarnings: number;
    pendingCommissions: number;
    totalReferrals: number;
    conversionRate: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('user_referral_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        totalEarnings: data.paid_commissions || 0,
        pendingCommissions: data.pending_commissions || 0,
        totalReferrals: data.total_referrals || 0,
        conversionRate: data.total_referrals > 0 ? (data.total_commissions / data.total_referrals) * 100 : 0
      };

    } catch (error) {
      console.error('Error fetching referral summary:', error);
      return null;
    }
  }
}
