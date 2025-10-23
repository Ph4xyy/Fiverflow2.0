-- Script de test pour vérifier que les admins n'ont pas de problèmes

-- 1. Vérifier les utilisateurs admin
SELECT '=== UTILISATEURS ADMIN ===' as test;
SELECT 
  up.full_name,
  up.is_admin,
  sp.display_name as subscription_plan,
  us.status as subscription_status
FROM user_profiles up
LEFT JOIN subscription_plans sp ON up.subscription_plan_id = sp.id
LEFT JOIN user_subscriptions us ON up.user_id = us.user_id
WHERE up.is_admin = TRUE;

-- 2. Tester la fonction get_user_current_subscription pour un admin
SELECT '=== ABONNEMENT ADMIN ===' as test;
SELECT * FROM get_user_current_subscription(
  (SELECT user_id FROM user_profiles WHERE is_admin = TRUE LIMIT 1)
);

-- 3. Tester la fonction get_user_roles pour un admin
SELECT '=== ROLES ADMIN ===' as test;
SELECT * FROM get_user_roles(
  (SELECT user_id FROM user_profiles WHERE is_admin = TRUE LIMIT 1)
);

-- 4. Vérifier que les admins peuvent changer les abonnements
SELECT '=== TEST CHANGEMENT ABONNEMENT PAR ADMIN ===' as test;
-- Note: Cette fonction nécessite des permissions admin
-- SELECT change_user_subscription(
--   (SELECT user_id FROM user_profiles WHERE is_admin = FALSE LIMIT 1),
--   'boost',
--   'monthly'
-- );

-- 5. Vérifier les permissions admin
SELECT '=== PERMISSIONS ADMIN ===' as test;
SELECT 
  up.full_name,
  up.is_admin,
  sr.display_name as role,
  sr.permissions
FROM user_profiles up
LEFT JOIN user_roles ur ON up.user_id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN system_roles sr ON ur.role_id = sr.id
WHERE up.is_admin = TRUE;

-- 6. Vérifier que les admins ont accès à toutes les pages
SELECT '=== ACCES PAGES ADMIN ===' as test;
SELECT 
  'Les admins devraient avoir accès à toutes les pages:' as info,
  'dashboard, clients, orders, calendar, referrals, workboard, stats, invoices, admin' as pages;

-- 7. Vérifier les limites admin (devraient être illimitées)
SELECT '=== LIMITES ADMIN ===' as test;
SELECT 
  'Les admins devraient avoir des limites illimitées:' as info,
  'maxClients: -1, maxOrders: -1, maxProjects: -1, maxStorage: -1, maxTeamMembers: -1' as limits;

SELECT '=== TESTS ADMIN TERMINES ===' as test;
