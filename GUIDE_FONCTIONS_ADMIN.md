# 🔧 Guide : Fonctions de Promotion Admin

## 🎯 Problème Résolu
- ✅ Ton ami est dans la liste
- ✅ Trigger automatique réparé
- ❌ Fonction de promotion manquante
- ❌ Erreur lors de la promotion

## 🛠️ Solution

### **ÉTAPE 1 : Créer les Fonctions de Promotion**
```sql
-- Exécute ce script pour créer les fonctions
-- Fichier: scripts/create-promote-admin-function.sql
```

### **ÉTAPE 2 : Tester les Fonctions**
```sql
-- Vérifier que tout fonctionne
-- Fichier: scripts/test-admin-functions.sql
```

## 🎯 Fonctions Créées

### ✅ `promote_user_to_admin(target_user_id, promoted_by_user_id)`
- **Promouvoir** un utilisateur en admin
- **Vérifications** de sécurité
- **Permissions** admin requises

### ✅ `demote_admin_to_user(target_user_id)`
- **Rétrograder** un admin en utilisateur
- **Protection** contre l'auto-rétrogradation
- **Permissions** admin requises

## 🔒 Sécurité

### Vérifications Automatiques
- ✅ **Authentification** requise
- ✅ **Permissions admin** vérifiées
- ✅ **Utilisateur cible** existe
- ✅ **Protection** contre l'auto-rétrogradation

### Permissions
- ✅ **Seuls les admins** peuvent promouvoir
- ✅ **Seuls les admins** peuvent rétrograder
- ✅ **Fonctions sécurisées** avec `SECURITY DEFINER`

## ✅ Vérification du Succès

### Après l'exécution :
1. **Va sur** `/admin` dans ton application
2. **Clique** sur "Promouvoir en admin" pour ton ami
3. **Vérifie** que ça fonctionne sans erreur
4. **Teste** la rétrogradation si nécessaire

### 🎯 Résultats Attendus
- ✅ **Plus d'erreur** "Could not find the function"
- ✅ **Promotion** fonctionne depuis le panel
- ✅ **Rétrogradation** fonctionne aussi
- ✅ **Sécurité** respectée

## 🔄 Automatisation Confirmée

### Le trigger réparé va maintenant :
- ✅ **Créer automatiquement** un profil pour chaque nouvel utilisateur
- ✅ **Fonctionner** sans récursion
- ✅ **Éviter** ce problème à l'avenir

### Test de l'Automatisation
1. **Demande à quelqu'un** de créer un compte
2. **Vérifie** qu'il apparaît automatiquement dans `user_profiles`
3. **Vérifie** qu'il est visible dans le panel admin

## 🚨 Si le Problème Persiste

### Vérification Manuelle
```sql
-- Vérifier que les fonctions existent
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('promote_user_to_admin', 'demote_admin_to_user');

-- Tester la fonction directement
SELECT promote_user_to_admin('USER_ID_DE_TON_AMI'::UUID);
```

### Redémarrage de l'Application
- **Rafraîchis** complètement ton application
- **Vide le cache** du navigateur
- **Reconnecte-toi** si nécessaire

---

## 🎉 Résultat Final

Après ces scripts :
- ✅ **Fonctions de promotion** créées
- ✅ **Panel admin** fonctionnel
- ✅ **Promotion** depuis l'interface
- ✅ **Automatisation** confirmée
- ✅ **Sécurité** respectée

**Exécute le script et teste la promotion depuis le panel admin !** 🚀
