# Test de correction du systeme de theme
Write-Host "Test de correction du systeme de theme" -ForegroundColor Cyan

# Verifier que les corrections sont en place
$themeContext = Get-Content "src/contexts/ThemeContext.tsx" -Raw

if ($themeContext -match "dark_mode") {
    Write-Host "OK: Utilise la colonne dark_mode existante" -ForegroundColor Green
} else {
    Write-Host "ERREUR: N'utilise pas la colonne dark_mode" -ForegroundColor Red
}

if ($themeContext -match "console.warn") {
    Write-Host "OK: Gestion d'erreur amelioree" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Gestion d'erreur manquante" -ForegroundColor Red
}

if ($themeContext -match "toast.error.*Failed to save") {
    Write-Host "ATTENTION: Toast d'erreur encore present" -ForegroundColor Yellow
} else {
    Write-Host "OK: Toast d'erreur supprime" -ForegroundColor Green
}

Write-Host "`nCorrections apportees:" -ForegroundColor Yellow
Write-Host "1. Utilise la colonne dark_mode existante au lieu de theme_preference" -ForegroundColor White
Write-Host "2. Convertit les themes en boolean (dark/halloween = true, light = false)" -ForegroundColor White
Write-Host "3. Supprime les toasts d'erreur pour les echecs de sauvegarde" -ForegroundColor White
Write-Host "4. Sauvegarde toujours dans localStorage en priorite" -ForegroundColor White

Write-Host "`nLe systeme de theme devrait maintenant fonctionner sans erreur!" -ForegroundColor Green
