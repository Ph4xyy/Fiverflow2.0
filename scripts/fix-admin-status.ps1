# Correction du statut admin
$supabaseUrl = "https://arnuyyyryvbfcvqauqur.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY"
$userId = "d670e08d-ea95-4738-a8b0-93682c9b5814"

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

$updateData = @{
    is_admin = $true
    updated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

$updateUrl = "$supabaseUrl/rest/v1/user_profiles?user_id=eq.$userId"

try {
    $result = Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateData
    Write-Host "Statut admin corrige: is_admin = true" -ForegroundColor Green
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
