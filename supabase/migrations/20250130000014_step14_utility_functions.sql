-- Etape 14: Fonctions utilitaires pour gérer les abonnements et rôles

-- 1. Fonction pour obtenir l'abonnement actuel d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_current_subscription(user_uuid UUID)
RETURNS TABLE(
  plan_name TEXT,
  plan_display_name TEXT,
  status TEXT,
  billing_cycle TEXT,
  amount DECIMAL,
  currency TEXT,
  end_date TIMESTAMPTZ,
  features JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name,
    sp.display_name,
    us.status,
    us.billing_cycle,
    us.amount,
    us.currency,
    us.end_date,
    sp.features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
  AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$;

-- 2. Fonction pour obtenir les rôles d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE(
  role_name TEXT,
  role_display_name TEXT,
  permissions JSONB,
  assigned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.name,
    sr.display_name,
    sr.permissions,
    ur.assigned_at,
    ur.expires_at
  FROM user_roles ur
  JOIN system_roles sr ON ur.role_id = sr.id
  WHERE ur.user_id = user_uuid
  AND ur.is_active = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
END;
$$;

-- 3. Fonction pour vérifier si un utilisateur a une permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN system_roles sr ON ur.role_id = sr.id
    WHERE ur.user_id = user_uuid
    AND ur.is_active = TRUE
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    AND sr.permissions ? permission_name
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;

-- 4. Fonction pour changer l'abonnement d'un utilisateur
CREATE OR REPLACE FUNCTION change_user_subscription(
  user_uuid UUID,
  new_plan_name TEXT,
  billing_cycle_param TEXT DEFAULT 'monthly'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_id_var UUID;
  plan_price DECIMAL;
  plan_currency TEXT;
BEGIN
  -- Récupérer les informations du plan
  SELECT id, 
         CASE WHEN billing_cycle_param = 'yearly' THEN price_yearly ELSE price_monthly END,
         currency
  INTO plan_id_var, plan_price, plan_currency
  FROM subscription_plans
  WHERE name = new_plan_name AND is_active = TRUE;
  
  IF plan_id_var IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Mettre à jour l'abonnement existant ou en créer un nouveau
  INSERT INTO user_subscriptions (user_id, plan_id, status, billing_cycle, amount, currency, start_date, end_date)
  VALUES (
    user_uuid,
    plan_id_var,
    'active',
    billing_cycle_param,
    plan_price,
    plan_currency,
    NOW(),
    CASE 
      WHEN billing_cycle_param = 'yearly' THEN NOW() + INTERVAL '1 year'
      ELSE NOW() + INTERVAL '1 month'
    END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    status = 'active',
    billing_cycle = EXCLUDED.billing_cycle,
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    updated_at = NOW();
  
  -- Mettre à jour le profil utilisateur
  UPDATE user_profiles 
  SET subscription_plan_id = plan_id_var, updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$;

-- 5. Fonction pour changer le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION change_user_role(
  user_uuid UUID,
  new_role_name TEXT,
  assigned_by_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_id_var UUID;
BEGIN
  -- Récupérer l'ID du rôle
  SELECT id INTO role_id_var
  FROM system_roles
  WHERE name = new_role_name AND is_active = TRUE;
  
  IF role_id_var IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Désactiver les rôles existants
  UPDATE user_roles 
  SET is_active = FALSE, updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Ajouter le nouveau rôle
  INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
  VALUES (user_uuid, role_id_var, assigned_by_uuid, NOW());
  
  -- Mettre à jour le profil utilisateur
  UPDATE user_profiles 
  SET 
    system_role_id = role_id_var,
    is_admin = (new_role_name = 'admin'),
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$;

-- 6. Fonction pour obtenir les statistiques d'abonnement
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE(
  plan_name TEXT,
  plan_display_name TEXT,
  subscriber_count BIGINT,
  total_revenue DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name,
    sp.display_name,
    COUNT(us.id) as subscriber_count,
    COALESCE(SUM(us.amount), 0) as total_revenue
  FROM subscription_plans sp
  LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
  WHERE sp.is_active = TRUE
  GROUP BY sp.id, sp.name, sp.display_name
  ORDER BY sp.price_monthly;
END;
$$;

-- Permissions pour les fonctions
GRANT EXECUTE ON FUNCTION get_user_current_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION change_user_subscription(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION change_user_role(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_stats() TO authenticated;

-- Vérifier que les fonctions ont été créées
SELECT 'Fonctions utilitaires creees avec succes!' as status;
