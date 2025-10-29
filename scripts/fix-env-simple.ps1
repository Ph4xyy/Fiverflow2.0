# Script simple de réparation du fichier .env.local
Write-Host "🔧 Réparation du fichier .env.local" -ForegroundColor Cyan

# Supprimer le fichier corrompu s'il existe
if (Test-Path ".env.local") {
    Write-Host "📁 Suppression du fichier .env.local existant..." -ForegroundColor Yellow
    Remove-Item ".env.local" -Force
    Write-Host "✅ Fichier supprimé" -ForegroundColor Green
}

# Créer un nouveau fichier .env.local
Write-Host "🆕 Création d'un nouveau fichier .env.local..." -ForegroundColor Blue

$envContent = @"
# Configuration FiverFlow2.0 - Variables d'environnement locales
VITE_SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1431331850198057069/iZACKTKLqL7tzP_eNmnu845Gk4DAKf_UNlAZQgWLzaLQPz_MBvJZQ6PY1-vZ1SlcivQD
OPENAI_API_KEY=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
"@

# Écrire le contenu dans le fichier
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Nouveau fichier .env.local créé" -ForegroundColor Green
Write-Host "📋 N'oubliez pas de configurer vos clés Stripe de test!" -ForegroundColor Yellow



