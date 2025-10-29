# Script de test pour vérifier les corrections du système admin
# Teste les permissions et le layout de la page admin

Write-Host "🔧 Test des Corrections du Système Admin" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Vérifier les utilisateurs admin dans la base
Write-Host "`n1. Vérification des utilisateurs admin..." -ForegroundColor Yellow
$adminCheck = @"
SELECT 
  up.user_id,
  up.full_name,
  up.is_admin,
  up.role,
  up.is_active,
  CASE 
    WHEN up.is_admin = TRUE THEN '✅ Admin via is_admin'
    WHEN up.role IN ('admin', 'moderator') THEN '✅ Admin via role'
    ELSE '❌ Pas admin'
  END as admin_status
FROM user_profiles up
WHERE up.is_admin = TRUE OR up.role IN ('admin', 'moderator')
ORDER BY up.is_admin DESC, up.created_at DESC;
"@

Write-Host "Requête SQL:" -ForegroundColor Gray
Write-Host $adminCheck -ForegroundColor Gray

# 2. Vérifier les fonctions admin
Write-Host "`n2. Test des fonctions admin..." -ForegroundColor Yellow
$functionTest = @"
-- Test de la fonction get_admin_stats
SELECT 'Test get_admin_stats' as test_name;

-- Test de la fonction get_user_current_subscription pour un admin
SELECT 'Test get_user_current_subscription (admin)' as test_name;
SELECT * FROM get_user_current_subscription(
  (SELECT user_id FROM user_profiles WHERE is_admin = TRUE LIMIT 1)
);

-- Test de la fonction get_user_roles pour un admin
SELECT 'Test get_user_roles (admin)' as test_name;
SELECT * FROM get_user_roles(
  (SELECT user_id FROM user_profiles WHERE is_admin = TRUE LIMIT 1)
);
"@

Write-Host "Requête SQL:" -ForegroundColor Gray
Write-Host $functionTest -ForegroundColor Gray

# 3. Vérifier les permissions RLS
Write-Host "`n3. Test des permissions RLS..." -ForegroundColor Yellow
$rlsTest = @"
-- Vérifier que les admins peuvent voir tous les profils
SELECT 'Test RLS - Admins peuvent voir tous les profils' as test_name;
SELECT COUNT(*) as total_profiles_visible_to_admin
FROM user_profiles
WHERE EXISTS (
  SELECT 1 FROM user_profiles admin_check 
  WHERE admin_check.user_id = auth.uid() 
  AND (admin_check.is_admin = TRUE OR admin_check.role IN ('admin', 'moderator'))
);
"@

Write-Host "Requête SQL:" -ForegroundColor Gray
Write-Host $rlsTest -ForegroundColor Gray

# 4. Instructions pour tester l'interface
Write-Host "`n4. Tests à effectuer dans l'interface:" -ForegroundColor Yellow
Write-Host "   ✅ Se connecter avec un compte admin" -ForegroundColor Green
Write-Host "   ✅ Naviguer vers /admin/dashboard" -ForegroundColor Green
Write-Host "   ✅ Vérifier que la page se charge sans erreur 'Forbidden'" -ForegroundColor Green
Write-Host "   ✅ Vérifier que le layout est responsive" -ForegroundColor Green
Write-Host "   ✅ Vérifier que la navigation admin fonctionne" -ForegroundColor Green
Write-Host "   ✅ Tester les filtres de date" -ForegroundColor Green
Write-Host "   ✅ Vérifier que les statistiques s'affichent" -ForegroundColor Green

# 5. Vérifications spécifiques
Write-Host "`n5. Vérifications spécifiques:" -ForegroundColor Yellow
Write-Host "   🔍 Edge Functions admin-stats: Vérifie is_admin ET role" -ForegroundColor Blue
Write-Host "   🔍 Edge Functions admin-users: Vérifie is_admin ET role" -ForegroundColor Blue
Write-Host "   🔍 Edge Functions admin-ai: Vérifie is_admin ET role" -ForegroundColor Blue
Write-Host "   🔍 Layout admin: Responsive et navigation améliorée" -ForegroundColor Blue
Write-Host "   🔍 Hook useSubscriptionPermissions: Utilise is_admin" -ForegroundColor Blue

# 6. Commandes de déploiement
Write-Host "`n6. Commandes de déploiement:" -ForegroundColor Yellow
Write-Host "   📦 supabase functions deploy admin-stats" -ForegroundColor Magenta
Write-Host "   📦 supabase functions deploy admin-users" -ForegroundColor Magenta
Write-Host "   📦 supabase functions deploy admin-ai" -ForegroundColor Magenta
Write-Host "   📦 npm run build" -ForegroundColor Magenta

Write-Host "`n✅ Script de test terminé!" -ForegroundColor Green
Write-Host "   Exécutez les requêtes SQL dans Supabase SQL Editor" -ForegroundColor Cyan
Write-Host "   Testez l'interface admin après déploiement" -ForegroundColor Cyan
