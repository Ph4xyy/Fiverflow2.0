# 🎯 Guide du Système d'Abonnements et de Rôles

## 📋 Vue d'ensemble

Le système d'abonnements et de rôles de FiverFlow 2.0 est maintenant complètement opérationnel ! Voici comment l'utiliser.

## 🗄️ Structure de la Base de Données

### **Tables Principales**

#### 1. **subscription_plans** - Plans d'abonnement
- `id` - Identifiant unique
- `name` - Nom technique ('free', 'launch', 'boost', 'scale')
- `display_name` - Nom affiché ('Free', 'Launch', 'Boost', 'Scale')
- `price_monthly` / `price_yearly` - Prix mensuel/annuel
- `max_projects` / `max_clients` / `max_storage_gb` / `max_team_members` - Limites
- `features` - Fonctionnalités incluses (JSON)

#### 2. **user_subscriptions** - Abonnements utilisateurs
- `user_id` - Référence vers auth.users
- `plan_id` - Référence vers subscription_plans
- `status` - Statut ('active', 'cancelled', 'expired', 'pending')
- `billing_cycle` - Cycle de facturation ('monthly', 'yearly')
- `amount` / `currency` - Montant et devise
- `start_date` / `end_date` - Dates de début/fin

#### 3. **system_roles** - Rôles système
- `name` - Nom technique ('user', 'admin', 'moderator', 'support')
- `display_name` - Nom affiché
- `permissions` - Permissions (JSON)

#### 4. **user_roles** - Rôles utilisateurs
- `user_id` - Référence vers auth.users
- `role_id` - Référence vers system_roles
- `assigned_by` - Qui a assigné le rôle
- `assigned_at` / `expires_at` - Dates d'assignation/expiration

## 🚀 Fonctions Utilitaires

### **Récupération de Données**

```sql
-- Obtenir l'abonnement actuel d'un utilisateur
SELECT * FROM get_user_current_subscription('user-uuid');

-- Obtenir les rôles d'un utilisateur
SELECT * FROM get_user_roles('user-uuid');

-- Vérifier si un utilisateur a une permission
SELECT user_has_permission('user-uuid', 'manage_all_users');

-- Obtenir les statistiques d'abonnement
SELECT * FROM get_subscription_stats();
```

### **Gestion des Abonnements**

```sql
-- Changer l'abonnement d'un utilisateur
SELECT change_user_subscription('user-uuid', 'launch', 'monthly');

-- Changer le rôle d'un utilisateur
SELECT change_user_role('user-uuid', 'admin', 'admin-uuid');
```

### **Fonctions d'Administration**

```sql
-- Promouvoir un utilisateur en admin
SELECT promote_user_to_admin('user-uuid', 'admin-uuid');

-- Rétrograder un admin en utilisateur
SELECT demote_admin_to_user('user-uuid', 'admin-uuid');
```

## 📊 Plans d'Abonnement Disponibles

### **🆓 Free**
- **Prix** : 0€/mois
- **Limites** : 1 projet, 5 clients, 1GB stockage, 1 membre équipe
- **Fonctionnalités** : Support basique, Templates standards

### **🚀 Launch**
- **Prix** : 29€/mois (290€/an)
- **Limites** : 5 projets, 25 clients, 10GB stockage, 1 membre équipe
- **Fonctionnalités** : Support prioritaire, Templates premium, Analytics, Branding personnalisé

### **⚡ Boost**
- **Prix** : 79€/mois (790€/an)
- **Limites** : 15 projets, 100 clients, 50GB stockage, 5 membres équipe
- **Fonctionnalités** : Tout de Launch + Collaboration équipe, Automatisation avancée

### **📈 Scale**
- **Prix** : 199€/mois (1990€/an)
- **Limites** : 50 projets, 500 clients, 200GB stockage, 20 membres équipe
- **Fonctionnalités** : Tout de Boost + Support dédié, API, White label

## 👥 Rôles Système

### **👤 User**
- **Permissions** : `view_dashboard`, `manage_own_projects`, `manage_own_clients`
- **Description** : Utilisateur standard

### **🛡️ Admin**
- **Permissions** : Toutes les permissions + `manage_all_users`, `view_analytics`, `manage_system_settings`
- **Description** : Administrateur avec accès complet

### **🔧 Moderator**
- **Permissions** : Permissions utilisateur + `moderate_content`, `view_user_analytics`
- **Description** : Modérateur avec permissions limitées

### **🎧 Support**
- **Permissions** : `view_dashboard`, `view_user_issues`, `manage_support_tickets`, `view_user_analytics`
- **Description** : Équipe de support client

## 🔄 Automatisation

### **Inscription Automatique**
Lors de l'inscription d'un nouvel utilisateur :
1. ✅ Profil créé dans `user_profiles`
2. ✅ Abonnement gratuit assigné
3. ✅ Rôle "user" assigné
4. ✅ Toutes les relations créées automatiquement

### **Gestion des Permissions**
- Les permissions sont vérifiées via `user_has_permission()`
- Les rôles peuvent expirer automatiquement
- Les abonnements peuvent être suspendus/annulés

## 🧪 Tests

### **Script de Test**
```bash
# Exécuter le script de test
psql -h your-db-host -U postgres -d postgres -f scripts/test-subscription-system.sql
```

### **Vérifications Manuelles**
1. **Vérifier les plans** : `SELECT * FROM subscription_plans;`
2. **Vérifier les rôles** : `SELECT * FROM system_roles;`
3. **Vérifier les abonnements** : `SELECT * FROM user_subscriptions;`
4. **Vérifier les rôles utilisateurs** : `SELECT * FROM user_roles;`

## 🎯 Prochaines Étapes

### **Intégration Frontend**
1. **Hook personnalisé** pour récupérer l'abonnement actuel
2. **Composant de gestion** des abonnements
3. **Interface d'administration** pour gérer les rôles
4. **Système de permissions** dans les composants

### **Fonctionnalités Avancées**
1. **Facturation automatique** avec Stripe
2. **Notifications** d'expiration d'abonnement
3. **Analytics** détaillées par plan
4. **API** pour intégrations tierces

## 🚨 Points d'Attention

### **Sécurité**
- ✅ RLS activé sur toutes les tables
- ✅ Fonctions avec `SECURITY DEFINER`
- ✅ Permissions granulaires

### **Performance**
- ✅ Index sur les colonnes fréquemment utilisées
- ✅ Requêtes optimisées
- ✅ Cache possible pour les permissions

### **Maintenance**
- ✅ Triggers automatiques
- ✅ Fonctions utilitaires
- ✅ Scripts de test

---

**🎉 Le système est prêt à être utilisé ! Tous les utilisateurs existants ont été automatiquement configurés avec un abonnement gratuit et le rôle utilisateur.**
