-- Etape 20: Corriger le conflit de triggers d'inscription
-- Problème: Plusieurs triggers conflictuels pour la création d'utilisateur

-- 1. Supprimer tous les triggers existants pour éviter les conflits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Créer une fonction unifiée et robuste pour la création d'utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  launch_plan_id UUID;
  user_role_id UUID;
  profile_created BOOLEAN := FALSE;
BEGIN
  -- Récupérer l'ID du plan launch (gratuit) - utiliser 'free' si 'launch' n'existe pas
  SELECT id INTO launch_plan_id
  FROM subscription_plans
  WHERE (name = 'launch' OR name = 'free') AND is_active = TRUE
  ORDER BY CASE WHEN name = 'launch' THEN 1 ELSE 2 END
  LIMIT 1;
  
  -- Récupérer l'ID du rôle utilisateur
  SELECT id INTO user_role_id
  FROM system_roles
  WHERE name = 'user' AND is_active = TRUE;
  
  -- Créer le profil utilisateur avec gestion d'erreur robuste
  BEGIN
    INSERT INTO public.user_profiles (
      user_id, 
      full_name, 
      email, 
      subscription_plan_id, 
      system_role_id,
      is_admin,
      is_active
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      launch_plan_id,
      user_role_id,
      FALSE, -- Pas admin par défaut
      TRUE   -- Actif par défaut
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    profile_created := TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log l'erreur mais continuer
      RAISE WARNING 'Erreur lors de la création du profil utilisateur %: %', NEW.id, SQLERRM;
  END;
  
  -- Créer l'abonnement si le plan existe
  IF launch_plan_id IS NOT NULL THEN
    BEGIN
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
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la création de l''abonnement pour l''utilisateur %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  -- Créer le rôle utilisateur si le rôle existe
  IF user_role_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_roles (user_id, role_id, assigned_at)
      VALUES (
        NEW.id,
        user_role_id,
        NOW()
      )
      ON CONFLICT (user_id, role_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la création du rôle pour l''utilisateur %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  -- Si aucun profil n'a pu être créé, créer un profil minimal
  IF NOT profile_created THEN
    BEGIN
      INSERT INTO public.user_profiles (user_id, full_name, is_admin, is_active)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        FALSE,
        TRUE
      )
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la création du profil minimal pour l''utilisateur %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger unique
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier que les tables nécessaires existent
DO $$
BEGIN
  -- Vérifier que la table subscription_plans existe et a des données
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE is_active = TRUE) THEN
    RAISE WARNING 'Aucun plan d''abonnement actif trouvé. Création d''un plan par défaut.';
    
    INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, is_active)
    VALUES ('free', 'Free', 'Plan gratuit par défaut', 0.00, 0.00, TRUE)
    ON CONFLICT (name) DO NOTHING;
  END IF;
  
  -- Vérifier que la table system_roles existe et a des données
  IF NOT EXISTS (SELECT 1 FROM system_roles WHERE name = 'user' AND is_active = TRUE) THEN
    RAISE WARNING 'Aucun rôle utilisateur trouvé. Création d''un rôle par défaut.';
    
    INSERT INTO system_roles (name, display_name, description, permissions, is_active)
    VALUES ('user', 'Utilisateur', 'Utilisateur standard', '["view_dashboard", "manage_own_projects"]'::jsonb, TRUE)
    ON CONFLICT (name) DO NOTHING;
  END IF;
END $$;

-- 5. Tester la fonction avec un utilisateur fictif (optionnel)
-- SELECT 'Trigger de création d''utilisateur corrigé et testé!' as status;

-- 6. Permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Vérification finale
SELECT 
  'Trigger d''inscription corrigé!' as status,
  COUNT(*) as subscription_plans_count
FROM subscription_plans 
WHERE is_active = TRUE;

SELECT 
  'Rôles système disponibles:' as info,
  COUNT(*) as system_roles_count
FROM system_roles 
WHERE is_active = TRUE;
