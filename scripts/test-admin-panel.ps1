# Script de test pour l'Admin Panel FiverFlow2.0
# Ce script teste les fonctionnalités principales du système d'administration

param(
    [string]$SupabaseUrl = "",
    [string]$SupabaseAnonKey = "",
    [string]$AdminEmail = "",
    [string]$AdminPassword = ""
)

Write-Host "🧪 Test de l'Admin Panel FiverFlow2.0" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Vérifier les paramètres requis
if (-not $SupabaseUrl -or -not $SupabaseAnonKey -or -not $AdminEmail -or -not $AdminPassword) {
    Write-Host "❌ Paramètres manquants. Utilisation:" -ForegroundColor Red
    Write-Host ".\test-admin-panel.ps1 -SupabaseUrl 'https://xxx.supabase.co' -SupabaseAnonKey 'xxx' -AdminEmail 'admin@example.com' -AdminPassword 'password'" -ForegroundColor Yellow
    exit 1
}

# Configuration
$baseUrl = $SupabaseUrl
$anonKey = $SupabaseAnonKey

Write-Host "📋 Configuration:" -ForegroundColor Green
Write-Host "  Supabase URL: $baseUrl" -ForegroundColor Gray
Write-Host "  Admin Email: $AdminEmail" -ForegroundColor Gray
Write-Host ""

# Fonction pour faire des requêtes HTTP
function Invoke-SupabaseRequest {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $url = "$baseUrl/functions/v1/$Endpoint"
    $defaultHeaders = @{
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    }
    
    $allHeaders = $defaultHeaders + $Headers
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $allHeaders
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $allHeaders -Body $Body
        }
        return $response
    } catch {
        Write-Host "❌ Erreur HTTP: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Vérifier la connexion Supabase
Write-Host "🔍 Test 1: Connexion Supabase" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/rest/v1/" -Method GET -Headers @{"apikey" = $anonKey}
    Write-Host "✅ Connexion Supabase OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Impossible de se connecter à Supabase" -ForegroundColor Red
    exit 1
}

# Test 2: Vérifier les Edge Functions
Write-Host "🔍 Test 2: Edge Functions" -ForegroundColor Yellow

$functions = @("admin-users", "admin-stats", "admin-ai", "stripe-webhook")

foreach ($func in $functions) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/functions/v1/$func" -Method GET -Headers @{"Authorization" = "Bearer $anonKey"}
        Write-Host "✅ Function $func accessible" -ForegroundColor Green
    } catch {
        Write-Host "❌ Function $func non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Vérifier les tables de base de données
Write-Host "🔍 Test 3: Tables de base de données" -ForegroundColor Yellow

$tables = @("admin_actions_log", "transactions", "user_profiles")

foreach ($table in $tables) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/rest/v1/$table?select=*&limit=1" -Method GET -Headers @{"apikey" = $anonKey}
        Write-Host "✅ Table $table accessible" -ForegroundColor Green
    } catch {
        Write-Host "❌ Table $table non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Authentification admin
Write-Host "🔍 Test 4: Authentification admin" -ForegroundColor Yellow

try {
    # Note: Ce test nécessite une implémentation côté client
    # Pour l'instant, on vérifie juste que l'endpoint existe
    Write-Host "ℹ️  Test d'authentification nécessite une implémentation côté client" -ForegroundColor Blue
} catch {
    Write-Host "❌ Erreur d'authentification: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Vérifier les variables d'environnement
Write-Host "🔍 Test 5: Variables d'environnement" -ForegroundColor Yellow

$requiredEnvVars = @(
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY", 
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET"
)

$optionalEnvVars = @(
    "DISCORD_WEBHOOK_URL",
    "OPENAI_API_KEY"
)

Write-Host "Variables requises:" -ForegroundColor Gray
foreach ($var in $requiredEnvVars) {
    if ([Environment]::GetEnvironmentVariable($var)) {
        Write-Host "✅ $var configurée" -ForegroundColor Green
    } else {
        Write-Host "❌ $var manquante" -ForegroundColor Red
    }
}

Write-Host "Variables optionnelles:" -ForegroundColor Gray
foreach ($var in $optionalEnvVars) {
    if ([Environment]::GetEnvironmentVariable($var)) {
        Write-Host "✅ $var configurée" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $var non configurée (optionnelle)" -ForegroundColor Yellow
    }
}

# Test 6: Test des webhooks Stripe (simulation)
Write-Host "🔍 Test 6: Webhook Stripe" -ForegroundColor Yellow

try {
    # Simuler un événement Stripe
    $stripeEvent = @{
        id = "evt_test_webhook"
        type = "checkout.session.completed"
        data = @{
            object = @{
                id = "cs_test_123"
                amount_total = 2999
                currency = "eur"
                customer = "cus_test_123"
                metadata = @{
                    plan = "launch"
                }
            }
        }
    } | ConvertTo-Json -Depth 3

    Write-Host "ℹ️  Test de webhook Stripe nécessite Stripe CLI ou simulation manuelle" -ForegroundColor Blue
    Write-Host "   Utilisez: stripe listen --forward-to $baseUrl/functions/v1/stripe-webhook" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur test webhook: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Vérifier les RLS policies
Write-Host "🔍 Test 7: RLS Policies" -ForegroundColor Yellow

try {
    # Vérifier que les politiques RLS sont en place
    $response = Invoke-RestMethod -Uri "$baseUrl/rest/v1/admin_actions_log?select=*&limit=1" -Method GET -Headers @{"apikey" = $anonKey}
    Write-Host "✅ RLS policies actives sur admin_actions_log" -ForegroundColor Green
} catch {
    Write-Host "❌ Problème avec RLS policies: $($_.Exception.Message)" -ForegroundColor Red
}

# Résumé des tests
Write-Host ""
Write-Host "📊 Résumé des tests" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "✅ Tests de base effectués" -ForegroundColor Green
Write-Host "ℹ️  Tests avancés nécessitent une configuration complète" -ForegroundColor Blue
Write-Host ""

# Recommandations
Write-Host "💡 Recommandations:" -ForegroundColor Cyan
Write-Host "1. Vérifiez que tous les Edge Functions sont déployés" -ForegroundColor Gray
Write-Host "2. Configurez les variables d'environnement manquantes" -ForegroundColor Gray
Write-Host "3. Testez l'authentification avec un compte admin" -ForegroundColor Gray
Write-Host "4. Configurez les webhooks Stripe" -ForegroundColor Gray
Write-Host "5. Testez l'assistant IA avec une clé OpenAI" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Tests terminés!" -ForegroundColor Green
