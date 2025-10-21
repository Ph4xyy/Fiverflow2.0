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
  static async getUserSkills(userId: string): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des compétences:', error);
      throw error;
    }

    return data || [];
  }

  static async addSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill> {
    const { data, error } = await supabase
      .from('user_skills')
      .insert([skill])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout de la compétence:', error);
      throw error;
    }

    return data;
  }

  static async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    const { data, error } = await supabase
      .from('user_skills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la compétence:', error);
      throw error;
    }

    return data;
  }

  static async deleteSkill(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de la compétence:', error);
      throw error;
    }
  }
}
