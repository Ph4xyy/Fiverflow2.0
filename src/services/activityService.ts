import { supabase } from '../lib/supabase';

export interface Activity {
  id: string;
  user_id: string;
  type: 'project_created' | 'project_liked' | 'profile_updated' | 'skill_added' | 'social_connected' | 'order_created' | 'order_updated' | 'order_completed' | 'client_created' | 'client_updated';
  title: string;
  description: string;
  metadata?: any;
  created_at: string;
}

export class ActivityService {
  static async getUserActivity(userId: string, limit: number = 20): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors du chargement de l\'activité:', error);
        // Retourner un tableau vide au lieu de lancer une erreur
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error);
      return [];
    }
  }

  static async getPublicActivity(userId: string, limit: number = 20): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .in('type', ['project_created', 'project_liked', 'skill_added'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur lors du chargement de l\'activité publique:', error);
      throw error;
    }

    return data || [];
  }

  static async logActivity(
    userId: string,
    type: Activity['type'],
    title: string,
    description: string,
    metadata?: any
  ): Promise<Activity> {
    const { data, error } = await supabase
      .from('user_activity')
      .insert([{
        user_id: userId,
        type,
        title,
        description,
        metadata
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
      throw error;
    }

    return data;
  }

  static async logProjectCreated(projectId: string, projectTitle: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'project_created',
      'Nouveau projet créé',
      `Vous avez créé le projet "${projectTitle}"`,
      { project_id: projectId }
    );
  }

  static async logProjectLiked(projectId: string, projectTitle: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'project_liked',
      'Projet liké',
      `Vous avez liké le projet "${projectTitle}"`,
      { project_id: projectId }
    );
  }

  static async logSkillAdded(skillName: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'skill_added',
      'Compétence ajoutée',
      `Vous avez ajouté la compétence "${skillName}"`,
      { skill_name: skillName }
    );
  }

  static async logProfileUpdated(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'profile_updated',
      'Profil mis à jour',
      'Vous avez mis à jour votre profil',
      {}
    );
  }

  static async logSocialConnected(platform: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'social_connected',
      'Réseau social connecté',
      `Vous avez connecté votre ${platform}`,
      { platform }
    );
  }

  // Nouvelles méthodes pour le suivi des commandes et clients
  static async logOrderCreated(orderId: string, orderTitle: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'order_created',
      'Nouvelle commande créée',
      `Vous avez créé la commande "${orderTitle}"`,
      { order_id: orderId }
    );
  }

  static async logOrderUpdated(orderId: string, orderTitle: string, changes: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'order_updated',
      'Commande mise à jour',
      `Vous avez modifié la commande "${orderTitle}" (${changes.join(', ')})`,
      { order_id: orderId, changes }
    );
  }

  static async logOrderCompleted(orderId: string, orderTitle: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'order_completed',
      'Commande terminée',
      `Vous avez terminé la commande "${orderTitle}"`,
      { order_id: orderId }
    );
  }

  static async logClientCreated(clientId: string, clientName: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'client_created',
      'Nouveau client ajouté',
      `Vous avez ajouté le client "${clientName}"`,
      { client_id: clientId }
    );
  }

  static async logClientUpdated(clientId: string, clientName: string, changes: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await this.logActivity(
      user.id,
      'client_updated',
      'Client mis à jour',
      `Vous avez modifié le client "${clientName}" (${changes.join(', ')})`,
      { client_id: clientId, changes }
    );
  }
}
