# Script de Vérification - Tout Fonctionne ?
Write-Host "🔍 VÉRIFICATION COMPLÈTE FIVERFLOW2.0" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Vérifier tous les fichiers d'environnement
$envFiles = @(".env.local", ".env", ".env.production", ".env.development", "env.example")
$allGood = $true

Write-Host "`n📁 Vérification des fichiers d'environnement:" -ForegroundColor Yellow
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   ✅ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file - MANQUANT" -ForegroundColor Red
        $allGood = $false
    }
}

# Vérifier les clés importantes
Write-Host "`n🔑 Vérification des clés importantes:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $content = Get-Content ".env.local" -Raw
    
    $keys = @(
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY", 
        "VITE_SUPABASE_SERVICE_ROLE_KEY",
        "VITE_STRIPE_PUBLISHABLE_KEY",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "VITE_DISCORD_WEBHOOK_URL",
        "VITE_OPENAI_API_KEY"
    )
    
    foreach ($key in $keys) {
        if ($content -match "^$key=") {
            Write-Host "   ✅ $key" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $key - MANQUANTE" -ForegroundColor Red
            $allGood = $false
        }
    }
} else {
    Write-Host "   ❌ Fichier .env.local manquant" -ForegroundColor Red
    $allGood = $false
}

# Vérifier les scripts
Write-Host "`n📜 Vérification des scripts:" -ForegroundColor Yellow
$scripts = @("scripts/quick-setup.ps1", "scripts/setup-master-env.ps1")
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "   ✅ $script" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $script - MANQUANT" -ForegroundColor Red
        $allGood = $false
    }
}

# Résultat final
Write-Host "`n📊 RÉSULTAT FINAL:" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "🎉 TOUT EST PARFAIT !" -ForegroundColor Green
    Write-Host "✅ Tous les fichiers d'environnement sont créés" -ForegroundColor Green
    Write-Host "✅ Toutes les clés sont configurées" -ForegroundColor Green
    Write-Host "✅ Tous les scripts sont disponibles" -ForegroundColor Green
    Write-Host "`n🚀 Vous pouvez maintenant:" -ForegroundColor Yellow
    Write-Host "   1. Redémarrer le serveur: npm run dev" -ForegroundColor White
    Write-Host "   2. Tester l'application: http://localhost:5173" -ForegroundColor White
    Write-Host "   3. Tester l'admin: http://localhost:5173/admin/dashboard" -ForegroundColor White
} else {
    Write-Host "❌ PROBLÈMES DÉTECTÉS !" -ForegroundColor Red
    Write-Host "🔧 Exécutez le script de configuration:" -ForegroundColor Yellow
    Write-Host "   powershell -ExecutionPolicy Bypass -File scripts/quick-setup.ps1" -ForegroundColor White
}

Write-Host "`n💡 En cas de problème:" -ForegroundColor Cyan
Write-Host "   - Exécutez: scripts/quick-setup.ps1" -ForegroundColor White
Write-Host "   - Vérifiez: ENV_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "   - Sauvegarde: MASTER_ENV_BACKUP.txt" -ForegroundColor White

Write-Host "`nVérification terminée !" -ForegroundColor Green
