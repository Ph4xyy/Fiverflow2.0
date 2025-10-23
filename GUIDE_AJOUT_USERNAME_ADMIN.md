# 🔧 Guide : Ajouter un Username à ton Compte Admin

## 🎯 Objectif
Ajouter un username unique à ton compte admin existant et l'afficher sur ton profil.

## 📋 Étapes à Suivre

### 1. Exécuter le Script SQL

**Option A : Script automatique**
```powershell
# Dans PowerShell, exécute :
.\scripts\add-username-to-admin.ps1
```

**Option B : Script manuel**
1. Ouvre Supabase SQL Editor
2. Copie et colle le contenu de `scripts/add-username-to-admin.sql`
3. Modifie `'admin'` par le username de ton choix
4. Exécute le script

### 2. Vérifier l'Ajout

```sql
-- Vérifier que le username a été ajouté
SELECT 
  user_id,
  full_name,
  email,
  username,
  is_admin
FROM user_profiles 
WHERE is_admin = TRUE;
```

### 3. Tester l'Affichage

1. **Va sur ton profil** (`/profile`)
2. **Vérifie** que le username s'affiche en dessous de ton nom
3. **Format attendu** : `@ton_username`

## 🎨 Résultat Visuel

### Sur ton Profil
```
John Doe
@john_doe
Professionnel
```

### Dans l'Admin Dashboard
```
John Doe
@john_doe
john@example.com
```

## 🔧 Règles du Username

- **Longueur** : 3-50 caractères
- **Caractères** : Lettres minuscules, chiffres, underscores uniquement
- **Interdictions** :
  - Pas de majuscules
  - Ne peut pas commencer par un chiffre
  - Ne peut pas se terminer par un underscore
  - Pas d'espaces ou caractères spéciaux

### Exemples Valides
- ✅ `john_doe`
- ✅ `admin123`
- ✅ `my_username`

### Exemples Invalides
- ❌ `JohnDoe` (majuscules)
- ❌ `123user` (commence par un chiffre)
- ❌ `user_` (se termine par un underscore)

## 🚨 Dépannage

### Problème : Username non affiché
**Solution** : Vérifie que le script SQL a bien été exécuté et que la colonne `username` n'est pas NULL.

### Problème : Erreur "Username déjà utilisé"
**Solution** : Choisis un username différent qui n'est pas déjà pris.

### Problème : Username invalide
**Solution** : Respecte les règles de validation (minuscules, 3-50 caractères, etc.).

## ✅ Checklist

- [ ] Script SQL exécuté sans erreur
- [ ] Username ajouté à la base de données
- [ ] Username affiché sur le profil
- [ ] Username affiché dans l'admin dashboard
- [ ] Format correct (@username)

---

**🎉 Une fois terminé, ton username sera visible partout dans l'application !**
