-- Etape 20: Créer une fonction RPC pour la vérification admin
-- Problème: Erreur 406 avec les politiques RLS
-- Solution: Fonction RPC qui contourne les restrictions

-- Fonction pour vérifier le statut admin d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_admin_status(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Exécute avec les privilèges du créateur
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Vérifier si l'utilisateur est admin
  SELECT is_admin INTO admin_status
  FROM user_profiles
  WHERE user_id = user_uuid;
  
  -- Retourner false si aucun profil trouvé
  RETURN COALESCE(admin_status, FALSE);
END;
$$;

-- Fonction pour obtenir les informations de profil d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_profile_info(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data JSON;
BEGIN
  -- Récupérer les informations du profil
  SELECT json_build_object(
    'id', id,
    'user_id', user_id,
    'full_name', full_name,
    'email', email,
    'is_admin', is_admin,
    'is_active', is_active,
    'created_at', created_at
  ) INTO profile_data
  FROM user_profiles
  WHERE user_id = user_uuid;
  
  -- Retourner null si aucun profil trouvé
  RETURN profile_data;
END;
$$;

-- Fonction pour créer un profil utilisateur s'il n'existe pas
CREATE OR REPLACE FUNCTION ensure_user_profile(user_uuid UUID, user_email TEXT DEFAULT NULL, user_name TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data JSON;
BEGIN
  -- Vérifier si le profil existe déjà
  SELECT json_build_object(
    'id', id,
    'user_id', user_id,
    'full_name', full_name,
    'email', email,
    'is_admin', is_admin,
    'is_active', is_active,
    'created_at', created_at
  ) INTO profile_data
  FROM user_profiles
  WHERE user_id = user_uuid;
  
  -- Si le profil n'existe pas, le créer
  IF profile_data IS NULL THEN
    INSERT INTO user_profiles (user_id, full_name, email, is_admin, is_active)
    VALUES (
      user_uuid,
      COALESCE(user_name, split_part(user_email, '@', 1)),
      user_email,
      FALSE, -- Pas admin par défaut
      TRUE   -- Actif par défaut
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Récupérer le profil créé
    SELECT json_build_object(
      'id', id,
      'user_id', user_id,
      'full_name', full_name,
      'email', email,
      'is_admin', is_admin,
      'is_active', is_active,
      'created_at', created_at
    ) INTO profile_data
    FROM user_profiles
    WHERE user_id = user_uuid;
  END IF;
  
  RETURN profile_data;
END;
$$;

-- Vérifier que les fonctions ont été créées
SELECT 'Fonctions RPC pour la vérification admin créées avec succès!' as status;
