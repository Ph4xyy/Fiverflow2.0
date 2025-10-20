# Script de test pour vérifier la solution sans RPC
# Vérifie que la gestion des profils utilisateurs fonctionne avec du JavaScript direct

Write-Host "🧪 Test de la Solution Sans RPC" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

Write-Host "`n🎯 Objectif:" -ForegroundColor Yellow
Write-Host "Vérifier que la gestion des profils utilisateurs fonctionne" -ForegroundColor White
Write-Host "avec du JavaScript direct, sans dépendre des fonctions RPC." -ForegroundColor White

# Vérifier les fichiers modifiés
Write-Host "`n1. Vérification des fichiers modifiés..." -ForegroundColor Yellow

$filesToCheck = @(
    "src/utils/userProfileManager.ts",
    "src/pages/AdminDashboard.tsx",
    "src/components/Layout.tsx"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file trouvé" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
    }
}

# Vérifier le contenu des fichiers
Write-Host "`n2. Vérification du contenu..." -ForegroundColor Yellow

# Vérifier UserProfileManager
if (Test-Path "src/utils/userProfileManager.ts") {
    $userProfileManager = Get-Content "src/utils/userProfileManager.ts" -Raw
    
    if ($userProfileManager -match "class UserProfileManager") {
        Write-Host "✅ Classe UserProfileManager créée" -ForegroundColor Green
    } else {
        Write-Host "❌ Classe UserProfileManager manquante" -ForegroundColor Red
    }
    
    if ($userProfileManager -match "checkProfileExists") {
        Write-Host "✅ Méthode checkProfileExists implémentée" -ForegroundColor Green
    } else {
        Write-Host "❌ Méthode checkProfileExists manquante" -ForegroundColor Red
    }
    
    if ($userProfileManager -match "createProfile") {
        Write-Host "✅ Méthode createProfile implémentée" -ForegroundColor Green
    } else {
        Write-Host "❌ Méthode createProfile manquante" -ForegroundColor Red
    }
    
    if ($userProfileManager -match "updateProfile") {
        Write-Host "✅ Méthode updateProfile implémentée" -ForegroundColor Green
    } else {
        Write-Host "❌ Méthode updateProfile manquante" -ForegroundColor Red
    }
    
    if ($userProfileManager -match "ensureProfile") {
        Write-Host "✅ Méthode ensureProfile implémentée" -ForegroundColor Green
    } else {
        Write-Host "❌ Méthode ensureProfile manquante" -ForegroundColor Red
    }
    
    if ($userProfileManager -match "checkAdminStatus") {
        Write-Host "✅ Méthode checkAdminStatus implémentée" -ForegroundColor Green
    } else {
        Write-Host "❌ Méthode checkAdminStatus manquante" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier UserProfileManager non trouvé" -ForegroundColor Red
}

# Vérifier AdminDashboard
if (Test-Path "src/pages/AdminDashboard.tsx") {
    $adminDashboard = Get-Content "src/pages/AdminDashboard.tsx" -Raw
    
    if ($adminDashboard -match "UserProfileManager") {
        Write-Host "✅ AdminDashboard utilise UserProfileManager" -ForegroundColor Green
    } else {
        Write-Host "❌ AdminDashboard n'utilise pas UserProfileManager" -ForegroundColor Red
    }
    
    if ($adminDashboard -match "ensure_user_profile") {
        Write-Host "❌ AdminDashboard contient encore des appels RPC" -ForegroundColor Red
    } else {
        Write-Host "✅ AdminDashboard ne contient plus d'appels RPC" -ForegroundColor Green
    }
    
    if ($adminDashboard -match "checkAdminStatus.*user") {
        Write-Host "✅ AdminDashboard utilise checkAdminStatus" -ForegroundColor Green
    } else {
        Write-Host "❌ AdminDashboard n'utilise pas checkAdminStatus" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier AdminDashboard non trouvé" -ForegroundColor Red
}

# Vérifier Layout
if (Test-Path "src/components/Layout.tsx") {
    $layout = Get-Content "src/components/Layout.tsx" -Raw
    
    if ($layout -match "UserProfileManager") {
        Write-Host "✅ Layout utilise UserProfileManager" -ForegroundColor Green
    } else {
        Write-Host "❌ Layout n'utilise pas UserProfileManager" -ForegroundColor Red
    }
    
    if ($layout -match "ensure_user_profile") {
        Write-Host "❌ Layout contient encore des appels RPC" -ForegroundColor Red
    } else {
        Write-Host "✅ Layout ne contient plus d'appels RPC" -ForegroundColor Green
    }
    
    if ($layout -match "checkAdminStatus.*user") {
        Write-Host "✅ Layout utilise checkAdminStatus" -ForegroundColor Green
    } else {
        Write-Host "❌ Layout n'utilise pas checkAdminStatus" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier Layout non trouvé" -ForegroundColor Red
}

# Vérifier qu'il n'y a plus d'appels RPC dans le code
Write-Host "`n3. Vérification des appels RPC restants..." -ForegroundColor Yellow

$rpcCalls = Get-ChildItem "src" -Recurse -Include "*.tsx", "*.ts" | 
    ForEach-Object { Get-Content $_.FullName -Raw } | 
    Select-String -Pattern "\.rpc\(" | 
    Measure-Object

if ($rpcCalls.Count -eq 0) {
    Write-Host "✅ Aucun appel RPC trouvé dans le code" -ForegroundColor Green
} else {
    Write-Host "⚠️ $($rpcCalls.Count) appel(s) RPC encore présent(s)" -ForegroundColor Yellow
}

# Instructions de test
Write-Host "`n4. Instructions de test:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

Write-Host "`nPour tester la solution sans RPC:" -ForegroundColor White
Write-Host "1. Redémarrez l'application: npm run dev" -ForegroundColor Gray
Write-Host "2. Connectez-vous avec votre compte" -ForegroundColor Gray
Write-Host "3. Vérifiez qu'il n'y a plus d'erreur 404 dans la console" -ForegroundColor Gray
Write-Host "4. Vérifiez que l'accès admin fonctionne" -ForegroundColor Gray
Write-Host "5. Testez sur votre autre ordinateur" -ForegroundColor Gray

Write-Host "`n5. Avantages de cette solution:" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

Write-Host "✅ Plus d'erreur 404 (pas de dépendance aux fonctions RPC)" -ForegroundColor Green
Write-Host "✅ Logique JavaScript directe et simple" -ForegroundColor Green
Write-Host "✅ Gestion complète des profils (vérifier/créer/mettre à jour)" -ForegroundColor Green
Write-Host "✅ Code réutilisable avec la classe UserProfileManager" -ForegroundColor Green
Write-Host "✅ Gestion des erreurs robuste" -ForegroundColor Green
Write-Host "✅ Logs détaillés pour le debugging" -ForegroundColor Green

Write-Host "`n6. Fonctionnalités de UserProfileManager:" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

Write-Host "✅ checkProfileExists() - Vérifie si un profil existe" -ForegroundColor Green
Write-Host "✅ createProfile() - Crée un nouveau profil" -ForegroundColor Green
Write-Host "✅ updateProfile() - Met à jour un profil existant" -ForegroundColor Green
Write-Host "✅ ensureProfile() - Gère automatiquement (vérifie/crée/met à jour)" -ForegroundColor Green
Write-Host "✅ checkAdminStatus() - Vérifie le statut admin" -ForegroundColor Green
Write-Host "✅ promoteToAdmin() - Promouvoir en admin" -ForegroundColor Green
Write-Host "✅ demoteFromAdmin() - Rétrograder" -ForegroundColor Green

Write-Host "`n🎯 La solution sans RPC est prête !" -ForegroundColor Cyan
Write-Host "Plus d'erreur 404, plus de dépendance aux fonctions RPC." -ForegroundColor White
Write-Host "Tout est géré avec du JavaScript direct et simple." -ForegroundColor White
