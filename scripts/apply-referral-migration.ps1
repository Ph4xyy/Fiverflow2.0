# Script pour appliquer la migration du système de parrainage
Write-Host "Application de la migration du système de parrainage" -ForegroundColor Cyan

Write-Host "`nMigration à appliquer:" -ForegroundColor Yellow
Write-Host "1. Ajouter les colonnes de parrainage à user_profiles" -ForegroundColor White
Write-Host "2. Créer la table referral_commissions" -ForegroundColor White
Write-Host "3. Créer les fonctions SQL" -ForegroundColor White
Write-Host "4. Créer les triggers" -ForegroundColor White
Write-Host "5. Créer les vues" -ForegroundColor White

Write-Host "`nColonnes à ajouter à user_profiles:" -ForegroundColor Yellow
Write-Host "- referral_code TEXT UNIQUE" -ForegroundColor White
Write-Host "- referred_by UUID REFERENCES user_profiles(id)" -ForegroundColor White
Write-Host "- referral_earnings DECIMAL(10,2) DEFAULT 0" -ForegroundColor White
Write-Host "- total_referrals INTEGER DEFAULT 0" -ForegroundColor White

Write-Host "`nTable referral_commissions à créer:" -ForegroundColor Yellow
Write-Host "- id, referrer_id, referred_id" -ForegroundColor White
Write-Host "- amount, percentage, status" -ForegroundColor White
Write-Host "- payment_method, payment_reference" -ForegroundColor White
Write-Host "- created_at, updated_at, paid_at" -ForegroundColor White

Write-Host "`nFonctions SQL à créer:" -ForegroundColor Yellow
Write-Host "- generate_referral_code()" -ForegroundColor White
Write-Host "- create_referral_commission()" -ForegroundColor White
Write-Host "- mark_commission_paid()" -ForegroundColor White

Write-Host "`nVues à créer:" -ForegroundColor Yellow
Write-Host "- user_referral_stats" -ForegroundColor White
Write-Host "- user_referrals" -ForegroundColor White

Write-Host "`nPour appliquer la migration:" -ForegroundColor Cyan
Write-Host "1. Allez dans votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Ouvrez l'onglet SQL Editor" -ForegroundColor White
Write-Host "3. Copiez le contenu de supabase/migrations/20250130000004_referral_system.sql" -ForegroundColor White
Write-Host "4. Exécutez le script SQL" -ForegroundColor White

Write-Host "`nOu utilisez la CLI Supabase:" -ForegroundColor Cyan
Write-Host "supabase db push" -ForegroundColor White

Write-Host "`nAprès la migration:" -ForegroundColor Yellow
Write-Host "1. Rechargez la page /referrals" -ForegroundColor White
Write-Host "2. Vérifiez que le code de parrainage se charge" -ForegroundColor White
Write-Host "3. Testez le bouton de copie" -ForegroundColor White

Write-Host "`nMigration prête à être appliquée!" -ForegroundColor Green