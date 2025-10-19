# Script de nettoyage des migrations
Write-Host "Nettoyage des migrations FiverFlow 2.0" -ForegroundColor Cyan

# Supprimer les anciennes migrations
$migrationFiles = Get-ChildItem "supabase/migrations" -Filter "*.sql" | Where-Object { $_.Name -ne "20250130000000_initial_clean_schema.sql" }

if ($migrationFiles.Count -gt 0) {
    Write-Host "Suppression de $($migrationFiles.Count) anciennes migrations..." -ForegroundColor Yellow
    
    foreach ($file in $migrationFiles) {
        Write-Host "Suppression: $($file.Name)" -ForegroundColor Gray
        Remove-Item $file.FullName -Force
    }
    
    Write-Host "Anciennes migrations supprimees" -ForegroundColor Green
} else {
    Write-Host "Aucune ancienne migration a supprimer" -ForegroundColor Green
}

# Verifier la nouvelle migration
if (Test-Path "supabase/migrations/20250130000000_initial_clean_schema.sql") {
    Write-Host "Nouvelle migration trouvee" -ForegroundColor Green
} else {
    Write-Host "Nouvelle migration non trouvee" -ForegroundColor Red
}

Write-Host "Nettoyage termine!" -ForegroundColor Green
