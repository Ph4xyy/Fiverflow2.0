# Script pour appliquer les contraintes de base de données
# Applique la migration des contraintes subscription_plan et role

Write-Host "Application des contraintes de base de données..." -ForegroundColor Green

# URL de votre projet Supabase
$SUPABASE_URL = "https://arnuyyyryvbfcvqauqur.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY"

# Lire le contenu de la migration
$migrationContent = Get-Content "supabase/migrations/20250130000024_fix_data_before_constraints.sql" -Raw

Write-Host "Contenu de la migration:" -ForegroundColor Yellow
Write-Host $migrationContent

Write-Host "`nMigration prête à être appliquée." -ForegroundColor Green
Write-Host "Vous devez appliquer cette migration manuellement dans le dashboard Supabase:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Sélectionnez votre projet" -ForegroundColor Cyan
Write-Host "3. Allez dans SQL Editor" -ForegroundColor Cyan
Write-Host "4. Collez le contenu de la migration" -ForegroundColor Cyan
Write-Host "5. Exécutez la requête" -ForegroundColor Cyan

Write-Host "`nContenu à copier-coller:" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host $migrationContent -ForegroundColor White
Write-Host "=" * 50 -ForegroundColor Gray
