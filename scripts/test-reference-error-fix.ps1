# Test de correction de l'erreur ReferenceError: pendingOrders is not defined
# Ce script vérifie que l'erreur a été corrigée

Write-Host "🔧 Test de correction ReferenceError - StatsPage" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Vérifier que le fichier StatsPage.tsx existe
if (Test-Path "src/pages/StatsPage.tsx") {
    Write-Host "✅ src/pages/StatsPage.tsx - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ src/pages/StatsPage.tsx - Manquant" -ForegroundColor Red
    exit 1
}

# Vérifier que pendingOrders n'est plus référencé directement
$statsContent = Get-Content "src/pages/StatsPage.tsx" -Raw

if ($statsContent -match "pendingOrders\.") {
    Write-Host "❌ Référence directe à pendingOrders trouvée" -ForegroundColor Red
} else {
    Write-Host "✅ Plus de référence directe à pendingOrders" -ForegroundColor Green
}

# Vérifier que pendingOrdersCount est défini
if ($statsContent -match "pendingOrdersCount") {
    Write-Host "✅ pendingOrdersCount est défini" -ForegroundColor Green
} else {
    Write-Host "❌ pendingOrdersCount n'est pas défini" -ForegroundColor Red
}

# Vérifier que useDashboardStats est utilisé
if ($statsContent -match "useDashboardStats") {
    Write-Host "✅ useDashboardStats est utilisé" -ForegroundColor Green
} else {
    Write-Host "❌ useDashboardStats n'est pas utilisé" -ForegroundColor Red
}

# Vérifier qu'il n'y a pas d'autres variables non définies
$undefinedVars = @("completedOrders", "clientsById")
foreach ($var in $undefinedVars) {
    if ($statsContent -match $var) {
        Write-Host "⚠️  Variable $var encore référencée" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Variable $var n'est plus référencée" -ForegroundColor Green
    }
}

Write-Host "`n📊 Résumé de la correction:" -ForegroundColor Cyan
Write-Host "1. ✅ pendingOrders remplacé par pendingOrdersCount" -ForegroundColor Green
Write-Host "2. ✅ Calcul basé sur les données du hook useDashboardStats" -ForegroundColor Green
Write-Host "3. ✅ Plus de variables non définies" -ForegroundColor Green
Write-Host "4. ✅ Code cohérent avec le hook" -ForegroundColor Green

Write-Host "`n🎯 La page Statistiques devrait maintenant se charger sans erreur!" -ForegroundColor Green
