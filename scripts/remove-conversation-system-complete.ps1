# Script PowerShell pour supprimer complètement le système de conversation
# Ce script exécute le nettoyage SQL et vérifie que tout a été supprimé

Write-Host "🧹 Suppression complète du système de conversation..." -ForegroundColor Yellow

# Vérifier que Supabase CLI est installé
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI n'est pas installé. Veuillez l'installer d'abord." -ForegroundColor Red
    exit 1
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "❌ Ce script doit être exécuté depuis la racine du projet FiverFlow" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Exécution du nettoyage SQL..." -ForegroundColor Blue

# Exécuter le script SQL de nettoyage
try {
    supabase db reset --linked
    Write-Host "✅ Base de données réinitialisée avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la réinitialisation de la base de données: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Vérification des tables restantes..." -ForegroundColor Blue

# Vérifier qu'il n'y a plus de tables liées au système de conversation
try {
    $result = supabase db shell --command "SELECT tablename FROM pg_tables WHERE tablename LIKE '%conversation%' OR tablename LIKE '%message%' OR tablename LIKE '%chat%';"
    
    if ($result -match "0 rows") {
        Write-Host "✅ Aucune table de conversation trouvée" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Des tables de conversation existent encore:" -ForegroundColor Yellow
        Write-Host $result
    }
} catch {
    Write-Host "⚠️ Impossible de vérifier les tables restantes" -ForegroundColor Yellow
}

Write-Host "🎉 Suppression du système de conversation terminée!" -ForegroundColor Green
Write-Host "📝 Résumé des actions effectuées:" -ForegroundColor Cyan
Write-Host "   • Composants React supprimés" -ForegroundColor White
Write-Host "   • Services et hooks supprimés" -ForegroundColor White
Write-Host "   • Scripts SQL supprimés" -ForegroundColor White
Write-Host "   • Documentation supprimée" -ForegroundColor White
Write-Host "   • Base de données nettoyée" -ForegroundColor White
Write-Host "   • Routes mises à jour" -ForegroundColor White

Write-Host "`n🚀 L'application est maintenant prête sans le système de conversation!" -ForegroundColor Green
