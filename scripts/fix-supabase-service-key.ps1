# Script pour corriger la variable d'environnement VITE_SUPABASE_SERVICE_ROLE_KEY
Write-Host "Correction de la variable d'environnement VITE_SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Vérifier si .env.local existe
if (Test-Path ".env.local") {
    Write-Host "`nFichier .env.local trouvé" -ForegroundColor Green
    
    # Lire le contenu actuel
    $content = Get-Content ".env.local" -Raw
    
    # Vérifier si SUPABASE_SERVICE_ROLE_KEY existe
    if ($content -match "SUPABASE_SERVICE_ROLE_KEY=") {
        Write-Host "Variable SUPABASE_SERVICE_ROLE_KEY trouvée" -ForegroundColor Yellow
        
        # Remplacer SUPABASE_SERVICE_ROLE_KEY par VITE_SUPABASE_SERVICE_ROLE_KEY
        $newContent = $content -replace "SUPABASE_SERVICE_ROLE_KEY=", "VITE_SUPABASE_SERVICE_ROLE_KEY="
        
        # Écrire le nouveau contenu
        Set-Content ".env.local" -Value $newContent -NoNewline
        
        Write-Host "✅ Variable corrigée: SUPABASE_SERVICE_ROLE_KEY → VITE_SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Green
    } else {
        Write-Host "Variable SUPABASE_SERVICE_ROLE_KEY non trouvée" -ForegroundColor Red
        Write-Host "Ajout de la variable VITE_SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor Yellow
        
        # Ajouter la variable à la fin du fichier
        $serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnV5eXlyeXZiZmN2cWF1cXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIyNjkyNCwiZXhwIjoyMDY4ODAyOTI0fQ.qlUGGfviSoPyXnqqL5OOMTSHLYlucaCHRXgSwNuUHcY"
        Add-Content ".env.local" -Value "`nVITE_SUPABASE_SERVICE_ROLE_KEY=$serviceKey"
        
        Write-Host "✅ Variable VITE_SUPABASE_SERVICE_ROLE_KEY ajoutée" -ForegroundColor Green
    }
} else {
    Write-Host "`nFichier .env.local non trouvé" -ForegroundColor Red
    Write-Host "Création du fichier .env.local à partir de env.example..." -ForegroundColor Yellow
    
    # Copier env.example vers .env.local
    Copy-Item "env.example" ".env.local"
    
    Write-Host "✅ Fichier .env.local créé avec les bonnes variables" -ForegroundColor Green
}

Write-Host "`nVérification des variables d'environnement:" -ForegroundColor Cyan
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $supabaseUrl = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_URL=" }
    $supabaseAnonKey = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_ANON_KEY=" }
    $supabaseServiceKey = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_SERVICE_ROLE_KEY=" }
    
    if ($supabaseUrl) {
        Write-Host "✅ VITE_SUPABASE_URL: Définie" -ForegroundColor Green
    } else {
        Write-Host "❌ VITE_SUPABASE_URL: Manquante" -ForegroundColor Red
    }
    
    if ($supabaseAnonKey) {
        Write-Host "✅ VITE_SUPABASE_ANON_KEY: Définie" -ForegroundColor Green
    } else {
        Write-Host "❌ VITE_SUPABASE_ANON_KEY: Manquante" -ForegroundColor Red
    }
    
    if ($supabaseServiceKey) {
        Write-Host "✅ VITE_SUPABASE_SERVICE_ROLE_KEY: Définie" -ForegroundColor Green
    } else {
        Write-Host "❌ VITE_SUPABASE_SERVICE_ROLE_KEY: Manquante" -ForegroundColor Red
    }
}

Write-Host "`nInstructions:" -ForegroundColor Cyan
Write-Host "1. Redémarrez le serveur de développement:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "2. Testez la page admin:" -ForegroundColor White
Write-Host "   http://localhost:5173/admin/users" -ForegroundColor White
Write-Host "3. Testez la page stats:" -ForegroundColor White
Write-Host "   http://localhost:5173/admin/stats" -ForegroundColor White

Write-Host "`nCorrection terminée!" -ForegroundColor Green
