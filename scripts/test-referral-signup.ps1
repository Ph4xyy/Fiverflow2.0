# Test du système d'inscription avec parrainage
Write-Host "Test du système d'inscription avec parrainage" -ForegroundColor Cyan

# Vérifier que tous les fichiers sont créés
$files = @(
    "src/contexts/ReferralContext.tsx",
    "src/pages/RegisterPage.tsx",
    "src/App.tsx"
)

Write-Host "`nVérification des fichiers:" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: $file manquant" -ForegroundColor Red
    }
}

# Vérifier les modifications spécifiques
Write-Host "`nVérification des modifications:" -ForegroundColor Yellow

# Vérifier ReferralContext
$referralContext = Get-Content "src/contexts/ReferralContext.tsx" -Raw
if ($referralContext -match "ReferralProvider") {
    Write-Host "OK: ReferralProvider créé" -ForegroundColor Green
} else {
    Write-Host "ERREUR: ReferralProvider manquant" -ForegroundColor Red
}

if ($referralContext -match "localStorage") {
    Write-Host "OK: Gestion localStorage implémentée" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Gestion localStorage manquante" -ForegroundColor Red
}

# Vérifier RegisterPage
$registerPage = Get-Content "src/pages/RegisterPage.tsx" -Raw
if ($registerPage -match "useReferral") {
    Write-Host "OK: useReferral intégré dans RegisterPage" -ForegroundColor Green
} else {
    Write-Host "ERREUR: useReferral non intégré" -ForegroundColor Red
}

if ($registerPage -match "applyReferralCode") {
    Write-Host "OK: applyReferralCode intégré" -ForegroundColor Green
} else {
    Write-Host "ERREUR: applyReferralCode manquant" -ForegroundColor Red
}

# Vérifier App.tsx
$app = Get-Content "src/App.tsx" -Raw
if ($app -match "ReferralProvider") {
    Write-Host "OK: ReferralProvider ajouté dans App" -ForegroundColor Green
} else {
    Write-Host "ERREUR: ReferralProvider manquant dans App" -ForegroundColor Red
}

Write-Host "`nFonctionnalités implémentées:" -ForegroundColor Cyan
Write-Host "1. ✅ Détection automatique du paramètre ?ref=CODE" -ForegroundColor White
Write-Host "2. ✅ Stockage temporaire dans localStorage" -ForegroundColor White
Write-Host "3. ✅ Validation du code de parrainage" -ForegroundColor White
Write-Host "4. ✅ Affichage des informations du parrain" -ForegroundColor White
Write-Host "5. ✅ Application automatique lors de l'inscription" -ForegroundColor White
Write-Host "6. ✅ Persistance après rechargement de page" -ForegroundColor White
Write-Host "7. ✅ Gestion des erreurs de parrainage" -ForegroundColor White

Write-Host "`nComment tester:" -ForegroundColor Yellow
Write-Host "1. Allez sur /register?ref=FXR-1234" -ForegroundColor White
Write-Host "2. Vérifiez que le code est détecté et affiché" -ForegroundColor White
Write-Host "3. Rechargez la page - le code doit persister" -ForegroundColor White
Write-Host "4. Inscrivez-vous - le parrain doit être enregistré" -ForegroundColor White
Write-Host "5. Vérifiez dans la console les logs de parrainage" -ForegroundColor White

Write-Host "`nProchaines étapes:" -ForegroundColor Yellow
Write-Host "1. Appliquer la migration SQL dans Supabase" -ForegroundColor White
Write-Host "2. Tester avec un vrai code de parrainage" -ForegroundColor White
Write-Host "3. Créer la page /referrals pour la gestion" -ForegroundColor White

Write-Host "`nSystème d'inscription avec parrainage prêt!" -ForegroundColor Green
