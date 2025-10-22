import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SubscriptionStatus {
  plan: 'free' | 'pro' | 'excellence';
  is_trial_active: boolean;
  trial_end: string | null;
  days_remaining: number | null;
  hours_remaining: number | null;
  trial_available: boolean;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  activateProTrial: () => Promise<boolean>;
  checkTrialStatus: () => Promise<void>;
}

// Mock subscription for when Supabase is not configured
const mockSubscription: SubscriptionStatus | null = null;

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkTrialStatus = useCallback(async () => {
    console.log('📋 Checking trial status...');
    
    // If Supabase is not configured, return null
    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase not configured - cannot check trial status');
      setSubscription(null);
      setLoading(false);
      setError('Database not configured');
      return;
    }

    if (!user) {
      console.log('❌ No user found for subscription check');
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      console.log('🔍 Querying trial status...');
      const { data, error: rpcError } = await supabase
        .rpc('get_trial_status', { target_user_id: user.id });

      if (rpcError) {
        console.error('❌ Error getting trial status:', rpcError);
        throw rpcError;
      }

      console.log('✅ Trial status loaded:', data);
      setSubscription(data);
    } catch (error) {
      console.error('💥 Error checking trial status:', error);
      setError(error instanceof Error ? error.message : 'Failed to check trial status');
      // Fallback to null data
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const activateProTrial = useCallback(async (): Promise<boolean> => {
    console.log('🚀 Activating Pro trial...');
    
    // If Supabase is not configured, return false
    if (!isSupabaseConfigured || !supabase) {
      console.error('Supabase not configured - cannot activate trial');
      return false;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour activer l\'essai');
      return false;
    }

    try {
      const toastId = toast.loading('Activation de l\'essai Pro...');
      
      console.log('🔍 Calling activate_pro_trial function...');
      const { data, error: rpcError } = await supabase
        .rpc('activate_pro_trial', { target_user_id: user.id });

      if (rpcError) {
        console.error('❌ Error activating trial:', rpcError);
        throw rpcError;
      }

      if (!data.success) {
        console.log('⚠️ Trial activation failed:', data.error);
        toast.error(data.message || data.error, { id: toastId });
        return false;
      }

      console.log('✅ Pro trial activated successfully');
      toast.success('Essai Pro activé ! 7 jours gratuits', { id: toastId });
      
      // Refresh trial status
      await checkTrialStatus();
      return true;
    } catch (error) {
      console.error('💥 Error activating Pro trial:', error);
      toast.error('Erreur lors de l\'activation de l\'essai');
      return false;
    }
  }, [user?.id]); // Only depend on user.id to prevent infinite loops // Remove checkTrialStatus from dependencies to prevent infinite loops

  // Check trial status on mount and when user changes
  useEffect(() => {
    if (user) {
      checkTrialStatus();
    } else {
      setSubscription(null);
      setLoading(false);
    }
    // Removed event listener to prevent infinite loop
  }, [user?.id]); // Only depend on user.id, not the entire user object

  // Check for expired trials on mount (simulates login check)
  useEffect(() => {
    const checkExpiredTrials = async () => {
      if (!isSupabaseConfigured || !supabase || !user) {
        console.log('⏭️ Skipping expired trials check - Supabase not configured or no user');
        return;
      }

      try {
        console.log('🔍 Checking for expired trials...');
        
        // Verify we can make the RPC call
        if (!supabase.rpc) {
          console.log('⚠️ RPC not available, skipping expired trials check');
          return;
        }
        
        const { data, error } = await supabase
          .rpc('check_expired_trials');

        if (error) {
          console.error('❌ Error checking expired trials:', error);
          // Don't throw here, just log and continue
          return;
        } else {
          console.log('✅ Expired trials check completed:', data);
          if (data.expired_trials > 0) {
            // Refresh status if trials were expired
            await checkTrialStatus();
          }
        }
      } catch (error) {
        console.error('💥 Network error in expired trials check:', error);
        // Silently fail for network errors - don't disrupt user experience
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.log('🌐 Network connectivity issue detected, continuing without expired trials check');
        }
      }
    };

    // Add a small delay to ensure everything is properly initialized
    if (user && isSupabaseConfigured) {
      setTimeout(() => {
        checkExpiredTrials();
      }, 1000);
    } else {
      checkExpiredTrials();
    }
  }, [user?.id]); // Only depend on user.id to prevent infinite loops // Remove checkTrialStatus from dependencies to prevent infinite loops

  return {
    subscription,
    loading,
    error,
    activateProTrial,
    checkTrialStatus
  };
};