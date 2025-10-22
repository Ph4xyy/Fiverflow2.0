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
      console.log('Supabase not configured or no user for subscriptions');
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('📋 Fetching subscriptions...');
      
      // Utiliser la table user_subscriptions au lieu de subscriptions
      const { data, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans!inner(
            name,
            display_name,
            price_monthly,
            price_yearly,
            currency,
            max_projects,
            max_clients,
            max_storage_gb,
            max_team_members,
            features
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching subscriptions:', fetchError);
        // Si la table n'existe pas, utiliser des données mock
        console.log('Using mock subscription data');
        setSubscriptions([]);
        setLoading(false);
        return;
      }

      // Transformer les données pour correspondre à l'interface Subscription
      const transformedSubscriptions: Subscription[] = (data || []).map(sub => ({
        id: sub.id,
        name: sub.subscription_plans?.display_name || 'Unknown Plan',
        description: `Plan ${sub.subscription_plans?.display_name || 'Unknown'}`,
        provider: 'FiverFlow',
        category: 'productivity',
        amount: sub.amount || 0,
        currency: sub.currency || 'USD',
        billing_cycle: sub.billing_cycle || 'monthly',
        next_renewal_date: sub.end_date || new Date().toISOString().split('T')[0],
        is_active: sub.status === 'active',
        color: '#8b5cf6',
        created_at: sub.created_at,
        updated_at: sub.updated_at
      }));

      setSubscriptions(transformedSubscriptions);
      console.log('✅ Subscriptions loaded:', transformedSubscriptions.length);
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      setError(err?.message || 'Failed to fetch subscriptions');
      setSubscriptions([]);
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
      // Pour l'instant, on ne peut pas créer de nouvelles subscriptions via cette interface
      // car cela nécessite une intégration Stripe
      toast.error('Subscription creation requires Stripe integration');
      return null;
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
      // Pour l'instant, on ne peut pas modifier les subscriptions via cette interface
      toast.error('Subscription updates require admin access');
      return null;
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
      // Pour l'instant, on ne peut pas supprimer les subscriptions via cette interface
      toast.error('Subscription cancellation requires admin access');
      return false;
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

  const markAsPaid = useCallback(async (id: string): Promise<boolean> => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) return false;

    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return false;
    }

    try {
      // Calculer la prochaine date de renouvellement
      const currentDate = new Date(subscription.next_renewal_date);
      let nextDate = new Date(currentDate);

      switch (subscription.billing_cycle) {
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        default:
          nextDate.setMonth(nextDate.getMonth() + 1);
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          end_date: nextDate.toISOString().split('T')[0],
          status: 'active'
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? { 
          ...sub, 
          next_renewal_date: nextDate.toISOString().split('T')[0],
          is_active: true
        } : sub)
      );

      toast.success('Subscription marked as paid! Next renewal updated.');
      return true;
    } catch (err: any) {
      console.error('Error marking subscription as paid:', err);
      toast.error(err?.message || 'Failed to mark subscription as paid');
      return false;
    }
  }, [subscriptions, user]);

  // Auto-fetch on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user?.id, fetchSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    markAsPaid,
  };
};