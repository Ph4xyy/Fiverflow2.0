# Guide du Système d'Administration

## 🎯 Fonctionnalités Implémentées

### ✅ Base de Données
- **Table `user_profiles`** créée avec champ `is_admin`
- **RLS (Row Level Security)** configuré
- **Trigger automatique** pour créer un profil lors de l'inscription

### ✅ Page d'Administration
- **AdminDashboard** accessible uniquement aux admins
- **Gestion des utilisateurs** (promouvoir/rétrograder admin)
- **Statistiques** (total users, actifs, admins, nouveaux)
- **Interface moderne** avec table des utilisateurs

### ✅ Badge Administrateur
- **Badge bleu** avec icône Shield dans le profil
- **Tooltip** "Administrateur - Accès complet au système"
- **Position** à gauche du badge d'abonnement

### ✅ Navigation
- **Menu Admin** ajouté entre Profile et Upgrade
- **Icône Shield** pour l'identification
- **Accès conditionnel** (visible uniquement aux admins)

## 🚀 Comment Tester

### 1. Promouvoir un Utilisateur en Admin

**Option A: Via SQL (Recommandé)**
```sql
-- Remplacez 'votre-email@example.com' par votre email
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'votre-email@example.com'
);
```

**Option B: Via l'Interface Admin (si déjà admin)**
1. Allez sur `/admin/dashboard`
2. Trouvez votre utilisateur dans la table
3. Cliquez sur "Promouvoir Admin"

### 2. Vérifier les Fonctionnalités

**Badge Admin dans le Profil:**
1. Allez sur `/profile`
2. Vérifiez que le badge bleu Shield apparaît à gauche du badge d'abonnement
3. Hover sur le badge pour voir le tooltip

**Navigation Admin:**
1. Vérifiez que "Admin" apparaît dans le menu sidebar
2. Cliquez sur "Admin" pour accéder à `/admin/dashboard`

**Page d'Administration:**
1. Vérifiez les statistiques en haut
2. Consultez la table des utilisateurs
3. Testez les boutons de promotion/rétrogradation

### 3. Tester la Sécurité

**Accès Non-Autorisé:**
1. Connectez-vous avec un compte non-admin
2. Essayez d'accéder à `/admin/dashboard`
3. Vous devriez voir "Accès Refusé"

**Navigation Conditionnelle:**
1. Avec un compte non-admin, vérifiez que "Admin" n'apparaît pas dans le menu

## 🔧 Scripts Utiles

### Lister tous les Admins
```sql
SELECT 
  up.full_name,
  au.email,
  up.is_admin,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.is_admin = TRUE
ORDER BY up.created_at DESC;
```

### Rétrograder un Admin
```sql
UPDATE user_profiles 
SET is_admin = FALSE 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin-email@example.com'
);
```

### Créer un Profil Manuellement
```sql
INSERT INTO user_profiles (user_id, full_name, is_admin)
VALUES ('user-id-here', 'Nom Utilisateur', FALSE);
```

## 🎨 Personnalisation

### Couleurs des Badges
- **Admin**: Bleu (`from-blue-600 to-blue-800`)
- **Abonnement**: Violet (`from-[#9c68f2] to-[#422ca5]`)

### Icônes
- **Admin**: `Shield` (Lucide React)
- **Abonnement**: `Crown` (Lucide React)

## 🐛 Dépannage

### Le Badge Admin n'Apparaît Pas
1. Vérifiez que `is_admin = TRUE` dans la base de données
2. Rechargez la page
3. Vérifiez la console pour les erreurs

### La Page Admin n'Est Pas Accessible
1. Vérifiez que l'utilisateur est bien admin
2. Vérifiez les permissions RLS
3. Vérifiez que la route est bien configurée

### Erreurs de Base de Données
1. Vérifiez que la table `user_profiles` existe
2. Vérifiez que le trigger `create_user_profile` fonctionne
3. Vérifiez les permissions sur la table

## 📝 Notes Techniques

- **RLS**: Les utilisateurs ne peuvent voir que leur propre profil
- **Admins**: Peuvent voir et modifier tous les profils
- **Trigger**: Crée automatiquement un profil lors de l'inscription
- **Performance**: Index sur `user_id`, `is_admin`, `is_active`
