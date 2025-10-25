/**
 * Service de gestion des commissions de parrainage
 * Gère la création automatique des commissions lors des paiements
 */

import { supabase } from '../lib/supabase';

export interface CommissionData {
  referrerId: string;
  referredId: string;
  amount: number;
  orderId?: string;
  subscriptionId?: string;
}

export class ReferralCommissionService {
  /**
   * Créer une commission de parrainage lors d'un paiement réussi
   */
  static async createCommission(data: CommissionData): Promise<boolean> {
    try {
      console.log('🎯 Creating referral commission:', data);

      // Vérifier que le filleul a bien un parrain
      const { data: referredUser, error: userError } = await supabase
        .from('user_profiles')
        .select('referred_by')
        .eq('id', data.referredId)
        .single();

      if (userError || !referredUser?.referred_by) {
        console.log('❌ No referrer found for user:', data.referredId);
        return false;
      }

      // Vérifier que le parrain existe
      const { data: referrer, error: referrerError } = await supabase
        .from('user_profiles')
        .select('id, referral_code')
        .eq('id', referredUser.referred_by)
        .single();

      if (referrerError || !referrer) {
        console.log('❌ Referrer not found:', referredUser.referred_by);
        return false;
      }

      // Créer la commission via la fonction SQL
      const { data: commissionId, error: commissionError } = await supabase.rpc(
        'create_referral_commission',
        {
          p_referrer_id: referredUser.referred_by,
          p_referred_id: data.referredId,
          p_amount: data.amount,
          p_order_id: data.orderId || null,
          p_subscription_id: data.subscriptionId || null
        }
      );

      if (commissionError) {
        console.error('❌ Error creating commission:', commissionError);
        return false;
      }

      console.log('✅ Commission created successfully:', commissionId);
      return true;

    } catch (error) {
      console.error('❌ Error in createCommission:', error);
      return false;
    }
  }

  /**
   * Créer une commission pour un abonnement Stripe
   */
  static async createCommissionForSubscription(
    userId: string, 
    subscriptionId: string, 
    amount: number
  ): Promise<boolean> {
    try {
      // Récupérer l'ID du profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        console.log('❌ User profile not found:', userId);
        return false;
      }

      return await this.createCommission({
        referrerId: '', // Sera déterminé par la fonction SQL
        referredId: profile.id,
        amount: amount,
        subscriptionId: subscriptionId
      });

    } catch (error) {
      console.error('❌ Error creating subscription commission:', error);
      return false;
    }
  }

  /**
   * Créer une commission pour une commande
   */
  static async createCommissionForOrder(
    userId: string,
    orderId: string,
    amount: number
  ): Promise<boolean> {
    try {
      // Récupérer l'ID du profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        console.log('❌ User profile not found:', userId);
        return false;
      }

      return await this.createCommission({
        referrerId: '', // Sera déterminé par la fonction SQL
        referredId: profile.id,
        amount: amount,
        orderId: orderId
      });

    } catch (error) {
      console.error('❌ Error creating order commission:', error);
      return false;
    }
  }

  /**
   * Marquer une commission comme payée
   */
  static async markCommissionAsPaid(commissionId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('mark_commission_paid', {
        p_commission_id: commissionId
      });

      if (error) {
        console.error('❌ Error marking commission as paid:', error);
        return false;
      }

      console.log('✅ Commission marked as paid:', commissionId);
      return true;

    } catch (error) {
      console.error('❌ Error in markCommissionAsPaid:', error);
      return false;
    }
  }

  /**
   * Obtenir les commissions d'un parrain
   */
  static async getReferrerCommissions(referrerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('referral_commissions')
        .select(`
          *,
          referred_user:user_profiles!referral_commissions_referred_id_fkey(
            full_name,
            email
          )
        `)
        .eq('referrer_id', referrerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching commissions:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Error in getReferrerCommissions:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques de parrainage d'un utilisateur
   */
  static async getReferralStats(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_referral_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching referral stats:', error);
        return null;
      }

      return data;

    } catch (error) {
      console.error('❌ Error in getReferralStats:', error);
      return null;
    }
  }
}








