-- Script de test pour le système d'abonnements et de rôles

-- 1. Vérifier les plans d'abonnement
SELECT '=== PLANS D ABONNEMENT ===' as test;
SELECT name, display_name, price_monthly, price_yearly, max_projects, max_clients, features
FROM subscription_plans
ORDER BY price_monthly;

-- 2. Vérifier les rôles système
SELECT '=== ROLES SYSTEME ===' as test;
SELECT name, display_name, permissions
FROM system_roles
ORDER BY name;

-- 3. Vérifier les abonnements utilisateurs
SELECT '=== ABONNEMENTS UTILISATEURS ===' as test;
SELECT 
  up.full_name,
  sp.display_name as plan,
  us.status,
  us.billing_cycle,
  us.amount,
  us.currency
FROM user_subscriptions us
JOIN user_profiles up ON us.user_id = up.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY up.full_name;

-- 4. Vérifier les rôles utilisateurs
SELECT '=== ROLES UTILISATEURS ===' as test;
SELECT 
  up.full_name,
  sr.display_name as role,
  ur.assigned_at,
  ur.is_active
FROM user_roles ur
JOIN user_profiles up ON ur.user_id = up.user_id
JOIN system_roles sr ON ur.role_id = sr.id
ORDER BY up.full_name;

-- 5. Tester la fonction get_user_current_subscription
SELECT '=== ABONNEMENT ACTUEL UTILISATEUR ===' as test;
SELECT * FROM get_user_current_subscription(
  (SELECT user_id FROM user_profiles LIMIT 1)
);

-- 6. Tester la fonction get_user_roles
SELECT '=== ROLES UTILISATEUR ===' as test;
SELECT * FROM get_user_roles(
  (SELECT user_id FROM user_profiles LIMIT 1)
);

-- 7. Tester la fonction get_subscription_stats
SELECT '=== STATISTIQUES ABONNEMENTS ===' as test;
SELECT * FROM get_subscription_stats();

-- 8. Vérifier les profils utilisateurs mis à jour
SELECT '=== PROFILS UTILISATEURS ===' as test;
SELECT 
  up.full_name,
  up.is_admin,
  sp.display_name as subscription_plan,
  sr.display_name as system_role
FROM user_profiles up
LEFT JOIN subscription_plans sp ON up.subscription_plan_id = sp.id
LEFT JOIN system_roles sr ON up.system_role_id = sr.id
ORDER BY up.full_name;

-- 9. Test de changement d'abonnement (simulation)
SELECT '=== TEST CHANGEMENT ABONNEMENT ===' as test;
-- Note: Cette fonction nécessite des permissions admin
-- SELECT change_user_subscription(
--   (SELECT user_id FROM user_profiles WHERE is_admin = FALSE LIMIT 1),
--   'launch',
--   'monthly'
-- );

-- 10. Test de changement de rôle (simulation)
SELECT '=== TEST CHANGEMENT ROLE ===' as test;
-- Note: Cette fonction nécessite des permissions admin
-- SELECT change_user_role(
--   (SELECT user_id FROM user_profiles WHERE is_admin = FALSE LIMIT 1),
--   'moderator'
-- );

SELECT '=== TESTS TERMINES ===' as test;
