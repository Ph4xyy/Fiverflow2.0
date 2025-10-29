# Script Automatique - Configuration Centralisée FiverFlow2.0
# Plus jamais de problèmes de clés ! Un seul script pour tout gérer

Write-Host "🚀 CONFIGURATION CENTRALISÉE FIVERFLOW2.0" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Un seul script pour gérer TOUTES les clés !" -ForegroundColor Yellow

# Configuration centralisée - TOUTES LES CLÉS EN UN ENDROIT
$MASTER_CONFIG = @"
# Configuration Centralisée FiverFlow2.0
# Un seul fichier pour tout gérer - Plus jamais de problèmes de clés !

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
VITE_SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY

# ===========================================
# STRIPE CONFIGURATION
# ===========================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51S9va4KF06h9za4cRVn81wyCSJflsM089tDiQ9VlPuUz58cfzAEuFYiUOnShXyJHQDSSirAdRqwt5ZgMOV058LZN00PHEhi9Rk
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_PlDrfBkstM4jVHGjQl06KpBjJG2wtE8I

# ===========================================
# DISCORD NOTIFICATIONS
# ===========================================
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1431331850198057069/iZACKTKLqL7tzP_eNmnu845Gk4DAKf_UNlAZQgWLzaLQPz_MBvJZQ6PY1-vZ1SlcivQD

# ===========================================
# OPENAI ASSISTANT
# ===========================================
VITE_OPENAI_API_KEY=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

# ===========================================
# EDGE FUNCTIONS (pour Supabase Dashboard)
# ===========================================
SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_PlDrfBkstM4jVHGjQl06KpBjJG2wtE8I
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1431331850198057069/iZACKTKLqL7tzP_eNmnu845Gk4DAKf_UNlAZQgWLzaLQPz_MBvJZQ6PY1-vZ1SlcivQD
OPENAI_API_KEY=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
"@

Write-Host "`n📁 Création des fichiers d'environnement..." -ForegroundColor Yellow

# 1. Créer .env.local (pour Vite)
Write-Host "1. Création de .env.local..." -ForegroundColor White
Set-Content ".env.local" -Value $MASTER_CONFIG -Encoding UTF8
Write-Host "   ✅ .env.local créé" -ForegroundColor Green

# 2. Créer .env (pour Node.js)
Write-Host "2. Création de .env..." -ForegroundColor White
Set-Content ".env" -Value $MASTER_CONFIG -Encoding UTF8
Write-Host "   ✅ .env créé" -ForegroundColor Green

# 3. Créer .env.production (pour production)
Write-Host "3. Création de .env.production..." -ForegroundColor White
Set-Content ".env.production" -Value $MASTER_CONFIG -Encoding UTF8
Write-Host "   ✅ .env.production créé" -ForegroundColor Green

# 4. Créer .env.development (pour développement)
Write-Host "4. Création de .env.development..." -ForegroundColor White
Set-Content ".env.development" -Value $MASTER_CONFIG -Encoding UTF8
Write-Host "   ✅ .env.development créé" -ForegroundColor Green

# 5. Mettre à jour env.example
Write-Host "5. Mise à jour de env.example..." -ForegroundColor White
Set-Content "env.example" -Value $MASTER_CONFIG -Encoding UTF8
Write-Host "   ✅ env.example mis à jour" -ForegroundColor Green

# 6. Créer un fichier de sauvegarde
Write-Host "6. Création du fichier de sauvegarde..." -ForegroundColor White
Set-Content "MASTER_ENV_BACKUP.txt" -Value $MASTER_CONFIG -Encoding UTF8
Write-Host "   ✅ MASTER_ENV_BACKUP.txt créé" -ForegroundColor Green

Write-Host "`n🔍 Vérification des fichiers créés:" -ForegroundColor Cyan

# Vérifier que tous les fichiers existent
$files = @(".env.local", ".env", ".env.production", ".env.development", "env.example", "MASTER_ENV_BACKUP.txt")
foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   ✅ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file - MANQUANT" -ForegroundColor Red
    }
}

Write-Host "`n📊 Résumé des clés configurées:" -ForegroundColor Cyan
Write-Host "   🔑 VITE_SUPABASE_URL: Configuré" -ForegroundColor Green
Write-Host "   🔑 VITE_SUPABASE_ANON_KEY: Configuré" -ForegroundColor Green
Write-Host "   🔑 VITE_SUPABASE_SERVICE_ROLE_KEY: Configuré" -ForegroundColor Green
Write-Host "   🔑 VITE_STRIPE_PUBLISHABLE_KEY: Configuré" -ForegroundColor Green
Write-Host "   🔑 STRIPE_SECRET_KEY: Configuré" -ForegroundColor Green
Write-Host "   🔑 STRIPE_WEBHOOK_SECRET: Configuré" -ForegroundColor Green
Write-Host "   🔑 VITE_DISCORD_WEBHOOK_URL: Configuré" -ForegroundColor Green
Write-Host "   🔑 VITE_OPENAI_API_KEY: Configuré" -ForegroundColor Green

Write-Host "`n🚀 Instructions:" -ForegroundColor Cyan
Write-Host "1. Redémarrez le serveur:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "2. Testez l'application:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host "3. Testez l'admin:" -ForegroundColor White
Write-Host "   http://localhost:5173/admin/dashboard" -ForegroundColor White

Write-Host "`n💡 Avantages de cette configuration:" -ForegroundColor Cyan
Write-Host "   ✅ Un seul endroit pour toutes les clés" -ForegroundColor Green
Write-Host "   ✅ Plus jamais de fichiers manquants" -ForegroundColor Green
Write-Host "   ✅ Configuration automatique" -ForegroundColor Green
Write-Host "   ✅ Sauvegarde automatique" -ForegroundColor Green
Write-Host "   ✅ Compatible avec tous les environnements" -ForegroundColor Green

Write-Host "`n🎉 CONFIGURATION TERMINÉE !" -ForegroundColor Green
Write-Host "Plus jamais de problèmes de clés !" -ForegroundColor Green
