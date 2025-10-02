import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData } from '../types/subscription';
import toast from 'react-hot-toast';

export const useSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_renewal_date', { ascending: true });

      if (fetchError) throw fetchError;
      setSubscriptions(data || []);
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      setError(err?.message || 'Failed to fetch subscriptions');
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createSubscription = useCallback(async (data: CreateSubscriptionData): Promise<Subscription | null> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return null;
    }

    try {
      const subscriptionData = {
        ...data,
        user_id: user.id,
        currency: data.currency || 'USD',
      };

      const { data: newSubscription, error: createError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (createError) throw createError;

      setSubscriptions(prev => [...prev, newSubscription]);
      toast.success('Subscription created successfully');
      return newSubscription;
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      toast.error(err?.message || 'Failed to create subscription');
      return null;
    }
  }, [user]);

  const updateSubscription = useCallback(async (id: string, data: UpdateSubscriptionData): Promise<Subscription | null> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return null;
    }

    try {
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('subscriptions')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? updatedSubscription : sub)
      );
      toast.success('Subscription updated successfully');
      return updatedSubscription;
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      toast.error(err?.message || 'Failed to update subscription');
      return null;
    }
  }, [user]);

  const deleteSubscription = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast.success('Subscription deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting subscription:', err);
      toast.error(err?.message || 'Failed to delete subscription');
      return false;
    }
  }, [user]);

  const toggleSubscription = useCallback(async (id: string): Promise<boolean> => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) return false;

    return await updateSubscription(id, { is_active: !subscription.is_active });
  }, [subscriptions, updateSubscription]);

  // 🔥 Auto-fetch on mount and when user changes - éviter les loops
  useEffect(() => {
    if (user) {
      // 🔥 Debounce minimal pour une authentification fluide
      const timeoutId = setTimeout(() => {
        fetchSubscriptions();
      }, 50); // Réduit de 200ms à 50ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [user?.id]); // 🔥 Retirer fetchSubscriptions des dépendances pour éviter les loops

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
  };
};
