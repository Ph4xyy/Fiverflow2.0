import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  platform?: string;
  client_name?: string;
  client_email?: string;
  budget?: number;
  currency: string;
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export class OrdersService {
  /**
   * Récupère toutes les commandes d'un utilisateur
   */
  static async getUserOrders(userId: string, limit: number = 20): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      return [];
    }
  }

  /**
   * Récupère une commande par ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Erreur lors du chargement de la commande:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle commande
   */
  static async createOrder(orderData: Partial<Order>): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la commande:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return null;
    }
  }

  /**
   * Met à jour une commande
   */
  static async updateOrder(orderId: string, updates: Partial<Order>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      return false;
    }
  }

  /**
   * Supprime une commande
   */
  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      return false;
    }
  }

  /**
   * Récupère les statistiques des commandes
   */
  static async getOrderStatistics(userId: string): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        return { total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 };
      }

      const orders = data || [];
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        in_progress: orders.filter(o => o.status === 'in_progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 };
    }
  }
}
