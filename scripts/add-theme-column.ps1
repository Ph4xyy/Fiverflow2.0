# Script pour ajouter la colonne theme_preference à Supabase
Write-Host "Ajout de la colonne theme_preference a Supabase" -ForegroundColor Cyan

# Vérifier que le fichier SQL existe
if (Test-Path "scripts/add-theme-column.sql") {
    Write-Host "OK: Fichier SQL trouve" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Fichier SQL manquant" -ForegroundColor Red
    exit 1
}

Write-Host "`nPour ajouter la colonne theme_preference:" -ForegroundColor Yellow
Write-Host "1. Allez dans votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Ouvrez l'onglet SQL Editor" -ForegroundColor White
Write-Host "3. Copiez le contenu de scripts/add-theme-column.sql" -ForegroundColor White
Write-Host "4. Exécutez le script SQL" -ForegroundColor White

Write-Host "`nOu utilisez la CLI Supabase:" -ForegroundColor Yellow
Write-Host "supabase db reset" -ForegroundColor White
Write-Host "supabase db push" -ForegroundColor White

Write-Host "`nUne fois la colonne ajoutee, le systeme de theme sera plus precis!" -ForegroundColor Green
