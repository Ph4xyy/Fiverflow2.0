# 🚨 Guide de Résolution : Erreur 500 - Récursion Infinie RLS

## 🔍 Diagnostic du Problème

L'erreur `"infinite recursion detected in policy for relation \"user_profiles\""` indique que les politiques RLS (Row Level Security) créent une boucle infinie.

### 🎯 Cause Principale
Les politiques RLS font référence à la même table qu'elles protègent, créant une récursion infinie.

## 🛠️ Solution Étape par Étape

### 1. **Diagnostic** (Optionnel)
```sql
-- Exécuter d'abord pour comprendre le problème
-- Fichier: scripts/diagnose-rls-issue.sql
```

### 2. **Correction Immédiate** (Recommandé)
```sql
-- Exécuter ce script pour corriger le problème
-- Fichier: scripts/fix-rls-recursion.sql
```

### 3. **Vérification**
Après avoir exécuté le script de correction :
1. **Rafraîchis** la page de ton application
2. **Vérifie** que l'erreur 500 a disparu
3. **Teste** la connexion et l'affichage du profil

## 🔧 Ce que fait le Script de Correction

### ✅ Actions Effectuées
1. **Supprime** toutes les politiques RLS problématiques
2. **Désactive temporairement** RLS pour nettoyer
3. **Réactive** RLS avec des politiques simples
4. **Crée** des politiques non-récursives
5. **Vérifie** que tout fonctionne

### 🎯 Nouvelles Politiques (Sécurisées)
- **Lecture publique** : Usernames visibles par tous
- **Profil personnel** : Chaque utilisateur voit son profil
- **Modification** : Chaque utilisateur modifie son profil
- **Admin** : Les admins gèrent tous les profils

## 🚨 Si le Problème Persiste

### Option A : Désactiver RLS Temporairement
```sql
-- Désactiver RLS complètement (temporaire)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

### Option B : Vérifier les Triggers
```sql
-- Vérifier s'il y a des triggers problématiques
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles';
```

### Option C : Reset Complet
```sql
-- Supprimer toutes les politiques et recommencer
DROP POLICY IF EXISTS "Public usernames readable" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all" ON user_profiles;

-- Recréer une politique simple
CREATE POLICY "Simple access" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);
```

## ✅ Vérification du Succès

### 🎯 Tests à Effectuer
1. **Connexion** : L'application se charge sans erreur 500
2. **Profil** : Le profil utilisateur s'affiche correctement
3. **Admin** : Le dashboard admin fonctionne
4. **Username** : Le username s'affiche sur le profil

### 📊 Logs à Surveiller
- ❌ Plus d'erreurs `infinite recursion`
- ❌ Plus d'erreurs 500 sur `/rest/v1/user_profiles`
- ✅ Chargement normal des profils
- ✅ Affichage des usernames

## 🔄 Prévention Future

### 🛡️ Bonnes Pratiques RLS
1. **Éviter** les références circulaires dans les politiques
2. **Tester** les politiques avant déploiement
3. **Utiliser** des politiques simples et directes
4. **Éviter** les sous-requêtes complexes dans les politiques

### 📝 Exemple de Politique Correcte
```sql
-- ✅ Bonne pratique
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- ❌ Mauvaise pratique (récursion)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );
```

---

## 🎉 Résultat Attendu

Après la correction :
- ✅ Plus d'erreurs 500
- ✅ Application fonctionnelle
- ✅ Usernames affichés
- ✅ Profils accessibles
- ✅ Dashboard admin opérationnel

**🚀 Ton application devrait maintenant fonctionner parfaitement !**
