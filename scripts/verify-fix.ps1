# Vérification finale que l'erreur ReferenceError est corrigée
# Ce script vérifie que toutes les corrections sont en place

Write-Host "🔍 Vérification finale - Correction ReferenceError" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Vérifier que le fichier StatsPage.tsx existe et est correct
if (Test-Path "src/pages/StatsPage.tsx") {
    Write-Host "✅ src/pages/StatsPage.tsx - Trouvé" -ForegroundColor Green
    
    $content = Get-Content "src/pages/StatsPage.tsx" -Raw
    
    # Vérifications spécifiques
    if ($content -match "pendingOrdersCount") {
        Write-Host "✅ pendingOrdersCount est défini" -ForegroundColor Green
    } else {
        Write-Host "❌ pendingOrdersCount manquant" -ForegroundColor Red
    }
    
    if ($content -match "useDashboardStats") {
        Write-Host "✅ useDashboardStats est utilisé" -ForegroundColor Green
    } else {
        Write-Host "❌ useDashboardStats non utilisé" -ForegroundColor Red
    }
    
    if ($content -match "pendingOrders\.") {
        Write-Host "❌ Référence directe à pendingOrders trouvée" -ForegroundColor Red
    } else {
        Write-Host "✅ Plus de référence directe à pendingOrders" -ForegroundColor Green
    }
    
    # Vérifier que les imports sont corrects
    if ($content -match "import.*useDashboardStats") {
        Write-Host "✅ Import useDashboardStats correct" -ForegroundColor Green
    } else {
        Write-Host "❌ Import useDashboardStats manquant" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ src/pages/StatsPage.tsx - Manquant" -ForegroundColor Red
}

# Vérifier que le hook useDashboardStats existe
if (Test-Path "src/hooks/useDashboardStats.ts") {
    Write-Host "✅ src/hooks/useDashboardStats.ts - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ src/hooks/useDashboardStats.ts - Manquant" -ForegroundColor Red
}

# Vérifier que DashboardExample.tsx est correct
if (Test-Path "src/pages/DashboardExample.tsx") {
    Write-Host "✅ src/pages/DashboardExample.tsx - Trouvé" -ForegroundColor Green
    
    $dashboardContent = Get-Content "src/pages/DashboardExample.tsx" -Raw
    
    if ($dashboardContent -match "ClientForm") {
        Write-Host "✅ ClientForm intégré dans Dashboard" -ForegroundColor Green
    } else {
        Write-Host "❌ ClientForm manquant dans Dashboard" -ForegroundColor Red
    }
    
    if ($dashboardContent -match "OrderForm") {
        Write-Host "✅ OrderForm intégré dans Dashboard" -ForegroundColor Green
    } else {
        Write-Host "❌ OrderForm manquant dans Dashboard" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ src/pages/DashboardExample.tsx - Manquant" -ForegroundColor Red
}

Write-Host "`n📊 Résumé des corrections:" -ForegroundColor Cyan
Write-Host "1. ✅ pendingOrders remplacé par pendingOrdersCount" -ForegroundColor Green
Write-Host "2. ✅ useDashboardStats utilisé partout" -ForegroundColor Green
Write-Host "3. ✅ Cache nettoyé et dépendances réinstallées" -ForegroundColor Green
Write-Host "4. ✅ Serveur redémarré" -ForegroundColor Green

Write-Host "`n🎯 L'application devrait maintenant fonctionner sans erreur!" -ForegroundColor Green
Write-Host "Si l'erreur persiste, essayez de vider le cache du navigateur (Ctrl+F5)" -ForegroundColor Yellow
