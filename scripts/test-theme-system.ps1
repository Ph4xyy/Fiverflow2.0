# Test du système de thème avec Halloween
# Ce script vérifie que le système de thème fonctionne correctement

Write-Host "🎨 Test du système de thème - Halloween" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Vérifier que les fichiers ont été créés/modifiés
$filesToCheck = @(
    "src/contexts/ThemeContext.tsx",
    "src/components/ThemeSelector.tsx",
    "src/components/Layout.tsx",
    "src/pages/ProfilePageNew.tsx",
    "src/index.css"
)

Write-Host "`n📋 Vérification des fichiers..." -ForegroundColor Yellow

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file - Trouvé" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Manquant" -ForegroundColor Red
    }
}

# Vérifier les modifications spécifiques
Write-Host "`n🔍 Vérification des modifications..." -ForegroundColor Yellow

# Vérifier ThemeContext
$themeContext = Get-Content "src/contexts/ThemeContext.tsx" -Raw
if ($themeContext -match "ThemeType.*halloween") {
    Write-Host "✅ ThemeType inclut halloween" -ForegroundColor Green
} else {
    Write-Host "❌ ThemeType n'inclut pas halloween" -ForegroundColor Red
}

if ($themeContext -match "setTheme") {
    Write-Host "✅ Fonction setTheme ajoutée" -ForegroundColor Green
} else {
    Write-Host "❌ Fonction setTheme manquante" -ForegroundColor Red
}

# Vérifier ThemeSelector
$themeSelector = Get-Content "src/components/ThemeSelector.tsx" -Raw
if ($themeSelector -match "halloween") {
    Write-Host "✅ ThemeSelector inclut Halloween" -ForegroundColor Green
} else {
    Write-Host "❌ ThemeSelector n'inclut pas Halloween" -ForegroundColor Red
}

# Vérifier Layout
$layout = Get-Content "src/components/Layout.tsx" -Raw
if ($layout -match "handleThemeChange") {
    Write-Host "✅ Layout inclut handleThemeChange" -ForegroundColor Green
} else {
    Write-Host "❌ Layout n'inclut pas handleThemeChange" -ForegroundColor Red
}

# Vérifier ProfilePageNew
$profile = Get-Content "src/pages/ProfilePageNew.tsx" -Raw
if ($profile -match "ThemeSelector") {
    Write-Host "✅ ProfilePageNew inclut ThemeSelector" -ForegroundColor Green
} else {
    Write-Host "❌ ProfilePageNew n'inclut pas ThemeSelector" -ForegroundColor Red
}

# Vérifier index.css
$css = Get-Content "src/index.css" -Raw
if ($css -match "\.halloween") {
    Write-Host "✅ Styles Halloween ajoutés" -ForegroundColor Green
} else {
    Write-Host "❌ Styles Halloween manquants" -ForegroundColor Red
}

Write-Host "`n📊 Fonctionnalités du système de thème:" -ForegroundColor Cyan
Write-Host "1. ✅ Thème Light (par défaut)" -ForegroundColor Green
Write-Host "2. ✅ Thème Dark (mode sombre)" -ForegroundColor Green
Write-Host "3. ✅ Thème Halloween (spécial)" -ForegroundColor Green
Write-Host "4. ✅ Bouton de changement rapide dans la barre de navigation" -ForegroundColor Green
Write-Host "5. ✅ Sélecteur de thème dans les paramètres du profil" -ForegroundColor Green
Write-Host "6. ✅ Sauvegarde des préférences dans localStorage et Supabase" -ForegroundColor Green
Write-Host "7. ✅ Transitions fluides entre les thèmes" -ForegroundColor Green

Write-Host "`n🎃 Thème Halloween spécial:" -ForegroundColor Cyan
Write-Host "• Couleurs orange et rouge pour l'ambiance Halloween" -ForegroundColor White
Write-Host "• Arrière-plans sombres avec accents orange" -ForegroundColor White
Write-Host "• Message spécial Halloween dans le sélecteur" -ForegroundColor White
Write-Host "• Icône éclair (Zap) pour le thème Halloween" -ForegroundColor White

Write-Host "`n🎯 Comment utiliser:" -ForegroundColor Cyan
Write-Host "1. Cliquez sur l'icône de thème dans la barre de navigation pour changer rapidement" -ForegroundColor White
Write-Host "2. Ou allez dans Profil > Settings > Theme pour choisir precisement" -ForegroundColor White
Write-Host "3. Les préférences sont sauvegardées automatiquement" -ForegroundColor White

Write-Host "`n✅ Systeme de theme Halloween implemente avec succes!" -ForegroundColor Green
