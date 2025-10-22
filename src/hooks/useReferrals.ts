import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface ReferralData {
  id: string;
  referred_id: string;
  subscription_status: string;
  created_at: string;
  referred_user: {
    email: string;
    name: string;
  };
}

export interface ReferralLog {
  id: string;
  amount_earned: number;
  date: string;
  referred_user: {
    email: string;
    name: string;
  };
}

interface UseReferralsReturn {
  referrals: ReferralData[];
  referralLogs: ReferralLog[];
  totalEarnings: number;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  validateReferralCode: (code: string) => Promise<boolean>;
}

// Mock data for when Supabase is not configured
const mockReferrals: ReferralData[] = [];
const mockReferralLogs: ReferralLog[] = [];

export const useReferrals = (): UseReferralsReturn => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [referralLogs, setReferralLogs] = useState<ReferralLog[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralData = useCallback(async () => {
    console.log('🔗 Fetching referral data...');
    
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured || !supabase) {
      console.log('🎭 Using mock referral data');
      setReferrals(mockReferrals);
      setReferralLogs(mockReferralLogs);
      setTotalEarnings(mockReferralLogs.reduce((s, l) => s + l.amount_earned, 0));
      setLoading(false);
      setError(null);
      return;
    }

    if (!user) {
      console.log('❌ No user found for referral data');
      setReferrals([]);
      setReferralLogs([]);
      setTotalEarnings(0);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch referrals
      console.log('🔍 Fetching referrals...');
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          subscription_status,
          created_at,
          referred_user:users!referrals_referred_id_fkey(email, name)
        `)
        .eq('referrer_id', user.id);

      if (referralsError) {
        console.error('❌ Error fetching referrals:', referralsError);
        throw referralsError;
      }

      // Fetch referral logs
      console.log('🔍 Fetching referral logs...');
      const { data: logsData, error: logsError } = await supabase
        .from('referral_logs')
        .select(`
          id,
          amount_earned,
          date,
          referred_user:users!referral_logs_referred_user_id_fkey(email, name)
        `)
        .eq('referrer_id', user.id)
        .order('date', { ascending: false });

      if (logsError) {
        console.error('❌ Error fetching referral logs:', logsError);
        throw logsError;
      }

      setReferrals(referralsData || []);
      setReferralLogs(logsData || []);
      setTotalEarnings((logsData || []).reduce((sum, log) => sum + Number(log.amount_earned), 0));
      
      console.log('✅ Referral data loaded successfully');
    } catch (error) {
      console.error('💥 Error fetching referral data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load referral data');
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const validateReferralCode = useCallback(async (code: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      return true; // Allow in mock mode
    }

    if (!code || code.trim() === '') {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('validate_referral_code', {
        code: code.trim()
      });

      if (error) {
        console.error('❌ Error validating referral code:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('💥 Unexpected error validating referral code:', error);
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchReferralData();
  }, [fetchReferralData]);

  useEffect(() => {
    fetchReferralData();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  return {
    referrals,
    referralLogs,
    totalEarnings,
    loading,
    error,
    refreshData,
    validateReferralCode
  };
};
