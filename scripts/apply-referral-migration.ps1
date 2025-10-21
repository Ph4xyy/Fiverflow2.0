# Script pour appliquer la migration du système de parrainage
Write-Host "Application de la migration du système de parrainage" -ForegroundColor Cyan

# Vérifier que le fichier de migration existe
if (Test-Path "supabase/migrations/20250130000004_referral_system.sql") {
    Write-Host "OK: Fichier de migration trouvé" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Fichier de migration manquant" -ForegroundColor Red
    exit 1
}

Write-Host "`nMigration du système de parrainage:" -ForegroundColor Yellow
Write-Host "1. Tables créées:" -ForegroundColor White
Write-Host "   - profiles (colonnes ajoutées)" -ForegroundColor White
Write-Host "   - referral_commissions" -ForegroundColor White
Write-Host "   - commission_status (ENUM)" -ForegroundColor White

Write-Host "`n2. Fonctions SQL créées:" -ForegroundColor White
Write-Host "   - generate_referral_code()" -ForegroundColor White
Write-Host "   - create_referral_commission()" -ForegroundColor White
Write-Host "   - mark_commission_paid()" -ForegroundColor White

Write-Host "`n3. Triggers créés:" -ForegroundColor White
Write-Host "   - Génération automatique des codes de parrainage" -ForegroundColor White
Write-Host "   - Mise à jour automatique des timestamps" -ForegroundColor White

Write-Host "`n4. Vues créées:" -ForegroundColor White
Write-Host "   - user_referral_stats" -ForegroundColor White
Write-Host "   - user_referrals" -ForegroundColor White

Write-Host "`n5. Politiques RLS configurées" -ForegroundColor White

Write-Host "`nPour appliquer la migration:" -ForegroundColor Cyan
Write-Host "1. Allez dans votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Ouvrez l'onglet SQL Editor" -ForegroundColor White
Write-Host "3. Copiez le contenu de supabase/migrations/20250130000004_referral_system.sql" -ForegroundColor White
Write-Host "4. Exécutez le script SQL" -ForegroundColor White

Write-Host "`nOu utilisez la CLI Supabase:" -ForegroundColor Cyan
Write-Host "supabase db reset" -ForegroundColor White
Write-Host "supabase db push" -ForegroundColor White

Write-Host "`nMigration prête à être appliquée!" -ForegroundColor Green
