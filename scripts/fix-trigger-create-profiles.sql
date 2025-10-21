-- Script pour réparer le trigger de création automatique des profils
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Créer une nouvelle fonction handle_new_user simplifiée
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  launch_plan_id UUID;
  user_role_id UUID;
BEGIN
  -- Récupérer l'ID du plan launch (gratuit)
  SELECT id INTO launch_plan_id
  FROM subscription_plans
  WHERE name = 'launch' AND is_active = TRUE;
  
  -- Récupérer l'ID du rôle utilisateur
  SELECT id INTO user_role_id
  FROM system_roles
  WHERE name = 'user' AND is_active = TRUE;
  
  -- Créer le profil utilisateur (sans username pour l'instant)
  INSERT INTO public.user_profiles (
    user_id, 
    full_name, 
    email, 
    is_admin, 
    is_active,
    subscription_plan_id, 
    system_role_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    FALSE, -- Pas admin par défaut
    TRUE,  -- Actif par défaut
    launch_plan_id,
    user_role_id
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Créer l'abonnement launch (gratuit) si le plan existe
  IF launch_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status, billing_cycle, amount, currency)
    VALUES (
      NEW.id,
      launch_plan_id,
      'active',
      'monthly',
      0.00,
      'USD'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Créer le rôle utilisateur si le rôle existe
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas bloquer l'inscription
    RAISE WARNING 'Erreur lors de la création du profil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier que le trigger est créé
SELECT 
  'Trigger de création de profil réparé!' as status,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_name = 'on_auth_user_created';

-- 5. Test : Vérifier que tous les utilisateurs ont maintenant un profil
SELECT 
  'Vérification finale:' as info,
  COUNT(DISTINCT au.id) as total_auth_users,
  COUNT(DISTINCT up.user_id) as total_profiles,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT up.user_id) as missing_profiles
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id;
