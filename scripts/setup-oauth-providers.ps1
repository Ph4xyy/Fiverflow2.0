# Script pour configurer les providers OAuth
# Ce script guide l'utilisateur pour configurer GitHub, Google et Discord OAuth

Write-Host "🔐 Configuration des providers OAuth pour FiverFlow" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Fichier .env.local non trouvé. Création à partir de env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env.local"
    Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Instructions pour configurer les providers OAuth:" -ForegroundColor Yellow
Write-Host ""

# GitHub
Write-Host "🐙 GITHUB OAuth:" -ForegroundColor Magenta
Write-Host "1. Allez sur https://github.com/settings/applications/new"
Write-Host "2. Application name: FiverFlow"
Write-Host "3. Homepage URL: http://localhost:3000"
Write-Host "4. Authorization callback URL: http://localhost:3000/auth/callback"
Write-Host "5. Copiez le Client ID et Client Secret"
Write-Host ""

# Google
Write-Host "🔍 GOOGLE OAuth:" -ForegroundColor Magenta
Write-Host "1. Allez sur https://console.developers.google.com/"
Write-Host "2. Créez un nouveau projet ou sélectionnez un existant"
Write-Host "3. Activez l'API Google+"
Write-Host "4. Créez des identifiants OAuth 2.0"
Write-Host "5. Authorized redirect URIs: http://localhost:3000/auth/callback"
Write-Host "6. Copiez le Client ID et Client Secret"
Write-Host ""

# Discord
Write-Host "💬 DISCORD OAuth:" -ForegroundColor Magenta
Write-Host "1. Allez sur https://discord.com/developers/applications"
Write-Host "2. Créez une nouvelle application"
Write-Host "3. Allez dans OAuth2 > General"
Write-Host "4. Redirects: http://localhost:3000/auth/callback"
Write-Host "5. Copiez le Client ID et Client Secret"
Write-Host ""

Write-Host "⚠️  IMPORTANT: Pour la production, remplacez localhost par votre domaine!" -ForegroundColor Red
Write-Host ""

# Demander les clés
$githubClientId = Read-Host "GitHub Client ID"
$githubSecret = Read-Host "GitHub Client Secret"
$googleClientId = Read-Host "Google Client ID"
$googleSecret = Read-Host "Google Client Secret"
$discordClientId = Read-Host "Discord Client ID"
$discordSecret = Read-Host "Discord Client Secret"

# Mettre à jour .env.local
Write-Host ""
Write-Host "📝 Mise à jour du fichier .env.local..." -ForegroundColor Yellow

$envContent = Get-Content ".env.local" -Raw

# Remplacer les valeurs OAuth
$envContent = $envContent -replace "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=.*", "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=$githubClientId"
$envContent = $envContent -replace "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=.*", "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=$githubSecret"
$envContent = $envContent -replace "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=.*", "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=$googleClientId"
$envContent = $envContent -replace "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=.*", "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=$googleSecret"
$envContent = $envContent -replace "SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID=.*", "SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID=$discordClientId"
$envContent = $envContent -replace "SUPABASE_AUTH_EXTERNAL_DISCORD_SECRET=.*", "SUPABASE_AUTH_EXTERNAL_DISCORD_SECRET=$discordSecret"

Set-Content ".env.local" $envContent

Write-Host "✅ Configuration OAuth mise à jour dans .env.local" -ForegroundColor Green
Write-Host ""

# Redémarrer Supabase
Write-Host "🔄 Redémarrage de Supabase pour appliquer les changements..." -ForegroundColor Yellow
Write-Host "Exécutez: supabase stop && supabase start" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 Configuration OAuth terminée!" -ForegroundColor Green
Write-Host "Les boutons de connexion sociale devraient maintenant fonctionner." -ForegroundColor Green


