# Script pour appliquer la migration propre
Write-Host "Application de la migration propre FiverFlow 2.0" -ForegroundColor Cyan

# Verifier que Supabase CLI est disponible
try {
    $version = npx supabase --version
    Write-Host "Supabase CLI version: $version" -ForegroundColor Green
} catch {
    Write-Host "Erreur: Supabase CLI non trouve" -ForegroundColor Red
    Write-Host "Installation: npm install -g @supabase/cli" -ForegroundColor Yellow
    exit 1
}

# Verifier la connexion a Supabase Cloud
Write-Host "Verification de la connexion a Supabase Cloud..." -ForegroundColor Yellow

try {
    npx supabase projects list
    Write-Host "Connexion a Supabase Cloud reussie" -ForegroundColor Green
} catch {
    Write-Host "Erreur de connexion a Supabase Cloud" -ForegroundColor Red
    Write-Host "Veuillez vous connecter avec: npx supabase login" -ForegroundColor Yellow
    Write-Host "Puis relancez ce script" -ForegroundColor Yellow
    exit 1
}

# Appliquer la migration
Write-Host "Application de la migration propre..." -ForegroundColor Yellow

try {
    npx supabase db push
    Write-Host "Migration appliquee avec succes!" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'application de la migration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifiez votre connexion et vos permissions" -ForegroundColor Yellow
    exit 1
}

# Generer les types TypeScript
Write-Host "Generation des types TypeScript..." -ForegroundColor Yellow

try {
    npx supabase gen types typescript --project-id $(npx supabase projects list --output json | ConvertFrom-Json | Select-Object -First 1 | ForEach-Object { $_.id }) > src/types/database.ts
    Write-Host "Types TypeScript generes dans src/types/database.ts" -ForegroundColor Green
} catch {
    Write-Host "Impossible de generer les types automatiquement" -ForegroundColor Yellow
    Write-Host "Vous pouvez les generer manuellement avec:" -ForegroundColor Blue
    Write-Host "npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts" -ForegroundColor Blue
}

Write-Host "Migration terminee avec succes!" -ForegroundColor Green
Write-Host "Votre base de donnees FiverFlow 2.0 est maintenant propre et optimisee!" -ForegroundColor Cyan
