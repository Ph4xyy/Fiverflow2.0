-- Etape 12: Système complet de rôles et d'abonnements
-- Créer les tables pour gérer les abonnements et les rôles

-- 1. Table des plans d'abonnement
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'launch', 'boost', 'scale'
  display_name TEXT NOT NULL, -- 'Free', 'Launch', 'Boost', 'Scale'
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Limites et fonctionnalités
  max_projects INTEGER DEFAULT 1,
  max_clients INTEGER DEFAULT 5,
  max_storage_gb INTEGER DEFAULT 1,
  max_team_members INTEGER DEFAULT 1,
  
  -- Fonctionnalités incluses
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Statut
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des abonnements utilisateurs
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Détails de l'abonnement
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
  
  -- Dates importantes
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Informations de facturation
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id),
  CONSTRAINT user_subscriptions_status_check CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  CONSTRAINT user_subscriptions_billing_cycle_check CHECK (billing_cycle IN ('monthly', 'yearly'))
);

-- 3. Table des rôles système
CREATE TABLE system_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'user', 'admin', 'moderator', 'support'
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Permissions
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Statut
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des rôles utilisateurs
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES system_roles(id),
  
  -- Détails du rôle
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Statut
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role_id)
);

-- Index pour les performances
CREATE INDEX idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_end_date ON user_subscriptions(end_date);

CREATE INDEX idx_system_roles_name ON system_roles(name);
CREATE INDEX idx_system_roles_active ON system_roles(is_active);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- RLS (Row Level Security)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour subscription_plans (lecture publique)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = TRUE);

-- Politiques RLS pour user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Politiques RLS pour system_roles (lecture publique)
CREATE POLICY "Anyone can view system roles" ON system_roles
  FOR SELECT USING (is_active = TRUE);

-- Politiques RLS pour user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Triggers pour updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_roles_updated_at
  BEFORE UPDATE ON system_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON subscription_plans TO authenticated;
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON system_roles TO authenticated;
GRANT ALL ON user_roles TO authenticated;

-- Vérifier que les tables ont été créées
SELECT 'Systeme de roles et d abonnements cree avec succes!' as status;
