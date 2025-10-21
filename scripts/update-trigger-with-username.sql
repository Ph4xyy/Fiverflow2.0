-- Script pour mettre à jour le trigger handle_new_user avec support du username
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Créer la nouvelle fonction handle_new_user avec support du username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  launch_plan_id UUID;
  user_role_id UUID;
  user_username TEXT;
BEGIN
  -- Récupérer l'ID du plan launch (gratuit)
  SELECT id INTO launch_plan_id
  FROM subscription_plans
  WHERE name = 'launch' AND is_active = TRUE;
  
  -- Récupérer l'ID du rôle utilisateur
  SELECT id INTO user_role_id
  FROM system_roles
  WHERE name = 'user' AND is_active = TRUE;
  
  -- Extraire le username des métadonnées
  user_username := NEW.raw_user_meta_data->>'username';
  
  -- Normaliser le username s'il est fourni
  IF user_username IS NOT NULL THEN
    user_username := normalize_username(user_username);
    
    -- Vérifier la validité du username
    IF NOT validate_username(user_username) THEN
      RAISE WARNING 'Username invalide fourni: %', user_username;
      user_username := NULL;
    END IF;
    
    -- Vérifier l'unicité du username
    IF user_username IS NOT NULL AND NOT check_username_uniqueness(user_username) THEN
      RAISE WARNING 'Username déjà utilisé: %', user_username;
      user_username := NULL;
    END IF;
  END IF;
  
  -- Créer le profil utilisateur avec username
  INSERT INTO public.user_profiles (user_id, full_name, email, username, subscription_plan_id, system_role_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    user_username,
    launch_plan_id,
    user_role_id
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Créer l'abonnement launch (gratuit)
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas bloquer l'inscription
    RAISE WARNING 'Erreur lors de la création du profil avec username: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier que le trigger a été mis à jour
SELECT 'Trigger mis à jour avec support du username!' as status;
