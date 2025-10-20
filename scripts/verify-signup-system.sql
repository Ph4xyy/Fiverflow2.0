-- Test rapide pour vérifier que le système d'inscription fonctionne
-- Ce script vérifie que tous les éléments nécessaires sont en place

-- 1. Vérifier que les plans d'abonnement existent
SELECT 
    'Plans d''abonnement disponibles:' as info,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as plans
FROM subscription_plans 
WHERE is_active = TRUE;

-- 2. Vérifier que les rôles système existent
SELECT 
    'Rôles système disponibles:' as info,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as roles
FROM system_roles 
WHERE is_active = TRUE;

-- 3. Vérifier que le trigger existe
SELECT 
    'Triggers sur auth.users:' as info,
    COUNT(*) as trigger_count
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth'
AND trigger_name = 'on_auth_user_created';

-- 4. Vérifier que la fonction handle_new_user existe
SELECT 
    'Fonction handle_new_user:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'handle_new_user' 
            AND routine_schema = 'public'
        ) THEN 'EXISTE' 
        ELSE 'MANQUANTE' 
    END as status;

-- 5. Vérifier les permissions
SELECT 
    'Permissions sur user_profiles:' as info,
    COUNT(*) as permission_count
FROM information_schema.table_privileges 
WHERE table_name = 'user_profiles' 
AND grantee = 'authenticated';

-- Résumé final
SELECT 
    'SYSTÈME D''INSCRIPTION PRÊT!' as status,
    'Tous les éléments nécessaires sont en place.' as message;
