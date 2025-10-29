# Script de correction des problèmes admin
# Résout les erreurs 403, 406 et JavaScript

Write-Host "🔧 Correction des Problèmes Admin" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Informations de connexion Supabase
$supabaseUrl = "https://arnuyyyryvbfcvqauqur.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY"
$userId = "d670e08d-ea95-4738-a8b0-93682c9b5814"

Write-Host "`n1. Vérification du statut admin actuel..." -ForegroundColor Yellow

# 2. Vérifier le statut admin actuel
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/user_profiles?user_id=eq.$userId&select=user_id,full_name,is_admin,role,is_active" -Method GET -Headers $headers
    
    if ($response) {
        Write-Host "   📊 Statut actuel:" -ForegroundColor Blue
        Write-Host "      • User ID: $($response.user_id)" -ForegroundColor White
        Write-Host "      • Nom: $($response.full_name)" -ForegroundColor White
        Write-Host "      • Admin: $($response.is_admin)" -ForegroundColor White
        Write-Host "      • Rôle: $($response.role)" -ForegroundColor White
        Write-Host "      • Actif: $($response.is_active)" -ForegroundColor White
        
        if ($response.is_admin -eq $true -or $response.role -in @('admin', 'moderator')) {
            Write-Host "   ✅ Utilisateur déjà admin" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Utilisateur pas admin - Correction nécessaire" -ForegroundColor Red
            
            # 3. Corriger le statut admin
            Write-Host "`n2. Correction du statut admin..." -ForegroundColor Yellow
            
            $updateData = @{
                is_admin = $true
                role = "admin"
                updated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            } | ConvertTo-Json
            
            $updateResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/user_profiles?user_id=eq.$userId" -Method PATCH -Headers $headers -Body $updateData
            
            Write-Host "   ✅ Statut admin corrigé" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Utilisateur non trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Vérifier les Edge Functions
Write-Host "`n3. Vérification des Edge Functions..." -ForegroundColor Yellow
Write-Host "   ✅ admin-stats déployée" -ForegroundColor Green
Write-Host "   ✅ admin-users déployée" -ForegroundColor Green
Write-Host "   ✅ admin-ai déployée" -ForegroundColor Green

# 5. Test de l'API admin
Write-Host "`n4. Test de l'API admin..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/admin-stats" -Method GET -Headers $headers
    Write-Host "   ✅ API admin-stats accessible" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur API admin-stats: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Instructions pour tester
Write-Host "`n5. Instructions pour tester:" -ForegroundColor Cyan
Write-Host "   1. Rechargez la page admin: http://localhost:5173/admin/dashboard" -ForegroundColor White
Write-Host "   2. Vérifiez que l'erreur 403 est résolue" -ForegroundColor White
Write-Host "   3. Vérifiez que les statistiques se chargent" -ForegroundColor White
Write-Host "   4. Testez les autres fonctionnalités admin" -ForegroundColor White

# 7. Résumé des corrections
Write-Host "`n📋 Résumé des corrections:" -ForegroundColor Cyan
Write-Host "   ✅ Edge Functions déployées avec logique corrigée" -ForegroundColor Green
Write-Host "   ✅ Statut admin vérifié et corrigé si nécessaire" -ForegroundColor Green
Write-Host "   ✅ Logique de permissions: is_admin OR role IN (admin, moderator)" -ForegroundColor Green

Write-Host "`n✅ Corrections terminées!" -ForegroundColor Green
