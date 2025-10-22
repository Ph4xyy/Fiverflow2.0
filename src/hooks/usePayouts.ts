import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface PayoutDetails {
  user_id: string;
  stripe_account_id: string | null;
  account_status: string;
  payout_enabled: boolean;
  bank_account_last4: string | null;
  bank_account_country: string | null;
  minimum_payout_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PayoutRequest {
  id: string;
  user_id: string;
  amount_requested: number;
  amount_fee: number;
  amount_net: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  stripe_transfer_id: string | null;
  requested_at: string;
  processed_at: string | null;
  failure_reason: string | null;
  notes: string | null;
}

interface UsePayoutsReturn {
  payoutDetails: PayoutDetails | null;
  payoutRequests: PayoutRequest[];
  availableEarnings: number;
  loading: boolean;
  error: string | null;
  setupStripeAccount: () => Promise<string | null>;
  checkAccountStatus: () => Promise<void>;
  requestPayout: (amount: number) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

// Mock data for when Supabase is not configured
const mockPayoutDetails: PayoutDetails | null = null;
const mockPayoutRequests: PayoutRequest[] = [];

export const usePayouts = (): UsePayoutsReturn => {
  const { user } = useAuth();
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails | null>(null);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [availableEarnings, setAvailableEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayoutData = useCallback(async () => {
    console.log('💰 Fetching payout data...');
    
    // If Supabase is not configured, return empty data
    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase not configured - cannot fetch payout data');
      setPayoutDetails(null);
      setPayoutRequests([]);
      setAvailableEarnings(0);
      setLoading(false);
      setError('Database not configured');
      return;
    }

    if (!user) {
      console.log('❌ No user found for payout data');
      setPayoutDetails(null);
      setPayoutRequests([]);
      setAvailableEarnings(0);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch payout details
      console.log('🔍 Fetching payout details...');
      const { data: details, error: detailsError } = await supabase
        .from('user_payout_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (detailsError) {
        console.error('❌ Error fetching payout details:', detailsError);
        throw detailsError;
      }

      setPayoutDetails(details);

      // Fetch payout requests
      console.log('🔍 Fetching payout requests...');
      const { data: requests, error: requestsError } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (requestsError) {
        console.error('❌ Error fetching payout requests:', requestsError);
        throw requestsError;
      }

      setPayoutRequests(requests || []);

      // Calculate available earnings
      console.log('🔍 Calculating available earnings...');
      const { data: earnings, error: earningsError } = await supabase
        .rpc('calculate_available_earnings', { target_user_id: user.id });

      if (earningsError) {
        console.error('❌ Error calculating earnings:', earningsError);
        throw earningsError;
      }

      setAvailableEarnings(Number(earnings) || 0);
      console.log('✅ Payout data loaded successfully');
    } catch (error) {
      console.error('💥 Error fetching payout data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payout data');
      toast.error('Failed to load payout data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const setupStripeAccount = useCallback(async (): Promise<string | null> => {
    console.log('🔗 Setting up Stripe Connect account...');
    
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Payment system not configured');
      return null;
    }

    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      const toastId = toast.loading('Setting up payout account...');
      
      // Get the current user's session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to authenticate user');
      }
      
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-onboarding`;
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      const body = {
        action: 'create_account',
        return_url: `${window.location.origin}/network?setup=success`,
        refresh_url: `${window.location.origin}/network?setup=refresh`
      };

      console.log('📡 Calling Stripe Connect onboarding function...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup payout account');
      }

      const data = await response.json();
      console.log('✅ Stripe Connect account setup initiated:', data);
      
      toast.success('Redirecting to account setup...', { id: toastId });
      return data.onboarding_url;
    } catch (error) {
      console.error('💥 Error setting up Stripe account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to setup payout account');
      return null;
    }
  }, [user]);

  const checkAccountStatus = useCallback(async () => {
    console.log('🔍 Checking account status...');
    
    if (!isSupabaseConfigured || !supabase || !user) {
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to authenticate user');
      }
      
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-onboarding`;
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'check_status' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check account status');
      }

      const data = await response.json();
      console.log('✅ Account status checked:', data);
      
      // Refresh payout data to get updated status
      await fetchPayoutData();
    } catch (error) {
      console.error('💥 Error checking account status:', error);
      toast.error('Failed to check account status');
    }
  }, [user]); // 🔥 FIXED: Remove fetchPayoutData from dependencies to prevent infinite loops

  const requestPayout = useCallback(async (amount: number): Promise<boolean> => {
    console.log('💸 Requesting payout:', amount);
    
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Payment system not configured');
      return false;
    }

    if (!user) {
      toast.error('You must be logged in');
      return false;
    }

    try {
      const toastId = toast.loading('Processing payout request...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to authenticate user');
      }
      
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-payout`;
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request payout');
      }

      const data = await response.json();
      console.log('✅ Payout requested successfully:', data);
      
      toast.success(`Payout of $${amount} requested successfully!`, { id: toastId });
      
      // Refresh data to show new request
      await fetchPayoutData();
      return true;
    } catch (error) {
      console.error('💥 Error requesting payout:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to request payout');
      return false;
    }
  }, [user]); // 🔥 FIXED: Remove fetchPayoutData from dependencies to prevent infinite loops

  const refreshData = useCallback(async () => {
    await fetchPayoutData();
  }, []); // 🔥 FIXED: Remove fetchPayoutData from dependencies to prevent infinite loops

  useEffect(() => {
    fetchPayoutData();
  }, [user?.id]); // 🔥 FIXED: Only depend on user.id to prevent infinite loops

  return {
    payoutDetails,
    payoutRequests,
    availableEarnings,
    loading,
    error,
    setupStripeAccount,
    checkAccountStatus,
    requestPayout,
    refreshData
  };
};