-- Etape 13: Données initiales pour les plans d'abonnement et rôles

-- 1. Insérer les plans d'abonnement
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, max_projects, max_clients, max_storage_gb, max_team_members, features) VALUES
('free', 'Free', 'Plan gratuit pour commencer', 0.00, 0.00, 1, 5, 1, 1, '["basic_support", "standard_templates"]'::jsonb),
('launch', 'Launch', 'Parfait pour les freelancers', 29.00, 290.00, 5, 25, 10, 1, '["priority_support", "premium_templates", "analytics", "custom_branding"]'::jsonb),
('boost', 'Boost', 'Idéal pour les petites équipes', 79.00, 790.00, 15, 100, 50, 5, '["priority_support", "premium_templates", "analytics", "custom_branding", "team_collaboration", "advanced_automation"]'::jsonb),
('scale', 'Scale', 'Pour les entreprises en croissance', 199.00, 1990.00, 50, 500, 200, 20, '["dedicated_support", "premium_templates", "analytics", "custom_branding", "team_collaboration", "advanced_automation", "api_access", "white_label"]'::jsonb);

-- 2. Insérer les rôles système
INSERT INTO system_roles (name, display_name, description, permissions) VALUES
('user', 'Utilisateur', 'Utilisateur standard de la plateforme', '["view_dashboard", "manage_own_projects", "manage_own_clients"]'::jsonb),
('admin', 'Administrateur', 'Administrateur avec accès complet', '["view_dashboard", "manage_own_projects", "manage_own_clients", "manage_all_users", "view_analytics", "manage_system_settings"]'::jsonb),
('moderator', 'Modérateur', 'Modérateur avec permissions limitées', '["view_dashboard", "manage_own_projects", "manage_own_clients", "moderate_content", "view_user_analytics"]'::jsonb),
('support', 'Support', 'Équipe de support client', '["view_dashboard", "view_user_issues", "manage_support_tickets", "view_user_analytics"]'::jsonb);

-- 3. Créer des abonnements par défaut pour les utilisateurs existants
INSERT INTO user_subscriptions (user_id, plan_id, status, billing_cycle, amount, currency)
SELECT 
  up.user_id,
  sp.id,
  'active',
  'monthly',
  sp.price_monthly,
  sp.currency
FROM user_profiles up
CROSS JOIN subscription_plans sp
WHERE sp.name = 'free'
AND NOT EXISTS (
  SELECT 1 FROM user_subscriptions us 
  WHERE us.user_id = up.user_id
);

-- 4. Créer des rôles par défaut pour les utilisateurs existants
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT 
  up.user_id,
  CASE 
    WHEN up.is_admin = TRUE THEN sr.id
    ELSE (SELECT id FROM system_roles WHERE name = 'user')
  END,
  NOW()
FROM user_profiles up
CROSS JOIN system_roles sr
WHERE (up.is_admin = TRUE AND sr.name = 'admin') 
   OR (up.is_admin = FALSE AND sr.name = 'user')
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = up.user_id
);

-- 5. Mettre à jour la table user_profiles pour inclure les nouvelles colonnes
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS system_role_id UUID REFERENCES system_roles(id);

-- 6. Mettre à jour les profils existants avec les nouvelles références
UPDATE user_profiles 
SET 
  subscription_plan_id = (SELECT id FROM subscription_plans WHERE name = 'free'),
  system_role_id = CASE 
    WHEN is_admin = TRUE THEN (SELECT id FROM system_roles WHERE name = 'admin')
    ELSE (SELECT id FROM system_roles WHERE name = 'user')
  END
WHERE subscription_plan_id IS NULL OR system_role_id IS NULL;

-- Vérifier les données insérées
SELECT 
  'Plans d abonnement crees:' as info,
  COUNT(*) as count
FROM subscription_plans;

SELECT 
  'Roles systeme crees:' as info,
  COUNT(*) as count
FROM system_roles;

SELECT 
  'Abonnements utilisateurs crees:' as info,
  COUNT(*) as count
FROM user_subscriptions;

SELECT 
  'Roles utilisateurs crees:' as info,
  COUNT(*) as count
FROM user_roles;
