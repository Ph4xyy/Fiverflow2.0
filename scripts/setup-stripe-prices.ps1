# Script pour configurer les prix Stripe
# Ce script doit être exécuté après avoir créé les produits dans le dashboard Stripe

Write-Host "🔧 Configuration des Prix Stripe pour FiverFlow 2.0" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Instructions pour configurer les prix dans Stripe Dashboard:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. 🚀 Plan Boost (24€/mois, 240€/an):" -ForegroundColor Green
Write-Host "   - Créer un produit 'Boost' dans Stripe Dashboard"
Write-Host "   - Prix mensuel: 24.00 EUR"
Write-Host "   - Prix annuel: 240.00 EUR"
Write-Host "   - Récupérer les price_id et les mettre dans le code"
Write-Host ""

Write-Host "2. 📈 Plan Scale (59€/mois, 590€/an):" -ForegroundColor Green
Write-Host "   - Créer un produit 'Scale' dans Stripe Dashboard"
Write-Host "   - Prix mensuel: 59.00 EUR"
Write-Host "   - Prix annuel: 590.00 EUR"
Write-Host "   - Récupérer les price_id et les mettre dans le code"
Write-Host ""

Write-Host "3. 🔧 Configuration des Webhooks:" -ForegroundColor Blue
Write-Host "   - Endpoint: https://your-project.supabase.co/functions/v1/stripe-webhook"
Write-Host "   - Événements requis:"
Write-Host "     * checkout.session.completed"
Write-Host "     * customer.subscription.created"
Write-Host "     * customer.subscription.updated"
Write-Host "     * customer.subscription.deleted"
Write-Host "     * invoice.payment_succeeded"
Write-Host "     * invoice.payment_failed"
Write-Host ""

Write-Host "4. 📝 Mise à jour du code:" -ForegroundColor Magenta
Write-Host "   - Remplacer les price_id dans src/stripe-config.ts"
Write-Host "   - Mettre à jour les price_id dans PagePricing.tsx"
Write-Host "   - Vérifier la configuration des Edge Functions"
Write-Host ""

Write-Host "✅ Une fois les prix configurés dans Stripe Dashboard:" -ForegroundColor Green
Write-Host "   - Les utilisateurs pourront s'abonner via la page /upgrade"
Write-Host "   - Les paiements seront traités automatiquement"
Write-Host "   - Les webhooks mettront à jour la base de données"
Write-Host ""

Write-Host "🔗 Liens utiles:" -ForegroundColor Cyan
Write-Host "   - Stripe Dashboard: https://dashboard.stripe.com/products"
Write-Host "   - Documentation: https://stripe.com/docs/api/prices"
Write-Host "   - Webhooks: https://dashboard.stripe.com/webhooks"
Write-Host ""

Write-Host "⚠️  IMPORTANT: N'oubliez pas de mettre à jour les price_id dans le code après création!" -ForegroundColor Red
Write-Host ""

# Vérifier si les variables d'environnement sont configurées
Write-Host "🔍 Vérification de la configuration..." -ForegroundColor Yellow

if ($env:STRIPE_SECRET_KEY) {
    Write-Host "✅ STRIPE_SECRET_KEY configuré" -ForegroundColor Green
} else {
    Write-Host "❌ STRIPE_SECRET_KEY manquant" -ForegroundColor Red
}

if ($env:STRIPE_WEBHOOK_SECRET) {
    Write-Host "✅ STRIPE_WEBHOOK_SECRET configuré" -ForegroundColor Green
} else {
    Write-Host "❌ STRIPE_WEBHOOK_SECRET manquant" -ForegroundColor Red
}

if ($env:VITE_STRIPE_PUBLISHABLE_KEY) {
    Write-Host "✅ VITE_STRIPE_PUBLISHABLE_KEY configuré" -ForegroundColor Green
} else {
    Write-Host "❌ VITE_STRIPE_PUBLISHABLE_KEY manquant" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Créer les produits dans Stripe Dashboard"
Write-Host "2. Récupérer les price_id"
Write-Host "3. Mettre à jour le code avec les vrais price_id"
Write-Host "4. Tester le flux de paiement"
Write-Host ""

Write-Host "✨ Configuration terminée! Bon développement! 🚀" -ForegroundColor Green
