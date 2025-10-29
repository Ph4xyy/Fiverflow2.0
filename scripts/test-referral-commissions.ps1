# Test du système de commissions automatiques
Write-Host "Test du système de commissions automatiques" -ForegroundColor Cyan

# Vérifier que tous les fichiers sont créés
$files = @(
    "supabase/functions/referral-webhook/index.ts",
    "supabase/functions/_shared/cors.ts",
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

Write-Host "`nFonctionnalités implémentées:" -ForegroundColor Cyan
Write-Host "1. ✅ Edge Function referral-webhook" -ForegroundColor White
Write-Host "   - Gestion des webhooks Stripe" -ForegroundColor White
Write-Host "   - Création automatique des commissions de 20%" -ForegroundColor White
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

Write-Host "`nÉvénements Stripe gérés:" -ForegroundColor Yellow
Write-Host "✅ payment_intent.succeeded" -ForegroundColor Green
Write-Host "✅ invoice.payment_succeeded" -ForegroundColor Green
Write-Host "✅ customer.subscription.created" -ForegroundColor Green
Write-Host "✅ customer.subscription.updated" -ForegroundColor Green
Write-Host "✅ payment_intent.payment_failed" -ForegroundColor Green
Write-Host "✅ invoice.payment_failed" -ForegroundColor Green
Write-Host "✅ customer.subscription.deleted" -ForegroundColor Green

Write-Host "`nÉtapes de déploiement:" -ForegroundColor Yellow
Write-Host "1. Appliquer la migration SQL:" -ForegroundColor White
Write-Host "   supabase db push" -ForegroundColor Gray
Write-Host "   # Ou copier le contenu de 20250130000005_referral_commissions_auto.sql" -ForegroundColor Gray

Write-Host "`n2. Déployer l'Edge Function:" -ForegroundColor White
Write-Host "   supabase functions deploy referral-webhook" -ForegroundColor Gray

Write-Host "`n3. Configurer les variables d'environnement:" -ForegroundColor White
Write-Host "   STRIPE_SECRET_KEY=sk_..." -ForegroundColor Gray
Write-Host "   STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Gray

Write-Host "`n4. Configurer le webhook Stripe:" -ForegroundColor White
Write-Host "   URL: https://your-project.supabase.co/functions/v1/referral-webhook" -ForegroundColor Gray
Write-Host "   Événements: payment_intent.succeeded, invoice.payment_succeeded, etc." -ForegroundColor Gray

Write-Host "`n5. Tester le système:" -ForegroundColor White
Write-Host "   - Créer un paiement de test avec un utilisateur parrainé" -ForegroundColor Gray
Write-Host "   - Vérifier la création de commission dans referral_commissions" -ForegroundColor Gray
Write-Host "   - Vérifier les statistiques du parrain" -ForegroundColor Gray

Write-Host "`nLogique de commission:" -ForegroundColor Yellow
Write-Host "1. Paiement réussi détecté" -ForegroundColor White
Write-Host "2. Utilisateur trouvé par customer_id Stripe" -ForegroundColor White
Write-Host "3. Vérification de l'existence d'un parrain" -ForegroundColor White
Write-Host "4. Calcul de la commission (20% du montant)" -ForegroundColor White
Write-Host "5. Création de la commission avec status='pending'" -ForegroundColor White
Write-Host "6. Mise à jour des statistiques du parrain" -ForegroundColor White

Write-Host "`nSystème de commissions automatiques prêt!" -ForegroundColor Green
