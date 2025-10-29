# 🔧 Guide : Utilisateurs Manquants dans user_profiles

## 🎯 Problème Identifié
- ✅ Tu as retrouvé l'accès admin
- ❌ Ton ami n'apparaît pas dans `user_profiles`
- ❌ Impossible de le promouvoir admin
- ❌ Pas visible dans le panel admin

## 🛠️ Solution Étape par Étape

### **ÉTAPE 1 : Créer les Profils Manquants**
```sql
-- Exécute ce script pour créer tous les profils manquants
-- Fichier: scripts/fix-missing-profiles.sql
```

### **ÉTAPE 2 : Réparer le Trigger Automatique**
```sql
-- Réparer le trigger pour les futurs utilisateurs
-- Fichier: scripts/fix-trigger-create-profiles.sql
```

### **ÉTAPE 3 : Promouvoir ton Ami en Admin**
```sql
-- Promouvoir ton ami en admin
-- Fichier: scripts/promote-friend-to-admin.sql
-- ⚠️ N'oublie pas de remplacer 'EMAIL_DE_TON_AMI' par l'email de ton ami
```

## 🎯 Ce que font les Scripts

### Script 1 : Créer les Profils Manquants
- **Identifie** tous les utilisateurs sans profil
- **Crée** les profils manquants
- **Vérifie** que tout est créé

### Script 2 : Réparer le Trigger
- **Supprime** l'ancien trigger défaillant
- **Crée** un nouveau trigger simplifié
- **Teste** que le trigger fonctionne

### Script 3 : Promouvoir ton Ami
- **Trouve** ton ami par email
- **Crée** son profil s'il n'existe pas
- **Le promeut** en admin
- **Vérifie** la promotion

## ✅ Vérification du Succès

### Après avoir exécuté les scripts :
1. **Va sur** `/admin` dans ton application
2. **Vérifie** que ton ami apparaît dans "Gestion des utilisateurs"
3. **Teste** de le promouvoir admin depuis l'interface
4. **Vérifie** qu'il peut accéder au dashboard admin

### 🎯 Résultats Attendus
- ✅ Ton ami visible dans le panel admin
- ✅ Profil créé dans `user_profiles`
- ✅ Peut être promu admin
- ✅ Trigger fonctionne pour les futurs utilisateurs

## 🔄 Prévention Future

### Le trigger réparé va maintenant :
- **Créer automatiquement** un profil pour chaque nouvel utilisateur
- **Éviter** ce problème à l'avenir
- **Fonctionner** correctement sans récursion

## 🚨 Si le Problème Persiste

### Vérification Manuelle
```sql
-- Vérifier que ton ami a bien un profil
SELECT * FROM user_profiles WHERE email = 'EMAIL_DE_TON_AMI';

-- Vérifier tous les utilisateurs
SELECT 
  au.email as auth_email,
  up.email as profile_email,
  up.is_admin
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
ORDER BY au.created_at;
```

---

## 🎉 Résultat Final

Après ces scripts :
- ✅ **Ton ami visible** dans le panel admin
- ✅ **Profil créé** automatiquement
- ✅ **Peut être promu** admin
- ✅ **Trigger réparé** pour l'avenir

**Exécute les 3 scripts dans l'ordre et ton ami apparaîtra dans le panel admin !** 🚀
