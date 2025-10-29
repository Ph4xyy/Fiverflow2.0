# Script pour générer les codes de parrainage manquants
Write-Host "Génération des codes de parrainage manquants" -ForegroundColor Cyan

Write-Host "`nProblème identifié:" -ForegroundColor Yellow
Write-Host "❌ Les utilisateurs existants n'ont pas de code de parrainage" -ForegroundColor Red
Write-Host "❌ Le trigger ne génère pas automatiquement les codes" -ForegroundColor Red
Write-Host "❌ Le lien affiche 'ref=null'" -ForegroundColor Red

Write-Host "`nSolution:" -ForegroundColor Yellow
Write-Host "✅ Créer une migration pour générer les codes manquants" -ForegroundColor Green
Write-Host "✅ Mettre à jour tous les profils sans code" -ForegroundColor Green
Write-Host "✅ Vérifier que tous les utilisateurs ont un code" -ForegroundColor Green

Write-Host "`nMigration créée:" -ForegroundColor Cyan
Write-Host "📄 supabase/migrations/20250130000021_generate_missing_referral_codes.sql" -ForegroundColor White

Write-Host "`nCe que fait la migration:" -ForegroundColor Yellow
Write-Host "1. ✅ Crée une fonction pour générer des codes uniques" -ForegroundColor White
Write-Host "2. ✅ Met à jour tous les profils sans code" -ForegroundColor White
Write-Host "3. ✅ Vérifie que tous les utilisateurs ont un code" -ForegroundColor White
Write-Host "4. ✅ Affiche des exemples de codes générés" -ForegroundColor White

Write-Host "`nPour appliquer la migration:" -ForegroundColor Cyan
Write-Host "1. Allez dans votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Ouvrez l'onglet SQL Editor" -ForegroundColor White
Write-Host "3. Copiez le contenu de 20250130000021_generate_missing_referral_codes.sql" -ForegroundColor White
Write-Host "4. Exécutez le script SQL" -ForegroundColor White

Write-Host "`nOu utilisez la CLI Supabase:" -ForegroundColor Cyan
Write-Host "supabase db push" -ForegroundColor White

Write-Host "`nAprès la migration:" -ForegroundColor Yellow
Write-Host "1. Rechargez la page /referrals" -ForegroundColor White
Write-Host "2. Vérifiez que le code de parrainage s'affiche" -ForegroundColor White
Write-Host "3. Testez le bouton de copie" -ForegroundColor White
Write-Host "4. Vérifiez que le lien ne contient plus 'ref=null'" -ForegroundColor White

Write-Host "`nMigration prête à être appliquée!" -ForegroundColor Green
