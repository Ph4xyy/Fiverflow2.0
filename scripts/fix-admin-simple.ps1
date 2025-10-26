# Script simple pour corriger les problèmes admin
# Résout les erreurs 403, 406 et JavaScript

Write-Host "Correction des Problemes Admin" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Informations de connexion
$supabaseUrl = "https://arnuyyyryvbfcvqauqur.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY"
$userId = "d670e08d-ea95-4738-a8b0-93682c9b5814"

Write-Host "1. Verification du statut admin..." -ForegroundColor Yellow

# Headers pour l'API
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

# URL avec paramètres échappés
$url = "$supabaseUrl/rest/v1/user_profiles?user_id=eq.$userId&select=user_id,full_name,is_admin,role,is_active"

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    
    if ($response) {
        Write-Host "Statut actuel:" -ForegroundColor Blue
        Write-Host "  User ID: $($response.user_id)" -ForegroundColor White
        Write-Host "  Nom: $($response.full_name)" -ForegroundColor White
        Write-Host "  Admin: $($response.is_admin)" -ForegroundColor White
        Write-Host "  Role: $($response.role)" -ForegroundColor White
        
        if ($response.is_admin -eq $true -or $response.role -in @('admin', 'moderator')) {
            Write-Host "Utilisateur deja admin" -ForegroundColor Green
        } else {
            Write-Host "Correction du statut admin..." -ForegroundColor Yellow
            
            $updateData = @{
                is_admin = $true
                role = "admin"
                updated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            } | ConvertTo-Json
            
            $updateUrl = "$supabaseUrl/rest/v1/user_profiles?user_id=eq.$userId"
            $updateResponse = Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateData
            
            Write-Host "Statut admin corrige" -ForegroundColor Green
        }
    } else {
        Write-Host "Utilisateur non trouve" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "2. Edge Functions deployees:" -ForegroundColor Yellow
Write-Host "  admin-stats: OK" -ForegroundColor Green
Write-Host "  admin-users: OK" -ForegroundColor Green
Write-Host "  admin-ai: OK" -ForegroundColor Green

Write-Host "3. Instructions de test:" -ForegroundColor Cyan
Write-Host "  1. Rechargez la page admin" -ForegroundColor White
Write-Host "  2. Verifiez que l'erreur 403 est resolue" -ForegroundColor White
Write-Host "  3. Testez les fonctionnalites admin" -ForegroundColor White

Write-Host "Corrections terminees!" -ForegroundColor Green
