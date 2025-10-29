-- Migration pour améliorer le système de profil
-- Ajout des champs manquants pour les photos, statut et informations de contact

-- Ajouter les colonnes manquantes à user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS professional_title TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'do_not_disturb')),
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS discord_username TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);

-- Fonction pour valider les URLs
CREATE OR REPLACE FUNCTION validate_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF url IS NULL OR url = '' THEN
    RETURN TRUE;
  END IF;
  
  RETURN url ~* '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ LANGUAGE plpgsql;

-- Contraintes de validation
ALTER TABLE user_profiles 
ADD CONSTRAINT check_website_url CHECK (validate_url(website)),
ADD CONSTRAINT check_github_url CHECK (validate_url(github_url)),
ADD CONSTRAINT check_twitter_url CHECK (validate_url(twitter_url)),
ADD CONSTRAINT check_linkedin_url CHECK (validate_url(linkedin_url));

-- Fonction pour mettre à jour le statut
CREATE OR REPLACE FUNCTION update_user_status(
  user_uuid UUID,
  new_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur existe et que le statut est valide
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid) THEN
    RETURN FALSE;
  END IF;
  
  IF new_status NOT IN ('available', 'busy', 'away', 'do_not_disturb') THEN
    RETURN FALSE;
  END IF;
  
  -- Mettre à jour le statut
  UPDATE user_profiles 
  SET status = new_status, updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour les paramètres de confidentialité
CREATE OR REPLACE FUNCTION update_privacy_settings(
  user_uuid UUID,
  show_email_setting BOOLEAN,
  show_phone_setting BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid) THEN
    RETURN FALSE;
  END IF;
  
  -- Mettre à jour les paramètres de confidentialité
  UPDATE user_profiles 
  SET 
    show_email = show_email_setting,
    show_phone = show_phone_setting,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour uploader une image de profil
CREATE OR REPLACE FUNCTION upload_profile_image(
  user_uuid UUID,
  image_type TEXT, -- 'avatar' ou 'banner'
  image_url TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = user_uuid) THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier le type d'image
  IF image_type NOT IN ('avatar', 'banner') THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier que l'URL est valide
  IF NOT validate_url(image_url) THEN
    RETURN FALSE;
  END IF;
  
  -- Mettre à jour l'image appropriée
  IF image_type = 'avatar' THEN
    UPDATE user_profiles 
    SET avatar_url = image_url, updated_at = NOW()
    WHERE user_id = user_uuid;
  ELSE
    UPDATE user_profiles 
    SET banner_url = image_url, updated_at = NOW()
    WHERE user_id = user_uuid;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION update_user_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_privacy_settings(UUID, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION upload_profile_image(UUID, TEXT, TEXT) TO authenticated;

-- Vérifier que les modifications sont appliquées
SELECT 'Migration profile enhancements terminée avec succès!' as status;
