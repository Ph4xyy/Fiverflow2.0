# Script pour corriger le profil utilisateur
# Assure que l'utilisateur a le bon rôle et plan d'abonnement

Write-Host "Script de correction du profil utilisateur..." -ForegroundColor Green

Write-Host "`nRequêtes SQL à exécuter dans Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n1. Vérifier votre profil actuel:" -ForegroundColor Cyan
Write-Host "SELECT user_id, role, subscription_plan FROM user_profiles WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n2. Corriger le rôle (remplacez VOTRE_USER_ID par votre ID):" -ForegroundColor Cyan
Write-Host "UPDATE user_profiles SET role = 'Admin' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n3. Corriger le plan d'abonnement (optionnel):" -ForegroundColor Cyan
Write-Host "UPDATE user_profiles SET subscription_plan = 'Lunch' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n4. Vérifier que les corrections ont été appliquées:" -ForegroundColor Cyan
Write-Host "SELECT user_id, role, subscription_plan FROM user_profiles WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n5. Si vous voulez tester avec un plan supérieur:" -ForegroundColor Cyan
Write-Host "UPDATE user_profiles SET subscription_plan = 'Boost' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "Instructions:" -ForegroundColor Green
Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Sélectionnez votre projet" -ForegroundColor Cyan
Write-Host "3. Allez dans SQL Editor" -ForegroundColor Cyan
Write-Host "4. Trouvez votre user_id dans la table auth.users" -ForegroundColor Cyan
Write-Host "5. Exécutez les requêtes ci-dessus avec votre user_id" -ForegroundColor Cyan

Write-Host "`nPour trouver votre user_id:" -ForegroundColor Yellow
Write-Host "SELECT id, email FROM auth.users WHERE email = 'votre-email@example.com';" -ForegroundColor White
