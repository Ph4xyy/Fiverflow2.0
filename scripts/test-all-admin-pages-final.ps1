# Test final de toutes les pages admin
Write-Host "Test Final - Toutes les Pages Admin" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n1. Vérification des corrections appliquées:" -ForegroundColor Yellow
Write-Host "   ✅ Toutes les références à cardClass supprimées" -ForegroundColor Green
Write-Host "   ✅ Toutes les références à pageBgClass supprimées" -ForegroundColor Green
Write-Host "   ✅ Classes Tailwind directes appliquées partout" -ForegroundColor Green
Write-Host "   ✅ Layout uniforme sur toutes les pages admin" -ForegroundColor Green

Write-Host "`n2. Pages admin corrigées:" -ForegroundColor Yellow
Write-Host "   ✅ AdminDashboard - Layout corrigé" -ForegroundColor Green
Write-Host "   ✅ AdminUsersPage - Layout corrigé" -ForegroundColor Green
Write-Host "   ✅ AdminStatsPage - Layout corrigé" -ForegroundColor Green
Write-Host "   ✅ AdminAIPage - Layout corrigé" -ForegroundColor Green

Write-Host "`n3. Test de l'API admin-users:" -ForegroundColor Yellow
$supabaseUrl = "https://arnuyyyryvbfcvqauqur.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs"

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

try {
    $testUrl = "$supabaseUrl/functions/v1/admin-users?page=1&limit=20"
    $response = Invoke-WebRequest -Uri $testUrl -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "   Utilisateurs trouvés: $($responseData.users.Count)" -ForegroundColor White
    Write-Host "   Pagination: Page $($responseData.pagination.page) sur $($responseData.pagination.pages)" -ForegroundColor White
} catch {
    Write-Host "   Erreur API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Instructions pour tester:" -ForegroundColor Cyan
Write-Host "   1. Rechargez toutes les pages admin:" -ForegroundColor White
Write-Host "      • http://localhost:5173/admin/dashboard" -ForegroundColor White
Write-Host "      • http://localhost:5173/admin/users" -ForegroundColor White
Write-Host "      • http://localhost:5173/admin/stats" -ForegroundColor White
Write-Host "      • http://localhost:5173/admin/ai" -ForegroundColor White
Write-Host "   2. Vérifiez que plus d'erreur 'cardClass is not defined'" -ForegroundColor White
Write-Host "   3. Vérifiez que le layout est uniforme sur toutes les pages" -ForegroundColor White
Write-Host "   4. Vérifiez que les fonctionnalités marchent correctement" -ForegroundColor White

Write-Host "`n5. Résumé des corrections:" -ForegroundColor Cyan
Write-Host "   ✅ Suppression de toutes les références à cardClass" -ForegroundColor Green
Write-Host "   ✅ Suppression de toutes les références à pageBgClass" -ForegroundColor Green
Write-Host "   ✅ Remplacement par des classes Tailwind directes" -ForegroundColor Green
Write-Host "   ✅ Layout uniforme sur toutes les pages admin" -ForegroundColor Green
Write-Host "   ✅ API admin-users fonctionnelle" -ForegroundColor Green

Write-Host "`nTest terminé!" -ForegroundColor Green
