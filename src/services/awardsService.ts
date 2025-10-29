import { supabase } from '../lib/supabase';

export interface Award {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  issuer: string; // Organisme qui a décerné la récompense
  date_received: string;
  category: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export class AwardsService {
  /**
   * Récupère toutes les récompenses d'un utilisateur
   */
  static async getUserAwards(userId: string): Promise<Award[]> {
    try {
      const { data, error } = await supabase
        .from('user_awards')
        .select('*')
        .eq('user_id', userId)
        .order('date_received', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des récompenses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des récompenses:', error);
      return [];
    }
  }

  /**
   * Récupère les récompenses publiques d'un utilisateur
   */
  static async getPublicAwards(userId: string): Promise<Award[]> {
    try {
      const { data, error } = await supabase
        .from('user_awards')
        .select('*')
        .eq('user_id', userId)
        .order('date_received', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des récompenses publiques:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des récompenses publiques:', error);
      return [];
    }
  }

  /**
   * Crée une nouvelle récompense
   */
  static async createAward(awardData: Omit<Award, 'id' | 'created_at' | 'updated_at'>): Promise<Award | null> {
    try {
      const { data, error } = await supabase
        .from('user_awards')
        .insert([awardData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la récompense:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la récompense:', error);
      return null;
    }
  }

  /**
   * Met à jour une récompense
   */
  static async updateAward(awardId: string, updates: Partial<Omit<Award, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_awards')
        .update(updates)
        .eq('id', awardId);

      if (error) {
        console.error('Erreur lors de la mise à jour de la récompense:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la récompense:', error);
      return false;
    }
  }

  /**
   * Supprime une récompense
   */
  static async deleteAward(awardId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_awards')
        .delete()
        .eq('id', awardId);

      if (error) {
        console.error('Erreur lors de la suppression de la récompense:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la récompense:', error);
      return false;
    }
  }

  /**
   * Récupère les catégories de récompenses
   */
  static getAwardCategories(): string[] {
    return [
      'Certification',
      'Concours',
      'Formation',
      'Performance',
      'Innovation',
      'Leadership',
      'Service client',
      'Autres'
    ];
  }
}
