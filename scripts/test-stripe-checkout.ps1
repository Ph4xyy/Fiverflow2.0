# Script de test pour l'Edge Function stripe-checkout
# Teste la fonction après création des tables Stripe

Write-Host "🧪 Test de l'Edge Function Stripe Checkout" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Prérequis:" -ForegroundColor Yellow
Write-Host "1. ✅ Tables Stripe créées (migration 20250130000026)"
Write-Host "2. ✅ Variables d'environnement configurées"
Write-Host "3. ✅ Edge Function déployée"
Write-Host ""

Write-Host "🔧 Variables d'environnement requises:" -ForegroundColor Green
Write-Host "   SUPABASE_URL=https://arnuyyyryvbfcvqauqur.supabase.co"
Write-Host "   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Write-Host "   STRIPE_SECRET_KEY=sk_live_..."
Write-Host "   STRIPE_WEBHOOK_SECRET=whsec_..."
Write-Host ""

Write-Host "🧪 Tests à effectuer:" -ForegroundColor Blue
Write-Host ""

Write-Host "1. 🔍 Test de l'authentification:" -ForegroundColor Green
Write-Host "   - Aller sur /upgrade"
Write-Host "   - Cliquer sur 'Choose Boost' ou 'Choose Scale'"
Write-Host "   - Vérifier qu'il n'y a plus d'erreur 500"
Write-Host "   - Vérifier qu'il n'y a plus d'erreur 'Failed to fetch customer information'"
Write-Host ""

Write-Host "2. 🔍 Test de la création de client Stripe:" -ForegroundColor Green
Write-Host "   - Premier paiement: doit créer un client Stripe"
Write-Host "   - Vérifier dans la table stripe_customers"
Write-Host ""

Write-Host "3. 🔍 Test de la session de checkout:" -ForegroundColor Green
Write-Host "   - Doit rediriger vers Stripe Checkout"
Write-Host "   - URL doit commencer par https://checkout.stripe.com"
Write-Host ""

Write-Host "4. 🔍 Test des logs Edge Function:" -ForegroundColor Green
Write-Host "   - Vérifier les logs dans Supabase Dashboard > Edge Functions"
Write-Host "   - Pas d'erreurs dans les logs"
Write-Host ""

Write-Host "📊 Résultats attendus:" -ForegroundColor Cyan
Write-Host "✅ Pas d'erreur 500 dans stripe-checkout"
Write-Host "✅ Pas d'erreur 'Failed to fetch customer information'"
Write-Host "✅ Redirection vers Stripe Checkout"
Write-Host "✅ Client Stripe créé dans la base de données"
Write-Host ""

Write-Host "🔧 Commandes de vérification SQL:" -ForegroundColor Magenta
Write-Host ""

Write-Host "# Vérifier que les tables Stripe existent:"
Write-Host "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'stripe_%';"
Write-Host ""

Write-Host "# Vérifier les clients Stripe:"
Write-Host "SELECT * FROM stripe_customers LIMIT 5;"
Write-Host ""

Write-Host "# Vérifier les abonnements:"
Write-Host "SELECT * FROM stripe_subscriptions LIMIT 5;"
Write-Host ""

Write-Host "🚨 Si les erreurs persistent:" -ForegroundColor Red
Write-Host "1. Vérifier que la migration 20250130000026 est appliquée"
Write-Host "2. Vérifier les variables d'environnement dans Supabase Dashboard"
Write-Host "3. Redéployer l'Edge Function stripe-checkout"
Write-Host "4. Vérifier les logs de l'Edge Function"
Write-Host ""

Write-Host "🎯 URL de test:" -ForegroundColor Blue
Write-Host "https://arnuyyyryvbfcvqauqur.supabase.co/functions/v1/stripe-checkout"
Write-Host ""

Write-Host "✨ Test terminé! Vérifiez la console du navigateur et les logs Supabase." -ForegroundColor Green
