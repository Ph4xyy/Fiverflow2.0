# Script pour mettre à jour le plan d'abonnement
# Permet de tester différents plans sans passer par Stripe

Write-Host "Script de mise à jour du plan d'abonnement..." -ForegroundColor Green

Write-Host "`nRequêtes SQL à exécuter dans Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n1. Trouvez votre user_id:" -ForegroundColor Cyan
Write-Host "SELECT id, email FROM auth.users WHERE email = 'votre-email@example.com';" -ForegroundColor White

Write-Host "`n2. Vérifiez votre plan actuel:" -ForegroundColor Cyan
Write-Host "SELECT user_id, subscription_plan FROM user_profiles WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n3. Mettez à jour vers Boost (remplacez VOTRE_USER_ID):" -ForegroundColor Cyan
Write-Host "UPDATE user_profiles SET subscription_plan = 'Boost' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n4. Mettez à jour vers Scale (remplacez VOTRE_USER_ID):" -ForegroundColor Cyan
Write-Host "UPDATE user_profiles SET subscription_plan = 'Scale' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n5. Revenez à Lunch (remplacez VOTRE_USER_ID):" -ForegroundColor Cyan
Write-Host "UPDATE user_profiles SET subscription_plan = 'Lunch' WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n6. Vérifiez le changement:" -ForegroundColor Cyan
Write-Host "SELECT user_id, subscription_plan FROM user_profiles WHERE user_id = 'VOTRE_USER_ID';" -ForegroundColor White

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "Plans disponibles:" -ForegroundColor Green
Write-Host "- Lunch: Plan gratuit (accès de base)" -ForegroundColor White
Write-Host "- Boost: Plan payant (fonctionnalités avancées)" -ForegroundColor White
Write-Host "- Scale: Plan premium (toutes les fonctionnalités)" -ForegroundColor White

Write-Host "`nAprès la mise à jour:" -ForegroundColor Yellow
Write-Host "1. Rafraîchissez votre application (F5)" -ForegroundColor Cyan
Write-Host "2. Vérifiez que le plan s'est mis à jour" -ForegroundColor Cyan
Write-Host "3. Testez l'accès aux différentes pages" -ForegroundColor Cyan
Write-Host "4. Les pages Boost/Scale devraient maintenant être accessibles" -ForegroundColor Cyan

