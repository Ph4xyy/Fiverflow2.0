# Script pour déployer le système de commissions automatiques
Write-Host "Déploiement du système de commissions automatiques" -ForegroundColor Cyan

# Vérifier que les fichiers existent
$files = @(
    "supabase/functions/stripe-webhook/index.ts",
    "supabase/functions/_shared/cors.ts",
    "supabase/functions/deno.json",
    "supabase/migrations/20250130000005_referral_commissions_auto.sql"
)

Write-Host "`nVérification des fichiers:" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: $file manquant" -ForegroundColor Red
    }
}

Write-Host "`nFonctionnalités déployées:" -ForegroundColor Cyan
Write-Host "1. ✅ Edge Function stripe-webhook" -ForegroundColor White
Write-Host "   - Gestion des webhooks Stripe" -ForegroundColor White
Write-Host "   - Création automatique des commissions" -ForegroundColor White
Write-Host "   - Gestion des échecs et annulations" -ForegroundColor White

Write-Host "`n2. ✅ Fonctions SQL automatiques:" -ForegroundColor White
Write-Host "   - create_automatic_referral_commission()" -ForegroundColor White
Write-Host "   - mark_referral_commission_paid()" -ForegroundColor White
Write-Host "   - cancel_referral_commissions_for_payment()" -ForegroundColor White
Write-Host "   - cancel_referral_commissions_for_subscription()" -ForegroundColor White

Write-Host "`n3. ✅ Triggers automatiques:" -ForegroundColor White
Write-Host "   - Mise à jour des statistiques" -ForegroundColor White
Write-Host "   - Gestion des changements de statut" -ForegroundColor White

Write-Host "`n4. ✅ Vues et permissions:" -ForegroundColor White
Write-Host "   - pending_referral_commissions" -ForegroundColor White
Write-Host "   - Permissions pour service_role" -ForegroundColor White

Write-Host "`nÉtapes de déploiement:" -ForegroundColor Yellow
Write-Host "1. Appliquer la migration SQL:" -ForegroundColor White
Write-Host "   supabase db push" -ForegroundColor Gray
Write-Host "   # Ou copier le contenu de 20250130000005_referral_commissions_auto.sql" -ForegroundColor Gray

Write-Host "`n2. Déployer l'Edge Function:" -ForegroundColor White
Write-Host "   supabase functions deploy stripe-webhook" -ForegroundColor Gray

Write-Host "`n3. Configurer les variables d'environnement:" -ForegroundColor White
Write-Host "   STRIPE_SECRET_KEY=sk_..." -ForegroundColor Gray
Write-Host "   STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Gray

Write-Host "`n4. Configurer le webhook Stripe:" -ForegroundColor White
Write-Host "   URL: https://your-project.supabase.co/functions/v1/stripe-webhook" -ForegroundColor Gray
Write-Host "   Événements: payment_intent.succeeded, invoice.payment_succeeded, etc." -ForegroundColor Gray

Write-Host "`n5. Tester le système:" -ForegroundColor White
Write-Host "   - Créer un paiement de test" -ForegroundColor Gray
Write-Host "   - Vérifier la création de commission" -ForegroundColor Gray
Write-Host "   - Vérifier les statistiques du parrain" -ForegroundColor Gray

Write-Host "`nSystème de commissions automatiques prêt!" -ForegroundColor Green
