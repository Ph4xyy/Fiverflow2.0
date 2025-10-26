# Script de réparation du fichier .env.local
# Résout le problème de caractères invalides dans le fichier d'environnement

Write-Host "🔧 Réparation du fichier .env.local" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Vérifier si le fichier existe
if (Test-Path ".env.local") {
    Write-Host "📁 Fichier .env.local trouvé" -ForegroundColor Yellow
    
    # Vérifier la taille du fichier
    $fileSize = (Get-Item ".env.local").Length
    Write-Host "📊 Taille du fichier: $fileSize bytes" -ForegroundColor Gray
    
    # Vérifier s'il y a des caractères invalides
    $content = Get-Content ".env.local" -Raw
    if ($content -match "[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]") {
        Write-Host "❌ Caractères invalides détectés dans .env.local" -ForegroundColor Red
        Write-Host "🔄 Suppression du fichier corrompu..." -ForegroundColor Yellow
        
        # Supprimer le fichier corrompu
        Remove-Item ".env.local" -Force
        Write-Host "✅ Fichier corrompu supprimé" -ForegroundColor Green
    } else {
        Write-Host "✅ Fichier .env.local semble valide" -ForegroundColor Green
        exit 0
    }
} else {
    Write-Host "📁 Fichier .env.local non trouvé" -ForegroundColor Yellow
}

# Créer un nouveau fichier .env.local propre
Write-Host "🆕 Création d'un nouveau fichier .env.local..." -ForegroundColor Blue

$envContent = @"
# Configuration FiverFlow2.0 - Variables d'environnement locales
# Ce fichier est utilisé pour le développement local

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
VITE_SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjY5MjQsImV4cCI6MjA2ODgwMjkyNH0.mWzoWkBbQcCNR2BHueu8mQpV6hFMZUacbv4EobzOIZs

# ===========================================
# STRIPE CONFIGURATION (TEST MODE)
# ===========================================
# ⚠️ IMPORTANT: Utilisez des clés de TEST pour le développement
# Remplacez ces valeurs par vos vraies clés de test Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# ===========================================
# DISCORD NOTIFICATIONS (OPTIONNEL)
# ===========================================
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1431331850198057069/iZACKTKLqL7tzP_eNmnu845Gk4DAKf_UNlAZQgWLzaLQPz_MBvJZQ6PY1-vZ1SlcivQD

# ===========================================
# OPENAI ASSISTANT (OPTIONNEL)
# ===========================================
OPENAI_API_KEY=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

# ===========================================
# NOTES IMPORTANTES
# ===========================================
# 1. Remplacez les clés Stripe par vos vraies clés de test
# 2. Les clés de production ne doivent JAMAIS être dans ce fichier
# 3. Ce fichier est ignoré par Git (.gitignore)
# 4. Pour la production, utilisez les variables d'environnement de Vercel
"@

# Écrire le contenu dans le fichier
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline

Write-Host "✅ Nouveau fichier .env.local créé" -ForegroundColor Green

# Vérifier que le fichier est valide
if (Test-Path ".env.local") {
    $newFileSize = (Get-Item ".env.local").Length
    Write-Host "📊 Nouvelle taille du fichier: $newFileSize bytes" -ForegroundColor Gray
    
    # Vérifier qu'il n'y a plus de caractères invalides
    $newContent = Get-Content ".env.local" -Raw
    if ($newContent -match "[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]") {
        Write-Host "❌ Erreur: Le nouveau fichier contient encore des caractères invalides" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Fichier .env.local valide créé" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Erreur: Impossible de créer le fichier .env.local" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. 🔑 Configurez vos clés Stripe de test dans .env.local" -ForegroundColor White
Write-Host "2. 🧪 Testez l'application avec: npm run dev" -ForegroundColor White
Write-Host "3. 🔍 Vérifiez qu'il n'y a plus d'erreur de parsing" -ForegroundColor White

Write-Host ""
Write-Host "🔑 Pour obtenir vos clés Stripe de test:" -ForegroundColor Yellow
Write-Host "- Allez sur https://dashboard.stripe.com/test/apikeys" -ForegroundColor White
Write-Host "- Copiez vos clés de TEST (pas de production)" -ForegroundColor White
Write-Host "- Remplacez les valeurs dans .env.local" -ForegroundColor White

Write-Host ""
Write-Host "✨ Réparation terminée!" -ForegroundColor Green
