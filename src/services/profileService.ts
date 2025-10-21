import { supabase } from '../lib/supabase';

export interface ProfileData {
  full_name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  professional_title?: string;
  status?: 'available' | 'busy' | 'away' | 'do_not_disturb';
  show_email?: boolean;
  show_phone?: boolean;
  github_url?: string;
  discord_username?: string;
  twitter_url?: string;
  linkedin_url?: string;
}

export interface PrivacySettings {
  show_email: boolean;
  show_phone: boolean;
}

export class ProfileService {
  /**
   * Récupère les données du profil utilisateur
   */
  static async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  /**
   * Met à jour les données du profil
   */
  static async updateProfile(userId: string, profileData: Partial<ProfileData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  }

  /**
   * Met à jour le statut de l'utilisateur
   */
  static async updateStatus(userId: string, status: 'available' | 'busy' | 'away' | 'do_not_disturb'): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_user_status', {
        user_uuid: userId,
        new_status: status
      });

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return false;
    }
  }

  /**
   * Met à jour les paramètres de confidentialité
   */
  static async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_privacy_settings', {
        user_uuid: userId,
        show_email_setting: settings.show_email,
        show_phone_setting: settings.show_phone
      });

      if (error) {
        console.error('Erreur lors de la mise à jour des paramètres de confidentialité:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres de confidentialité:', error);
      return false;
    }
  }

  /**
   * Upload une image de profil (avatar ou bannière)
   */
  static async uploadProfileImage(
    userId: string, 
    file: File, 
    imageType: 'avatar' | 'banner'
  ): Promise<string | null> {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${imageType}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError);
        return null;
      }

      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase.rpc('upload_profile_image', {
        user_uuid: userId,
        image_type: imageType,
        image_url: imageUrl
      });

      if (updateError) {
        console.error('Erreur lors de la mise à jour du profil:', updateError);
        return null;
      }

      return imageUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      return null;
    }
  }

  /**
   * Supprime une image de profil
   */
  static async deleteProfileImage(userId: string, imageType: 'avatar' | 'banner'): Promise<boolean> {
    try {
      // Récupérer l'URL actuelle
      const profile = await this.getProfile(userId);
      if (!profile) return false;

      const currentUrl = imageType === 'avatar' ? profile.avatar_url : profile.banner_url;
      if (!currentUrl) return true; // Pas d'image à supprimer

      // Extraire le chemin du fichier depuis l'URL
      const urlParts = currentUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `profiles/${fileName}`;

      // Supprimer le fichier du storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('Erreur lors de la suppression du fichier:', deleteError);
      }

      // Mettre à jour le profil pour supprimer l'URL
      const updateData = imageType === 'avatar' 
        ? { avatar_url: null } 
        : { banner_url: null };

      return await this.updateProfile(userId, updateData);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      return false;
    }
  }

  /**
   * Valide une URL
   */
  static validateUrl(url: string): boolean {
    if (!url || url.trim() === '') return true; // URL vide est valide
    const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    return urlPattern.test(url);
  }

  /**
   * Valide un numéro de téléphone
   */
  static validatePhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return true; // Téléphone vide est valide
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
    return phonePattern.test(phone.replace(/\s/g, ''));
  }

  /**
   * Valide un email
   */
  static validateEmail(email: string): boolean {
    if (!email || email.trim() === '') return true; // Email vide est valide
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
}
