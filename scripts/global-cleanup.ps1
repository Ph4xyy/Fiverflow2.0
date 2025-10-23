# Script de nettoyage global du projet FiverFlow
Write-Host "🧹 Nettoyage global du projet FiverFlow..." -ForegroundColor Yellow

# Vérifier si nous sommes à la racine du projet
$currentPath = Get-Location
if (-not ($currentPath.Path.EndsWith("Fiverflow2.0"))) {
    Write-Error "❌ Ce script doit être exécuté depuis la racine du projet FiverFlow"
    exit 1
}

Write-Host "📁 Nettoyage des fichiers temporaires..." -ForegroundColor Blue

# Supprimer les fichiers temporaires
$tempFiles = @(
    "*.tmp",
    "*.temp",
    "*.log",
    "*.cache",
    "node_modules/.cache",
    ".next",
    "dist",
    "build"
)

foreach ($pattern in $tempFiles) {
    $files = Get-ChildItem -Path . -Recurse -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            Remove-Item -Path $file -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Supprimé: $file" -ForegroundColor Green
        }
    }
}

Write-Host "🔍 Vérification des dépendances..." -ForegroundColor Blue

# Vérifier si node_modules existe
if (Test-Path "node_modules") {
    Write-Host "  ✅ node_modules trouvé" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ node_modules manquant - exécutez 'npm install'" -ForegroundColor Yellow
}

# Vérifier package.json
if (Test-Path "package.json") {
    Write-Host "  ✅ package.json trouvé" -ForegroundColor Green
} else {
    Write-Host "  ❌ package.json manquant" -ForegroundColor Red
}

Write-Host "📊 Statistiques du projet..." -ForegroundColor Blue

# Compter les fichiers
$tsFiles = (Get-ChildItem -Path "src" -Recurse -Filter "*.ts" -ErrorAction SilentlyContinue).Count
$tsxFiles = (Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue).Count
$cssFiles = (Get-ChildItem -Path "src" -Recurse -Filter "*.css" -ErrorAction SilentlyContinue).Count

Write-Host "  📄 Fichiers TypeScript (.ts): $tsFiles" -ForegroundColor Cyan
Write-Host "  📄 Fichiers React (.tsx): $tsxFiles" -ForegroundColor Cyan
Write-Host "  📄 Fichiers CSS (.css): $cssFiles" -ForegroundColor Cyan

Write-Host "🎯 Nettoyage terminé avec succès!" -ForegroundColor Green
Write-Host "💡 Conseils pour optimiser le projet:" -ForegroundColor Yellow
Write-Host "  - Exécutez 'npm run build' pour vérifier la compilation" -ForegroundColor White
Write-Host "  - Exécutez 'npm run lint' pour vérifier le code" -ForegroundColor White
Write-Host "  - Exécutez 'npm run dev' pour démarrer le serveur de développement" -ForegroundColor White
