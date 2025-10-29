# Script de Vérification Simple
Write-Host "🔍 VÉRIFICATION FIVERFLOW2.0" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Vérifier les fichiers
$files = @(".env.local", ".env", ".env.production", ".env.development", "env.example")
Write-Host "`n📁 Fichiers d'environnement:" -ForegroundColor Yellow

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file" -ForegroundColor Red
    }
}

# Vérifier les scripts
Write-Host "`n📜 Scripts disponibles:" -ForegroundColor Yellow
$scripts = @("scripts/quick-setup.ps1", "scripts/setup-master-env.ps1")
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "   ✅ $script" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $script" -ForegroundColor Red
    }
}

Write-Host "`n🎉 VÉRIFICATION TERMINÉE !" -ForegroundColor Green
Write-Host "Redémarrez avec: npm run dev" -ForegroundColor Yellow
