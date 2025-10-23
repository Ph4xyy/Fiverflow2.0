# Script pour corriger la migration
Write-Host "Correction de la migration pour gérer les conflits..." -ForegroundColor Cyan

# Lire le fichier de migration
$content = Get-Content "supabase/migrations/20250130000000_initial_clean_schema.sql" -Raw

# Remplacer CREATE TABLE par CREATE TABLE IF NOT EXISTS
$content = $content -replace "CREATE TABLE (\w+) \(", "CREATE TABLE IF NOT EXISTS `$1 ("

# Remplacer CREATE INDEX par CREATE INDEX IF NOT EXISTS
$content = $content -replace "CREATE INDEX (\w+) ON", "CREATE INDEX IF NOT EXISTS `$1 ON"

# Remplacer CREATE POLICY par CREATE POLICY IF NOT EXISTS
$content = $content -replace "CREATE POLICY `"([^`"]+)`" ON", "CREATE POLICY IF NOT EXISTS `"`$1`" ON"

# Remplacer CREATE FUNCTION par CREATE OR REPLACE FUNCTION
$content = $content -replace "CREATE FUNCTION (\w+)", "CREATE OR REPLACE FUNCTION `$1"

# Remplacer CREATE TRIGGER par DROP TRIGGER IF EXISTS puis CREATE TRIGGER
$content = $content -replace "CREATE TRIGGER (\w+)", "DROP TRIGGER IF EXISTS `$1 ON `$2;`nCREATE TRIGGER `$1"

# Écrire le fichier corrigé
$content | Out-File "supabase/migrations/20250130000000_initial_clean_schema.sql" -Encoding UTF8

Write-Host "Migration corrigee pour gérer les conflits" -ForegroundColor Green
Write-Host "Vous pouvez maintenant executer: npx supabase db push" -ForegroundColor Yellow
