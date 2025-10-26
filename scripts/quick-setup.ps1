# Script Ultra-Simple - Configuration Automatique
# Un seul clic pour tout configurer !

Write-Host "🚀 CONFIGURATION AUTOMATIQUE FIVERFLOW2.0" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Configuration complète - TOUTES LES CLÉS
$CONFIG = @"
VITE_SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51S9va4KF06h9za4cRVn81wyCSJflsM089tDiQ9VlPuUz58cfzAEuFYiUOnShXyJHQDSSirAdRqwt5ZgMOV058LZN00PHEhi9Rk
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_PlDrfBkstM4jVHGjQl06KpBjJG2wtE8I
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1431331850198057069/iZACKTKLqL7tzP_eNmnu845Gk4DAKf_UNlAZQgWLzaLQPz_MBvJZQ6PY1-vZ1SlcivQD
VITE_OPENAI_API_KEY=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
SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1431331850198057069/iZACKTKLqL7tzP_eNmnu845Gk4DAKf_UNlAZQgWLzaLQPz_MBvJZQ6PY1-vZ1SlcivQD
OPENAI_API_KEY=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
"@

# Créer tous les fichiers d'un coup
$files = @(".env.local", ".env", ".env.production", ".env.development", "env.example")

foreach ($file in $files) {
    Set-Content $file -Value $CONFIG -Encoding UTF8
    Write-Host "✅ $file créé" -ForegroundColor Green
}

Write-Host "`n🎉 TOUT EST CONFIGURÉ !" -ForegroundColor Green
Write-Host "Redémarrez avec: npm run dev" -ForegroundColor Yellow
