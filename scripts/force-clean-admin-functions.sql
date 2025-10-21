-- Script pour forcer le nettoyage et créer les fonctions admin
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer TOUTES les fonctions existantes de manière agressive
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Supprimer toutes les fonctions promote_user_to_admin
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'promote_user_to_admin'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.argtypes || ') CASCADE';
    END LOOP;
    
    -- Supprimer toutes les fonctions demote_admin_to_user
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'demote_admin_to_user'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- 2. Vérifier que toutes les fonctions sont supprimées
SELECT 
    'Fonctions supprimées:' as status,
    COUNT(*) as remaining_functions
FROM pg_proc 
WHERE proname IN ('promote_user_to_admin', 'demote_admin_to_user');

-- 3. Créer la fonction promote_user_to_admin
CREATE FUNCTION promote_user_to_admin(
  target_user_id UUID,
  promoted_by_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  target_user_exists BOOLEAN;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  current_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Non authentifié'
    );
  END IF;
  
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = current_user_id AND is_admin = TRUE
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Permissions insuffisantes. Seuls les admins peuvent promouvoir des utilisateurs.'
    );
  END IF;
  
  -- Vérifier que l'utilisateur cible existe
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = target_user_id
  ) INTO target_user_exists;
  
  IF NOT target_user_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Utilisateur non trouvé'
    );
  END IF;
  
  -- Promouvoir l'utilisateur
  UPDATE user_profiles 
  SET 
    is_admin = TRUE,
    is_active = TRUE,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Vérifier que la promotion a réussi
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Utilisateur promu admin avec succès',
      'user_id', target_user_id
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Échec de la promotion'
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la promotion: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer la fonction demote_admin_to_user
CREATE FUNCTION demote_admin_to_user(
  target_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  target_user_exists BOOLEAN;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  current_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Non authentifié'
    );
  END IF;
  
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = current_user_id AND is_admin = TRUE
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Permissions insuffisantes. Seuls les admins peuvent rétrograder des utilisateurs.'
    );
  END IF;
  
  -- Empêcher l'auto-rétrogradation
  IF current_user_id = target_user_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Vous ne pouvez pas vous rétrograder vous-même'
    );
  END IF;
  
  -- Vérifier que l'utilisateur cible existe
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = target_user_id
  ) INTO target_user_exists;
  
  IF NOT target_user_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Utilisateur non trouvé'
    );
  END IF;
  
  -- Rétrograder l'utilisateur
  UPDATE user_profiles 
  SET 
    is_admin = FALSE,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  
  -- Vérifier que la rétrogradation a réussi
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Admin rétrogradé en utilisateur avec succès',
      'user_id', target_user_id
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Échec de la rétrogradation'
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la rétrogradation: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Donner les permissions aux fonctions
GRANT EXECUTE ON FUNCTION promote_user_to_admin TO authenticated;
GRANT EXECUTE ON FUNCTION demote_admin_to_user TO authenticated;

-- 6. Vérifier que les fonctions sont créées
SELECT 
  'Fonctions admin créées avec succès!' as status,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('promote_user_to_admin', 'demote_admin_to_user')
AND routine_schema = 'public';

-- 7. Test de la fonction (optionnel)
-- SELECT promote_user_to_admin('USER_ID_DE_TON_AMI'::UUID);
