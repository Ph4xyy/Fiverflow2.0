-- Script pour créer une fonction qui récupère les vraies statistiques d'abonnements
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS get_subscription_stats();
DROP FUNCTION IF EXISTS get_user_detailed_stats(UUID);

-- 2. Fonction pour récupérer les statistiques d'abonnements réelles
CREATE FUNCTION get_subscription_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_subscriptions INTEGER;
  active_subscriptions INTEGER;
  monthly_revenue DECIMAL;
  yearly_revenue DECIMAL;
  plan_stats JSON;
BEGIN
  -- Compter le total des abonnements
  SELECT COUNT(*) INTO total_subscriptions
  FROM user_subscriptions;
  
  -- Compter les abonnements actifs
  SELECT COUNT(*) INTO active_subscriptions
  FROM user_subscriptions
  WHERE status = 'active';
  
  -- Calculer les revenus mensuels
  SELECT COALESCE(SUM(amount), 0) INTO monthly_revenue
  FROM user_subscriptions
  WHERE status = 'active' AND billing_cycle = 'monthly';
  
  -- Calculer les revenus annuels
  SELECT COALESCE(SUM(amount), 0) INTO yearly_revenue
  FROM user_subscriptions
  WHERE status = 'active' AND billing_cycle = 'yearly';
  
  -- Statistiques par plan
  SELECT json_build_object(
    'launch', (
      SELECT COUNT(*) 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE sp.name = 'launch' AND us.status = 'active'
    ),
    'boost', (
      SELECT COUNT(*) 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE sp.name = 'boost' AND us.status = 'active'
    ),
    'scale', (
      SELECT COUNT(*) 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE sp.name = 'scale' AND us.status = 'active'
    )
  ) INTO plan_stats;
  
  -- Construire le résultat
  result := json_build_object(
    'total_subscriptions', total_subscriptions,
    'active_subscriptions', active_subscriptions,
    'monthly_revenue', monthly_revenue,
    'yearly_revenue', yearly_revenue,
    'total_revenue', monthly_revenue + yearly_revenue,
    'plan_stats', plan_stats
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour récupérer les statistiques d'un utilisateur spécifique
CREATE FUNCTION get_user_detailed_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_profile RECORD;
  subscription_info RECORD;
  orders_count INTEGER;
  invoices_count INTEGER;
  clients_count INTEGER;
  total_orders_revenue DECIMAL;
  total_invoices_revenue DECIMAL;
BEGIN
  -- Récupérer le profil utilisateur
  SELECT 
    up.user_id,
    up.full_name,
    up.email,
    up.username,
    up.is_admin,
    up.is_active,
    up.created_at,
    up.avatar_url,
    up.bio,
    up.location,
    up.website,
    up.phone
  INTO user_profile
  FROM user_profiles up
  WHERE up.user_id = user_uuid;
  
  -- Récupérer les informations d'abonnement
  SELECT 
    sp.name as plan_name,
    sp.price as plan_price,
    us.status as subscription_status,
    us.billing_cycle,
    us.amount,
    us.start_date,
    us.end_date
  INTO subscription_info
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Compter les commandes
  SELECT COUNT(*) INTO orders_count
  FROM orders
  WHERE user_id = user_uuid;
  
  -- Compter les factures
  SELECT COUNT(*) INTO invoices_count
  FROM invoices
  WHERE user_id = user_uuid;
  
  -- Compter les clients
  SELECT COUNT(*) INTO clients_count
  FROM clients
  WHERE user_id = user_uuid;
  
  -- Calculer les revenus des commandes
  SELECT COALESCE(SUM(amount), 0) INTO total_orders_revenue
  FROM orders
  WHERE user_id = user_uuid;
  
  -- Calculer les revenus des factures
  SELECT COALESCE(SUM(total), 0) INTO total_invoices_revenue
  FROM invoices
  WHERE user_id = user_uuid;
  
  -- Construire le résultat
  result := json_build_object(
    'user_profile', row_to_json(user_profile),
    'subscription', row_to_json(subscription_info),
    'stats', json_build_object(
      'orders_count', orders_count,
      'invoices_count', invoices_count,
      'clients_count', clients_count,
      'total_orders_revenue', total_orders_revenue,
      'total_invoices_revenue', total_invoices_revenue,
      'total_revenue', total_orders_revenue + total_invoices_revenue
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Donner les permissions aux fonctions
GRANT EXECUTE ON FUNCTION get_subscription_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_detailed_stats TO authenticated;

-- 5. Vérifier que les fonctions sont créées
SELECT 
  'Fonctions de statistiques créées!' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_subscription_stats', 'get_user_detailed_stats')
AND routine_schema = 'public';

-- 6. Test des fonctions (optionnel)
-- SELECT get_subscription_stats();
-- SELECT get_user_detailed_stats('USER_ID_DE_TON_AMI'::UUID);
