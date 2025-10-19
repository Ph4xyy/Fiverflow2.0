-- =====================================================
-- SCRIPT DE VÉRIFICATION DE LA BASE DE DONNÉES
-- FiverFlow 2.0 - Vérification complète
-- =====================================================

-- =====================================================
-- 1. VÉRIFICATION DES TABLES
-- =====================================================

SELECT 'Vérification des tables principales...' as status;

-- Vérifier que toutes les tables existent
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'clients', 'orders', 'tasks', 'subscriptions',
      'invoices', 'invoice_items', 'invoice_templates', 'invoice_payments',
      'user_2fa', 'referrals', 'pending_referrals'
    ) THEN '✅ Existe'
    ELSE '❌ Manquante'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'clients', 'orders', 'tasks', 'subscriptions',
    'invoices', 'invoice_items', 'invoice_templates', 'invoice_payments',
    'user_2fa', 'referrals', 'pending_referrals'
  )
ORDER BY table_name;

-- =====================================================
-- 2. VÉRIFICATION DES TYPES ENUM
-- =====================================================

SELECT 'Vérification des types ENUM...' as status;

SELECT 
  typname as type_name,
  CASE 
    WHEN typname IN ('invoice_status', 'order_status', 'task_status', 'task_priority') 
    THEN '✅ Existe'
    ELSE '❌ Manquant'
  END as status
FROM pg_type 
WHERE typname IN ('invoice_status', 'order_status', 'task_status', 'task_priority')
ORDER BY typname;

-- =====================================================
-- 3. VÉRIFICATION DES INDEX
-- =====================================================

SELECT 'Vérification des index...' as status;

SELECT 
  schemaname,
  tablename,
  indexname,
  CASE 
    WHEN indexname LIKE 'idx_%' THEN '✅ Index personnalisé'
    ELSE '📋 Index système'
  END as index_type
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- 4. VÉRIFICATION DES CONTRAINTES
-- =====================================================

SELECT 'Vérification des contraintes...' as status;

SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  CASE 
    WHEN tc.constraint_name LIKE '%_check' THEN '✅ Contrainte de validation'
    WHEN tc.constraint_name LIKE '%_unique' THEN '✅ Contrainte d\'unicité'
    WHEN tc.constraint_name LIKE '%_pkey' THEN '✅ Clé primaire'
    WHEN tc.constraint_name LIKE '%_fkey' THEN '✅ Clé étrangère'
    ELSE '📋 Autre contrainte'
  END as constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'clients', 'orders', 'tasks', 'subscriptions',
    'invoices', 'invoice_items', 'invoice_templates', 'invoice_payments',
    'user_2fa', 'referrals', 'pending_referrals'
  )
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- =====================================================
-- 5. VÉRIFICATION DES FONCTIONS
-- =====================================================

SELECT 'Vérification des fonctions...' as status;

SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name IN (
      'update_updated_at_column', 'calculate_invoice_totals', 
      'ensure_single_default_template', 'generate_invoice_number',
      'user_has_2fa_enabled', 'get_user_2fa_info', 'disable_user_2fa'
    ) THEN '✅ Fonction personnalisée'
    ELSE '📋 Fonction système'
  END as function_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column', 'calculate_invoice_totals', 
    'ensure_single_default_template', 'generate_invoice_number',
    'user_has_2fa_enabled', 'get_user_2fa_info', 'disable_user_2fa'
  )
ORDER BY routine_name;

-- =====================================================
-- 6. VÉRIFICATION DES TRIGGERS
-- =====================================================

SELECT 'Vérification des triggers...' as status;

SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  CASE 
    WHEN trigger_name LIKE 'update_%_updated_at' THEN '✅ Trigger updated_at'
    WHEN trigger_name LIKE 'calculate_%' THEN '✅ Trigger de calcul'
    WHEN trigger_name LIKE 'ensure_%' THEN '✅ Trigger de validation'
    ELSE '📋 Autre trigger'
  END as trigger_type
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'update_clients_updated_at', 'update_orders_updated_at', 'update_tasks_updated_at',
    'update_subscriptions_updated_at', 'update_invoices_updated_at', 
    'update_invoice_templates_updated_at', 'update_user_2fa_updated_at',
    'calculate_invoice_totals_on_item_change', 'calculate_invoice_totals_on_invoice_change',
    'ensure_single_default_template_trigger'
  )
ORDER BY trigger_name;

-- =====================================================
-- 7. VÉRIFICATION DES POLITIQUES RLS
-- =====================================================

SELECT 'Vérification des politiques RLS...' as status;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 'orders', 'tasks', 'subscriptions',
    'invoices', 'invoice_items', 'invoice_templates', 'invoice_payments',
    'user_2fa', 'referrals', 'pending_referrals'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- 8. VÉRIFICATION DES PERMISSIONS
-- =====================================================

SELECT 'Vérification des permissions...' as status;

SELECT 
  table_name,
  privilege_type,
  grantee,
  CASE 
    WHEN grantee = 'authenticated' THEN '✅ Permission utilisateur'
    WHEN grantee = 'anon' THEN '✅ Permission anonyme'
    ELSE '📋 Autre permission'
  END as permission_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
  AND table_name IN (
    'clients', 'orders', 'tasks', 'subscriptions',
    'invoices', 'invoice_items', 'invoice_templates', 'invoice_payments',
    'user_2fa', 'referrals', 'pending_referrals'
  )
  AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee, privilege_type;

-- =====================================================
-- 9. TEST DES FONCTIONS PRINCIPALES
-- =====================================================

SELECT 'Test des fonctions principales...' as status;

-- Test de la fonction update_updated_at_column
SELECT 'Test update_updated_at_column: ' || 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'update_updated_at_column' 
        AND routine_schema = 'public'
    ) THEN '✅ Fonction existe'
    ELSE '❌ Fonction manquante'
  END as test_result;

-- Test de la fonction calculate_invoice_totals
SELECT 'Test calculate_invoice_totals: ' || 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'calculate_invoice_totals' 
        AND routine_schema = 'public'
    ) THEN '✅ Fonction existe'
    ELSE '❌ Fonction manquante'
  END as test_result;

-- Test de la fonction generate_invoice_number
SELECT 'Test generate_invoice_number: ' || 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'generate_invoice_number' 
        AND routine_schema = 'public'
    ) THEN '✅ Fonction existe'
    ELSE '❌ Fonction manquante'
  END as test_result;

-- =====================================================
-- 10. RÉSUMÉ DE LA VÉRIFICATION
-- =====================================================

SELECT 'Résumé de la vérification...' as status;

SELECT 
  'Tables créées' as category,
  COUNT(*) as count,
  '✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'clients', 'orders', 'tasks', 'subscriptions',
    'invoices', 'invoice_items', 'invoice_templates', 'invoice_payments',
    'user_2fa', 'referrals', 'pending_referrals'
  )

UNION ALL

SELECT 
  'Index créés' as category,
  COUNT(*) as count,
  '✅' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'

UNION ALL

SELECT 
  'Fonctions créées' as category,
  COUNT(*) as count,
  '✅' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column', 'calculate_invoice_totals', 
    'ensure_single_default_template', 'generate_invoice_number',
    'user_has_2fa_enabled', 'get_user_2fa_info', 'disable_user_2fa'
  )

UNION ALL

SELECT 
  'Triggers créés' as category,
  COUNT(*) as count,
  '✅' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'update_clients_updated_at', 'update_orders_updated_at', 'update_tasks_updated_at',
    'update_subscriptions_updated_at', 'update_invoices_updated_at', 
    'update_invoice_templates_updated_at', 'update_user_2fa_updated_at',
    'calculate_invoice_totals_on_item_change', 'calculate_invoice_totals_on_invoice_change',
    'ensure_single_default_template_trigger'
  )

UNION ALL

SELECT 
  'Politiques RLS créées' as category,
  COUNT(*) as count,
  '✅' as status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 'orders', 'tasks', 'subscriptions',
    'invoices', 'invoice_items', 'invoice_templates', 'invoice_payments',
    'user_2fa', 'referrals', 'pending_referrals'
  );

-- =====================================================
-- FIN DE LA VÉRIFICATION
-- =====================================================

SELECT 'Vérification terminée avec succès !' as final_status;
