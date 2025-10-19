-- Etape 17: Corriger le trigger pour utiliser le plan 'launch' au lieu de 'free'

-- Supprimer d'abord le trigger, puis la fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
  
  -- Créer le profil utilisateur
  INSERT INTO public.user_profiles (user_id, full_name, email, subscription_plan_id, system_role_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Vérifier que le trigger a été corrigé
SELECT 'Trigger corrige pour utiliser le plan launch!' as status;
