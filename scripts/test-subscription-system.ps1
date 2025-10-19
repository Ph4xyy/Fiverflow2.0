# Script PowerShell pour tester le systeme d'abonnements et de roles

Write-Host "Test du Systeme d'Abonnements et de Roles" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`nPlans d'abonnement disponibles:" -ForegroundColor Yellow
Write-Host "- Free: 0 EUR/mois (1 projet, 5 clients, 1GB)" -ForegroundColor White
Write-Host "- Launch: 29 EUR/mois (5 projets, 25 clients, 10GB)" -ForegroundColor White
Write-Host "- Boost: 79 EUR/mois (15 projets, 100 clients, 50GB)" -ForegroundColor White
Write-Host "- Scale: 199 EUR/mois (50 projets, 500 clients, 200GB)" -ForegroundColor White

Write-Host "`nRoles systeme disponibles:" -ForegroundColor Yellow
Write-Host "- User: Utilisateur standard" -ForegroundColor White
Write-Host "- Admin: Administrateur avec acces complet" -ForegroundColor White
Write-Host "- Moderator: Moderateur avec permissions limitees" -ForegroundColor White
Write-Host "- Support: Equipe de support client" -ForegroundColor White

Write-Host "`nFonctions utilitaires creees:" -ForegroundColor Yellow
Write-Host "- get_user_current_subscription()" -ForegroundColor White
Write-Host "- get_user_roles()" -ForegroundColor White
Write-Host "- user_has_permission()" -ForegroundColor White
Write-Host "- change_user_subscription()" -ForegroundColor White
Write-Host "- change_user_role()" -ForegroundColor White
Write-Host "- get_subscription_stats()" -ForegroundColor White

Write-Host "`nAutomatisation:" -ForegroundColor Yellow
Write-Host "- Inscription automatique avec abonnement gratuit" -ForegroundColor White
Write-Host "- Attribution automatique du role utilisateur" -ForegroundColor White
Write-Host "- Triggers pour maintenir la coherence des donnees" -ForegroundColor White

Write-Host "`nLe systeme est pret a etre utilise !" -ForegroundColor Green
Write-Host "Pour tester, connectez-vous a votre base de donnees Supabase" -ForegroundColor White
Write-Host "et executez le fichier: scripts/test-subscription-system.sql" -ForegroundColor White