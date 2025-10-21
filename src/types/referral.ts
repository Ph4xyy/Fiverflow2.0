// Types pour le système de parrainage
export interface ReferralProfile {
  id: string;
  referral_code: string;
  referred_by?: string;
  referral_earnings: number;
  total_referrals: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralCommission {
  id: string;
  referrer_id: string;
  referred_id: string;
  order_id?: string;
  subscription_id?: string;
  amount: number;
  percentage: number;
  status: CommissionStatus;
  payment_method?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export type CommissionStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface ReferralStats {
  user_id: string;
  referral_code: string;
  referral_earnings: number;
  total_referrals: number;
  total_commissions: number;
  paid_commissions: number;
  pending_commissions: number;
  cancelled_commissions: number;
}

export interface ReferralData {
  referrer_id: string;
  referred_id: string;
  referred_email: string;
  referred_name: string;
  referred_joined_at: string;
  commission_amount: number;
  commission_status: CommissionStatus;
  commission_created_at: string;
  paid_at?: string;
}

export interface CreateReferralCommissionParams {
  referrer_id: string;
  referred_id: string;
  amount: number;
  percentage?: number;
  order_id?: string;
  subscription_id?: string;
}

export interface MarkCommissionPaidParams {
  commission_id: string;
  payment_method?: string;
  payment_reference?: string;
}

// Types pour les liens de parrainage
export interface ReferralLink {
  code: string;
  url: string;
  clicks?: number;
  conversions?: number;
}

// Types pour les statistiques de parrainage
export interface ReferralAnalytics {
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  total_earnings: number;
  monthly_earnings: Array<{
    month: string;
    earnings: number;
  }>;
  top_referrals: Array<{
    referred_email: string;
    commission_amount: number;
    status: CommissionStatus;
  }>;
}
