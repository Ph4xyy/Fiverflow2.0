# Test visuel du systeme de theme
Write-Host "Test visuel du systeme de theme" -ForegroundColor Cyan

# Verifier que les styles CSS sont ajoutes
$cssContent = Get-Content "src/index.css" -Raw

if ($cssContent -match "\.halloween.*bg-\[#111726\]") {
    Write-Host "OK: Styles Halloween pour bg-[#111726] ajoutes" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Styles Halloween manquants" -ForegroundColor Red
}

if ($cssContent -match "\.halloween.*text-white") {
    Write-Host "OK: Styles Halloween pour text-white ajoutes" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Styles text Halloween manquants" -ForegroundColor Red
}

# Verifier que le ThemeContext a les logs
$themeContext = Get-Content "src/contexts/ThemeContext.tsx" -Raw

if ($themeContext -match "console.log.*Theme applied") {
    Write-Host "OK: Logs de debug ajoutes" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Logs de debug manquants" -ForegroundColor Red
}

if ($themeContext -match "setAttribute.*data-theme") {
    Write-Host "OK: Attribut data-theme ajoute" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Attribut data-theme manquant" -ForegroundColor Red
}

Write-Host "`nInstructions pour tester:" -ForegroundColor Yellow
Write-Host "1. Ouvrez la console du navigateur (F12)" -ForegroundColor White
Write-Host "2. Changez de theme dans Profil > Settings" -ForegroundColor White
Write-Host "3. Verifiez les logs: 'Theme applied: halloween'" -ForegroundColor White
Write-Host "4. Verifiez que la classe 'halloween' est ajoutee au <html>" -ForegroundColor White
Write-Host "5. Les couleurs devraient changer immediatement" -ForegroundColor White

Write-Host "`nSi le theme ne change pas visuellement:" -ForegroundColor Yellow
Write-Host "1. Videz le cache du navigateur (Ctrl+F5)" -ForegroundColor White
Write-Host "2. Verifiez que les classes CSS sont appliquees" -ForegroundColor White
Write-Host "3. Regardez les logs dans la console" -ForegroundColor White

Write-Host "`nLe systeme de theme devrait maintenant fonctionner visuellement!" -ForegroundColor Green
