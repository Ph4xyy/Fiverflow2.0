import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url?: string;
  tags: string[];
  is_public: boolean;
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectLike {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface ProjectView {
  id: string;
  project_id: string;
  user_id?: string;
  ip_address?: string;
  created_at: string;
}

export class ProjectsService {
  static async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('user_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des projets:', error);
      throw error;
    }

    return data || [];
  }

  static async getPublicProjects(limit: number = 20, offset: number = 0): Promise<Project[]> {
    const { data, error } = await supabase
      .from('user_projects')
      .select(`
        *,
        user_profiles!inner(full_name, avatar_url, professional_title)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur lors du chargement des projets publics:', error);
      throw error;
    }

    return data || [];
  }

  static async createProject(project: Omit<Project, 'id' | 'likes_count' | 'views_count' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('user_projects')
      .insert([{
        ...project,
        likes_count: 0,
        views_count: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw error;
    }

    return data;
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('user_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      throw error;
    }

    return data;
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      throw error;
    }
  }

  static async likeProject(projectId: string, userId: string): Promise<void> {
    // Vérifier si l'utilisateur a déjà liké ce projet
    const { data: existingLike } = await supabase
      .from('project_likes')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Retirer le like
      await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      // Décrémenter le compteur
      await supabase.rpc('decrement_project_likes', { project_id: projectId });
    } else {
      // Ajouter le like
      await supabase
        .from('project_likes')
        .insert([{ project_id: projectId, user_id: userId }]);

      // Incrémenter le compteur
      await supabase.rpc('increment_project_likes', { project_id: projectId });
    }
  }

  static async viewProject(projectId: string, userId?: string, ipAddress?: string): Promise<void> {
    // Enregistrer la vue
    await supabase
      .from('project_views')
      .insert([{
        project_id: projectId,
        user_id: userId,
        ip_address: ipAddress
      }]);

    // Incrémenter le compteur de vues
    await supabase.rpc('increment_project_views', { project_id: projectId });
  }

  static async getUserLikedProjects(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('project_likes')
      .select('project_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors du chargement des projets likés:', error);
      throw error;
    }

    return data?.map(like => like.project_id) || [];
  }
}
