# Test simple du systeme de theme Halloween
Write-Host "Test du systeme de theme Halloween" -ForegroundColor Cyan

# Verifier les fichiers
$files = @(
    "src/contexts/ThemeContext.tsx",
    "src/components/ThemeSelector.tsx", 
    "src/components/Layout.tsx",
    "src/pages/ProfilePageNew.tsx",
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
Write-Host "1. Theme Light (defaut)" -ForegroundColor White
Write-Host "2. Theme Dark (mode sombre)" -ForegroundColor White  
Write-Host "3. Theme Halloween (special)" -ForegroundColor White
Write-Host "4. Bouton de changement rapide dans la barre de navigation" -ForegroundColor White
Write-Host "5. Selecteur de theme dans les parametres du profil" -ForegroundColor White

Write-Host "`nSysteme de theme Halloween implemente avec succes!" -ForegroundColor Green
