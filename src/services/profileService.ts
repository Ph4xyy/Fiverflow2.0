import { supabase } from '../lib/supabase';

export interface ProfileData {
  full_name?: string;
  username?: string; // Username unique pour les URLs publiques
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  email?: string; // Email principal de l'utilisateur
  professional_title?: string;
  status?: 'available' | 'busy' | 'away' | 'do_not_disturb';
  show_email?: boolean;
  show_phone?: boolean;
  github_url?: string;
  discord_username?: string;
  twitter_url?: string;
  linkedin_url?: string;
  // Champs de contact séparés
  contact_email?: string;
  contact_phone?: string;
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
      console.log('Tentative de mise à jour du profil:', { userId, profileData });
      
      // Nettoyer les données - supprimer les champs undefined/null
      const cleanData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined && value !== null)
      );
      
      console.log('Données nettoyées:', cleanData);

      // Champs étendus qui devraient exister après les migrations
  const extendedFields = [
    'full_name', 'username', 'avatar_url', 'bio', 'banner_url', 'location', 'website',
    'phone', 'professional_title', 'status', 'show_email', 'show_phone',
    'github_url', 'discord_username', 'twitter_url', 'linkedin_url',
    'instagram_url', 'tiktok_url', 'youtube_url',
    'contact_email', 'contact_phone', 'theme'
  ];
      
      const safeData = Object.fromEntries(
        Object.entries(cleanData).filter(([key]) => extendedFields.includes(key))
      );

      console.log('Données sécurisées à mettre à jour:', safeData);

      if (Object.keys(safeData).length > 0) {
        const { error } = await supabase
          .from('user_profiles')
          .update(safeData)
          .eq('user_id', userId);

        if (error) {
          console.error('Erreur lors de la mise à jour du profil:', error);
          console.error('Détails de l\'erreur:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return false;
        }
      }

      console.log('Profil mis à jour avec succès');
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
      const { error } = await supabase
        .from('user_profiles')
        .update({ status })
        .eq('user_id', userId);

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
      const { error } = await supabase
        .from('user_profiles')
        .update({
          show_email: settings.show_email,
          show_phone: settings.show_phone
        })
        .eq('user_id', userId);

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

      // Vérifier si le bucket existe, sinon le créer
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Erreur lors de la récupération des buckets:', bucketsError);
        return null;
      }

      const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
      if (!avatarsBucket) {
        console.warn('Le bucket "avatars" n\'existe pas. Tentative de création...');
        
        // Essayer de créer le bucket via l'API
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('avatars', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 10485760 // 10MB
        });

        if (createError) {
          console.error('Impossible de créer le bucket avatars automatiquement:', createError);
          
          // Essayer d'utiliser un bucket existant comme fallback
          const fallbackBucket = buckets?.find(bucket => bucket.public === true);
          if (fallbackBucket) {
            console.warn(`Utilisation du bucket de fallback: ${fallbackBucket.name}`);
            // Modifier le chemin pour utiliser le bucket de fallback
            const fallbackPath = `avatars/${filePath}`;
            
            // Upload vers le bucket de fallback
            const { error: uploadError } = await supabase.storage
              .from(fallbackBucket.name)
              .upload(fallbackPath, file, {
                cacheControl: '3600',
                upsert: true
              });

            if (uploadError) {
              console.error('Erreur lors de l\'upload vers le bucket de fallback:', uploadError);
              return null;
            }

            // Retourner l'URL publique
            const { data: { publicUrl } } = supabase.storage
              .from(fallbackBucket.name)
              .getPublicUrl(fallbackPath);

            return publicUrl;
          }
          
          console.error('Aucun bucket public disponible. Veuillez créer le bucket "avatars" manuellement :');
          console.error(`
-- Dans Supabase SQL Editor :
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Puis créer les politiques :
CREATE POLICY "Public avatars are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
          `);
          return null;
        }

        console.log('Bucket avatars créé avec succès!');
      }

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Permettre l'écrasement
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

      // Mettre à jour le profil avec la nouvelle URL directement
      const updateData = imageType === 'avatar' 
        ? { avatar_url: imageUrl } 
        : { banner_url: imageUrl };

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId);

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

  /**
   * Valide un username
   */
  static validateUsername(username: string): boolean {
    if (!username || username.trim() === '') return false;
    
    // Vérifier la longueur (3-50 caractères)
    if (username.length < 3 || username.length > 50) return false;
    
    // Vérifier qu'il ne contient que des caractères autorisés (lettres, chiffres, underscores)
    if (!/^[a-z0-9_]+$/.test(username)) return false;
    
    // Vérifier qu'il ne commence pas par un chiffre
    if (/^[0-9]/.test(username)) return false;
    
    // Vérifier qu'il ne se termine pas par un underscore
    if (/_$/.test(username)) return false;
    
    return true;
  }

  /**
   * Vérifie l'unicité d'un username
   */
  static async checkUsernameAvailability(username: string, currentUserId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .neq('user_id', currentUserId || '');

      if (error) {
        console.error('Erreur lors de la vérification du username:', error);
        return false;
      }

      return data.length === 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du username:', error);
      return false;
    }
  }

  /**
   * Met à jour le username d'un utilisateur
   */
  static async updateUsername(userId: string, username: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Normaliser le username
      const normalizedUsername = username.toLowerCase().trim();
      
      // Valider le username
      if (!this.validateUsername(normalizedUsername)) {
        return { 
          success: false, 
          error: 'Username invalide. Utilisez uniquement des lettres minuscules, chiffres et underscores (3-50 caractères)' 
        };
      }

      // Vérifier l'unicité
      const isAvailable = await this.checkUsernameAvailability(normalizedUsername, userId);
      if (!isAvailable) {
        return { 
          success: false, 
          error: 'Ce username est déjà utilisé' 
        };
      }

      // Mettre à jour le username
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: normalizedUsername })
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la mise à jour du username:', error);
        return { 
          success: false, 
          error: 'Erreur lors de la mise à jour du username' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du username:', error);
      return { 
        success: false, 
        error: 'Erreur inattendue lors de la mise à jour du username' 
      };
    }
  }

  /**
   * Récupère un profil par username
   */
  static async getProfileByUsername(username: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil par username:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil par username:', error);
      return null;
    }
  }
}
