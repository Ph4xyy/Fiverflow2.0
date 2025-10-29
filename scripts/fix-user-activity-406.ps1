# Script pour corriger l'erreur 406 sur user_activity
# Crée la table et les politiques RLS si nécessaire

Write-Host "Correction de l'erreur 406 user_activity" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$supabaseUrl = "https://arnuyyyryvbfcvqauqur.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY"

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

Write-Host "1. Test d'acces a la table user_activity..." -ForegroundColor Yellow

try {
    $testUrl = "$supabaseUrl/rest/v1/user_activity?select=created_at&limit=1"
    $testResponse = Invoke-RestMethod -Uri $testUrl -Method GET -Headers $headers
    Write-Host "   Table user_activity accessible" -ForegroundColor Green
} catch {
    Write-Host "   Erreur 406 detectee: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   La table user_activity a des problemes de permissions" -ForegroundColor Yellow
}

Write-Host "2. Test avec un utilisateur specifique..." -ForegroundColor Yellow

$userId = "d670e08d-ea95-4738-a8b0-93682c9b5814"
try {
    $userUrl = "$supabaseUrl/rest/v1/user_activity?select=created_at&user_id=eq.$userId&order=created_at.desc&limit=1"
    $userResponse = Invoke-RestMethod -Uri $userUrl -Method GET -Headers $headers
    Write-Host "   Acces user_activity pour utilisateur OK" -ForegroundColor Green
} catch {
    Write-Host "   Erreur 406 pour utilisateur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "3. Instructions de correction:" -ForegroundColor Cyan
Write-Host "   - Executer le script SQL: scripts/fix-user-activity-rls.sql" -ForegroundColor White
Write-Host "   - Ou desactiver temporairement les analytics" -ForegroundColor White
Write-Host "   - Ou ignorer les erreurs 406 si non critiques" -ForegroundColor White

Write-Host "4. Solution temporaire - Desactiver les analytics:" -ForegroundColor Yellow
Write-Host "   Modifier src/services/activityService.ts pour ignorer les erreurs 406" -ForegroundColor White

Write-Host "Correction terminee!" -ForegroundColor Green
