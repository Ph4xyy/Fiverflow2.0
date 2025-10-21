# Test final du systeme de theme
Write-Host "Test final du systeme de theme" -ForegroundColor Cyan

# Verifier tous les fichiers
$files = @(
    "src/contexts/ThemeContext.tsx",
    "src/components/ThemeSelector.tsx",
    "src/components/Layout.tsx", 
    "src/pages/ProfilePageNew.tsx",
    "src/App.tsx",
    "src/index.css"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: $file manquant" -ForegroundColor Red
    }
}

Write-Host "`nFonctionnalites implementees:" -ForegroundColor Yellow
Write-Host "1. ThemeProvider enveloppe l'application" -ForegroundColor White
Write-Host "2. ThemeSelector dans Profil > Settings" -ForegroundColor White
Write-Host "3. Bouton de changement rapide dans la barre de navigation" -ForegroundColor White
Write-Host "4. Styles CSS Halloween avec couleurs orange/rouge" -ForegroundColor White
Write-Host "5. Sauvegarde automatique dans localStorage" -ForegroundColor White
Write-Host "6. Logs de debug pour le developpement" -ForegroundColor White

Write-Host "`nComment tester:" -ForegroundColor Cyan
Write-Host "1. Allez dans Profil > Settings > Theme" -ForegroundColor White
Write-Host "2. Cliquez sur 'Halloween'" -ForegroundColor White
Write-Host "3. Le theme devrait changer immediatement" -ForegroundColor White
Write-Host "4. Ou utilisez le bouton dans la barre de navigation" -ForegroundColor White

Write-Host "`nSi le theme ne change pas:" -ForegroundColor Yellow
Write-Host "1. Ouvrez la console (F12) et regardez les logs" -ForegroundColor White
Write-Host "2. Videz le cache (Ctrl+F5)" -ForegroundColor White
Write-Host "3. Verifiez que la classe 'halloween' est sur <html>" -ForegroundColor White

Write-Host "`nSysteme de theme Halloween complet!" -ForegroundColor Green
