import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface ProfileData {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  banner_url: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  created_at: string;
  is_admin: boolean;
  is_active: boolean;
  // Données publiques seulement
  public_data: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    banner_url: string | null;
    location: string | null;
    website: string | null;
    created_at: string;
  };
}

export const useProfile = (username?: string) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user && !username) {
      setLoading(false);
      return;
    }

    loadProfile();
  }, [user, username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetUsername = username;

      // Si aucun username fourni, utiliser celui de l'utilisateur connecté
      if (!targetUsername && user) {
        const { data: currentUserProfile, error: currentUserError } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();

        if (currentUserError || !currentUserProfile?.username) {
          setError('Profil utilisateur non trouvé');
          return;
        }

        targetUsername = currentUserProfile.username;
      }

      if (!targetUsername) {
        setError('Username requis');
        return;
      }

      // Récupérer le profil par username
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          full_name,
          username,
          avatar_url,
          bio,
          banner_url,
          location,
          website,
          phone,
          created_at,
          is_admin,
          is_active
        `)
        .eq('username', targetUsername)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError('Profil introuvable');
        } else {
          setError('Erreur lors du chargement du profil');
        }
        return;
      }

      if (!profile) {
        setError('Profil introuvable');
        return;
      }

      // Vérifier si c'est le profil de l'utilisateur connecté
      const isOwn = user && profile.user_id === user.id;

      // Créer les données publiques (sans informations sensibles)
      const publicData = {
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        banner_url: profile.banner_url,
        location: profile.location,
        website: profile.website,
        created_at: profile.created_at
      };

      const profileData: ProfileData = {
        ...profile,
        public_data: publicData
      };

      setProfileData(profileData);
      setIsOwnProfile(isOwn);

      console.log('📊 Profil chargé:', {
        username: targetUsername,
        isOwnProfile: isOwn,
        profileData: publicData
      });

    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    loadProfile();
  };

  return {
    profileData,
    loading,
    error,
    isOwnProfile,
    refreshProfile
  };
};
