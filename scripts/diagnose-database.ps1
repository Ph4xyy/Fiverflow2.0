# Script de diagnostic pour voir les valeurs actuelles dans la base de données
# Aide à identifier les valeurs qui causent les erreurs de contrainte

Write-Host "Diagnostic de la base de données..." -ForegroundColor Green

# URL de votre projet Supabase
$SUPABASE_URL = "https://arnuyyyryvbfcvqauqur.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY"

Write-Host "`nRequêtes de diagnostic à exécuter dans Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n1. Voir les rôles actuels:" -ForegroundColor Cyan
Write-Host "SELECT DISTINCT role, COUNT(*) as count FROM user_profiles GROUP BY role;" -ForegroundColor White

Write-Host "`n2. Voir les plans d'abonnement actuels:" -ForegroundColor Cyan
Write-Host "SELECT DISTINCT subscription_plan, COUNT(*) as count FROM user_profiles GROUP BY subscription_plan;" -ForegroundColor White

Write-Host "`n3. Voir les valeurs NULL:" -ForegroundColor Cyan
Write-Host "SELECT COUNT(*) as null_roles FROM user_profiles WHERE role IS NULL;" -ForegroundColor White
Write-Host "SELECT COUNT(*) as null_plans FROM user_profiles WHERE subscription_plan IS NULL;" -ForegroundColor White

Write-Host "`n4. Voir les valeurs vides:" -ForegroundColor Cyan
Write-Host "SELECT COUNT(*) as empty_roles FROM user_profiles WHERE role = '';" -ForegroundColor White
Write-Host "SELECT COUNT(*) as empty_plans FROM user_profiles WHERE subscription_plan = '';" -ForegroundColor White

Write-Host "`n5. Voir toutes les valeurs uniques:" -ForegroundColor Cyan
Write-Host "SELECT role, subscription_plan, COUNT(*) as count FROM user_profiles GROUP BY role, subscription_plan ORDER BY count DESC;" -ForegroundColor White

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "Instructions:" -ForegroundColor Green
Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Sélectionnez votre projet" -ForegroundColor Cyan
Write-Host "3. Allez dans SQL Editor" -ForegroundColor Cyan
Write-Host "4. Exécutez ces requêtes une par une" -ForegroundColor Cyan
Write-Host "5. Notez les résultats pour identifier les valeurs problématiques" -ForegroundColor Cyan

Write-Host "`nUne fois le diagnostic terminé, utilisez la migration corrigée:" -ForegroundColor Yellow
Write-Host "supabase/migrations/20250130000024_fix_data_before_constraints.sql" -ForegroundColor White
