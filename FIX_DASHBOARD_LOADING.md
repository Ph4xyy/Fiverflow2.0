# Fix: Dashboard et Profile qui chargent indéfiniment

## Problème
Après l'inscription, le dashboard et la page de profil ne s'affichent pas et restent en chargement infini.

## Causes identifiées
1. **Profil utilisateur manquant** : Si le trigger `handle_new_user()` n'a pas fonctionné, le profil utilisateur n'existe pas dans `user_profiles`
2. **Erreurs RLS non gérées** : Les requêtes vers `user_profiles` échouaient et bloquaient l'interface
3. **Gestion d'erreur insuffisante** : Les composants utilisaient `.single()` qui lance une erreur si aucun résultat n'est trouvé

## Solutions appliquées

### 1. `src/pages/ProfileRedirect.tsx`
- ✅ Utilisation de `.maybeSingle()` au lieu de `.single()` pour gérer l'absence de profil
- ✅ Redirection vers `/dashboard` en cas d'erreur au lieu de bloquer
- ✅ Vérification que Supabase est configuré avant les requêtes

### 2. `src/components/Layout.tsx`
- ✅ Utilisation de `.maybeSingle()` pour la vérification du rôle admin
- ✅ Gestion gracieuse des erreurs si le profil n'existe pas encore
- ✅ Logging amélioré pour le diagnostic

### 3. `src/hooks/useDashboardStats.ts`
- ✅ Requêtes simplifiées pour éviter les dépendances entre tables
- ✅ Gestion d'erreur non-bloquante : les erreurs sont loggées mais ne bloquent pas le chargement
- ✅ Continuation avec des données vides si les tables n'existent pas ou si RLS bloque

## Résultat
- Le dashboard s'affiche même si certaines données ne peuvent pas être chargées
- La page de profil redirige vers `/dashboard` ou `/settings` si le profil n'existe pas
- Plus de chargement infini - les erreurs sont gérées gracieusement

## Vérification
1. Créez un nouveau compte
2. Connectez-vous
3. Accédez au dashboard - il devrait s'afficher même avec des données vides
4. Accédez à `/profile` - il devrait rediriger correctement

## Note importante
Si le profil utilisateur n'est toujours pas créé automatiquement lors de l'inscription, vous devrez peut-être :
1. Appliquer la migration `20250210000000_fix_user_profile_rls.sql` dans Supabase
2. Vérifier que le trigger `on_auth_user_created` existe et fonctionne
3. Créer manuellement le profil via SQL si nécessaire :

```sql
-- Vérifier si un utilisateur n'a pas de profil
SELECT auth.users.id, auth.users.email, user_profiles.id as profile_id
FROM auth.users
LEFT JOIN user_profiles ON auth.users.id = user_profiles.user_id
WHERE user_profiles.id IS NULL;

-- Créer le profil manuellement si nécessaire (remplacer USER_ID)
INSERT INTO user_profiles (user_id, email, username, subscription, role, full_name)
SELECT 
  id,
  email,
  split_part(email, '@', 1),
  'Lunch',
  'member',
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE id = 'USER_ID_HERE'
ON CONFLICT (user_id) DO NOTHING;
```

