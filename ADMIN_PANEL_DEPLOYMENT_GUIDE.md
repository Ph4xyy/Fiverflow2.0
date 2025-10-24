# Guide de Déploiement - Admin Panel Complet

Ce guide détaille les étapes pour déployer le système d'administration complet de FiverFlow2.0.

## 📋 Prérequis

- Projet FiverFlow2.0 existant avec Supabase configuré
- Compte Stripe configuré
- Webhook Discord (optionnel)
- Clé API OpenAI (pour l'assistant IA)

## 🗄️ 1. Migrations SQL

### Exécuter la migration principale

```bash
# Dans le dossier supabase
supabase db push
```

Ou via l'interface Supabase :
1. Aller dans l'onglet "SQL Editor"
2. Exécuter le contenu de `supabase/migrations/20250130000031_admin_panel_complete.sql`

### Vérifier les tables créées

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_actions_log', 'transactions');
```

## 🔧 2. Variables d'Environnement

### Variables Supabase

Ajouter dans votre fichier `.env` :

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_live_51S9va4KF06h9za4cKywl3Ule05sL2RoRClpMZbTwOODdaaLHoB2CTTl5Yr0kFsPCYSVPGdOuB5mtmVpVG8MFmbaq00scipmxm9your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_PlDrfBkstM4jVHGjQl06KpBjJG2wtE8I

# Discord (optionnel)
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1431331850198057069/iZACKTKLqL7tzP_eNmnu845Gk4DAKf_UNlAZQgWLzaLQPz_MBvJZQ6PY1-vZ1SlcivQD

# OpenAI (pour l'assistant IA)
OPENAI_API_KEY=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
```

### Variables Edge Functions

Dans le dashboard Supabase, aller dans "Edge Functions" et ajouter :

```env
# Dans chaque Edge Function
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
DISCORD_WEBHOOK_URL=your_discord_webhook_url
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 3. Déploiement des Edge Functions

### Déployer les fonctions

```bash
# Déployer toutes les fonctions admin
supabase functions deploy admin-users
supabase functions deploy admin-stats
supabase functions deploy admin-ai
supabase functions deploy stripe-webhook
```

### Vérifier le déploiement

```bash
# Lister les fonctions déployées
supabase functions list
```

## 🔐 4. Configuration des Rôles

### Créer un utilisateur admin

```sql
-- Mettre à jour le rôle d'un utilisateur existant
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = 'user_id_here';

-- Ou créer un profil admin pour un nouvel utilisateur
INSERT INTO user_profiles (user_id, username, display_name, role)
VALUES ('new_user_id', 'admin', 'Administrator', 'admin');
```

### Vérifier les permissions

```sql
-- Vérifier les rôles des utilisateurs
SELECT user_id, username, role FROM user_profiles 
WHERE role IN ('admin', 'moderator');
```

## 🔗 5. Configuration Stripe Webhooks

### Créer le webhook dans Stripe Dashboard

1. Aller dans Stripe Dashboard > Webhooks
2. Cliquer "Add endpoint"
3. URL : `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `charge.refunded`

### Tester le webhook

```bash
# Utiliser Stripe CLI pour tester
stripe listen --forward-to https://arnuyyyryvbfcvqauqur.supabase.co/functions/v1/stripe-webhook
```

## 📊 6. Configuration Discord (Optionnel)

### Créer un webhook Discord

1. Aller dans votre serveur Discord
2. Paramètres du canal > Intégrations > Webhooks
3. Créer un nouveau webhook
4. Copier l'URL du webhook

### Tester les notifications

```javascript
// Test simple de notification Discord
const { getDiscordNotifier } = require('./src/utils/discord');

const notifier = getDiscordNotifier();
if (notifier) {
  notifier.notifyNewPayment({
    amount: 29.99,
    currency: 'EUR',
    plan: 'launch',
    customerEmail: 'test@example.com'
  });
}
```

## 🤖 7. Configuration OpenAI

### Obtenir une clé API

1. Aller sur https://platform.openai.com/
2. Créer un compte ou se connecter
3. Aller dans API Keys
4. Créer une nouvelle clé API

### Tester l'assistant IA

```bash
# Tester l'endpoint IA
curl -X POST https://your-project.supabase.co/functions/v1/admin-ai \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Analyse les revenus du dernier mois"}'
```

## 🧪 8. Tests de Fonctionnement

### Test 1: Accès Admin

1. Se connecter avec un compte admin
2. Aller sur `/admin/dashboard`
3. Vérifier que la navigation admin s'affiche
4. Tester les différentes pages admin

### Test 2: Gestion des Utilisateurs

1. Aller sur `/admin/users`
2. Vérifier la liste des utilisateurs
3. Tester les filtres et la recherche
4. Essayer de changer un rôle (si admin)

### Test 3: Statistiques

1. Aller sur `/admin/stats`
2. Vérifier l'affichage des graphiques
3. Tester les filtres de date
4. Vérifier les KPIs

### Test 4: Assistant IA

1. Aller sur `/admin/ai`
2. Poser une question simple
3. Vérifier la réponse de l'IA
4. Tester les questions prédéfinies

### Test 5: Webhook Stripe

```bash
# Simuler un événement Stripe
stripe trigger checkout.session.completed
```

## 🔍 9. Vérifications Post-Déploiement

### Vérifier les tables

```sql
-- Vérifier les données dans admin_actions_log
SELECT * FROM admin_actions_log ORDER BY created_at DESC LIMIT 10;

-- Vérifier les transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

-- Vérifier les profils utilisateurs
SELECT user_id, role, subscription_plan FROM user_profiles 
WHERE role IN ('admin', 'moderator');
```

### Vérifier les Edge Functions

```bash
# Tester chaque fonction
curl -X GET https://your-project.supabase.co/functions/v1/admin-users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X GET https://your-project.supabase.co/functions/v1/admin-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 10. Sécurité et Bonnes Pratiques

### RLS (Row Level Security)

Vérifier que les politiques RLS sont actives :

```sql
-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('admin_actions_log', 'transactions');
```

### Logs d'Audit

```sql
-- Vérifier les logs d'audit
SELECT 
  aal.action_type,
  aal.created_at,
  up1.username as admin_user,
  up2.username as target_user
FROM admin_actions_log aal
LEFT JOIN user_profiles up1 ON aal.admin_user_id = up1.user_id
LEFT JOIN user_profiles up2 ON aal.target_user_id = up2.user_id
ORDER BY aal.created_at DESC;
```

## 📈 11. Monitoring et Maintenance

### Surveillance des Erreurs

- Vérifier les logs Supabase Edge Functions
- Monitorer les webhooks Stripe
- Surveiller les notifications Discord

### Sauvegarde

```sql
-- Exporter les données critiques
COPY admin_actions_log TO '/tmp/admin_actions_log.csv' WITH CSV HEADER;
COPY transactions TO '/tmp/transactions.csv' WITH CSV HEADER;
```

## 🆘 12. Dépannage

### Problèmes Courants

1. **Erreur 403 sur les routes admin**
   - Vérifier que l'utilisateur a le rôle `admin` ou `moderator`
   - Vérifier la configuration RLS

2. **Edge Functions ne répondent pas**
   - Vérifier les variables d'environnement
   - Vérifier les logs dans Supabase Dashboard

3. **Webhook Stripe ne fonctionne pas**
   - Vérifier l'URL du webhook
   - Vérifier la signature du webhook
   - Tester avec Stripe CLI

4. **Assistant IA ne répond pas**
   - Vérifier la clé API OpenAI
   - Vérifier les quotas OpenAI

### Logs Utiles

```bash
# Logs Supabase
supabase functions logs admin-users
supabase functions logs stripe-webhook

# Logs Stripe
stripe logs tail
```

## ✅ Checklist de Déploiement

- [ ] Migration SQL exécutée
- [ ] Variables d'environnement configurées
- [ ] Edge Functions déployées
- [ ] Utilisateur admin créé
- [ ] Webhook Stripe configuré
- [ ] Webhook Discord configuré (optionnel)
- [ ] Clé OpenAI configurée
- [ ] Tests de fonctionnement effectués
- [ ] RLS vérifié
- [ ] Monitoring en place

## 📞 Support

En cas de problème :

1. Vérifier les logs Supabase
2. Tester les endpoints individuellement
3. Vérifier la configuration des variables d'environnement
4. Consulter la documentation Supabase et Stripe

---

**Note** : Ce guide assume que vous avez déjà un projet FiverFlow2.0 fonctionnel avec Supabase configuré. Si ce n'est pas le cas, commencez par configurer l'environnement de base.
