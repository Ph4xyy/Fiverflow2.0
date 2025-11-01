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
      console.log('📋 Fetching personal subscriptions...');
      
      // Récupérer les souscriptions personnelles de l'utilisateur
      const { data, error: fetchError } = await supabase
        .from('user_personal_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching personal subscriptions:', fetchError);
        // Si la table n'existe pas encore, initialiser avec une liste vide
        console.log('Personal subscriptions table not found, initializing empty list');
        setSubscriptions([]);
        setLoading(false);
        return;
      }

      // Transformer les données pour correspondre à l'interface Subscription
      const transformedSubscriptions: Subscription[] = (data || []).map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        provider: sub.provider,
        category: sub.category,
        amount: sub.amount,
        currency: sub.currency,
        billing_cycle: sub.billing_cycle,
        next_renewal_date: sub.next_renewal_date,
        is_active: sub.is_active,
        color: sub.color,
        created_at: sub.created_at,
        updated_at: sub.updated_at
      }));

      setSubscriptions(transformedSubscriptions);
      console.log('✅ Personal subscriptions loaded:', transformedSubscriptions.length);
    } catch (err: any) {
      console.error('Error fetching personal subscriptions:', err);
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
      console.log('📋 Creating personal subscription:', data);
      
      // Créer une souscription personnelle dans la table user_personal_subscriptions
      const { data: newSub, error } = await supabase
        .from('user_personal_subscriptions')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          provider: data.provider,
          category: data.category,
          amount: data.amount,
          currency: data.currency,
          billing_cycle: data.billing_cycle,
          next_renewal_date: data.next_renewal_date,
          color: data.color,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        // Si la table n'existe pas, créer une souscription locale temporaire
        if (error.message.includes('relation "user_personal_subscriptions" does not exist')) {
          console.log('Table not found, creating local subscription');
          const tempSubscription: Subscription = {
            id: `temp-${Date.now()}`,
            name: data.name,
            description: data.description || '',
            provider: data.provider,
            category: data.category,
            amount: data.amount,
            currency: data.currency,
            billing_cycle: data.billing_cycle,
            next_renewal_date: data.next_renewal_date,
            is_active: true,
            color: data.color,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setSubscriptions(prev => [tempSubscription, ...prev]);
          toast.success('Subscription created successfully! (Local)');
          return tempSubscription;
        }
        throw error;
      }

      // Ajouter la nouvelle souscription à la liste locale
      const newSubscription: Subscription = {
        id: newSub.id,
        name: newSub.name,
        description: newSub.description,
        provider: newSub.provider,
        category: newSub.category,
        amount: newSub.amount,
        currency: newSub.currency,
        billing_cycle: newSub.billing_cycle,
        next_renewal_date: newSub.next_renewal_date,
        is_active: newSub.is_active,
        color: newSub.color,
        created_at: newSub.created_at,
        updated_at: newSub.updated_at
      };

      setSubscriptions(prev => [newSubscription, ...prev]);
      toast.success('Subscription created successfully!');
      
      // Re-fetch pour s'assurer que toutes les données sont à jour
      await fetchSubscriptions();
      
      return newSubscription;
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      toast.error(err?.message || 'Failed to create subscription');
      throw err; // Re-throw pour que le composant puisse gérer l'erreur
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
      console.log('📋 Deleting personal subscription:', id);
      
      const { error } = await supabase
        .from('user_personal_subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Retirer de la liste locale
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast.success('Subscription deleted successfully!');
      
      // Re-fetch pour s'assurer que toutes les données sont à jour
      await fetchSubscriptions();
      
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
        .from('user_personal_subscriptions')
        .update({ 
          next_renewal_date: nextDate.toISOString().split('T')[0],
          is_active: true
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
      
      // Re-fetch pour s'assurer que toutes les données sont à jour
      await fetchSubscriptions();
      
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