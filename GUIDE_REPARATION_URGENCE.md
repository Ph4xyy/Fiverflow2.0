# 🚨 Guide de Réparation d'Urgence - Perte d'Accès Admin

## 🔥 Situation Critique
- ❌ Erreur 500 persistante
- ❌ Plus d'accès admin
- ❌ Profil non accessible
- ❌ RLS bloquant tout

## 🛠️ Solution d'Urgence

### **ÉTAPE 1 : Réparation Immédiate**
```sql
-- Exécute ce script EN PRIORITÉ
-- Fichier: scripts/emergency-fix-admin.sql
```

### **ÉTAPE 2 : Si l'Étape 1 ne fonctionne pas**
```sql
-- Exécute ce script de restauration complète
-- Fichier: scripts/complete-admin-restore.sql
```

## 🎯 Ce que font les Scripts

### Script d'Urgence (`emergency-fix-admin.sql`)
1. **Désactive RLS** complètement
2. **Restaure ton statut admin**
3. **Ajoute le username 'admin'**
4. **Crée un profil par défaut** si nécessaire
5. **Réactive RLS** avec une politique permissive

### Script Complet (`complete-admin-restore.sql`)
1. **Supprime toutes les politiques** problématiques
2. **Restaure complètement** ton profil admin
3. **Ajoute le username**
4. **Crée des politiques simples**
5. **Vérifie** que tout fonctionne

## ✅ Vérification du Succès

### Après avoir exécuté le script :
1. **Rafraîchis** ton application
2. **Vérifie** que tu es reconnecté
3. **Va sur** `/admin` pour vérifier l'accès admin
4. **Vérifie** que ton profil s'affiche avec le username

### 🎯 Résultats Attendus
- ✅ Plus d'erreur 500
- ✅ Accès admin restauré
- ✅ Profil accessible
- ✅ Username affiché : `@admin`

## 🚨 Si Rien ne Fonctionne

### Option de Dernier Recours
```sql
-- Désactiver RLS complètement (temporaire)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Vérifier que tu peux accéder à ton profil
SELECT * FROM user_profiles WHERE user_id = 'd670e08d-ea95-4738-a8b0-93682c9b5814';
```

## 🔧 Diagnostic Supplémentaire

### Si les scripts ne fonctionnent pas :
1. **Vérifie** que ton `user_id` est correct
2. **Vérifie** que la table `user_profiles` existe
3. **Vérifie** que tu as les permissions SQL

### Commande de Vérification
```sql
-- Vérifier ton user_id dans auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'fx.bergeron011@gmail.com';
```

## 🎉 Une Fois Réparé

### Actions à Faire :
1. **Teste** l'accès admin
2. **Vérifie** l'affichage du username
3. **Teste** la création de profils
4. **Documente** le problème pour éviter qu'il se reproduise

---

## 🚀 Priorité Absolue

**Exécute `emergency-fix-admin.sql` MAINTENANT pour restaurer ton accès admin !**

Une fois que tu auras retrouvé l'accès, on pourra optimiser les politiques RLS de manière plus sûre.
