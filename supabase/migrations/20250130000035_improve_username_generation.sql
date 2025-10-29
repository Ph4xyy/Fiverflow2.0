-- Amélioration de la génération de username pour éviter les conflits
-- Cette migration améliore la fonction handle_new_user pour générer des usernames uniques

-- 1. Créer une fonction pour générer un username unique
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  final_username TEXT;
  counter INTEGER := 0;
  username_exists BOOLEAN;
BEGIN
  -- Nettoyer le username de base (enlever caractères spéciaux, limiter la longueur)
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');
  base_username := left(base_username, 15); -- Limiter à 15 caractères
  
  -- Si le username est vide après nettoyage, utiliser "user"
  IF base_username = '' THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- Vérifier si le username existe déjà
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_profiles 
      WHERE username = final_username
    ) INTO username_exists;
    
    -- Si le username n'existe pas, on peut l'utiliser
    IF NOT username_exists THEN
      EXIT;
    END IF;
    
    -- Sinon, ajouter un numéro
    counter := counter + 1;
    final_username := base_username || counter;
    
    -- Sécurité : éviter les boucles infinies
    IF counter > 999 THEN
      final_username := base_username || extract(epoch from now())::bigint;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- 2. Mettre à jour la fonction handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Générer un username unique
  generated_username := public.generate_unique_username(
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    )
  );
  
  -- Insérer dans user_profiles avec le username généré
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
    generated_username,
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

-- 3. Permissions
GRANT EXECUTE ON FUNCTION public.generate_unique_username(TEXT) TO authenticated;

-- Vérification
SELECT 'Migration amélioration username terminée avec succès!' as status;
