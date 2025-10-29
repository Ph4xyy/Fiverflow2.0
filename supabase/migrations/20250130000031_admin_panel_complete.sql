-- Migration complète pour le système d'administration
-- Création des tables et colonnes nécessaires pour l'admin panel

-- 1. Table admin_actions_log pour auditer toutes les actions admin
CREATE TABLE IF NOT EXISTS admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  payload JSONB NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table transactions pour le cache des paiements et reporting
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  plan TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ajouter les colonnes manquantes à user_profiles si elles n'existent pas
ALTER TABLE IF EXISTS user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT, -- 'launch'|'boost'|'scale'
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;

-- 4. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan ON user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_id ON transactions(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_admin_user_id ON admin_actions_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_target_user_id ON admin_actions_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_created_at ON admin_actions_log(created_at);

-- 5. RLS Policies pour user_profiles
-- Tout le monde peut voir les champs publics
DROP POLICY IF EXISTS "user_profiles_select_public" ON user_profiles;
CREATE POLICY "user_profiles_select_public" ON user_profiles
  FOR SELECT USING (true);

-- Seul le propriétaire ou un admin peut modifier
DROP POLICY IF EXISTS "user_profiles_update_owner_or_admin" ON user_profiles;
CREATE POLICY "user_profiles_update_owner_or_admin" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- 6. RLS Policies pour transactions
-- Le propriétaire ou les admins peuvent voir les transactions
DROP POLICY IF EXISTS "transactions_select_owner_or_admin" ON transactions;
CREATE POLICY "transactions_select_owner_or_admin" ON transactions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Seuls les admins peuvent insérer des transactions
DROP POLICY IF EXISTS "transactions_insert_admin_only" ON transactions;
CREATE POLICY "transactions_insert_admin_only" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- 7. RLS Policies pour admin_actions_log
-- Seuls les admins peuvent voir et insérer dans les logs
DROP POLICY IF EXISTS "admin_actions_log_select_admin_only" ON admin_actions_log;
CREATE POLICY "admin_actions_log_select_admin_only" ON admin_actions_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "admin_actions_log_insert_admin_only" ON admin_actions_log;
CREATE POLICY "admin_actions_log_insert_admin_only" ON admin_actions_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- 8. Fonction pour logger les actions admin
CREATE OR REPLACE FUNCTION log_admin_action(
  p_target_user_id UUID,
  p_action_type TEXT,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin/moderator
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;

  -- Insérer le log
  INSERT INTO admin_actions_log (admin_user_id, target_user_id, action_type, payload)
  VALUES (auth.uid(), p_target_user_id, p_action_type, p_payload)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- 9. Fonction pour mettre à jour le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_role(
  p_target_user_id UUID,
  p_new_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Vérifier que le nouveau rôle est valide
  IF p_new_role NOT IN ('member', 'moderator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: Must be member, moderator, or admin';
  END IF;

  -- Mettre à jour le rôle
  UPDATE user_profiles 
  SET role = p_new_role
  WHERE user_id = p_target_user_id;

  -- Logger l'action
  SELECT log_admin_action(
    p_target_user_id,
    'role_change',
    jsonb_build_object('new_role', p_new_role, 'old_role', (SELECT role FROM user_profiles WHERE user_id = p_target_user_id))
  ) INTO v_log_id;

  RETURN TRUE;
END;
$$;

-- 10. Fonction pour mettre à jour l'abonnement d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_subscription(
  p_target_user_id UUID,
  p_plan TEXT,
  p_started_at TIMESTAMPTZ DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
  v_old_plan TEXT;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin/moderator
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;

  -- Récupérer l'ancien plan
  SELECT subscription_plan INTO v_old_plan FROM user_profiles WHERE user_id = p_target_user_id;

  -- Mettre à jour l'abonnement
  UPDATE user_profiles 
  SET 
    subscription_plan = p_plan,
    subscription_started_at = COALESCE(p_started_at, subscription_started_at, NOW()),
    subscription_expires_at = COALESCE(p_expires_at, subscription_expires_at)
  WHERE user_id = p_target_user_id;

  -- Logger l'action
  SELECT log_admin_action(
    p_target_user_id,
    'subscription_change',
    jsonb_build_object(
      'new_plan', p_plan,
      'old_plan', v_old_plan,
      'started_at', p_started_at,
      'expires_at', p_expires_at
    )
  ) INTO v_log_id;

  RETURN TRUE;
END;
$$;

-- 11. Vue pour les statistiques admin
CREATE OR REPLACE VIEW admin_stats_view AS
SELECT 
  -- Statistiques utilisateurs
  (SELECT COUNT(*) FROM user_profiles) as total_users,
  (SELECT COUNT(*) FROM user_profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM user_profiles WHERE role = 'moderator') as total_moderators,
  (SELECT COUNT(*) FROM user_profiles WHERE subscription_plan IS NOT NULL) as total_subscribers,
  
  -- Statistiques revenus
  (SELECT COALESCE(SUM(amount_cents), 0) FROM transactions WHERE status = 'completed') as total_revenue_cents,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM transactions WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days') as revenue_last_30_days_cents,
  
  -- Statistiques par plan
  (SELECT COUNT(*) FROM user_profiles WHERE subscription_plan = 'launch') as launch_subscribers,
  (SELECT COUNT(*) FROM user_profiles WHERE subscription_plan = 'boost') as boost_subscribers,
  (SELECT COUNT(*) FROM user_profiles WHERE subscription_plan = 'scale') as scale_subscribers;

-- 12. Fonction pour obtenir les statistiques détaillées
CREATE OR REPLACE FUNCTION get_admin_stats(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date TIMESTAMPTZ := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  v_end_date TIMESTAMPTZ := COALESCE(p_end_date, NOW());
  v_result JSONB;
BEGIN
  -- Vérifier que l'utilisateur actuel est admin/moderator
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;

  SELECT jsonb_build_object(
    'totals', jsonb_build_object(
      'allTimeUsers', (SELECT COUNT(*) FROM user_profiles),
      'newUsersInRange', (SELECT COUNT(*) FROM user_profiles WHERE created_at BETWEEN v_start_date AND v_end_date),
      'totalRevenue', (SELECT COALESCE(SUM(amount_cents), 0) / 100.0 FROM transactions WHERE status = 'completed'),
      'revenueInRange', (SELECT COALESCE(SUM(amount_cents), 0) / 100.0 FROM transactions WHERE status = 'completed' AND created_at BETWEEN v_start_date AND v_end_date),
      'totalClients', (SELECT COUNT(*) FROM clients),
      'totalOrders', (SELECT COUNT(*) FROM orders),
      'totalInvoices', (SELECT COUNT(*) FROM invoices),
      'totalTasks', (SELECT COUNT(*) FROM tasks),
      'totalTimeEntries', (SELECT COUNT(*) FROM time_entries),
      'adminsAllTime', (SELECT COUNT(*) FROM user_profiles WHERE role = 'admin')
    ),
    'plans', jsonb_build_object(
      'free', (SELECT COUNT(*) FROM user_profiles WHERE subscription_plan IS NULL OR subscription_plan = 'free'),
      'pro', (SELECT COUNT(*) FROM user_profiles WHERE subscription_plan IN ('launch', 'boost', 'scale'))
    ),
    'revenue', jsonb_build_object(
      'fromInvoices', (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid'),
      'fromOrders', (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'completed')
    ),
    'subscriptions', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM user_profiles WHERE subscription_plan IS NOT NULL),
      'active', (SELECT COUNT(*) FROM user_profiles WHERE subscription_plan IS NOT NULL AND subscription_expires_at > NOW()),
      'monthlyRevenue', (SELECT COALESCE(SUM(CASE WHEN subscription_plan = 'launch' THEN 29 ELSE 0 END), 0) FROM user_profiles WHERE subscription_plan IS NOT NULL),
      'yearlyRevenue', (SELECT COALESCE(SUM(CASE WHEN subscription_plan = 'launch' THEN 29 * 12 ELSE 0 END), 0) FROM user_profiles WHERE subscription_plan IS NOT NULL)
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 13. Activer RLS sur toutes les tables
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 14. Commentaires pour la documentation
COMMENT ON TABLE admin_actions_log IS 'Log de toutes les actions administratives pour audit et traçabilité';
COMMENT ON TABLE transactions IS 'Cache des transactions Stripe pour reporting et analytics';
COMMENT ON FUNCTION log_admin_action IS 'Fonction sécurisée pour logger les actions admin';
COMMENT ON FUNCTION update_user_role IS 'Fonction sécurisée pour changer le rôle d''un utilisateur';
COMMENT ON FUNCTION update_user_subscription IS 'Fonction sécurisée pour modifier l''abonnement d''un utilisateur';
COMMENT ON FUNCTION get_admin_stats IS 'Fonction pour récupérer les statistiques admin avec filtres de date';
