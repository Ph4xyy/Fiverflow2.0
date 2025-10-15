/*
  # Fix Subscription System and Role Management
  
  PROBLÈMES IDENTIFIÉS:
  1. Les abonnements ne sont pas connectés aux rôles utilisateurs
  2. Multiple systèmes d'abonnements non synchronisés
  3. is_pro ne reflète pas les vrais abonnements
  4. Les rôles ne donnent pas les bonnes permissions
  5. Pas de système de plans cohérent
  
  SOLUTIONS:
  1. Créer une table user_subscriptions pour les abonnements de la plateforme
  2. Connecter les rôles aux abonnements
  3. Synchroniser is_pro avec les vrais abonnements
  4. Créer des fonctions pour gérer les permissions
  5. Ajouter des triggers pour maintenir la cohérence
*/

-- 1. Créer une table pour les abonnements de la plateforme
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL CHECK (plan_name IN ('free', 'trial', 'pro', 'excellence')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT user_subscriptions_end_date_check CHECK (end_date IS NULL OR end_date > start_date),
  CONSTRAINT user_subscriptions_price_check CHECK (price_monthly >= 0 AND price_yearly >= 0)
);

-- 2. Ajouter des colonnes manquantes à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_plan VARCHAR(50) DEFAULT 'free' CHECK (current_plan IN ('free', 'trial', 'pro', 'excellence'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;

-- 3. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_name ON user_subscriptions(plan_name);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON user_subscriptions(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_users_current_plan ON users(current_plan);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- 4. Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS pour user_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own subscriptions"
  ON user_subscriptions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 6. Politiques admin pour user_subscriptions
CREATE POLICY "Admins can view all user subscriptions"
  ON user_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Fonction pour synchroniser is_pro avec current_plan
CREATE OR REPLACE FUNCTION sync_user_pro_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour is_pro basé sur current_plan
  NEW.is_pro = (NEW.current_plan IN ('pro', 'excellence'));
  
  -- Mettre à jour subscription_status si nécessaire
  IF NEW.current_plan = 'free' THEN
    NEW.subscription_status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger pour synchroniser is_pro
CREATE TRIGGER sync_user_pro_status_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_pro_status();

-- 9. Fonction pour obtenir le plan actif d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_active_plan(target_user_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  active_plan VARCHAR(50);
BEGIN
  -- Vérifier d'abord dans user_subscriptions
  SELECT plan_name INTO active_plan
  FROM user_subscriptions
  WHERE user_id = target_user_id 
    AND status = 'active' 
    AND (end_date IS NULL OR end_date > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Si pas d'abonnement actif, retourner le plan de base
  IF active_plan IS NULL THEN
    SELECT current_plan INTO active_plan
    FROM users
    WHERE id = target_user_id;
  END IF;
  
  RETURN COALESCE(active_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Fonction pour vérifier si un utilisateur a un plan spécifique
CREATE OR REPLACE FUNCTION user_has_plan(target_user_id UUID, required_plan VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
  user_plan VARCHAR(50);
BEGIN
  user_plan := get_user_active_plan(target_user_id);
  
  -- Logique de hiérarchie des plans
  CASE required_plan
    WHEN 'free' THEN RETURN TRUE; -- Tout le monde a au moins free
    WHEN 'trial' THEN RETURN user_plan IN ('trial', 'pro', 'excellence');
    WHEN 'pro' THEN RETURN user_plan IN ('pro', 'excellence');
    WHEN 'excellence' THEN RETURN user_plan = 'excellence';
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Fonction pour obtenir les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_permissions(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  user_role TEXT;
  user_plan VARCHAR(50);
  permissions JSON;
BEGIN
  -- Récupérer le rôle et le plan
  SELECT role, get_user_active_plan(target_user_id) INTO user_role, user_plan
  FROM users
  WHERE id = target_user_id;
  
  -- Définir les permissions basées sur le rôle et le plan
  permissions := json_build_object(
    'role', COALESCE(user_role, 'user'),
    'plan', COALESCE(user_plan, 'free'),
    'can_access_admin', (user_role = 'admin'),
    'can_create_invoices', user_has_plan(target_user_id, 'pro'),
    'can_create_templates', user_has_plan(target_user_id, 'trial'),
    'can_export_data', user_has_plan(target_user_id, 'pro'),
    'can_manage_clients', TRUE, -- Tous les utilisateurs peuvent gérer leurs clients
    'can_manage_tasks', TRUE, -- Tous les utilisateurs peuvent gérer leurs tâches
    'max_invoices_per_month', CASE user_plan 
      WHEN 'free' THEN 3
      WHEN 'trial' THEN 10
      WHEN 'pro' THEN 100
      WHEN 'excellence' THEN -1 -- Illimité
      ELSE 3
    END,
    'max_clients', CASE user_plan 
      WHEN 'free' THEN 5
      WHEN 'trial' THEN 20
      WHEN 'pro' THEN 100
      WHEN 'excellence' THEN -1 -- Illimité
      ELSE 5
    END
  );
  
  RETURN permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Fonction pour créer/mettre à jour un abonnement utilisateur
CREATE OR REPLACE FUNCTION set_user_subscription(
  target_user_id UUID,
  plan_name VARCHAR(50),
  duration_months INTEGER DEFAULT NULL,
  stripe_subscription_id TEXT DEFAULT NULL,
  stripe_customer_id TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  end_date TIMESTAMPTZ;
  price_monthly DECIMAL(10,2);
  price_yearly DECIMAL(10,2);
  result JSON;
BEGIN
  -- Calculer la date de fin si une durée est fournie
  IF duration_months IS NOT NULL THEN
    end_date := NOW() + (duration_months || ' months')::INTERVAL;
  END IF;
  
  -- Définir les prix selon le plan
  CASE plan_name
    WHEN 'free' THEN
      price_monthly := 0;
      price_yearly := 0;
    WHEN 'trial' THEN
      price_monthly := 0;
      price_yearly := 0;
    WHEN 'pro' THEN
      price_monthly := 29.99;
      price_yearly := 299.99;
    WHEN 'excellence' THEN
      price_monthly := 99.99;
      price_yearly := 999.99;
    ELSE
      price_monthly := 0;
      price_yearly := 0;
  END CASE;
  
  -- Désactiver les abonnements existants
  UPDATE user_subscriptions
  SET status = 'inactive', updated_at = NOW()
  WHERE user_id = target_user_id AND status = 'active';
  
  -- Créer le nouvel abonnement
  INSERT INTO user_subscriptions (
    user_id, plan_name, status, start_date, end_date,
    price_monthly, price_yearly, stripe_subscription_id, stripe_customer_id
  ) VALUES (
    target_user_id, plan_name, 'active', NOW(), end_date,
    price_monthly, price_yearly, stripe_subscription_id, stripe_customer_id
  );
  
  -- Mettre à jour la table users
  UPDATE users
  SET 
    current_plan = plan_name,
    subscription_status = 'active',
    updated_at = NOW()
  WHERE id = target_user_id;
  
  result := json_build_object(
    'success', TRUE,
    'plan', plan_name,
    'end_date', end_date,
    'price_monthly', price_monthly,
    'price_yearly', price_yearly
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Fonction pour obtenir les statistiques admin complètes
CREATE OR REPLACE FUNCTION get_complete_admin_stats(
  start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Vérifier si l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'users', json_build_object(
      'total', (SELECT COUNT(*) FROM users),
      'admins', (SELECT COUNT(*) FROM users WHERE role = 'admin'),
      'new_period', (SELECT COUNT(*) FROM users WHERE created_at >= start_date AND created_at <= end_date)
    ),
    'plans', json_build_object(
      'free', (SELECT COUNT(*) FROM users WHERE current_plan = 'free'),
      'trial', (SELECT COUNT(*) FROM users WHERE current_plan = 'trial'),
      'pro', (SELECT COUNT(*) FROM users WHERE current_plan = 'pro'),
      'excellence', (SELECT COUNT(*) FROM users WHERE current_plan = 'excellence')
    ),
    'subscriptions', json_build_object(
      'total', (SELECT COUNT(*) FROM user_subscriptions),
      'active', (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active'),
      'monthly_revenue', COALESCE((
        SELECT SUM(price_monthly) 
        FROM user_subscriptions 
        WHERE status = 'active' AND plan_name IN ('pro', 'excellence')
      ), 0),
      'yearly_revenue', COALESCE((
        SELECT SUM(price_yearly) 
        FROM user_subscriptions 
        WHERE status = 'active' AND plan_name IN ('pro', 'excellence')
      ), 0)
    ),
    'revenue', json_build_object(
      'orders', COALESCE((SELECT SUM(amount) FROM orders), 0),
      'invoices', COALESCE((SELECT SUM(total) FROM invoices), 0),
      'subscriptions', COALESCE((
        SELECT SUM(price_monthly) 
        FROM user_subscriptions 
        WHERE status = 'active'
      ), 0)
    ),
    'clients', (SELECT COUNT(*) FROM clients),
    'orders', (SELECT COUNT(*) FROM orders),
    'invoices', (SELECT COUNT(*) FROM invoices),
    'tasks', (SELECT COUNT(*) FROM tasks),
    'time_entries', (SELECT COUNT(*) FROM time_entries)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION get_user_active_plan(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_plan(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_subscription(UUID, VARCHAR, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_complete_admin_stats(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- 15. Mettre à jour les utilisateurs existants pour avoir un plan cohérent
UPDATE users 
SET 
  current_plan = CASE 
    WHEN is_pro = TRUE THEN 'pro'
    ELSE 'free'
  END,
  subscription_status = 'active'
WHERE current_plan IS NULL OR current_plan = '';

-- 16. Créer des abonnements pour les utilisateurs existants qui ont is_pro = true
INSERT INTO user_subscriptions (user_id, plan_name, status, price_monthly, price_yearly)
SELECT 
  id,
  CASE 
    WHEN is_pro = TRUE THEN 'pro'
    ELSE 'free'
  END,
  'active',
  CASE 
    WHEN is_pro = TRUE THEN 29.99
    ELSE 0
  END,
  CASE 
    WHEN is_pro = TRUE THEN 299.99
    ELSE 0
  END
FROM users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions);

-- 17. Commentaires pour la documentation
COMMENT ON TABLE user_subscriptions IS 'Gestion des abonnements utilisateurs à la plateforme';
COMMENT ON COLUMN users.current_plan IS 'Plan actuel de l''utilisateur (free, trial, pro, excellence)';
COMMENT ON COLUMN users.subscription_status IS 'Statut de l''abonnement (active, inactive, cancelled, expired)';
COMMENT ON FUNCTION get_user_active_plan(UUID) IS 'Retourne le plan actif d''un utilisateur';
COMMENT ON FUNCTION user_has_plan(UUID, VARCHAR) IS 'Vérifie si un utilisateur a un plan spécifique ou supérieur';
COMMENT ON FUNCTION get_user_permissions(UUID) IS 'Retourne toutes les permissions d''un utilisateur';
COMMENT ON FUNCTION set_user_subscription(UUID, VARCHAR, INTEGER, TEXT, TEXT) IS 'Crée ou met à jour un abonnement utilisateur';
COMMENT ON FUNCTION get_complete_admin_stats(TIMESTAMPTZ, TIMESTAMPTZ) IS 'Retourne toutes les statistiques admin';
