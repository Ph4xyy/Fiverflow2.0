import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    is_admin?: boolean;
  };
}

/**
 * Gère les profils utilisateurs avec logique JS directe (sans RPC)
 */
export class UserProfileManager {
  
  /**
   * Vérifie si un profil utilisateur existe
   */
  static async checkProfileExists(userId: string): Promise<UserProfile | null> {
    if (!supabase) {
      console.error('❌ Supabase client non initialisé');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profil non trouvé
          return null;
        }
        console.error('❌ Erreur lors de la vérification du profil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du profil:', error);
      return null;
    }
  }

  /**
   * Crée un nouveau profil utilisateur
   */
  static async createProfile(user: User): Promise<UserProfile | null> {
    if (!supabase) {
      console.error('❌ Supabase client non initialisé');
      return null;
    }

    try {
      const profileData = {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
        email: user.email || '',
        is_admin: user.user_metadata?.is_admin || false,
        is_active: true
      };

      console.log('🔍 Création du profil:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création du profil:', error);
        return null;
      }

      console.log('✅ Profil créé avec succès:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du profil:', error);
      return null;
    }
  }

  /**
   * Met à jour un profil utilisateur existant
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!supabase) {
      console.error('❌ Supabase client non initialisé');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        return null;
      }

      console.log('✅ Profil mis à jour:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      return null;
    }
  }

  /**
   * Gère un profil utilisateur (vérifie, crée ou met à jour)
   */
  static async ensureProfile(user: User): Promise<UserProfile | null> {
    console.log('🔍 Vérification/assurance du profil pour user:', user.id);

    // 1. Vérifier si le profil existe
    const existingProfile = await this.checkProfileExists(user.id);
    
    if (existingProfile) {
      console.log('✅ Profil existant trouvé:', existingProfile);
      
      // Vérifier si une mise à jour est nécessaire
      const needsUpdate = 
        existingProfile.full_name !== (user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur') ||
        existingProfile.email !== user.email ||
        existingProfile.is_admin !== (user.user_metadata?.is_admin || false);

      if (needsUpdate) {
        console.log('🔄 Mise à jour du profil nécessaire');
        return await this.updateProfile(user.id, {
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
          email: user.email || '',
          is_admin: user.user_metadata?.is_admin || false
        });
      }

      return existingProfile;
    } else {
      console.log('🆕 Profil non trouvé, création...');
      return await this.createProfile(user);
    }
  }

  /**
   * Vérifie le statut admin d'un utilisateur
   */
  static async checkAdminStatus(user: User): Promise<boolean> {
    console.log('🔍 Vérification du statut admin pour user:', user.id);

    // 1. Vérifier d'abord les métadonnées utilisateur (le plus rapide)
    if (user.user_metadata?.is_admin === true) {
      console.log('✅ Admin détecté via métadonnées utilisateur');
      return true;
    }

    // 2. Vérifier dans la base de données
    const profile = await this.checkProfileExists(user.id);
    
    if (profile) {
      console.log('🔍 Statut admin dans la base:', profile.is_admin);
      return profile.is_admin;
    }

    // 3. Si pas de profil, créer un profil par défaut (non-admin)
    console.log('🆕 Pas de profil, création d\'un profil par défaut');
    const newProfile = await this.createProfile(user);
    
    return newProfile?.is_admin || false;
  }

  /**
   * Promouvoir un utilisateur en admin
   */
  static async promoteToAdmin(userId: string): Promise<boolean> {
    if (!supabase) {
      console.error('❌ Supabase client non initialisé');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erreur lors de la promotion admin:', error);
        return false;
      }

      console.log('✅ Utilisateur promu administrateur');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la promotion admin:', error);
      return false;
    }
  }

  /**
   * Rétrograder un utilisateur (enlever admin)
   */
  static async demoteFromAdmin(userId: string): Promise<boolean> {
    if (!supabase) {
      console.error('❌ Supabase client non initialisé');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_admin: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erreur lors de la rétrogradation:', error);
        return false;
      }

      console.log('✅ Utilisateur rétrogradé');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la rétrogradation:', error);
      return false;
    }
  }
}

export default UserProfileManager;
