# Script SIMPLE pour promouvoir un utilisateur en admin
# Solution : Utiliser les métadonnées utilisateur au lieu de la base de données complexe

param(
    [Parameter(Mandatory=$true)]
    [string]$UserEmail
)

Write-Host "🚀 PROMOTION ADMIN SIMPLE" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "`n📧 Email: $UserEmail" -ForegroundColor Yellow
Write-Host "🎯 Objectif: Marquer l'utilisateur comme admin dans les métadonnées" -ForegroundColor Yellow

Write-Host "`n💡 SOLUTION SIMPLE:" -ForegroundColor Green
Write-Host "Au lieu de gérer des tables complexes, on va simplement" -ForegroundColor White
Write-Host "marquer votre utilisateur comme admin dans les métadonnées." -ForegroundColor White
Write-Host "C'est beaucoup plus simple et ça marche partout !" -ForegroundColor White

Write-Host "`n📋 Instructions pour Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

Write-Host "`n1. Allez sur https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Sélectionnez votre projet" -ForegroundColor WhiteGraph
Write-Host "3. Allez dans 'Authentication' > 'Users'" -ForegroundColor White
Write-Host "4. Trouvez l'utilisateur avec l'email: $UserEmail" -ForegroundColor White
Write-Host "5. Cliquez sur les 3 points (...) > 'Edit user'" -ForegroundColor White
Write-Host "6. Dans 'Raw user meta data', ajoutez:" -ForegroundColor White

Write-Host "`n📝 Code JSON à ajouter:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$jsonCode = @"
{
  "is_admin": true,
  "full_name": "Votre Nom"
}
"@

Write-Host $jsonCode -ForegroundColor Gray

Write-Host "`n7. Cliquez sur 'Save'" -ForegroundColor White
Write-Host "8. C'est tout ! Votre utilisateur est maintenant admin partout" -ForegroundColor White

Write-Host "`n🎯 AVANTAGES DE CETTE SOLUTION:" -ForegroundColor Green
Write-Host "✅ Simple et rapide" -ForegroundColor Green
Write-Host "✅ Fonctionne sur tous les ordinateurs" -ForegroundColor Green
Write-Host "✅ Pas de problème de synchronisation de base de données" -ForegroundColor Green
Write-Host "✅ Pas d'erreur 404 ou 406" -ForegroundColor Green
Write-Host "✅ Le code vérifie d'abord les métadonnées" -ForegroundColor Green

Write-Host "`n🔧 ALTERNATIVE AVEC SQL:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host "Si vous préférez utiliser SQL Editor:" -ForegroundColor White
Write-Host ""
Write-Host "-- Trouver l'utilisateur" -ForegroundColor Cyan
Write-Host "SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = '$UserEmail';" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Mettre à jour les métadonnées (remplacez USER_ID par l'ID trouvé ci-dessus)" -ForegroundColor Cyan
Write-Host "UPDATE auth.users" -ForegroundColor Gray
Write-Host "SET raw_user_meta_data = raw_user_meta_data || '{\"is_admin\": true}'::jsonb" -ForegroundColor Gray
Write-Host "WHERE id = 'USER_ID';" -ForegroundColor Gray

Write-Host "`n🎉 RÉSULTAT:" -ForegroundColor Cyan
Write-Host "Après cette modification, quand vous vous connecterez" -ForegroundColor White
Write-Host "depuis n'importe quel ordinateur, vous serez automatiquement" -ForegroundColor White
Write-Host "reconnu comme admin. Plus de problème de synchronisation !" -ForegroundColor White

Write-Host "`n📞 EN CAS DE PROBLÈME:" -ForegroundColor Yellow
Write-Host "Si ça ne marche toujours pas:" -ForegroundColor White
Write-Host "1. Déconnectez-vous complètement" -ForegroundColor Gray
Write-Host "2. Videz le cache du navigateur (Ctrl+Shift+Delete)" -ForegroundColor Gray
Write-Host "3. Reconnectez-vous" -ForegroundColor Gray
Write-Host "4. Le statut admin devrait être reconnu" -ForegroundColor Gray

Write-Host "`n✨ C'est beaucoup plus simple comme ça !" -ForegroundColor Cyan
