# Script de test pour vérifier les corrections API
# Teste les requêtes qui causaient des erreurs 400 et 406

Write-Host "🧪 Test des Corrections API - FiverFlow 2.0" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Tests à effectuer manuellement:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. 🔍 Test de la requête orders (Erreur 400):" -ForegroundColor Green
Write-Host "   - Ouvrir la console du navigateur (F12)"
Write-Host "   - Recharger la page"
Write-Host "   - Vérifier qu'il n'y a plus d'erreur 400 pour orders"
Write-Host "   - URL testée: orders?select=id%2Ctitle%2Camount%2Cstatus%2Cdeadline%2Ccreated_at%2Cclient_name%2Cplatform"
Write-Host ""

Write-Host "2. 🔍 Test de la requête users (Erreur 406):" -ForegroundColor Green
Write-Host "   - Vérifier qu'il n'y a plus d'erreur 406 pour users"
Write-Host "   - URL testée: users?select=name%2Crole%2Ccreated_at"
Write-Host ""

Write-Host "3. 🔍 Test de l'authentification Stripe:" -ForegroundColor Green
Write-Host "   - Aller sur la page /upgrade"
Write-Host "   - Cliquer sur 'Choose Boost' ou 'Choose Scale'"
Write-Host "   - Vérifier qu'il n'y a plus d'erreur 'Supabase non configuré'"
Write-Host ""

Write-Host "4. 🔍 Test des requêtes invoices:" -ForegroundColor Green
Write-Host "   - Aller sur la page des factures"
Write-Host "   - Vérifier que les factures se chargent sans erreur 400"
Write-Host ""

Write-Host "📊 Résultats attendus:" -ForegroundColor Cyan
Write-Host "✅ Aucune erreur 400 dans les requêtes orders"
Write-Host "✅ Aucune erreur 406 dans les requêtes users"
Write-Host "✅ Authentification Stripe fonctionnelle"
Write-Host "✅ Chargement des données sans erreur"
Write-Host ""

Write-Host "🔧 Corrections appliquées:" -ForegroundColor Magenta
Write-Host "1. usePreloadData.ts - Requête orders corrigée"
Write-Host "2. usePreloadData.ts - Requête users → user_profiles"
Write-Host "3. SubscriptionButton.tsx - Import supabase direct"
Write-Host "4. useInvoices.ts - Requête clients!inner supprimée"
Write-Host "5. Migration SQL - Colonnes orders ajoutées"
Write-Host ""

Write-Host "⚠️  Si les erreurs persistent:" -ForegroundColor Red
Write-Host "1. Vérifier que la migration 20250130000025_fix_orders_columns.sql est appliquée"
Write-Host "2. Vérifier que les colonnes client_name et platform existent dans orders"
Write-Host "3. Vérifier que la table user_profiles existe"
Write-Host "4. Vérifier les variables d'environnement Supabase"
Write-Host ""

Write-Host "🎯 Commandes de vérification:" -ForegroundColor Blue
Write-Host ""

Write-Host "# Vérifier les colonnes de la table orders:"
Write-Host "SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';"
Write-Host ""

Write-Host "# Vérifier que user_profiles existe:"
Write-Host "SELECT table_name FROM information_schema.tables WHERE table_name = 'user_profiles';"
Write-Host ""

Write-Host "✨ Tests terminés! Vérifiez la console du navigateur pour les résultats." -ForegroundColor Green
