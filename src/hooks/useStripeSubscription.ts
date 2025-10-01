import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getProductByPriceId } from '../stripe-config';
import toast from 'react-hot-toast';

export interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  product_name?: string;
  product_description?: string;
}

interface UseStripeSubscriptionReturn {
  subscription: StripeSubscription | null;
  loading: boolean;
  error: string | null;
  createCheckoutSession: (priceId: string, mode: 'subscription' | 'payment') => Promise<string | null>;
  createCheckoutSession: (priceId: string, mode: 'subscription' | 'payment', trialDays?: number) => Promise<string | null>;
  refreshSubscription: () => Promise<void>;
}

export const useStripeSubscription = (): UseStripeSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    console.log('💳 Fetching Stripe subscription...');
    
    if (!isSupabaseConfigured || !supabase) {
      console.log('🎭 Supabase not configured, no subscription data');
      setSubscription(null);
      setLoading(false);
      return;
    }

    if (!user) {
      console.log('❌ No user found for subscription');
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      console.log('🔍 Querying user subscription...');
      const { data, error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (subError) {
        console.error('❌ Error fetching subscription:', subError);
        throw subError;
      }

      if (data) {
        // Enrich with product information
        const product = data.price_id ? getProductByPriceId(data.price_id) : null;
        const enrichedSubscription: StripeSubscription = {
          ...data,
          product_name: product?.name,
          product_description: product?.description
        };
        
        console.log('✅ Subscription loaded:', enrichedSubscription);
        setSubscription(enrichedSubscription);
      } else {
        console.log('ℹ️ No subscription found');
        setSubscription(null);
      }
    } catch (error) {
      console.error('💥 Error fetching subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch subscription');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id

  const createCheckoutSession = useCallback(async (priceId: string, mode: 'subscription' | 'payment', trialDays?: number): Promise<string | null> => {
    console.log('🛒 Creating checkout session...', { priceId, mode });
    
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Payment system not configured');
      return null;
    }

    if (!user) {
      toast.error('You must be logged in to make a purchase');
      return null;
    }

    try {
      const toastId = toast.loading('Creating checkout session...');
      
      // Get the current user's session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to authenticate user');
      }
      
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      const body = {
        price_id: priceId,
        mode,
        trial_period_days: trialDays,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/upgrade`
      };

      console.log('📡 Calling checkout function...', body);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('✅ Checkout session created:', data);
      
      toast.success('Redirecting to checkout...', { id: toastId });
      return data.url;
    } catch (error) {
      console.error('💥 Error creating checkout session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create checkout session');
      return null;
    }
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    const currentUserId = user?.id || null;
    
    // Ne fetch que si l'utilisateur change ou si on n'a pas encore fetché
    if (currentUserId && (currentUserId !== lastUserIdRef.current || !hasFetchedRef.current)) {
      lastUserIdRef.current = currentUserId;
      hasFetchedRef.current = true;
      
      // Debounce pour éviter les appels multiples
      const timeoutId = setTimeout(() => {
        fetchSubscription();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (!currentUserId) {
      // Réinitialiser si l'utilisateur se déconnecte
      hasFetchedRef.current = false;
      lastUserIdRef.current = null;
      setSubscription(null);
      setLoading(false);
    }
    // Removed event listener to prevent infinite loop
  }, [user?.id]); // Only depend on user.id, not the entire user object

  return {
    subscription,
    loading,
    error,
    createCheckoutSession,
    refreshSubscription
  };
};