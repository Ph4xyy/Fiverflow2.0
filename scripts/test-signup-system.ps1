# Script de test pour vérifier le système d'inscription
# Ce script teste la création d'utilisateur et vérifie que tous les triggers fonctionnent

Write-Host "🔧 Test du système d'inscription - FiverFlow" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Configuration Supabase
$supabaseUrl = "https://your-project.supabase.co"
$supabaseKey = "your-anon-key"

# Fonction pour tester l'inscription
function Test-UserSignup {
    param(
        [string]$email,
        [string]$password,
        [string]$firstName = "Test",
        [string]$lastName = "User"
    )
    
    Write-Host "`n🧪 Test d'inscription pour: $email" -ForegroundColor Yellow
    
    try {
        # Appel à l'API Supabase Auth
        $signupData = @{
            email = $email
            password = $password
            data = @{
                first_name = $firstName
                last_name = $lastName
                full_name = "$firstName $lastName"
            }
        } | ConvertTo-Json -Depth 3
        
        $headers = @{
            "Content-Type" = "application/json"
            "apikey" = $supabaseKey
        }
        
        $response = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/signup" -Method Post -Body $signupData -Headers $headers
        
        if ($response.user) {
            Write-Host "✅ Inscription réussie!" -ForegroundColor Green
            Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
            Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
            
            # Vérifier que le profil a été créé
            Start-Sleep -Seconds 2
            Test-UserProfile -userId $response.user.id
            
            return $response.user
        } else {
            Write-Host "❌ Échec de l'inscription" -ForegroundColor Red
            return $null
        }
    }
    catch {
        Write-Host "❌ Erreur lors de l'inscription: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Fonction pour vérifier le profil utilisateur
function Test-UserProfile {
    param([string]$userId)
    
    Write-Host "`n🔍 Vérification du profil utilisateur..." -ForegroundColor Yellow
    
    try {
        $headers = @{
            "apikey" = $supabaseKey
        }
        
        # Vérifier le profil dans user_profiles
        $profileResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/user_profiles?user_id=eq.$userId" -Method Get -Headers $headers
        
        if ($profileResponse.Count -gt 0) {
            $profile = $profileResponse[0]
            Write-Host "✅ Profil créé avec succès!" -ForegroundColor Green
            Write-Host "   Nom: $($profile.full_name)" -ForegroundColor Gray
            Write-Host "   Email: $($profile.email)" -ForegroundColor Gray
            Write-Host "   Admin: $($profile.is_admin)" -ForegroundColor Gray
            Write-Host "   Actif: $($profile.is_active)" -ForegroundColor Gray
            
            # Vérifier l'abonnement
            Test-UserSubscription -userId $userId
            
            # Vérifier le rôle
            Test-UserRole -userId $userId
            
        } else {
            Write-Host "❌ Aucun profil trouvé pour l'utilisateur" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erreur lors de la vérification du profil: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fonction pour vérifier l'abonnement utilisateur
function Test-UserSubscription {
    param([string]$userId)
    
    Write-Host "`n💳 Vérification de l'abonnement..." -ForegroundColor Yellow
    
    try {
        $headers = @{
            "apikey" = $supabaseKey
        }
        
        $subscriptionResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/user_subscriptions?user_id=eq.$userId" -Method Get -Headers $headers
        
        if ($subscriptionResponse.Count -gt 0) {
            $subscription = $subscriptionResponse[0]
            Write-Host "✅ Abonnement créé avec succès!" -ForegroundColor Green
            Write-Host "   Statut: $($subscription.status)" -ForegroundColor Gray
            Write-Host "   Cycle: $($subscription.billing_cycle)" -ForegroundColor Gray
            Write-Host "   Montant: $($subscription.amount)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Aucun abonnement trouvé pour l'utilisateur" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erreur lors de la vérification de l'abonnement: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fonction pour vérifier le rôle utilisateur
function Test-UserRole {
    param([string]$userId)
    
    Write-Host "`n👤 Vérification du rôle utilisateur..." -ForegroundColor Yellow
    
    try {
        $headers = @{
            "apikey" = $supabaseKey
        }
        
        $roleResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/user_roles?user_id=eq.$userId" -Method Get -Headers $headers
        
        if ($roleResponse.Count -gt 0) {
            $role = $roleResponse[0]
            Write-Host "✅ Rôle créé avec succès!" -ForegroundColor Green
            Write-Host "   Rôle ID: $($role.role_id)" -ForegroundColor Gray
            Write-Host "   Assigné le: $($role.assigned_at)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Aucun rôle trouvé pour l'utilisateur" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erreur lors de la vérification du rôle: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fonction pour nettoyer les données de test
function Cleanup-TestData {
    param([string]$email)
    
    Write-Host "`n🧹 Nettoyage des données de test..." -ForegroundColor Yellow
    
    try {
        # Note: Dans un vrai environnement, vous devriez supprimer l'utilisateur via l'API Admin
        # ou utiliser une base de données de test séparée
        Write-Host "⚠️  Nettoyage manuel requis pour l'email: $email" -ForegroundColor Yellow
        Write-Host "   - Supprimer l'utilisateur dans le dashboard Supabase" -ForegroundColor Gray
        Write-Host "   - Ou utiliser l'API Admin pour supprimer l'utilisateur" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Erreur lors du nettoyage: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Tests principaux
Write-Host "`n🚀 Démarrage des tests d'inscription..." -ForegroundColor Cyan

# Test 1: Inscription normale
$testEmail1 = "test-signup-$(Get-Date -Format 'yyyyMMdd-HHmmss')@example.com"
$testUser1 = Test-UserSignup -email $testEmail1 -password "TestPassword123!" -firstName "Test" -lastName "User"

# Test 2: Inscription avec données complètes
$testEmail2 = "test-signup-full-$(Get-Date -Format 'yyyyMMdd-HHmmss')@example.com"
$testUser2 = Test-UserSignup -email $testEmail2 -password "TestPassword123!" -firstName "John" -lastName "Doe"

# Résumé des tests
Write-Host "`n📊 Résumé des tests:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

if ($testUser1) {
    Write-Host "✅ Test 1 (inscription normale): RÉUSSI" -ForegroundColor Green
} else {
    Write-Host "❌ Test 1 (inscription normale): ÉCHEC" -ForegroundColor Red
}

if ($testUser2) {
    Write-Host "✅ Test 2 (inscription complète): RÉUSSI" -ForegroundColor Green
} else {
    Write-Host "❌ Test 2 (inscription complète): ÉCHEC" -ForegroundColor Red
}

# Nettoyage
Write-Host "`n🧹 Nettoyage des données de test..." -ForegroundColor Yellow
Cleanup-TestData -email $testEmail1
Cleanup-TestData -email $testEmail2

Write-Host "`n✨ Tests terminés!" -ForegroundColor Cyan
Write-Host "Si tous les tests sont réussis, le système d'inscription fonctionne correctement." -ForegroundColor Green
Write-Host "Si des tests échouent, vérifiez les logs Supabase et les migrations." -ForegroundColor Yellow
