import { supabase } from '../lib/supabase';
import { 
  ReferralProfile, 
  ReferralCommission, 
  ReferralStats, 
  ReferralData, 
  ReferralLink,
  ReferralAnalytics,
  CreateReferralCommissionParams,
  MarkCommissionPaidParams,
  CommissionStatus
} from '../types/referral';

export class ReferralService {
  // =============================================
  // GESTION DES PROFILS DE PARRAINAGE
  // =============================================

  /**
   * Obtenir le profil de parrainage d'un utilisateur
   */
  static async getUserReferralProfile(userId: string): Promise<ReferralProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, referral_code, referred_by, referral_earnings, total_referrals, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user referral profile:', error);
      return null;
    }
  }

  /**
   * Générer un nouveau code de parrainage pour un utilisateur
   */
  static async generateReferralCode(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('generate_referral_code');
      if (error) throw error;

      // Mettre à jour le profil avec le nouveau code
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ referral_code: data })
        .eq('user_id', userId);

      if (updateError) throw updateError;
      return data;
    } catch (error) {
      console.error('Error generating referral code:', error);
      return null;
    }
  }

  /**
   * Enregistrer un parrain lors de l'inscription
   */
  static async setReferrer(userId: string, referralCode: string): Promise<boolean> {
    try {
      // Trouver le parrain par son code
      const { data: referrer, error: referrerError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError || !referrer) {
        console.warn('Referrer not found for code:', referralCode);
        return false;
      }

      // Mettre à jour le profil du filleul
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ referred_by: referrer.id })
        .eq('user_id', userId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error setting referrer:', error);
      return false;
    }
  }

  // =============================================
  // GESTION DES COMMISSIONS
  // =============================================

  /**
   * Créer une commission de parrainage
   */
  static async createCommission(params: CreateReferralCommissionParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_referral_commission', {
        p_referrer_id: params.referrer_id,
        p_referred_id: params.referred_id,
        p_amount: params.amount,
        p_percentage: params.percentage || 20.00,
        p_order_id: params.order_id || null,
        p_subscription_id: params.subscription_id || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating referral commission:', error);
      return null;
    }
  }

  /**
   * Marquer une commission comme payée
   */
  static async markCommissionPaid(params: MarkCommissionPaidParams): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('mark_commission_paid', {
        p_commission_id: params.commission_id,
        p_payment_method: params.payment_method || 'stripe',
        p_payment_reference: params.payment_reference || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking commission as paid:', error);
      return false;
    }
  }

  /**
   * Obtenir les commissions d'un utilisateur
   */
  static async getUserCommissions(userId: string, status?: CommissionStatus): Promise<ReferralCommission[]> {
    try {
      let query = supabase
        .from('referral_commissions')
        .select('*')
        .or(`referrer_id.eq.${userId},referred_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user commissions:', error);
      return [];
    }
  }

  // =============================================
  // STATISTIQUES ET ANALYTICS
  // =============================================

  /**
   * Obtenir les statistiques de parrainage d'un utilisateur
   */
  static async getUserReferralStats(userId: string): Promise<ReferralStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_referral_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return null;
    }
  }

  /**
   * Obtenir la liste des filleuls d'un utilisateur
   */
  static async getUserReferrals(userId: string): Promise<ReferralData[]> {
    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      return [];
    }
  }

  /**
   * Obtenir les analytics de parrainage
   */
  static async getReferralAnalytics(userId: string): Promise<ReferralAnalytics | null> {
    try {
      // Obtenir les statistiques de base
      const stats = await this.getUserReferralStats(userId);
      if (!stats) return null;

      // Obtenir les commissions des 12 derniers mois
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('referral_commissions')
        .select('amount, created_at, status')
        .eq('referrer_id', userId)
        .eq('status', 'paid')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (monthlyError) throw monthlyError;

      // Grouper par mois
      const monthlyEarnings = monthlyData?.reduce((acc: any, commission: any) => {
        const month = new Date(commission.created_at).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + commission.amount;
        return acc;
      }, {}) || {};

      // Obtenir les top referrals
      const { data: topReferrals, error: topError } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('commission_amount', { ascending: false })
        .limit(5);

      if (topError) throw topError;

      return {
        total_clicks: 0, // À implémenter avec un système de tracking
        total_conversions: stats.total_referrals,
        conversion_rate: 0, // À calculer
        total_earnings: stats.paid_commissions,
        monthly_earnings: Object.entries(monthlyEarnings).map(([month, earnings]) => ({
          month,
          earnings: earnings as number
        })),
        top_referrals: topReferrals || []
      };
    } catch (error) {
      console.error('Error fetching referral analytics:', error);
      return null;
    }
  }

  // =============================================
  // GESTION DES LIENS DE PARRAINAGE
  // =============================================

  /**
   * Générer le lien de parrainage d'un utilisateur
   */
  static generateReferralLink(referralCode: string, baseUrl?: string): ReferralLink {
    const base = baseUrl || window.location.origin;
    const url = `${base}/register?ref=${referralCode}`;
    
    return {
      code: referralCode,
      url,
      clicks: 0,
      conversions: 0
    };
  }

  /**
   * Extraire le code de parrainage d'une URL
   */
  static extractReferralCodeFromUrl(url?: string): string | null {
    const targetUrl = url || window.location.href;
    const urlParams = new URLSearchParams(new URL(targetUrl).search);
    return urlParams.get('ref');
  }

  /**
   * Valider un code de parrainage
   */
  static async validateReferralCode(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('referral_code', code)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error validating referral code:', error);
      return false;
    }
  }
}
