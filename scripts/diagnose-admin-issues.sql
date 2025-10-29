-- Script de diagnostic et correction des problèmes admin
-- Résout les erreurs 403, 406 et JavaScript

-- 1. Vérifier le statut admin de l'utilisateur problématique
SELECT '=== VÉRIFICATION STATUT ADMIN ===' as diagnostic;
SELECT 
  up.user_id,
  up.full_name,
  up.is_admin,
  up.role,
  up.is_active,
  up.created_at,
  CASE 
    WHEN up.is_admin = TRUE THEN '✅ Admin via is_admin'
    WHEN up.role IN ('admin', 'moderator') THEN '✅ Admin via role'
    ELSE '❌ Pas admin'
  END as admin_status
FROM user_profiles up
WHERE up.user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 2. Vérifier toutes les tables admin
SELECT '=== TABLES ADMIN ===' as diagnostic;
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('user_profiles', 'user_activity', 'admin_stats') THEN '✅ Table admin'
    ELSE '⚠️ Table standard'
  END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_activity', 'admin_stats', 'clients', 'orders');

-- 3. Vérifier les politiques RLS sur user_activity
SELECT '=== POLITIQUES RLS USER_ACTIVITY ===' as diagnostic;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_activity';

-- 4. Vérifier si la table user_activity existe et est accessible
SELECT '=== TEST ACCÈS USER_ACTIVITY ===' as diagnostic;
SELECT COUNT(*) as total_records
FROM user_activity 
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 5. Corriger le statut admin si nécessaire
SELECT '=== CORRECTION STATUT ADMIN ===' as diagnostic;
UPDATE user_profiles 
SET 
  is_admin = TRUE,
  role = 'admin',
  updated_at = NOW()
WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814'
AND (is_admin = FALSE OR role IS NULL OR role NOT IN ('admin', 'moderator'));

-- 6. Vérifier la correction
SELECT '=== VÉRIFICATION APRÈS CORRECTION ===' as diagnostic;
SELECT 
  up.user_id,
  up.full_name,
  up.is_admin,
  up.role,
  CASE 
    WHEN up.is_admin = TRUE THEN '✅ Admin confirmé'
    WHEN up.role IN ('admin', 'moderator') THEN '✅ Admin confirmé'
    ELSE '❌ Toujours pas admin'
  END as admin_status_final
FROM user_profiles up
WHERE up.user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';

-- 7. Test des fonctions admin
SELECT '=== TEST FONCTIONS ADMIN ===' as diagnostic;
-- Test de la fonction get_admin_stats
SELECT 'Test get_admin_stats pour admin' as test_name;
SELECT COUNT(*) as admin_count FROM user_profiles WHERE is_admin = TRUE;

-- 8. Vérifier les Edge Functions
SELECT '=== VÉRIFICATION EDGE FUNCTIONS ===' as diagnostic;
SELECT 'Les Edge Functions admin-stats, admin-users, admin-ai doivent être déployées' as info;
SELECT 'Vérifiez que les fonctions utilisent la logique: is_admin OR role IN (admin, moderator)' as info;

-- 9. Instructions finales
SELECT '=== INSTRUCTIONS FINALES ===' as diagnostic;
SELECT '1. Déployez les Edge Functions corrigées' as instruction;
SELECT '2. Testez la page admin: /admin/dashboard' as instruction;
SELECT '3. Vérifiez que les erreurs 403 et 406 sont résolues' as instruction;
SELECT '4. Testez le JavaScript share-modal.js' as instruction;
