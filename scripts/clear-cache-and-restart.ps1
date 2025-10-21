# Script pour nettoyer le cache et redémarrer l'application
# Ce script résout les problèmes de cache qui peuvent causer des erreurs ReferenceError

Write-Host "🧹 Nettoyage du cache et redémarrage" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Arrêter tous les processus Node.js
Write-Host "`n🛑 Arrêt des processus Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Nettoyer le cache npm
Write-Host "`n🧹 Nettoyage du cache npm..." -ForegroundColor Yellow
npm cache clean --force

# Supprimer node_modules et package-lock.json
Write-Host "`n🗑️ Suppression des dépendances..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ node_modules supprimé" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ package-lock.json supprimé" -ForegroundColor Green
}

# Réinstaller les dépendances
Write-Host "`n📦 Réinstallation des dépendances..." -ForegroundColor Yellow
npm install

# Vérifier que le fichier StatsPage.tsx est correct
Write-Host "`n🔍 Vérification du fichier StatsPage.tsx..." -ForegroundColor Yellow
$statsContent = Get-Content "src/pages/StatsPage.tsx" -Raw

if ($statsContent -match "pendingOrdersCount") {
    Write-Host "✅ pendingOrdersCount est défini" -ForegroundColor Green
} else {
    Write-Host "❌ pendingOrdersCount n'est pas défini" -ForegroundColor Red
}

if ($statsContent -match "pendingOrders\.") {
    Write-Host "❌ Référence directe à pendingOrders trouvée" -ForegroundColor Red
} else {
    Write-Host "✅ Plus de référence directe à pendingOrders" -ForegroundColor Green
}

# Redémarrer le serveur de développement
Write-Host "`n🚀 Redémarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host "Le serveur va démarrer en arrière-plan..." -ForegroundColor Cyan

# Démarrer le serveur en arrière-plan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

Write-Host "`n✅ Cache nettoyé et serveur redémarré!" -ForegroundColor Green
Write-Host "L'application devrait maintenant fonctionner sans erreur ReferenceError" -ForegroundColor Cyan
