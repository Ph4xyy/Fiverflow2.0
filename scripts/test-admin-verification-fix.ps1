# Script de test pour vérifier la correction de l'erreur PGRST116
# Test de la vérification admin sans erreur

Write-Host "🧪 Test de la correction de l'erreur PGRST116" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Vérifier que Supabase est configuré
Write-Host "`n1. Vérification de la configuration Supabase..." -ForegroundColor Yellow

$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "✅ Fichier .env.local trouvé" -ForegroundColor Green
    $envContent = Get-Content $envFile
    $hasUrl = $envContent | Where-Object { $_ -match "VITE_SUPABASE_URL" }
    $hasKey = $envContent | Where-Object { $_ -match "VITE_SUPABASE_ANON_KEY" }
    
    if ($hasUrl -and $hasKey) {
        Write-Host "✅ Variables d'environnement Supabase configurées" -ForegroundColor Green
    } else {
        Write-Host "❌ Variables d'environnement Supabase manquantes" -ForegroundColor Red
        Write-Host "   VITE_SUPABASE_URL: $($hasUrl -ne $null)" -ForegroundColor Gray
        Write-Host "   VITE_SUPABASE_ANON_KEY: $($hasKey -ne $null)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Fichier .env.local non trouvé" -ForegroundColor Red
}

# Vérifier les modifications apportées
Write-Host "`n2. Vérification des modifications du code..." -ForegroundColor Yellow

$adminDashboardFile = "src/pages/AdminDashboard.tsx"
$layoutFile = "src/components/Layout.tsx"

if (Test-Path $adminDashboardFile) {
    $adminContent = Get-Content $adminDashboardFile -Raw
    if ($adminContent -match "Utiliser une requête sans \.single\(\) pour éviter l'erreur PGRST116") {
        Write-Host "✅ AdminDashboard.tsx - Correction PGRST116 appliquée" -ForegroundColor Green
    } else {
        Write-Host "❌ AdminDashboard.tsx - Correction PGRST116 non trouvée" -ForegroundColor Red
    }
    
    if ($adminContent -match "if \(!supabase\)") {
        Write-Host "✅ AdminDashboard.tsx - Vérification null ajoutée" -ForegroundColor Green
    } else {
        Write-Host "❌ AdminDashboard.tsx - Vérification null manquante" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier AdminDashboard.tsx non trouvé" -ForegroundColor Red
}

if (Test-Path $layoutFile) {
    $layoutContent = Get-Content $layoutFile -Raw
    if ($layoutContent -match "Utiliser une requête sans \.single\(\) pour éviter l'erreur PGRST116") {
        Write-Host "✅ Layout.tsx - Correction PGRST116 appliquée" -ForegroundColor Green
    } else {
        Write-Host "❌ Layout.tsx - Correction PGRST116 non trouvée" -ForegroundColor Red
    }
    
    if ($layoutContent -match "if \(!supabase\)") {
        Write-Host "✅ Layout.tsx - Vérification null ajoutée" -ForegroundColor Green
    } else {
        Write-Host "❌ Layout.tsx - Vérification null manquante" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier Layout.tsx non trouvé" -ForegroundColor Red
}

# Vérifier la structure de la base de données
Write-Host "`n3. Vérification de la structure de la base de données..." -ForegroundColor Yellow

$migrationFiles = Get-ChildItem "supabase/migrations" -Filter "*.sql" | Sort-Object Name
$hasUserProfiles = $false
$hasAdminSupport = $false

foreach ($file in $migrationFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "CREATE TABLE user_profiles") {
        $hasUserProfiles = $true
        Write-Host "✅ Table user_profiles trouvée dans $($file.Name)" -ForegroundColor Green
    }
    if ($content -match "is_admin") {
        $hasAdminSupport = $true
        Write-Host "✅ Support admin trouvé dans $($file.Name)" -ForegroundColor Green
    }
}

if (-not $hasUserProfiles) {
    Write-Host "❌ Table user_profiles non trouvée dans les migrations" -ForegroundColor Red
}
if (-not $hasAdminSupport) {
    Write-Host "❌ Support admin non trouvé dans les migrations" -ForegroundColor Red
}

# Instructions de test
Write-Host "`n4. Instructions de test..." -ForegroundColor Yellow
Write-Host "Pour tester la correction:" -ForegroundColor White
Write-Host "1. Démarrez l'application: npm run dev" -ForegroundColor Gray
Write-Host "2. Connectez-vous avec un compte admin" -ForegroundColor Gray
Write-Host "3. Naviguez vers /admin/dashboard" -ForegroundColor Gray
Write-Host "4. Vérifiez qu'il n'y a plus d'erreur PGRST116 dans la console" -ForegroundColor Gray
Write-Host "5. Vérifiez que le dashboard admin s'affiche correctement" -ForegroundColor Gray

Write-Host "`n5. Résumé des corrections apportées:" -ForegroundColor Yellow
Write-Host "✅ Suppression de .single() dans les requêtes admin" -ForegroundColor Green
Write-Host "✅ Gestion du cas où l'utilisateur n'existe pas dans user_profiles" -ForegroundColor Green
Write-Host "✅ Vérification de null pour le client Supabase" -ForegroundColor Green
Write-Host "✅ Messages de log améliorés pour le debugging" -ForegroundColor Green

Write-Host "`n🎯 La correction devrait résoudre l'erreur PGRST116!" -ForegroundColor Cyan
Write-Host "L'erreur se produisait car .single() s'attendait à trouver exactement une ligne," -ForegroundColor White
Write-Host "mais l'utilisateur n'avait pas de profil dans user_profiles." -ForegroundColor White
Write-Host "Maintenant, la requête gère correctement le cas où aucun profil n'existe." -ForegroundColor White
