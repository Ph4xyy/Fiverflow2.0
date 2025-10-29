# Script complet pour corriger le profil utilisateur
# Corrige le rôle et le plan d'abonnement

Write-Host "Script complet de correction du profil utilisateur..." -ForegroundColor Green

Write-Host "`nÉtapes à suivre dans Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n1. Trouvez votre user_id:" -ForegroundColor Cyan
Write-Host "SELECT id, email FROM auth.users WHERE email = 'votre-email@example.com';" -ForegroundColor White

Write-Host "`n2. Vérifiez votre profil actuel:" -ForegroundColor Cyan
Write-Host "SELECT user_id, role, subscription_plan, subscription FROM user_profiles WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n3. Corrigez le rôle (remplacez VOTRE_USER_ID):" -ForegroundColor Cyan
Write-Host "UPDATE user_profiles SET role = 'Admin' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n4. Corrigez le plan d'abonnement (remplacez VOTRE_USER_ID):" -ForegroundColor Cyan
Write-Host "UPDATE user_profiles SET subscription_plan = 'Scale' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n5. Si vous voulez tester avec d'autres plans:" -ForegroundColor Cyan
Write-Host "-- Pour Boost:" -ForegroundColor White
Write-Host "UPDATE user_profiles SET subscription_plan = 'Boost' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White
Write-Host "-- Pour Lunch (gratuit):" -ForegroundColor White
Write-Host "UPDATE user_profiles SET subscription_plan = 'Lunch' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n6. Vérifiez que les corrections ont été appliquées:" -ForegroundColor Cyan
Write-Host "SELECT user_id, role, subscription_plan, subscription FROM user_profiles WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n7. Si la colonne 'subscription' existe et contient des données Stripe:" -ForegroundColor Cyan
Write-Host "-- Vérifiez son contenu:" -ForegroundColor White
Write-Host "SELECT subscription FROM user_profiles WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White
Write-Host "-- Mettez à jour si nécessaire:" -ForegroundColor White
Write-Host "UPDATE user_profiles SET subscription = '{\"status\": \"active\", \"plan\": \"scale\"}' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "Colonnes importantes:" -ForegroundColor Green
Write-Host "- role: Admin, Moderator, Member" -ForegroundColor White
Write-Host "- subscription_plan: Lunch, Boost, Scale" -ForegroundColor White
Write-Host "- subscription: Détails JSON de l'abonnement Stripe (optionnel)" -ForegroundColor White

Write-Host "`nAprès les corrections:" -ForegroundColor Yellow
Write-Host "1. Rafraîchissez votre application" -ForegroundColor Cyan
Write-Host "2. Vérifiez que le menu Admin apparaît" -ForegroundColor Cyan
Write-Host "3. Testez l'accès aux pages avec différents plans" -ForegroundColor Cyan
