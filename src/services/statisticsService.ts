import { supabase } from '../lib/supabase';

export interface UserStatistics {
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  lastActivity: string | null;
}

export class StatisticsService {
  /**
   * Récupère les statistiques d'un utilisateur
   */
  static async getUserStatistics(userId: string): Promise<UserStatistics> {
    try {
      // Récupérer le nombre total de clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Récupérer les statistiques des commandes
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('status, budget, currency, created_at, updated_at')
        .eq('user_id', userId);

      if (ordersError) {
        console.error('Erreur lors de la récupération des commandes:', ordersError);
        throw ordersError;
      }

      const orders = ordersData || [];
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      // Calculer le revenu total (en USD pour simplifier)
      const totalRevenue = orders
        .filter(order => order.status === 'completed' && order.budget)
        .reduce((sum, order) => {
          // Convertir en USD si nécessaire (simplification)
          return sum + (order.budget || 0);
        }, 0);

      const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      // Récupérer la dernière activité
      const { data: lastActivityData } = await supabase
        .from('user_activity')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalClients: totalClients || 0,
        totalOrders,
        totalRevenue,
        completedOrders,
        pendingOrders,
        averageOrderValue,
        lastActivity: lastActivityData?.created_at || null
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalClients: 0,
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
        pendingOrders: 0,
        averageOrderValue: 0,
        lastActivity: null
      };
    }
  }

  /**
   * Met à jour les statistiques en temps réel
   */
  static async refreshStatistics(userId: string): Promise<UserStatistics> {
    return await this.getUserStatistics(userId);
  }

  /**
   * Récupère les statistiques pour l'affichage sur le profil
   */
  static async getProfileStatistics(userId: string): Promise<{
    clients: number;
    orders: number;
    rating: number;
    experience: number;
  }> {
    try {
      const stats = await this.getUserStatistics(userId);
      
      // Calculer une note basée sur les commandes complétées
      const rating = stats.completedOrders > 0 ? Math.min(5, 4 + (stats.completedOrders / 10)) : 4.5;
      
      // Calculer l'expérience en années (basé sur la date de création du compte)
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('created_at')
        .eq('user_id', userId)
        .single();

      const experience = userData?.created_at 
        ? Math.max(1, Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)))
        : 1;

      return {
        clients: stats.totalClients,
        orders: stats.totalOrders,
        rating: Math.round(rating * 10) / 10,
        experience
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques du profil:', error);
      return {
        clients: 0,
        orders: 0,
        rating: 4.5,
        experience: 1
      };
    }
  }
}
