# Script pour promouvoir un utilisateur en admin
# Utilise l'email de l'utilisateur pour l'identifier

param(
    [Parameter(Mandatory=$true)]
    [string]$UserEmail
)

Write-Host "🔧 Promotion d'un utilisateur en administrateur" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

Write-Host "`n📧 Email de l'utilisateur: $UserEmail" -ForegroundColor Yellow

# Vérifier que Supabase CLI est disponible
Write-Host "`n1. Vérification de Supabase CLI..." -ForegroundColor Yellow

try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI trouvé: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Installez-le d'abord:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Gray
    exit 1
}

# Créer le script SQL pour promouvoir l'utilisateur
Write-Host "`n2. Création du script de promotion..." -ForegroundColor Yellow

$sqlScript = @"
-- Script pour promouvoir un utilisateur en admin
-- Email: $UserEmail

-- Étape 1: Vérifier que l'utilisateur existe dans auth.users
DO \$\$
DECLARE
    user_uuid UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Récupérer l'UUID de l'utilisateur
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = '$UserEmail';
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Utilisateur avec email % non trouvé dans auth.users', '$UserEmail';
    END IF;
    
    RAISE NOTICE 'Utilisateur trouvé: %', user_uuid;
    
    -- Vérifier si le profil existe dans user_profiles
    SELECT EXISTS(
        SELECT 1 FROM user_profiles 
        WHERE user_id = user_uuid
    ) INTO profile_exists;
    
    -- Créer le profil s'il n'existe pas
    IF NOT profile_exists THEN
        INSERT INTO user_profiles (user_id, full_name, email, is_admin, is_active)
        VALUES (
            user_uuid,
            COALESCE(
                (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_uuid),
                split_part('$UserEmail', '@', 1)
            ),
            '$UserEmail',
            FALSE, -- Pas admin par défaut
            TRUE   -- Actif par défaut
        );
        RAISE NOTICE 'Profil utilisateur créé pour %', '$UserEmail';
    ELSE
        RAISE NOTICE 'Profil utilisateur existe déjà pour %', '$UserEmail';
    END IF;
    
    -- Promouvoir l'utilisateur en admin
    UPDATE user_profiles
    SET is_admin = TRUE,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Vérifier la promotion
    IF FOUND THEN
        RAISE NOTICE '✅ Utilisateur % promu administrateur avec succès!', '$UserEmail';
    ELSE
        RAISE EXCEPTION '❌ Échec de la promotion de %', '$UserEmail';
    END IF;
    
    -- Afficher les informations finales
    SELECT 
        up.user_id,
        up.full_name,
        up.email,
        up.is_admin,
        up.is_active,
        up.created_at,
        up.updated_at
    FROM user_profiles up
    WHERE up.user_id = user_uuid;
    
END \$\$;
"@

$scriptPath = "temp_promote_user.sql"
$sqlScript | Out-File -FilePath $scriptPath -Encoding UTF8

Write-Host "✅ Script SQL créé: $scriptPath" -ForegroundColor Green

# Exécuter le script
Write-Host "`n3. Exécution du script de promotion..." -ForegroundColor Yellow

try {
    # Exécuter le script via Supabase
    $result = supabase db reset --db-url $env:DATABASE_URL --script $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script exécuté avec succès!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'exécution du script" -ForegroundColor Red
        Write-Host "Résultat: $result" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution:" -ForegroundColor Red
    Write-Host "$_" -ForegroundColor Gray
}

# Alternative: utiliser psql directement si disponible
Write-Host "`n4. Alternative avec psql..." -ForegroundColor Yellow

try {
    # Vérifier si psql est disponible
    $psqlVersion = psql --version
    Write-Host "✅ psql trouvé: $psqlVersion" -ForegroundColor Green
    
    Write-Host "Pour exécuter manuellement, utilisez:" -ForegroundColor White
    Write-Host "psql -h your-host -U postgres -d postgres -f $scriptPath" -ForegroundColor Gray
} catch {
    Write-Host "ℹ️ psql non disponible, utilisez Supabase Dashboard" -ForegroundColor Yellow
}

# Nettoyer le fichier temporaire
Write-Host "`n5. Nettoyage..." -ForegroundColor Yellow
if (Test-Path $scriptPath) {
    Remove-Item $scriptPath
    Write-Host "✅ Fichier temporaire supprimé" -ForegroundColor Green
}

# Instructions pour Supabase Dashboard
Write-Host "`n6. Instructions pour Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "Si les scripts automatiques ne fonctionnent pas:" -ForegroundColor White
Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "2. Sélectionnez votre projet" -ForegroundColor Gray
Write-Host "3. Allez dans SQL Editor" -ForegroundColor Gray
Write-Host "4. Exécutez cette requête:" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Trouver l'utilisateur" -ForegroundColor Cyan
Write-Host "SELECT id, email FROM auth.users WHERE email = '$UserEmail';" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Créer/mettre à jour le profil" -ForegroundColor Cyan
Write-Host "INSERT INTO user_profiles (user_id, full_name, email, is_admin, is_active)" -ForegroundColor Gray
Write-Host "VALUES ('USER_UUID_FROM_ABOVE', 'Nom Utilisateur', '$UserEmail', true, true)" -ForegroundColor Gray
Write-Host "ON CONFLICT (user_id) DO UPDATE SET is_admin = true, updated_at = NOW();" -ForegroundColor Gray

Write-Host "`n🎯 Promotion terminée!" -ForegroundColor Cyan
Write-Host "L'utilisateur $UserEmail devrait maintenant être administrateur." -ForegroundColor White
