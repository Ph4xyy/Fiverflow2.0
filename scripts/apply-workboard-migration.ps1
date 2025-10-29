# Script pour appliquer la migration Workboard
# Applique la migration pour les tables tasks et time_entries complètes

Write-Host "🚀 Application de la migration Workboard..." -ForegroundColor Green

# Vérifier si Supabase CLI est installé
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI n'est pas installé. Installez-le d'abord." -ForegroundColor Red
    Write-Host "📖 Guide: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor Yellow
    exit 1
}

# Vérifier si nous sommes dans un projet Supabase
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "❌ Ce n'est pas un projet Supabase. Initialisez d'abord le projet." -ForegroundColor Red
    Write-Host "💡 Exécutez: supabase init" -ForegroundColor Yellow
    exit 1
}

# Appliquer la migration
Write-Host "📋 Application de la migration workboard_tables..." -ForegroundColor Blue
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration Workboard appliquée avec succès!" -ForegroundColor Green
    Write-Host "🎯 Les tables tasks et time_entries sont maintenant configurées" -ForegroundColor Green
    Write-Host "🔧 Vous pouvez maintenant utiliser la page Workboard à 100%" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
    Write-Host "🔍 Vérifiez les logs Supabase pour plus de détails" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Configuration Workboard terminée!" -ForegroundColor Green


