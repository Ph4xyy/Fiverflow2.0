# Script de diagnostic de la session utilisateur
# Résout l'erreur 401 Unauthorized

Write-Host "Diagnostic de la Session Utilisateur" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# 1. Vérifier la session actuelle
Write-Host "`n1. Vérification de la session..." -ForegroundColor Yellow

$supabaseUrl = "https://arnuyyyryvbfcvqauqur.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs"
$userId = "d670e08d-ea95-4738-a8b0-93682c9b5814"

# Headers pour l'API
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

# 2. Test de l'API admin-stats
Write-Host "`n2. Test de l'API admin-stats..." -ForegroundColor Yellow
try {
    $testUrl = "$supabaseUrl/functions/v1/admin-stats"
    $testResponse = Invoke-RestMethod -Uri $testUrl -Method GET -Headers $headers
    Write-Host "   API admin-stats accessible avec service key" -ForegroundColor Green
} catch {
    Write-Host "   Erreur API admin-stats: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Vérifier le profil utilisateur
Write-Host "`n3. Vérification du profil utilisateur..." -ForegroundColor Yellow
try {
    $profileUrl = "$supabaseUrl/rest/v1/user_profiles?user_id=eq.$userId&select=user_id,full_name,is_admin,role,is_active"
    $profileResponse = Invoke-RestMethod -Uri $profileUrl -Method GET -Headers $headers
    
    if ($profileResponse) {
        Write-Host "   Profil utilisateur trouvé:" -ForegroundColor Green
        Write-Host "     • Nom: $($profileResponse.full_name)" -ForegroundColor White
        Write-Host "     • Admin: $($profileResponse.is_admin)" -ForegroundColor White
        Write-Host "     • Rôle: $($profileResponse.role)" -ForegroundColor White
        Write-Host "     • Actif: $($profileResponse.is_active)" -ForegroundColor White
    } else {
        Write-Host "   Profil utilisateur non trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "   Erreur profil: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Instructions pour corriger la session
Write-Host "`n4. Instructions pour corriger la session:" -ForegroundColor Cyan
Write-Host "   1. Déconnectez-vous de l'application" -ForegroundColor White
Write-Host "   2. Reconnectez-vous avec vos identifiants" -ForegroundColor White
Write-Host "   3. Vérifiez que la session est valide" -ForegroundColor White
Write-Host "   4. Testez la page admin" -ForegroundColor White

# 5. Alternative: Utiliser la service key
Write-Host "`n5. Alternative - Utiliser la service key:" -ForegroundColor Yellow
Write-Host "   Les Edge Functions peuvent utiliser la service key" -ForegroundColor White
Write-Host "   au lieu du token utilisateur pour les opérations admin" -ForegroundColor White

Write-Host "`nDiagnostic terminé!" -ForegroundColor Green
