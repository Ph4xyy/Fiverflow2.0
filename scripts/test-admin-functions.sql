-- Script pour tester les fonctions de promotion admin
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier que les fonctions existent
SELECT 
  'Fonctions disponibles:' as info,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('promote_user_to_admin', 'demote_admin_to_user')
AND routine_schema = 'public';

-- 2. Lister tous les utilisateurs avec leur statut admin
SELECT 
  'Utilisateurs actuels:' as info,
  up.user_id,
  up.full_name,
  up.email,
  up.username,
  up.is_admin,
  up.is_active,
  up.created_at
FROM user_profiles up
ORDER BY up.is_admin DESC, up.created_at DESC;

-- 3. Compter les admins
SELECT 
  'Statistiques:' as info,
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_count,
  COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users
FROM user_profiles;

-- 4. Vérifier les permissions sur les fonctions
SELECT 
  'Permissions des fonctions:' as info,
  p.proname as function_name,
  p.proacl as permissions
FROM pg_proc p
WHERE p.proname IN ('promote_user_to_admin', 'demote_admin_to_user');

-- 5. Test de la fonction (remplace USER_ID par l'ID de ton ami)
-- Décommente la ligne suivante pour tester :
-- SELECT promote_user_to_admin('USER_ID_DE_TON_AMI'::UUID);

SELECT 'Test terminé - Fonctions prêtes à utiliser!' as status;
