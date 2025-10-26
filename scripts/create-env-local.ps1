# Script simple pour créer le fichier .env.local
# Résout l'erreur "unexpected character '#' in variable name"

Write-Host "🔧 Création du fichier .env.local" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Créer le fichier .env.local avec le contenu correct
$envContent = @"
# Configuration Admin Panel FiverFlow2.0
# Copiez ce fichier vers .env.local et remplissez les valeurs

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
VITE_SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY

# ===========================================
# STRIPE CONFIGURATION
# ===========================================
STRIPE_SECRET_KEY=pk_live_51S9va4KF06h9za4cRVn81wyCSJflsM089tDiQ9VlPuUz58cfzAEuFYiUOnShXyJHQDSSirAdRqwt5ZgMOV058LZN00PHEhi9Rk
STRIPE_WEBHOOK_SECRET=whsec_PlDrfBkstM4jVHGjQl06KpBjJG2wtE8I

# ===========================================
# DISCORD NOTIFICATIONS (OPTIONNEL)
# ===========================================
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1431331850198057069/iZACKTKLqL7tzP_eNmnu845Gk4DAKf_UNlAZQgWLzaLQPz_MBvJZQ6PY1-vZ1SlcivQD

# ===========================================
# OPENAI ASSISTANT (OPTIONNEL)
# ===========================================
OPENAI_API_KEY=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
"@

# Sauvegarder l'ancien fichier s'il existe
if (Test-Path ".env.local") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item ".env.local" ".env.local.backup.$timestamp"
    Write-Host "✅ Sauvegarde créée: .env.local.backup.$timestamp" -ForegroundColor Green
}

# Créer le nouveau fichier
$envContent | Out-File ".env.local" -Encoding UTF8
Write-Host "✅ Fichier .env.local créé avec succès" -ForegroundColor Green

# Vérifier le fichier créé
Write-Host "`n🔍 Vérification du fichier créé:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $lines = Get-Content ".env.local"
    $variableCount = 0
    foreach ($line in $lines) {
        if ($line -match "^[A-Za-z_][A-Za-z0-9_]*=") {
            $variableCount++
        }
    }
    Write-Host "   📊 Nombre de variables: $variableCount" -ForegroundColor Blue
    Write-Host "   ✅ Fichier valide et prêt à utiliser" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors de la création du fichier" -ForegroundColor Red
}

Write-Host "`n🚀 Instructions:" -ForegroundColor Cyan
Write-Host "   1. Exécutez: npm run dev" -ForegroundColor White
Write-Host "   2. L'erreur de parsing devrait être résolue" -ForegroundColor White
Write-Host "   3. Si problème persiste, vérifiez les logs" -ForegroundColor White

Write-Host "`n✅ Script terminé!" -ForegroundColor Green
