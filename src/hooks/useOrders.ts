import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface Order {
  id: string;
  title: string;
  description?: string;
  budget: number; // Utilise budget au lieu de amount
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string; // Utilise due_date au lieu de deadline
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
  };
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (orderData: Partial<Order>) => Promise<boolean>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  refetchOrders: () => Promise<void>;
}

// Mock data pour quand Supabase n'est pas configuré
const mockOrders: Order[] = [];

export const useOrders = (): UseOrdersReturn => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    console.log('📦 Fetching orders...');
    
    // Si Supabase n'est pas configuré, utiliser les données mock
    if (!isSupabaseConfigured || !supabase) {
      console.log('🎭 Using mock orders data');
      setOrders(mockOrders);
      setLoading(false);
      setError(null);
      return;
    }

    if (!user) {
      console.log('❌ No user found for orders');
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupérer les commandes avec les informations du client
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, title, description, budget, status, due_date, created_at, updated_at,
          clients!inner(id, name, user_id)
        `)
        .eq('clients.user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Transformer les données des commandes
      const transformedOrders: Order[] = ordersData?.map(order => ({
        id: order.id,
        title: order.title,
        description: order.description,
        budget: order.budget || 0,
        status: order.status || 'pending',
        due_date: order.due_date,
        created_at: order.created_at,
        updated_at: order.updated_at,
        client: {
          id: (order.clients as any).id,
          name: (order.clients as any).name
        }
      })) || [];

      setOrders(transformedOrders);
      console.log('✅ Orders loaded successfully:', transformedOrders.length);
    } catch (error) {
      console.error('💥 Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createOrder = useCallback(async (orderData: Partial<Order>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return false;
    }

    if (!orderData.title) {
      toast.error('Title is required');
      return false;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          title: orderData.title,
          description: orderData.description || null,
          budget: orderData.budget || 0,
          status: orderData.status || 'pending',
          due_date: orderData.due_date || null,
          client_id: orderData.client?.id || null
        });

      if (error) throw error;

      toast.success('Order created successfully!');
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      return false;
    }
  }, [fetchOrders]);

  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return false;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order updated successfully!');
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      return false;
    }
  }, [fetchOrders]);

  const deleteOrder = useCallback(async (orderId: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return false;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order deleted successfully!');
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
      return false;
    }
  }, [fetchOrders]);

  const refetchOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    refetchOrders
  };
};
