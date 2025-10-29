# Script pour vérifier la structure de la base de données
# Aide à identifier les colonnes d'abonnement disponibles

Write-Host "Vérification de la structure de la base de données..." -ForegroundColor Green

Write-Host "`nRequêtes SQL à exécuter dans Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n1. Vérifier la structure de la table user_profiles:" -ForegroundColor Cyan
Write-Host "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'user_profiles' ORDER BY ordinal_position;" -ForegroundColor White

Write-Host "`n2. Vérifier les colonnes d'abonnement disponibles:" -ForegroundColor Cyan
Write-Host "SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name LIKE '%subscription%';" -ForegroundColor White

Write-Host "`n3. Vérifier les colonnes de rôle disponibles:" -ForegroundColor Cyan
Write-Host "SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles' AND (column_name LIKE '%role%' OR column_name LIKE '%admin%');" -ForegroundColor White

Write-Host "`n4. Voir un exemple de données dans user_profiles:" -ForegroundColor Cyan
Write-Host "SELECT user_id, role, subscription_plan, subscription FROM user_profiles LIMIT 5;" -ForegroundColor White

Write-Host "`n5. Vérifier s'il y a une table user_subscriptions:" -ForegroundColor Cyan
Write-Host "SELECT table_name FROM information_schema.tables WHERE table_name = 'user_subscriptions';" -ForegroundColor White

Write-Host "`n6. Si user_subscriptions existe, voir sa structure:" -ForegroundColor Cyan
Write-Host "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_subscriptions' ORDER BY ordinal_position;" -ForegroundColor White

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "Instructions:" -ForegroundColor Green
Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Sélectionnez votre projet" -ForegroundColor Cyan
Write-Host "3. Allez dans SQL Editor" -ForegroundColor Cyan
Write-Host "4. Exécutez ces requêtes pour identifier la structure" -ForegroundColor Cyan
Write-Host "5. Notez les colonnes disponibles pour les abonnements" -ForegroundColor Cyan

Write-Host "`nColonnes probables:" -ForegroundColor Yellow
Write-Host "- subscription_plan: Plan d'abonnement (Lunch, Boost, Scale)" -ForegroundColor White
Write-Host "- subscription: Détails de l'abonnement Stripe" -ForegroundColor White
Write-Host "- role: Rôle utilisateur (Member, Moderator, Admin)" -ForegroundColor White
