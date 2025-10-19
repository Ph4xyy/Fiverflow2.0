-- Etape 15: Trigger automatique pour créer abonnements et rôles lors de l'inscription

-- 1. Modifier la fonction handle_new_user pour inclure les abonnements et rôles
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
  user_role_id UUID;
BEGIN
  -- Récupérer l'ID du plan gratuit
  SELECT id INTO free_plan_id
  FROM subscription_plans
  WHERE name = 'free' AND is_active = TRUE;
  
  -- Récupérer l'ID du rôle utilisateur
  SELECT id INTO user_role_id
  FROM system_roles
  WHERE name = 'user' AND is_active = TRUE;
  
  -- Créer le profil utilisateur
  INSERT INTO public.user_profiles (user_id, full_name, email, subscription_plan_id, system_role_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    free_plan_id,
    user_role_id
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Créer l'abonnement gratuit
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status, billing_cycle, amount, currency)
    VALUES (
      NEW.id,
      free_plan_id,
      'active',
      'monthly',
      0.00,
      'USD'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Créer le rôle utilisateur
  IF user_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, assigned_at)
    VALUES (
      NEW.id,
      user_role_id,
      NOW()
    )
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Fonction pour promouvoir un utilisateur en admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_uuid UUID, promoted_by_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Récupérer l'ID du rôle admin
  SELECT id INTO admin_role_id
  FROM system_roles
  WHERE name = 'admin' AND is_active = TRUE;
  
  IF admin_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Désactiver les rôles existants
  UPDATE user_roles 
  SET is_active = FALSE, updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Ajouter le rôle admin
  INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
  VALUES (user_uuid, admin_role_id, promoted_by_uuid, NOW())
  ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = TRUE,
    assigned_by = promoted_by_uuid,
    assigned_at = NOW(),
    updated_at = NOW();
  
  -- Mettre à jour le profil utilisateur
  UPDATE user_profiles 
  SET 
    system_role_id = admin_role_id,
    is_admin = TRUE,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$;

-- 4. Fonction pour rétrograder un admin en utilisateur normal
CREATE OR REPLACE FUNCTION demote_admin_to_user(user_uuid UUID, demoted_by_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_id UUID;
BEGIN
  -- Récupérer l'ID du rôle utilisateur
  SELECT id INTO user_role_id
  FROM system_roles
  WHERE name = 'user' AND is_active = TRUE;
  
  IF user_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Désactiver les rôles existants
  UPDATE user_roles 
  SET is_active = FALSE, updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Ajouter le rôle utilisateur
  INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
  VALUES (user_uuid, user_role_id, demoted_by_uuid, NOW())
  ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = TRUE,
    assigned_by = demoted_by_uuid,
    assigned_at = NOW(),
    updated_at = NOW();
  
  -- Mettre à jour le profil utilisateur
  UPDATE user_profiles 
  SET 
    system_role_id = user_role_id,
    is_admin = FALSE,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$;

-- Permissions pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION promote_user_to_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_admin_to_user(UUID, UUID) TO authenticated;

-- Vérifier que les fonctions ont été créées
SELECT 'Triggers et fonctions d administration crees avec succes!' as status;
