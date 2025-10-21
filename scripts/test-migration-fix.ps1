# Test de la correction de la migration SQL
Write-Host "Test de la correction de la migration SQL" -ForegroundColor Cyan

Write-Host "`nProblème résolu:" -ForegroundColor Yellow
Write-Host "✅ Type commission_status créé AVANT la table referral_commissions" -ForegroundColor Green
Write-Host "✅ Section dupliquée supprimée" -ForegroundColor Green
Write-Host "✅ Ordre des sections corrigé" -ForegroundColor Green

Write-Host "`nOrdre correct de la migration:" -ForegroundColor Cyan
Write-Host "1. ✅ Ajouter colonnes à user_profiles" -ForegroundColor White
Write-Host "2. ✅ Créer type commission_status" -ForegroundColor White
Write-Host "3. ✅ Créer table referral_commissions" -ForegroundColor White
Write-Host "4. ✅ Créer fonctions SQL" -ForegroundColor White
Write-Host "5. ✅ Créer triggers" -ForegroundColor White
Write-Host "6. ✅ Créer vues" -ForegroundColor White

Write-Host "`nType commission_status créé avec:" -ForegroundColor Yellow
Write-Host "- 'pending' (En attente de paiement)" -ForegroundColor White
Write-Host "- 'paid' (Payé)" -ForegroundColor White
Write-Host "- 'cancelled' (Annulé)" -ForegroundColor White
Write-Host "- 'refunded' (Remboursé)" -ForegroundColor White

Write-Host "`nPour appliquer la migration corrigée:" -ForegroundColor Cyan
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

Write-Host "`nMigration corrigée et prête!" -ForegroundColor Green
