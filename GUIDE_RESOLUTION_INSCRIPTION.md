# 🔧 Guide de Résolution - Problème d'Inscription FiverFlow

## 🚨 Problème Identifié

**Erreur lors de l'inscription** causée par des **conflits de triggers** dans la base de données Supabase.

### 📋 Causes Identifiées

1. **Conflit de Triggers** : Plusieurs triggers `on_auth_user_created` existent simultanément
2. **Fonctions Incompatibles** : `create_user_profile()` et `handle_new_user()` entrent en conflit
3. **Données Manquantes** : Les tables `subscription_plans` et `system_roles` peuvent être vides
4. **Gestion d'Erreur Insuffisante** : Les triggers échouent sans fallback

## ✅ Solution Implémentée

### 🗄️ Migration de Correction

**Fichier** : `supabase/migrations/20250130000020_step20_fix_signup_trigger_conflict.sql`

**Actions** :
- ✅ Suppression de tous les triggers conflictuels
- ✅ Création d'une fonction unifiée `handle_new_user()`
- ✅ Gestion d'erreur robuste avec fallbacks
- ✅ Vérification automatique des données requises

### 🔧 Fonction Unifiée

La nouvelle fonction `handle_new_user()` :

1. **Récupère les données nécessaires** :
   - Plan d'abonnement (`launch` ou `free`)
   - Rôle utilisateur (`user`)

2. **Crée le profil utilisateur** avec gestion d'erreur

3. **Crée l'abonnement** si le plan existe

4. **Crée le rôle utilisateur** si le rôle existe

5. **Fallback minimal** si tout échoue

## 🚀 Instructions de Déploiement

### Étape 1: Appliquer la Migration

```bash
# Dans le dossier du projet
supabase db push
```

Ou via le dashboard Supabase :
1. Aller dans **Database** > **Migrations**
2. Appliquer la migration `20250130000020_step20_fix_signup_trigger_conflict.sql`

### Étape 2: Vérifier les Données Initiales

```sql
-- Vérifier que les plans d'abonnement existent
SELECT name, display_name, price_monthly, is_active 
FROM subscription_plans 
WHERE is_active = TRUE;

-- Vérifier que les rôles système existent
SELECT name, display_name, is_active 
FROM system_roles 
WHERE is_active = TRUE;
```

### Étape 3: Tester l'Inscription

**Script de test** : `scripts/test-signup-system.ps1`

```powershell
# Exécuter le script de test
.\scripts\test-signup-system.ps1
```

### Étape 4: Test Manuel

1. Aller sur la page d'inscription de l'application
2. Créer un compte avec des données valides
3. Vérifier que :
   - ✅ L'inscription réussit
   - ✅ Le profil utilisateur est créé
   - ✅ L'abonnement est assigné
   - ✅ Le rôle utilisateur est assigné

## 🔍 Vérifications Post-Déploiement

### 1. Vérifier les Triggers

```sql
-- Vérifier qu'un seul trigger existe
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
```

### 2. Vérifier les Fonctions

```sql
-- Vérifier que la fonction existe
SELECT 
    routine_name, 
    routine_type, 
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

### 3. Test d'Inscription Réel

```sql
-- Créer un utilisateur de test (à supprimer après)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test-signup@example.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Test User", "first_name": "Test", "last_name": "User"}'::jsonb
);
```

## 🛠️ Dépannage

### Problème : Migration échoue

**Solution** :
1. Vérifier les permissions Supabase
2. Exécuter les migrations dans l'ordre
3. Vérifier que les tables existent

### Problème : Trigger ne se déclenche pas

**Solution** :
1. Vérifier que le trigger est créé
2. Vérifier les permissions de la fonction
3. Tester avec un utilisateur de test

### Problème : Données manquantes

**Solution** :
1. Exécuter `step13_initial_data.sql`
2. Vérifier que les plans et rôles existent
3. Créer manuellement si nécessaire

### Problème : Erreur de permissions

**Solution** :
```sql
-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON user_roles TO authenticated;
```

## 📊 Monitoring

### Logs à Surveiller

1. **Logs Supabase** : Erreurs de trigger
2. **Logs Application** : Erreurs d'inscription
3. **Métriques** : Taux de succès d'inscription

### Alertes Recommandées

- ❌ Échec de création de profil utilisateur
- ❌ Échec de création d'abonnement
- ❌ Échec de création de rôle
- ⚠️ Données manquantes dans les tables de référence

## 🎯 Résultat Attendu

Après application de cette solution :

✅ **Inscription fonctionnelle** : Les utilisateurs peuvent créer des comptes
✅ **Profil automatique** : Profil créé automatiquement lors de l'inscription
✅ **Abonnement assigné** : Plan gratuit assigné automatiquement
✅ **Rôle assigné** : Rôle utilisateur assigné automatiquement
✅ **Gestion d'erreur** : Erreurs gérées sans bloquer l'inscription
✅ **Fallback robuste** : Système fonctionne même en cas de problème partiel

## 📞 Support

Si le problème persiste après application de cette solution :

1. **Vérifier les logs** Supabase pour des erreurs spécifiques
2. **Tester avec le script** `test-signup-system.ps1`
3. **Vérifier les permissions** de base de données
4. **Contacter le support** avec les logs d'erreur

---

**Date de création** : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Version** : 1.0
**Statut** : ✅ Solution implémentée et testée
