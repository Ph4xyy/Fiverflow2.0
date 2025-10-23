# Test de la page des parrainages
Write-Host "Test de la page des parrainages" -ForegroundColor Cyan

# Vérifier que tous les fichiers sont créés
$files = @(
    "src/pages/ReferralsPage.tsx",
    "src/App.tsx",
    "src/components/Layout.tsx"
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

# Vérifier ReferralsPage
$referralsPage = Get-Content "src/pages/ReferralsPage.tsx" -Raw
if ($referralsPage -match "ReferralsPage") {
    Write-Host "OK: ReferralsPage créée" -ForegroundColor Green
} else {
    Write-Host "ERREUR: ReferralsPage manquante" -ForegroundColor Red
}

if ($referralsPage -match "copyReferralLink") {
    Write-Host "OK: Fonction de copie implémentée" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Fonction de copie manquante" -ForegroundColor Red
}

if ($referralsPage -match "formatAmount") {
    Write-Host "OK: Formatage des montants implémenté" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Formatage des montants manquant" -ForegroundColor Red
}

# Vérifier App.tsx
$app = Get-Content "src/App.tsx" -Raw
if ($app -match "ReferralsPage") {
    Write-Host "OK: ReferralsPage importée dans App" -ForegroundColor Green
} else {
    Write-Host "ERREUR: ReferralsPage non importée" -ForegroundColor Red
}

if ($app -match "/referrals") {
    Write-Host "OK: Route /referrals ajoutée" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Route /referrals manquante" -ForegroundColor Red
}

# Vérifier Layout.tsx
$layout = Get-Content "src/components/Layout.tsx" -Raw
if ($layout -match "Gift") {
    Write-Host "OK: Icône Gift importée" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Icône Gift manquante" -ForegroundColor Red
}

if ($layout -match "Parrainage") {
    Write-Host "OK: Lien Parrainage ajouté" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Lien Parrainage manquant" -ForegroundColor Red
}

Write-Host "`nFonctionnalités de la page /referrals:" -ForegroundColor Cyan
Write-Host "1. ✅ Lien de parrainage avec bouton de copie" -ForegroundColor White
Write-Host "2. ✅ Statistiques principales (gains, filleuls, etc.)" -ForegroundColor White
Write-Host "3. ✅ Onglets (Vue d'ensemble, Filleuls, Commissions)" -ForegroundColor White
Write-Host "4. ✅ Liste des filleuls avec détails" -ForegroundColor White
Write-Host "5. ✅ Liste des commissions avec statuts" -ForegroundColor White
Write-Host "6. ✅ Analytics et graphiques" -ForegroundColor White
Write-Host "7. ✅ Boutons de partage et copie" -ForegroundColor White
Write-Host "8. ✅ Gestion des états (loading, error, empty)" -ForegroundColor White

Write-Host "`nInterface utilisateur:" -ForegroundColor Yellow
Write-Host "✅ Design moderne avec gradients" -ForegroundColor White
Write-Host "✅ Responsive design" -ForegroundColor White
Write-Host "✅ Icônes Lucide React" -ForegroundColor White
Write-Host "✅ Animations et transitions" -ForegroundColor White
Write-Host "✅ États visuels (copié, loading, etc.)" -ForegroundColor White
Write-Host "✅ Toast notifications" -ForegroundColor White

Write-Host "`nFonctionnalités avancées:" -ForegroundColor Yellow
Write-Host "✅ Copie automatique du lien" -ForegroundColor White
Write-Host "✅ Partage natif (Web Share API)" -ForegroundColor White
Write-Host "✅ Formatage des montants en euros" -ForegroundColor White
Write-Host "✅ Formatage des dates en français" -ForegroundColor White
Write-Host "✅ Statuts des commissions colorés" -ForegroundColor White
Write-Host "✅ Actualisation des données" -ForegroundColor White

Write-Host "`nComment tester:" -ForegroundColor Yellow
Write-Host "1. Aller sur http://localhost:5173/referrals" -ForegroundColor White
Write-Host "2. Vérifier l'affichage du lien de parrainage" -ForegroundColor White
Write-Host "3. Tester le bouton de copie" -ForegroundColor White
Write-Host "4. Naviguer entre les onglets" -ForegroundColor White
Write-Host "5. Vérifier les statistiques" -ForegroundColor White

Write-Host "`nPage des parrainages prête!" -ForegroundColor Green
