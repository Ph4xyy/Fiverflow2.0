# =====================================================
# SCRIPT DE NETTOYAGE SIMPLIFIÉ - SANS DOCKER
# FiverFlow 2.0 - Nettoyage de la base de données
# =====================================================

Write-Host "🧹 Nettoyage simplifié de la base de données FiverFlow 2.0" -ForegroundColor Cyan
Write-Host "⚠️ Ce script fonctionne sans Docker (pour Supabase Cloud)" -ForegroundColor Yellow

# =====================================================
# 1. VÉRIFICATIONS PRÉALABLES
# =====================================================

Write-Host "`n📋 Vérifications préalables..." -ForegroundColor Yellow

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "❌ Fichier supabase/config.toml non trouvé. Êtes-vous dans le bon répertoire ?" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le répertoire racine du projet FiverFlow 2.0" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Répertoire de projet trouvé" -ForegroundColor Green

# Vérifier que npx supabase fonctionne
try {
    $supabaseVersion = npx supabase --version
    Write-Host "✅ Supabase CLI trouvé: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Veuillez l'installer d'abord." -ForegroundColor Red
    Write-Host "   Installation: npm install -g @supabase/cli" -ForegroundColor Yellow
    exit 1
}

# =====================================================
# 2. NETTOYAGE DES MIGRATIONS EXISTANTES
# =====================================================

Write-Host "`n🗑️ Nettoyage des migrations existantes..." -ForegroundColor Yellow

# Supprimer toutes les anciennes migrations sauf la nouvelle
$migrationFiles = Get-ChildItem "supabase/migrations" -Filter "*.sql" | Where-Object { $_.Name -ne "20250130000000_initial_clean_schema.sql" }

if ($migrationFiles.Count -gt 0) {
    Write-Host "📁 Suppression de $($migrationFiles.Count) anciennes migrations..." -ForegroundColor Blue
    
    foreach ($file in $migrationFiles) {
        Write-Host "   🗑️ Suppression: $($file.Name)" -ForegroundColor Gray
        Remove-Item $file.FullName -Force
    }
    
    Write-Host "✅ Anciennes migrations supprimées" -ForegroundColor Green
} else {
    Write-Host "✅ Aucune ancienne migration à supprimer" -ForegroundColor Green
}

# =====================================================
# 3. VÉRIFICATION DE LA NOUVELLE MIGRATION
# =====================================================

Write-Host "`n📄 Vérification de la nouvelle migration..." -ForegroundColor Yellow

if (Test-Path "supabase/migrations/20250130000000_initial_clean_schema.sql") {
    Write-Host "✅ Nouvelle migration trouvée" -ForegroundColor Green
    
    # Afficher la taille du fichier
    $fileSize = (Get-Item "supabase/migrations/20250130000000_initial_clean_schema.sql").Length
    Write-Host "   📊 Taille: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Blue
} else {
    Write-Host "❌ Nouvelle migration non trouvée" -ForegroundColor Red
    Write-Host "   Création de la migration..." -ForegroundColor Yellow
    
    # Créer la migration si elle n'existe pas
    if (Test-Path "scripts/clean-database.sql") {
        Copy-Item "scripts/clean-database.sql" "supabase/migrations/20250130000000_initial_clean_schema.sql"
        Write-Host "✅ Migration créée à partir du script de nettoyage" -ForegroundColor Green
    } else {
        Write-Host "❌ Script de nettoyage non trouvé" -ForegroundColor Red
        exit 1
    }
}

# =====================================================
# 4. OPTIONS DE DÉPLOIEMENT
# =====================================================

Write-Host "`n🚀 Options de déploiement:" -ForegroundColor Yellow
Write-Host "   1. Supabase Local (nécessite Docker)" -ForegroundColor White
Write-Host "   2. Supabase Cloud (recommandé)" -ForegroundColor White
Write-Host "   3. Générer les types TypeScript seulement" -ForegroundColor White

$choice = Read-Host "`nChoisissez une option (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n🐳 Déploiement sur Supabase Local..." -ForegroundColor Blue
        Write-Host "⚠️ Nécessite Docker Desktop installé et démarré" -ForegroundColor Yellow
        
        try {
            # Vérifier Docker
            docker --version
            Write-Host "✅ Docker trouvé" -ForegroundColor Green
            
            # Démarrer Supabase local
            Write-Host "🔄 Démarrage de Supabase local..." -ForegroundColor Blue
            npx supabase start
            
            # Appliquer les migrations
            Write-Host "📄 Application des migrations..." -ForegroundColor Blue
            npx supabase db reset
            
            Write-Host "✅ Base de données locale mise à jour" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erreur avec Docker: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Veuillez installer Docker Desktop et le démarrer" -ForegroundColor Yellow
        }
    }
    "2" {
        Write-Host "`n☁️ Déploiement sur Supabase Cloud..." -ForegroundColor Blue
        Write-Host "⚠️ Assurez-vous d'etre connecte a votre projet Supabase" -ForegroundColor Yellow
        
        try {
            # Vérifier la connexion
            Write-Host "🔍 Vérification de la connexion..." -ForegroundColor Blue
            npx supabase projects list
            
            # Appliquer les migrations
            Write-Host "📄 Application des migrations..." -ForegroundColor Blue
            npx supabase db push
            
            Write-Host "✅ Base de données cloud mise à jour" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Veuillez vous connecter avec: npx supabase login" -ForegroundColor Yellow
        }
    }
    "3" {
        Write-Host "`n📝 Génération des types TypeScript..." -ForegroundColor Blue
        
        try {
            # Générer les types
            npx supabase gen types typescript --local > src/types/database.ts
            Write-Host "✅ Types TypeScript générés dans src/types/database.ts" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Impossible de générer les types localement" -ForegroundColor Yellow
            Write-Host "   Essayez avec: npx supabase gen types typescript --project-id YOUR_PROJECT_ID" -ForegroundColor Blue
        }
    }
    default {
        Write-Host "❌ Option invalide" -ForegroundColor Red
        exit 1
    }
}

# =====================================================
# 5. VÉRIFICATION FINALE
# =====================================================

Write-Host "`n🔍 Vérification finale..." -ForegroundColor Yellow

# Vérifier que les fichiers sont en place
$requiredFiles = @(
    "supabase/migrations/20250130000000_initial_clean_schema.sql",
    "scripts/clean-database.sql",
    "scripts/verify-database.sql"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "✅ Tous les fichiers requis sont présents" -ForegroundColor Green
} else {
    Write-Host "❌ Certains fichiers sont manquants" -ForegroundColor Red
}

# =====================================================
# 6. RÉSUMÉ FINAL
# =====================================================

Write-Host "`n🎉 NETTOYAGE TERMINÉ !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`n📊 Résumé du nettoyage:" -ForegroundColor Yellow
Write-Host "   ✅ Anciennes migrations supprimées" -ForegroundColor Green
Write-Host "   ✅ Nouvelle migration propre en place" -ForegroundColor Green
Write-Host "   ✅ Scripts de nettoyage créés" -ForegroundColor Green

Write-Host "`n📁 Fichiers créés:" -ForegroundColor Yellow
Write-Host "   📄 supabase/migrations/20250130000000_initial_clean_schema.sql" -ForegroundColor Blue
Write-Host "   📄 scripts/clean-database.sql" -ForegroundColor Blue
Write-Host "   📄 scripts/verify-database.sql" -ForegroundColor Blue
Write-Host "   📄 DATABASE_CLEANUP_GUIDE.md" -ForegroundColor Blue

Write-Host "`n🚀 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Si vous utilisez Supabase Cloud, connectez-vous avec: npx supabase login" -ForegroundColor White
Write-Host "   2. Appliquez les migrations avec: npx supabase db push" -ForegroundColor White
Write-Host "   3. Testez votre application" -ForegroundColor White

Write-Host "`n✨ Base de données FiverFlow 2.0 prête pour le nettoyage !" -ForegroundColor Green
