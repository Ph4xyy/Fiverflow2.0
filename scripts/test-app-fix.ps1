# Test de correction de l'erreur Layout
Write-Host "Test de correction de l'erreur Layout" -ForegroundColor Cyan

# Verifier que ThemeProvider est ajoute dans App.tsx
$appContent = Get-Content "src/App.tsx" -Raw

if ($appContent -match "ThemeProvider") {
    Write-Host "OK: ThemeProvider ajoute dans App.tsx" -ForegroundColor Green
} else {
    Write-Host "ERREUR: ThemeProvider manquant dans App.tsx" -ForegroundColor Red
}

if ($appContent -match "import.*ThemeProvider") {
    Write-Host "OK: Import ThemeProvider ajoute" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Import ThemeProvider manquant" -ForegroundColor Red
}

# Verifier que le code de forçage du thème est supprime dans main.tsx
$mainContent = Get-Content "src/main.tsx" -Raw

if ($mainContent -match "document.documentElement.classList.add") {
    Write-Host "ATTENTION: Code de forçage du thème encore present" -ForegroundColor Yellow
} else {
    Write-Host "OK: Code de forçage du thème supprime" -ForegroundColor Green
}

Write-Host "`nCorrections apportees:" -ForegroundColor Yellow
Write-Host "1. ThemeProvider ajoute dans App.tsx" -ForegroundColor White
Write-Host "2. ThemeProvider enveloppe autour de l'application" -ForegroundColor White
Write-Host "3. Code de forçage du thème supprime de main.tsx" -ForegroundColor White

Write-Host "`nL'application devrait maintenant fonctionner!" -ForegroundColor Green
