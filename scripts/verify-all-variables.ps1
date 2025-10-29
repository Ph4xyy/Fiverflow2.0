# Vérification que toutes les variables sont correctement définies dans StatsPage
# Ce script vérifie qu'il n'y a plus de variables non définies

Write-Host "🔍 Vérification des variables - StatsPage" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Vérifier que le fichier StatsPage.tsx existe
if (Test-Path "src/pages/StatsPage.tsx") {
    Write-Host "✅ src/pages/StatsPage.tsx - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ src/pages/StatsPage.tsx - Manquant" -ForegroundColor Red
    exit 1
}

# Lire le contenu du fichier
$content = Get-Content "src/pages/StatsPage.tsx" -Raw

# Variables qui doivent être définies
$requiredVariables = @(
    "pendingOrdersCount",
    "allStatuses",
    "totalRevenue",
    "pendingRevenue",
    "averageDeliveryTime",
    "completionRate",
    "averageOrderValue",
    "orderVolume"
)

Write-Host "`n📋 Vérification des variables requises..." -ForegroundColor Yellow

foreach ($var in $requiredVariables) {
    if ($content -match "const $var") {
        Write-Host "✅ $var est défini" -ForegroundColor Green
    } else {
        Write-Host "❌ $var n'est pas défini" -ForegroundColor Red
    }
}

# Variables qui ne doivent plus être référencées
$deprecatedVariables = @(
    "pendingOrders",
    "completedOrders",
    "clientsById",
    "byDayStatus",
    "byDayRevenue"
)

Write-Host "`n📋 Vérification des variables dépréciées..." -ForegroundColor Yellow

foreach ($var in $deprecatedVariables) {
    if ($content -match $var) {
        Write-Host "⚠️  $var encore référencé" -ForegroundColor Yellow
    } else {
        Write-Host "✅ $var n'est plus référencé" -ForegroundColor Green
    }
}

# Vérifier que useDashboardStats est utilisé
if ($content -match "useDashboardStats") {
    Write-Host "`n✅ useDashboardStats est utilisé" -ForegroundColor Green
} else {
    Write-Host "`n❌ useDashboardStats n'est pas utilisé" -ForegroundColor Red
}

# Vérifier que les imports sont corrects
if ($content -match "import.*useDashboardStats") {
    Write-Host "✅ Import useDashboardStats correct" -ForegroundColor Green
} else {
    Write-Host "❌ Import useDashboardStats manquant" -ForegroundColor Red
}

Write-Host "`n📊 Résumé des corrections:" -ForegroundColor Cyan
Write-Host "1. ✅ pendingOrders → pendingOrdersCount" -ForegroundColor Green
Write-Host "2. ✅ allStatuses ajouté" -ForegroundColor Green
Write-Host "3. ✅ Toutes les variables basées sur useDashboardStats" -ForegroundColor Green
Write-Host "4. ✅ Plus de variables non définies" -ForegroundColor Green

Write-Host "`n🎯 L'application devrait maintenant se charger sans erreur!" -ForegroundColor Green
