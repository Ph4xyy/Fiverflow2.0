-- Etape 16: Correction des plans d'abonnement selon les spécifications

-- Mettre à jour les plans existants avec les bons prix et noms
UPDATE subscription_plans 
SET 
  display_name = 'Launch',
  description = 'Plan gratuit de base',
  price_monthly = 0.00,
  price_yearly = 0.00,
  max_projects = 1,
  max_clients = 5,
  max_storage_gb = 1,
  max_team_members = 1,
  features = '["basic_support", "standard_templates"]'::jsonb
WHERE name = 'free';

UPDATE subscription_plans 
SET 
  display_name = 'Boost',
  description = 'Plan premium pour les freelancers',
  price_monthly = 24.00,
  price_yearly = 240.00,
  max_projects = 5,
  max_clients = 25,
  max_storage_gb = 10,
  max_team_members = 1,
  features = '["priority_support", "premium_templates", "analytics", "custom_branding"]'::jsonb
WHERE name = 'launch' AND price_monthly = 29.00;

UPDATE subscription_plans 
SET 
  display_name = 'Scale',
  description = 'Plan entreprise pour les équipes',
  price_monthly = 59.00,
  price_yearly = 590.00,
  max_projects = 15,
  max_clients = 100,
  max_storage_gb = 50,
  max_team_members = 5,
  features = '["dedicated_support", "premium_templates", "analytics", "custom_branding", "team_collaboration", "advanced_automation", "api_access"]'::jsonb
WHERE name = 'boost' AND price_monthly = 79.00;

-- Supprimer le plan 'scale' qui était à 199€ (il n'existe plus)
DELETE FROM subscription_plans WHERE name = 'scale' AND price_monthly = 199.00;

-- Vérifier les nouveaux plans
SELECT 'Plans d abonnement corriges:' as info;
SELECT name, display_name, price_monthly, price_yearly, max_projects, max_clients, features
FROM subscription_plans
ORDER BY price_monthly;
