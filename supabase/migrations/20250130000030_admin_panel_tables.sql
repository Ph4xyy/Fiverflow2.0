-- Migration pour Admin Panel - Tables principales
-- Création des tables pour l'audit, les transactions et l'extension des profils utilisateurs

-- 1. Table admin_actions_log pour auditer toutes les actions admin
CREATE TABLE IF NOT EXISTS admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'role_change', 'subscription_change', 'user_ban', 'user_unban', etc.
  payload JSONB NULL, -- Détails de l'action (ancien/nouveau rôle, montant, etc.)
  ip_address INET NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table transactions pour le cache des paiements et reporting
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  plan TEXT, -- 'lunch', 'boost', 'scale'
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  payment_method TEXT, -- 'card', 'bank_transfer', 'manual'
  description TEXT,
  metadata JSONB NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Extension de la table user_profiles avec les colonnes manquantes
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT, -- 'lunch', 'boost', 'scale'
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- 4. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_admin_user_id ON admin_actions_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_target_user_id ON admin_actions_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_action_type ON admin_actions_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_created_at ON admin_actions_log(created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_id ON transactions(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_plan ON transactions(plan);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(lower(username));
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan ON user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_banned ON user_profiles(is_banned);

-- 5. RLS (Row Level Security)
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour admin_actions_log (seuls les admins peuvent voir/insérer)
CREATE POLICY "Admins can view admin actions log" ON admin_actions_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR is_admin = TRUE)
    )
  );

CREATE POLICY "Admins can insert admin actions log" ON admin_actions_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR is_admin = TRUE)
    )
  );

-- Politiques RLS pour transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR is_admin = TRUE)
    )
  );

CREATE POLICY "System can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true); -- Les webhooks Stripe peuvent insérer

-- 6. Fonction pour logger les actions admin
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_user_id UUID,
  p_target_user_id UUID,
  p_action_type TEXT,
  p_payload JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_id UUID;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = p_admin_user_id 
    AND (role = 'admin' OR is_admin = TRUE)
  ) THEN
    RAISE EXCEPTION 'User is not authorized to perform admin actions';
  END IF;

  -- Insérer l'action
  INSERT INTO admin_actions_log (
    admin_user_id,
    target_user_id,
    action_type,
    payload,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_user_id,
    p_target_user_id,
    p_action_type,
    p_payload,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO action_id;

  RETURN action_id;
END;
$$;

-- 7. Fonction pour obtenir les statistiques admin
CREATE OR REPLACE FUNCTION get_admin_stats(
  p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR is_admin = TRUE)
  ) THEN
    RAISE EXCEPTION 'User is not authorized to view admin stats';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM user_profiles),
    'active_users', (SELECT COUNT(*) FROM user_profiles WHERE is_active = TRUE),
    'banned_users', (SELECT COUNT(*) FROM user_profiles WHERE is_banned = TRUE),
    'total_revenue', (
      SELECT COALESCE(SUM(amount_cents), 0) / 100.0 
      FROM transactions 
      WHERE status = 'completed' 
      AND created_at BETWEEN p_start_date AND p_end_date
    ),
    'revenue_by_plan', (
      SELECT jsonb_object_agg(
        COALESCE(plan, 'unknown'), 
        COALESCE(SUM(amount_cents), 0) / 100.0
      )
      FROM transactions 
      WHERE status = 'completed' 
      AND created_at BETWEEN p_start_date AND p_end_date
      GROUP BY plan
    ),
    'new_users_last_7_days', (
      SELECT COUNT(*) 
      FROM user_profiles 
      WHERE created_at >= (NOW() - INTERVAL '7 days')
    ),
    'subscription_distribution', (
      SELECT jsonb_object_agg(
        COALESCE(subscription_plan, 'none'), 
        COUNT(*)
      )
      FROM user_profiles 
      WHERE is_active = TRUE
      GROUP BY subscription_plan
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 8. Trigger pour mettre à jour updated_at sur transactions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Fonction pour synchroniser les données Stripe
CREATE OR REPLACE FUNCTION sync_stripe_transaction(
  p_user_id UUID,
  p_stripe_payment_id TEXT,
  p_stripe_customer_id TEXT,
  p_amount_cents INTEGER,
  p_currency TEXT DEFAULT 'usd',
  p_plan TEXT,
  p_status TEXT DEFAULT 'completed',
  p_payment_method TEXT DEFAULT 'card',
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id UUID;
BEGIN
  -- Insérer ou mettre à jour la transaction
  INSERT INTO transactions (
    user_id,
    stripe_payment_id,
    stripe_customer_id,
    amount_cents,
    currency,
    plan,
    status,
    payment_method,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_stripe_payment_id,
    p_stripe_customer_id,
    p_amount_cents,
    p_currency,
    p_plan,
    p_status,
    p_payment_method,
    p_description,
    p_metadata
  )
  ON CONFLICT (stripe_payment_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW()
  RETURNING id INTO transaction_id;

  -- Mettre à jour le total_spent de l'utilisateur si la transaction est complétée
  IF p_status = 'completed' THEN
    UPDATE user_profiles 
    SET total_spent = total_spent + (p_amount_cents / 100.0)
    WHERE user_id = p_user_id;
  END IF;

  RETURN transaction_id;
END;
$$;

