-- Migration pour gérer les utilisateurs OAuth avec username unique
-- Cette migration met à jour le système pour gérer correctement les utilisateurs OAuth

-- 1. Ajouter les colonnes manquantes à user_profiles si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter la colonne email si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Ajouter la colonne username si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'username') THEN
        ALTER TABLE user_profiles ADD COLUMN username TEXT UNIQUE;
    END IF;
    
    -- Ajouter la colonne subscription si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'subscription') THEN
        ALTER TABLE user_profiles ADD COLUMN subscription TEXT DEFAULT 'Lunch';
    END IF;
    
    -- Ajouter la colonne role si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'member';
    END IF;
END $$;

-- 2. Créer la fonction handle_new_user selon les spécifications
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans user_profiles avec les colonnes spécifiées
  INSERT INTO public.user_profiles (
    id, 
    email, 
    username, 
    subscription, 
    role, 
    created_at,
    user_id,
    full_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1), -- Username par défaut basé sur l'email
    'Lunch',
    'member',
    NOW(),
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Créer une fonction pour vérifier la disponibilité d'un username
CREATE OR REPLACE FUNCTION public.check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_exists BOOLEAN;
BEGIN
  -- Vérifier si le username existe déjà
  SELECT EXISTS(
    SELECT 1 FROM user_profiles 
    WHERE username = username_to_check
  ) INTO username_exists;
  
  RETURN NOT username_exists;
END;
$$;

-- 5. Créer une fonction pour mettre à jour le username d'un utilisateur
CREATE OR REPLACE FUNCTION public.update_user_username(
  user_uuid UUID,
  new_username TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_available BOOLEAN;
BEGIN
  -- Vérifier la disponibilité du username
  SELECT public.check_username_availability(new_username) INTO username_available;
  
  IF NOT username_available THEN
    RETURN FALSE;
  END IF;
  
  -- Mettre à jour le username
  UPDATE user_profiles 
  SET 
    username = new_username,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$;

-- 6. Permissions
GRANT EXECUTE ON FUNCTION public.check_username_availability(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_username(UUID, TEXT) TO authenticated;

-- 7. Index pour optimiser les recherches de username
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 8. Contrainte d'unicité pour username (si elle n'existe pas déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_username_unique'
    ) THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_unique UNIQUE (username);
    END IF;
END $$;

-- Vérification
SELECT 'Migration OAuth user handling terminée avec succès!' as status;
