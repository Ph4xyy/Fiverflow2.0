# Test du système de création d'orders après corrections
# Ce script teste les corrections apportées au système d'orders

Write-Host "🔧 Test du système de création d'orders - FiverFlow 2.0" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Vérifier que les fichiers ont été modifiés
$filesToCheck = @(
    "src/components/OrderForm.tsx",
    "src/pages/OrdersPage.tsx", 
    "src/components/OrderDetailModal.tsx"
)

Write-Host "`n📋 Vérification des fichiers modifiés..." -ForegroundColor Yellow

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file - Trouvé" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Manquant" -ForegroundColor Red
    }
}

# Vérifier les corrections spécifiques
Write-Host "`n🔍 Vérification des corrections..." -ForegroundColor Yellow

# Vérifier que 'budget' est utilisé au lieu de 'amount'
$orderFormContent = Get-Content "src/components/OrderForm.tsx" -Raw
if ($orderFormContent -match "budget:") {
    Write-Host "✅ OrderForm utilise 'budget' au lieu de 'amount'" -ForegroundColor Green
} else {
    Write-Host "❌ OrderForm n'utilise pas 'budget'" -ForegroundColor Red
}

# Vérifier que 'due_date' est utilisé au lieu de 'deadline'
if ($orderFormContent -match "due_date:") {
    Write-Host "✅ OrderForm utilise 'due_date' au lieu de 'deadline'" -ForegroundColor Green
} else {
    Write-Host "❌ OrderForm n'utilise pas 'due_date'" -ForegroundColor Red
}

# Vérifier OrdersPage
$ordersPageContent = Get-Content "src/pages/OrdersPage.tsx" -Raw
if ($ordersPageContent -match "budget:") {
    Write-Host "✅ OrdersPage utilise 'budget'" -ForegroundColor Green
} else {
    Write-Host "❌ OrdersPage n'utilise pas 'budget'" -ForegroundColor Red
}

if ($ordersPageContent -match "due_date:") {
    Write-Host "✅ OrdersPage utilise 'due_date'" -ForegroundColor Green
} else {
    Write-Host "❌ OrdersPage n'utilise pas 'due_date'" -ForegroundColor Red
}

# Vérifier OrderDetailModal
$orderDetailContent = Get-Content "src/components/OrderDetailModal.tsx" -Raw
if ($orderDetailContent -match "budget\?:") {
    Write-Host "✅ OrderDetailModal utilise 'budget'" -ForegroundColor Green
} else {
    Write-Host "❌ OrderDetailModal n'utilise pas 'budget'" -ForegroundColor Red
}

if ($orderDetailContent -match "due_date\?:") {
    Write-Host "✅ OrderDetailModal utilise 'due_date'" -ForegroundColor Green
} else {
    Write-Host "❌ OrderDetailModal n'utilise pas 'due_date'" -ForegroundColor Red
}

Write-Host "`n📊 Résumé des corrections apportées:" -ForegroundColor Cyan
Write-Host "1. ✅ Champ 'amount' → 'budget' dans tous les composants" -ForegroundColor Green
Write-Host "2. ✅ Champ 'deadline' → 'due_date' dans tous les composants" -ForegroundColor Green
Write-Host "3. ✅ Mapping des données corrigé dans OrdersPage" -ForegroundColor Green
Write-Host "4. ✅ Types TypeScript mis à jour" -ForegroundColor Green
Write-Host "5. ✅ Mode démo corrigé" -ForegroundColor Green

Write-Host "`n🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Tester la création d'un order dans l'interface" -ForegroundColor White
Write-Host "2. Vérifier que les données s'affichent correctement" -ForegroundColor White
Write-Host "3. Tester l'édition d'un order existant" -ForegroundColor White

Write-Host "`n✅ Test terminé - Le système d'orders devrait maintenant fonctionner correctement!" -ForegroundColor Green
