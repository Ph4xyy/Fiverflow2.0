import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlanRestrictions } from './usePlanRestrictions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface PlanLimits {
  maxClients: number;
  maxOrdersPerMonth: number;
  currentClients: number;
  currentMonthOrders: number;
  canAddClient: boolean;
  canAddOrder: boolean;
}

interface UsePlanLimitsReturn {
  limits: PlanLimits | null;
  loading: boolean;
  error: string | null;
  checkClientLimit: () => Promise<boolean>;
  checkOrderLimit: () => Promise<boolean>;
  refreshLimits: () => Promise<void>;
}

export const usePlanLimits = (): UsePlanLimitsReturn => {
  const { user } = useAuth();
  const { restrictions } = usePlanRestrictions();
  const navigate = useNavigate();
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = useCallback(async () => {
    console.log('📊 Fetching plan limits...');
    
    if (!user) {
      console.log('❌ No user found for plan limits');
      setLimits(null);
      setLoading(false);
      return;
    }

    // If user is admin or not on free plan, no limits apply
    if (restrictions?.isAdmin || restrictions?.plan !== 'free') {
      console.log('✅ User is admin or not on free plan, no limits apply');
      setLimits({
        maxClients: Infinity,
        maxOrdersPerMonth: Infinity,
        currentClients: 0,
        currentMonthOrders: 0,
        canAddClient: true,
        canAddOrder: true
      });
      setLoading(false);
      return;
    }

    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured || !supabase) {
      console.log('🎭 Using mock plan limits data');
      setLimits({
        maxClients: 5,
        maxOrdersPerMonth: 10,
        currentClients: 2,
        currentMonthOrders: 3,
        canAddClient: true,
        canAddOrder: true
      });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Get current client count
      console.log('🔍 Counting current clients...');
      const { count: clientCount, error: clientError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (clientError) {
        console.error('❌ Error counting clients:', clientError);
        throw clientError;
      }

      // Get current month order count
      console.log('🔍 Counting current month orders...');
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('client_id, clients!inner(user_id)', { count: 'exact', head: true })
        .eq('clients.user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (orderError) {
        console.error('❌ Error counting orders:', orderError);
        throw orderError;
      }

      const currentClients = clientCount || 0;
      const currentMonthOrders = orderCount || 0;
      const maxClients = 5;
      const maxOrdersPerMonth = 10;

      const planLimits: PlanLimits = {
        maxClients,
        maxOrdersPerMonth,
        currentClients,
        currentMonthOrders,
        canAddClient: currentClients < maxClients,
        canAddOrder: currentMonthOrders < maxOrdersPerMonth
      };

      console.log('✅ Plan limits loaded:', planLimits);
      setLimits(planLimits);
    } catch (error) {
      console.error('💥 Error fetching plan limits:', error);
      setError(error instanceof Error ? error.message : 'Failed to load plan limits');
      // Fallback to safe defaults
      setLimits({
        maxClients: 5,
        maxOrdersPerMonth: 10,
        currentClients: 0,
        currentMonthOrders: 0,
        canAddClient: true,
        canAddOrder: true
      });
    } finally {
      setLoading(false);
    }
  }, [user, restrictions]);

  const showLimitError = (type: 'client' | 'order') => {
    const message = type === 'client' 
      ? 'Limite de 5 clients atteinte pour le plan gratuit. Veuillez mettre à niveau pour continuer.'
      : 'Limite de 10 commandes par mois atteinte pour le plan gratuit. Veuillez mettre à niveau pour continuer.';
    
    toast.error(message, {
      duration: 6000,
      action: {
        label: 'Mettre à niveau',
        onClick: () => navigate('/upgrade')
      }
    });
    
    // Redirect to pricing page after a short delay
    setTimeout(() => {
      navigate('/pricing');
    }, 2000);
  };

  const checkClientLimit = useCallback(async (): Promise<boolean> => {
    console.log('🔍 Checking client limit...');
    
    // If admin or not on free plan, allow
    if (restrictions?.isAdmin || restrictions?.plan !== 'free') {
      return true;
    }

    // Refresh limits to get latest count
    await fetchLimits();
    
    if (!limits?.canAddClient) {
      console.log('❌ Client limit reached');
      showLimitError('client');
      return false;
    }

    console.log('✅ Client limit check passed');
    return true;
  }, [restrictions, limits, navigate]); // 🔥 FIXED: Remove fetchLimits from dependencies to prevent infinite loops

  const checkOrderLimit = useCallback(async (): Promise<boolean> => {
    console.log('🔍 Checking order limit...');
    
    // If admin or not on free plan, allow
    if (restrictions?.isAdmin || restrictions?.plan !== 'free') {
      return true;
    }

    // Refresh limits to get latest count
    await fetchLimits();
    
    if (!limits?.canAddOrder) {
      console.log('❌ Order limit reached');
      showLimitError('order');
      return false;
    }

    console.log('✅ Order limit check passed');
    return true;
  }, [restrictions, limits, navigate]); // 🔥 FIXED: Remove fetchLimits from dependencies to prevent infinite loops

  const refreshLimits = useCallback(async () => {
    await fetchLimits();
  }, []); // 🔥 FIXED: Remove fetchLimits from dependencies to prevent infinite loops

  useEffect(() => {
    if (user && restrictions) {
      fetchLimits();
    }
  }, [user?.id, restrictions?.plan]); // 🔥 FIXED: Remove fetchLimits from dependencies to prevent infinite loops

  return {
    limits,
    loading,
    error,
    checkClientLimit,
    checkOrderLimit,
    refreshLimits
  };
};