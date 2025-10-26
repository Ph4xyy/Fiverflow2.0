# Test direct de l'API admin-stats pour debugger l'erreur 500
Write-Host "Test Direct API admin-stats" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

$supabaseUrl = "https://arnuyyyryvbfcvqauqur.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs"

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

Write-Host "`n1. Test de l'API admin-stats..." -ForegroundColor Yellow
try {
    $testUrl = "$supabaseUrl/functions/v1/admin-stats"
    $response = Invoke-WebRequest -Uri $testUrl -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Détails de l'erreur: $errorContent" -ForegroundColor Red
    }
}

Write-Host "`n2. Test avec paramètres de date..." -ForegroundColor Yellow
try {
    $testUrlWithParams = "$supabaseUrl/functions/v1/admin-stats?start_date=2025-01-01&end_date=2025-01-30"
    $response2 = Invoke-WebRequest -Uri $testUrlWithParams -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "   Status Code: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response2.Content)" -ForegroundColor White
} catch {
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Détails de l'erreur: $errorContent" -ForegroundColor Red
    }
}

Write-Host "`nTest terminé!" -ForegroundColor Green
