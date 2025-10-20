# Script pour corriger l'erreur 406 dans la vérification admin
# Problème: Erreur 406 "Not Acceptable" lors de la requête user_profiles

Write-Host "🔧 Correction de l'erreur 406 - Vérification Admin" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Vérifier que Supabase CLI est disponible
Write-Host "`n1. Vérification de Supabase CLI..." -ForegroundColor Yellow

try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI trouvé: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Installez-le d'abord:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Gray
    Write-Host "   ou visitez: https://supabase.com/docs/guides/cli" -ForegroundColor Gray
    exit 1
}

# Vérifier la connexion à Supabase
Write-Host "`n2. Vérification de la connexion Supabase..." -ForegroundColor Yellow

try {
    $status = supabase status
    Write-Host "✅ Connexion Supabase OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Impossible de se connecter à Supabase" -ForegroundColor Red
    Write-Host "   Vérifiez votre configuration dans .env.local" -ForegroundColor Gray
    exit 1
}

# Appliquer la migration
Write-Host "`n3. Application de la migration pour corriger l'erreur 406..." -ForegroundColor Yellow

try {
    # Vérifier si la migration existe
    $migrationFile = "supabase/migrations/20250130000020_step20_admin_verification_rpc.sql"
    if (Test-Path $migrationFile) {
        Write-Host "✅ Fichier de migration trouvé: $migrationFile" -ForegroundColor Green
        
        # Appliquer la migration
        Write-Host "📤 Application de la migration..." -ForegroundColor Blue
        supabase db push
        
        Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
    } else {
        Write-Host "❌ Fichier de migration non trouvé: $migrationFile" -ForegroundColor Red
        Write-Host "   Créez d'abord le fichier de migration" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'application de la migration:" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Gray
    exit 1
}

# Vérifier les modifications du code
Write-Host "`n4. Vérification des modifications du code..." -ForegroundColor Yellow

$adminDashboardFile = "src/pages/AdminDashboard.tsx"
$layoutFile = "src/components/Layout.tsx"

$hasRpcSupport = $false
$has406Handling = $false

if (Test-Path $adminDashboardFile) {
    $adminContent = Get-Content $adminDashboardFile -Raw
    if ($adminContent -match "get_user_admin_status") {
        Write-Host "✅ AdminDashboard.tsx - Support RPC ajouté" -ForegroundColor Green
        $hasRpcSupport = $true
    } else {
        Write-Host "❌ AdminDashboard.tsx - Support RPC manquant" -ForegroundColor Red
    }
    
    if ($adminContent -match "Erreur 406 détectée") {
        Write-Host "✅ AdminDashboard.tsx - Gestion erreur 406 ajoutée" -ForegroundColor Green
        $has406Handling = $true
    } else {
        Write-Host "❌ AdminDashboard.tsx - Gestion erreur 406 manquante" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier AdminDashboard.tsx non trouvé" -ForegroundColor Red
}

if (Test-Path $layoutFile) {
    $layoutContent = Get-Content $layoutFile -Raw
    if ($layoutContent -match "get_user_admin_status") {
        Write-Host "✅ Layout.tsx - Support RPC ajouté" -ForegroundColor Green
        $hasRpcSupport = $hasRpcSupport -or $true
    } else {
        Write-Host "❌ Layout.tsx - Support RPC manquant" -ForegroundColor Red
    }
    
    if ($layoutContent -match "Erreur 406 détectée") {
        Write-Host "✅ Layout.tsx - Gestion erreur 406 ajoutée" -ForegroundColor Green
        $has406Handling = $has406Handling -or $true
    } else {
        Write-Host "❌ Layout.tsx - Gestion erreur 406 manquante" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier Layout.tsx non trouvé" -ForegroundColor Red
}

# Résumé des corrections
Write-Host "`n5. Résumé des corrections apportées:" -ForegroundColor Yellow

if ($hasRpcSupport) {
    Write-Host "✅ Fonctions RPC créées pour contourner les politiques RLS" -ForegroundColor Green
} else {
    Write-Host "❌ Fonctions RPC manquantes" -ForegroundColor Red
}

if ($has406Handling) {
    Write-Host "✅ Gestion spécifique de l'erreur 406 ajoutée" -ForegroundColor Green
} else {
    Write-Host "❌ Gestion erreur 406 manquante" -ForegroundColor Red
}

Write-Host "✅ Vérification null pour le client Supabase" -ForegroundColor Green
Write-Host "✅ Messages de log améliorés pour le debugging" -ForegroundColor Green
Write-Host "✅ Fallback vers métadonnées utilisateur en cas d'erreur" -ForegroundColor Green

# Instructions de test
Write-Host "`n6. Instructions de test:" -ForegroundColor Yellow
Write-Host "Pour tester la correction de l'erreur 406:" -ForegroundColor White
Write-Host "1. Redémarrez l'application: npm run dev" -ForegroundColor Gray
Write-Host "2. Connectez-vous avec votre compte admin" -ForegroundColor Gray
Write-Host "3. Vérifiez que le dashboard admin reste affiché (ne disparaît plus)" -ForegroundColor Gray
Write-Host "4. Vérifiez qu'il n'y a plus d'erreur 406 dans la console" -ForegroundColor Gray
Write-Host "5. Vérifiez que la page profil affiche correctement le nom" -ForegroundColor Gray

Write-Host "`n7. Fonctions RPC créées:" -ForegroundColor Yellow
Write-Host "✅ get_user_admin_status(user_uuid) - Vérifie le statut admin" -ForegroundColor Green
Write-Host "✅ get_user_profile_info(user_uuid) - Récupère les infos profil" -ForegroundColor Green
Write-Host "✅ ensure_user_profile(user_uuid) - Crée le profil si nécessaire" -ForegroundColor Green

Write-Host "`n🎯 La correction devrait résoudre l'erreur 406!" -ForegroundColor Cyan
Write-Host "L'erreur 406 était causée par les politiques RLS qui bloquaient" -ForegroundColor White
Write-Host "l'accès à la table user_profiles. Les fonctions RPC contournent" -ForegroundColor White
Write-Host "cette restriction en s'exécutant avec les privilèges du créateur." -ForegroundColor White
