import { supabase } from '../lib/supabase';

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  created_at: string;
  updated_at: string;
}

export class SkillsService {
  /**
   * Récupère toutes les compétences d'un utilisateur
   */
  static async getUserSkills(userId: string): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des compétences:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des compétences:', error);
      return [];
    }
  }

  /**
   * Récupère les compétences publiques d'un utilisateur
   */
  static async getPublicSkills(userId: string): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .order('level', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement des compétences publiques:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des compétences publiques:', error);
      return [];
    }
  }

  /**
   * Crée une nouvelle compétence
   */
  static async createSkill(skillData: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill | null> {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .insert([skillData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la compétence:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la compétence:', error);
      return null;
    }
  }

  /**
   * Met à jour une compétence
   */
  static async updateSkill(skillId: string, updates: Partial<Omit<Skill, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_skills')
        .update(updates)
        .eq('id', skillId);

      if (error) {
        console.error('Erreur lors de la mise à jour de la compétence:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la compétence:', error);
      return false;
    }
  }

  /**
   * Supprime une compétence
   */
  static async deleteSkill(skillId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        console.error('Erreur lors de la suppression de la compétence:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la compétence:', error);
      return false;
    }
  }

  /**
   * Récupère les catégories de compétences
   */
  static getSkillCategories(): string[] {
    return [
      'Développement',
      'Design',
      'Marketing',
      'Gestion de projet',
      'Communication',
      'Langues',
      'Outils',
      'Autres'
    ];
  }

  /**
   * Récupère les niveaux de compétences
   */
  static getSkillLevels(): { value: Skill['level']; label: string; color: string }[] {
    return [
      { value: 'beginner', label: 'Débutant', color: 'text-green-400' },
      { value: 'intermediate', label: 'Intermédiaire', color: 'text-blue-400' },
      { value: 'advanced', label: 'Avancé', color: 'text-purple-400' },
      { value: 'expert', label: 'Expert', color: 'text-orange-400' }
    ];
  }
}