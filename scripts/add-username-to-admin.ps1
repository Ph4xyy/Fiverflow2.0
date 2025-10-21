# Script PowerShell pour ajouter un username à un compte admin
# Exécute ce script dans PowerShell

Write-Host "🔧 Ajout d'un username au compte admin..." -ForegroundColor Cyan

# Demander le username souhaité
$username = Read-Host "Entrez le username souhaité pour votre compte admin"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username vide, utilisation de 'admin' par défaut" -ForegroundColor Yellow
    $username = "admin"
}

# Vérifier que le username respecte les règles
if ($username -notmatch '^[a-z0-9_]+$') {
    Write-Host "❌ Username invalide. Utilisez uniquement des lettres minuscules, chiffres et underscores" -ForegroundColor Red
    exit 1
}

if ($username.Length -lt 3 -or $username.Length -gt 50) {
    Write-Host "❌ Username doit contenir entre 3 et 50 caractères" -ForegroundColor Red
    exit 1
}

if ($username -match '^[0-9]') {
    Write-Host "❌ Username ne peut pas commencer par un chiffre" -ForegroundColor Red
    exit 1
}

if ($username -match '_$') {
    Write-Host "❌ Username ne peut pas se terminer par un underscore" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Username valide: $username" -ForegroundColor Green

# Générer le script SQL
$sqlScript = @"
-- Script pour ajouter le username '$username' au compte admin
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les comptes admin existants
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin,
  created_at
FROM user_profiles 
WHERE is_admin = TRUE
ORDER BY created_at;

-- 2. Mettre à jour le username pour le premier admin
UPDATE user_profiles 
SET username = '$username'
WHERE is_admin = TRUE 
AND username IS NULL
AND user_id = (
  SELECT user_id 
  FROM user_profiles 
  WHERE is_admin = TRUE 
  AND username IS NULL 
  ORDER BY created_at 
  LIMIT 1
);

-- 3. Vérifier que la mise à jour a fonctionné
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin
FROM user_profiles 
WHERE is_admin = TRUE;

SELECT 'Username $username ajouté au compte admin!' as status;
"@

# Sauvegarder le script SQL
$scriptPath = "scripts/add-username-to-admin-$username.sql"
$sqlScript | Out-File -FilePath $scriptPath -Encoding UTF8

Write-Host "📄 Script SQL généré: $scriptPath" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Ouvre Supabase SQL Editor" -ForegroundColor White
Write-Host "2. Copie et colle le contenu du fichier $scriptPath" -ForegroundColor White
Write-Host "3. Exécute le script" -ForegroundColor White
Write-Host "4. Vérifie que le username a été ajouté" -ForegroundColor White
Write-Host ""
Write-Host "✅ Une fois fait, ton username '$username' sera affiché sur ton profil!" -ForegroundColor Cyan
