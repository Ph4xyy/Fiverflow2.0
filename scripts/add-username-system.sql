-- Script pour ajouter le système de username unique
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter la colonne username après la colonne id
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- 2. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 3. Fonction pour normaliser le username (minuscules, sans espaces)
CREATE OR REPLACE FUNCTION normalize_username(input_username TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convertir en minuscules et supprimer les espaces
  RETURN LOWER(TRIM(input_username));
END;
$$ LANGUAGE plpgsql;

-- 4. Fonction de validation du username
CREATE OR REPLACE FUNCTION validate_username(input_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que le username n'est pas vide
  IF input_username IS NULL OR LENGTH(TRIM(input_username)) = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier la longueur (3-50 caractères)
  IF LENGTH(input_username) < 3 OR LENGTH(input_username) > 50 THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier qu'il ne contient que des caractères autorisés (lettres, chiffres, underscores)
  IF NOT input_username ~ '^[a-z0-9_]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier qu'il ne commence pas par un chiffre
  IF input_username ~ '^[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier qu'il ne se termine pas par un underscore
  IF input_username ~ '_$' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger pour normaliser automatiquement le username
CREATE OR REPLACE FUNCTION trigger_normalize_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Normaliser le username si il est fourni
  IF NEW.username IS NOT NULL THEN
    NEW.username := normalize_username(NEW.username);
    
    -- Valider le username
    IF NOT validate_username(NEW.username) THEN
      RAISE EXCEPTION 'Username invalide. Utilisez uniquement des lettres minuscules, chiffres et underscores (3-50 caractères)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer le trigger
DROP TRIGGER IF EXISTS trigger_normalize_username ON user_profiles;
CREATE TRIGGER trigger_normalize_username
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_normalize_username();

-- 7. Supprimer les anciennes politiques RLS pour les recréer
DROP POLICY IF EXISTS "Simple user access" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- 8. Créer les nouvelles politiques RLS
-- Politique pour la lecture des usernames (profils publics)
CREATE POLICY "Public usernames are readable" ON user_profiles
  FOR SELECT USING (username IS NOT NULL);

-- Politique pour que les utilisateurs puissent voir leur propre profil complet
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent modifier leur propre profil
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent insérer leur propre profil
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour que les admins puissent tout faire
CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- 9. Fonction pour vérifier l'unicité du username
CREATE OR REPLACE FUNCTION check_username_uniqueness(input_username TEXT, user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  -- Compter les usernames existants (en excluant l'utilisateur actuel si fourni)
  SELECT COUNT(*) INTO existing_count
  FROM user_profiles 
  WHERE username = input_username 
  AND (user_uuid IS NULL OR user_id != user_uuid);
  
  RETURN existing_count = 0;
END;
$$ LANGUAGE plpgsql;

-- 10. Fonction publique pour créer un profil avec username
CREATE OR REPLACE FUNCTION create_user_profile_with_username(
  p_user_id UUID,
  p_full_name TEXT,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Vérifier l'unicité du username si fourni
  IF p_username IS NOT NULL THEN
    IF NOT check_username_uniqueness(p_username) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Username déjà utilisé'
      );
    END IF;
  END IF;
  
  -- Créer le profil
  INSERT INTO user_profiles (user_id, full_name, username, email)
  VALUES (p_user_id, p_full_name, p_username, p_email);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Profil créé avec succès'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Fonction publique pour mettre à jour le username
CREATE OR REPLACE FUNCTION update_user_username(
  p_username TEXT
)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  result JSON;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Non authentifié'
    );
  END IF;
  
  -- Vérifier l'unicité du username
  IF NOT check_username_uniqueness(p_username, current_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Username déjà utilisé'
    );
  END IF;
  
  -- Mettre à jour le username
  UPDATE user_profiles 
  SET username = p_username, updated_at = NOW()
  WHERE user_id = current_user_id;
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Username mis à jour avec succès'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Profil non trouvé'
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Fonction publique pour récupérer un profil par username
CREATE OR REPLACE FUNCTION get_profile_by_username(p_username TEXT)
RETURNS JSON AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Récupérer le profil
  SELECT 
    user_id,
    full_name,
    username,
    avatar_url,
    bio,
    created_at
  INTO profile_record
  FROM user_profiles 
  WHERE username = p_username;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Profil non trouvé'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'profile', row_to_json(profile_record)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Permissions pour les fonctions
GRANT EXECUTE ON FUNCTION create_user_profile_with_username TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_username TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_by_username TO anon, authenticated;

-- 14. Vérification finale
SELECT 'Système de username ajouté avec succès!' as status;
