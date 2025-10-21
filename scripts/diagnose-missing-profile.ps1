# Script pour diagnostiquer et corriger les profils utilisateurs manquants
# Problème: Utilisateur existe dans auth.users mais pas dans user_profiles

Write-Host "🔍 Diagnostic des profils utilisateurs manquants" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

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

# Créer le script de diagnostic
Write-Host "`n2. Création du script de diagnostic..." -ForegroundColor Yellow

$diagnosticScript = @"
-- Script de diagnostic pour les profils utilisateurs manquants

-- Étape 1: Compter les utilisateurs dans auth.users
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- Étape 2: Compter les profils dans user_profiles
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_profiles,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_profiles
FROM user_profiles;

-- Étape 3: Identifier les utilisateurs sans profil
SELECT 
    'Utilisateurs sans profil' as status,
    au.id as user_id,
    au.email,
    au.created_at as user_created_at,
    au.email_confirmed_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ORDER BY au.created_at DESC;

-- Étape 4: Identifier les profils sans utilisateur auth
SELECT 
    'Profils sans utilisateur auth' as status,
    up.id as profile_id,
    up.user_id,
    up.email,
    up.created_at as profile_created_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.id IS NULL;

-- Étape 5: Vérifier les utilisateurs admin
SELECT 
    'Utilisateurs admin' as status,
    up.user_id,
    up.email,
    up.full_name,
    up.is_admin,
    up.is_active,
    au.email_confirmed_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.is_admin = true
ORDER BY up.updated_at DESC;
"@

$scriptPath = "temp_diagnostic.sql"
$diagnosticScript | Out-File -FilePath $scriptPath -Encoding UTF8

Write-Host "✅ Script de diagnostic créé: $scriptPath" -ForegroundColor Green

# Créer le script de correction
Write-Host "`n3. Création du script de correction..." -ForegroundColor Yellow

$fixScript = @"
-- Script pour corriger les profils utilisateurs manquants

-- Étape 1: Créer les profils manquants pour tous les utilisateurs auth
INSERT INTO user_profiles (user_id, full_name, email, is_admin, is_active)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        split_part(au.email, '@', 1)
    ) as full_name,
    au.email,
    FALSE as is_admin, -- Pas admin par défaut
    TRUE as is_active  -- Actif par défaut
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = au.id
)
AND au.email_confirmed_at IS NOT NULL; -- Seulement les utilisateurs confirmés

-- Étape 2: Afficher le résultat
SELECT 
    'Profils créés' as status,
    COUNT(*) as count
FROM user_profiles;

-- Étape 3: Vérifier qu'il n'y a plus d'utilisateurs sans profil
SELECT 
    'Utilisateurs confirmés sans profil' as status,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
AND au.email_confirmed_at IS NOT NULL;
"@

$fixScriptPath = "temp_fix_profiles.sql"
$fixScript | Out-File -FilePath $fixScriptPath -Encoding UTF8

Write-Host "✅ Script de correction créé: $fixScriptPath" -ForegroundColor Green

# Instructions pour exécuter les scripts
Write-Host "`n4. Instructions pour exécuter les scripts:" -ForegroundColor Yellow
Write-Host "Pour diagnostiquer le problème:" -ForegroundColor White
Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "2. Sélectionnez votre projet" -ForegroundColor Gray
Write-Host "3. Allez dans SQL Editor" -ForegroundColor Gray
Write-Host "4. Copiez et exécutez le contenu de: $scriptPath" -ForegroundColor Gray

Write-Host "`nPour corriger le problème:" -ForegroundColor White
Write-Host "1. Dans SQL Editor, copiez et exécutez le contenu de: $fixScriptPath" -ForegroundColor Gray
Write-Host "2. Cela créera automatiquement tous les profils manquants" -ForegroundColor Gray

# Afficher le contenu des scripts
Write-Host "`n5. Contenu du script de diagnostic:" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host $diagnosticScript -ForegroundColor Gray

Write-Host "`n6. Contenu du script de correction:" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host $fixScript -ForegroundColor Gray

# Instructions spécifiques pour promouvoir un utilisateur en admin
Write-Host "`n7. Pour promouvoir un utilisateur en admin:" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "Utilisez le script: .\scripts\promote-user-to-admin.ps1 -UserEmail 'votre@email.com'" -ForegroundColor Green

# Nettoyer les fichiers temporaires
Write-Host "`n8. Nettoyage..." -ForegroundColor Yellow
if (Test-Path $scriptPath) {
    Remove-Item $scriptPath
    Write-Host "✅ Fichier de diagnostic supprimé" -ForegroundColor Green
}
if (Test-Path $fixScriptPath) {
    Remove-Item $fixScriptPath
    Write-Host "✅ Fichier de correction supprimé" -ForegroundColor Green
}

Write-Host "`n🎯 Diagnostic terminé!" -ForegroundColor Cyan
Write-Host "Le problème est que votre utilisateur existe dans auth.users" -ForegroundColor White
Write-Host "mais pas dans user_profiles. Les scripts ci-dessus vous permettront" -ForegroundColor White
Write-Host "de diagnostiquer et corriger ce problème." -ForegroundColor White
