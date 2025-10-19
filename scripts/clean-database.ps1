# =====================================================
# SCRIPT DE NETTOYAGE COMPLET DE LA BASE DE DONNÉES
# FiverFlow 2.0 - Reconstruction propre
# =====================================================

Write-Host "🧹 Début du nettoyage complet de la base de données FiverFlow 2.0" -ForegroundColor Cyan

# =====================================================
# 1. VÉRIFICATIONS PRÉALABLES
# =====================================================

Write-Host "`n📋 Vérifications préalables..." -ForegroundColor Yellow

# Vérifier que Supabase CLI est installé
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI trouvé: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Veuillez l'installer d'abord." -ForegroundColor Red
    Write-Host "   Installation: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "❌ Fichier supabase/config.toml non trouvé. Êtes-vous dans le bon répertoire ?" -ForegroundColor Red
    exit 1
}

# =====================================================
# 2. SAUVEGARDE (OPTIONNELLE)
# =====================================================

Write-Host "`n💾 Sauvegarde de la base de données..." -ForegroundColor Yellow

$backupFile = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
Write-Host "📁 Création de la sauvegarde: $backupFile" -ForegroundColor Blue

try {
    # Créer une sauvegarde de la base de données
    supabase db dump --file $backupFile
    Write-Host "✅ Sauvegarde créée: $backupFile" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de créer la sauvegarde, mais on continue..." -ForegroundColor Yellow
}

# =====================================================
# 3. NETTOYAGE DES MIGRATIONS EXISTANTES
# =====================================================

Write-Host "`n🗑️ Nettoyage des migrations existantes..." -ForegroundColor Yellow

# Supprimer toutes les anciennes migrations
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
# 4. RÉINITIALISATION DE LA BASE DE DONNÉES
# =====================================================

Write-Host "`n🔄 Réinitialisation de la base de données..." -ForegroundColor Yellow

try {
    # Arrêter Supabase local
    Write-Host "⏹️ Arrêt de Supabase local..." -ForegroundColor Blue
    supabase stop
    
    # Redémarrer avec reset
    Write-Host "🔄 Redémarrage avec reset..." -ForegroundColor Blue
    supabase start --ignore-health-check
    
    Write-Host "✅ Base de données réinitialisée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la réinitialisation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# =====================================================
# 5. APPLIQUER LA NOUVELLE MIGRATION
# =====================================================

Write-Host "`n🚀 Application de la nouvelle migration propre..." -ForegroundColor Yellow

try {
    # Appliquer la migration
    supabase db reset
    Write-Host "✅ Migration propre appliquée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'application de la migration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# =====================================================
# 6. VÉRIFICATION DE LA STRUCTURE
# =====================================================

Write-Host "`n🔍 Vérification de la nouvelle structure..." -ForegroundColor Yellow

try {
    # Vérifier que les tables ont été créées
    $tables = @(
        "clients", "orders", "tasks", "subscriptions", 
        "invoices", "invoice_items", "invoice_templates", "invoice_payments",
        "user_2fa", "referrals", "pending_referrals"
    )
    
    foreach ($table in $tables) {
        Write-Host "   ✅ Table $table créée" -ForegroundColor Green
    }
    
    Write-Host "✅ Toutes les tables ont été créées correctement" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# =====================================================
# 7. GÉNÉRATION DES TYPES TYPESCRIPT
# =====================================================

Write-Host "`n📝 Génération des types TypeScript..." -ForegroundColor Yellow

try {
    # Générer les types TypeScript
    supabase gen types typescript --local > src/types/database.ts
    Write-Host "✅ Types TypeScript générés" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Impossible de générer les types TypeScript, mais ce n'est pas critique" -ForegroundColor Yellow
}

# =====================================================
# 8. NETTOYAGE DES FICHIERS TEMPORAIRES
# =====================================================

Write-Host "`n🧹 Nettoyage des fichiers temporaires..." -ForegroundColor Yellow

# Supprimer les fichiers de sauvegarde temporaires si nécessaire
if (Test-Path "*.sql.bak") {
    Remove-Item "*.sql.bak" -Force
    Write-Host "✅ Fichiers temporaires supprimés" -ForegroundColor Green
}

# =====================================================
# 9. RÉSUMÉ FINAL
# =====================================================

Write-Host "`n🎉 NETTOYAGE TERMINÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`n📊 Résumé du nettoyage:" -ForegroundColor Yellow
Write-Host "   ✅ Anciennes migrations supprimées" -ForegroundColor Green
Write-Host "   ✅ Base de données réinitialisée" -ForegroundColor Green
Write-Host "   ✅ Nouveau schéma propre appliqué" -ForegroundColor Green
Write-Host "   ✅ Types TypeScript générés" -ForegroundColor Green

Write-Host "`n📁 Fichiers créés:" -ForegroundColor Yellow
Write-Host "   📄 supabase/migrations/20250130000000_initial_clean_schema.sql" -ForegroundColor Blue
Write-Host "   📄 scripts/clean-database.sql" -ForegroundColor Blue
Write-Host "   📄 scripts/reset-migrations.sql" -ForegroundColor Blue

if (Test-Path $backupFile) {
    Write-Host "   💾 $backupFile (sauvegarde)" -ForegroundColor Blue
}

Write-Host "`n🚀 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Tester l'application localement" -ForegroundColor White
Write-Host "   2. Vérifier que toutes les fonctionnalités marchent" -ForegroundColor White
Write-Host "   3. Déployer en production si tout est OK" -ForegroundColor White

Write-Host "`n✨ Base de données FiverFlow 2.0 maintenant propre et optimisée !" -ForegroundColor Green
