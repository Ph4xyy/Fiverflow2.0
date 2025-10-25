import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionData {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user, supabase } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'Lunch',
    status: 'active',
    currentPeriodEnd: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || !supabase) {
      setSubscription(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchSubscription = async () => {
      try {
        setSubscription(prev => ({ ...prev, isLoading: true, error: null }));

        // Récupérer le plan depuis user_profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('subscription_plan')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          throw new Error('Erreur lors de la récupération du profil');
        }

        // Récupérer les détails de l'abonnement (optionnel)
        let subscriptionData = null;
        try {
          const { data, error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .select('status, current_period_end')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (!subscriptionError) {
            subscriptionData = data;
          }
        } catch (e) {
          // Table user_subscriptions n'existe pas ou erreur - on continue sans
          console.log('Table user_subscriptions non disponible, utilisation des données de profil uniquement');
        }

        setSubscription({
          plan: profile?.subscription_plan || 'Lunch',
          status: subscriptionData?.status || 'active',
          currentPeriodEnd: subscriptionData?.current_period_end || null,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'abonnement:', error);
        setSubscription(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        }));
      }
    };

    fetchSubscription();
  }, [user, supabase]);

  const hasAccess = (requiredPlan: string): boolean => {
    const planHierarchy = {
      'Lunch': 0,
      'Boost': 1,
      'Scale': 2,
    };

    const userPlanLevel = planHierarchy[subscription.plan as keyof typeof planHierarchy] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;

    return userPlanLevel >= requiredPlanLevel;
  };

  const isActive = (): boolean => {
    return subscription.status === 'active' && subscription.plan !== 'Lunch';
  };

  const canAccess = (pageType: 'admin' | 'pro' | 'premium'): boolean => {
    switch (pageType) {
      case 'admin':
        return subscription.plan === 'Scale'; // Seuls les utilisateurs Scale peuvent accéder à l'admin
      case 'pro':
        return hasAccess('Boost');
      case 'premium':
        return hasAccess('Scale');
      default:
        return false;
    }
  };

  return {
    ...subscription,
    hasAccess,
    isActive,
    canAccess,
  };
};

export default useSubscription;