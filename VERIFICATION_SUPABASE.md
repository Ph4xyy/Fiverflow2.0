# Vérification Supabase - ENV et RLS Policies

Ce document décrit comment vérifier que votre configuration Supabase est correcte pour éviter les problèmes de perte de session et d'accès aux données.

## 1. Vérification des variables d'environnement

### Fichiers à vérifier

1. **`.env` (développement local)**
2. **`.env.local` (override local)**
3. **Vercel Dashboard** → Project Settings → Environment Variables
4. **Variables de build Vercel**

### Variables requises

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ⚠️ Points de vigilance

- **Les valeurs doivent être IDENTIQUES** entre :
  - Développement local
  - Preview branches Vercel
  - Production Vercel
  
- **Vérifier dans la console du navigateur** :
  ```javascript
  // Ouvrir la console et taper :
  console.log({
    url: import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length
  })
  ```

- Si les valeurs diffèrent entre onglets du même environnement → **PROBLÈME DE CACHE** :
  - Vider le cache du navigateur
  - Supprimer localStorage/sessionStorage
  - Hard refresh (Ctrl+Shift+R)

---

## 2. Vérification des RLS Policies

Les Row Level Security (RLS) policies de Supabase contrôlent l'accès aux données. Si mal configurées, vous obtiendrez des erreurs 401/403.

### Policy requise pour `users` (ou `profiles`)

```sql
-- Policy : SELECT sur users/profiles
-- Permet à un utilisateur de lire son propre profil

CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### Policy requise pour `clients`

```sql
-- Policy : SELECT sur clients
-- Permet à un utilisateur de lire ses propres clients

CREATE POLICY "Users can read own clients"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Policy requise pour `orders`

```sql
-- Policy : SELECT sur orders via clients
-- Permet à un utilisateur de lire ses propres commandes

CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = orders.client_id
    AND clients.user_id = auth.uid()
  )
);
```

### Policy requise pour `tasks`

```sql
-- Policy : SELECT sur tasks
-- Permet à un utilisateur de lire ses propres tâches

CREATE POLICY "Users can read own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

---

## 3. Vérifier les policies dans Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** → **Policies**
4. Vérifier que les policies ci-dessus existent pour chaque table
5. Cliquer sur **"Enable RLS"** si pas déjà activé

### Test manuel des policies

Dans le **SQL Editor** de Supabase :

```sql
-- Test 1 : Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'clients', 'orders', 'tasks');

-- Résultat attendu : rowsecurity = true pour toutes les tables

-- Test 2 : Lister toutes les policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier que vous avez au moins une policy SELECT par table
```

---

## 4. Tester l'accès aux données

### Depuis la console du navigateur

Après vous être connecté, ouvrez la console et testez :

```javascript
// Test 1 : Vérifier la session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Test 2 : Lire son profil
const { data: profile, error: profileError } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single();
console.log('Profile:', profile, 'Error:', profileError);

// Test 3 : Lire ses clients
const { data: clients, error: clientsError } = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', session.user.id);
console.log('Clients:', clients, 'Error:', clientsError);
```

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `PGRST301` | JWT expiré ou invalide | Le système devrait auto-refresh, vérifier les logs |
| `new row violates row-level security policy` | Policy INSERT manquante | Ajouter policy INSERT |
| `permission denied for table` | RLS activé mais pas de policy | Ajouter policy SELECT |
| `JWT expired` | Token expiré et refresh a échoué | Vérifier `refreshSession()` dans les logs |

---

## 5. Vérifier le role admin

### Méthode 1 : Via app_metadata (recommandé)

```sql
-- Dans Supabase SQL Editor, promouvoir un utilisateur en admin :
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'votre-email@example.com';
```

### Méthode 2 : Via table users

```sql
-- Mettre à jour la table users :
UPDATE public.users
SET role = 'admin'
WHERE email = 'votre-email@example.com';
```

### Vérifier le rôle dans la console

```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Role dans app_metadata:', session.user.app_metadata.role);
console.log('Role dans user_metadata:', session.user.user_metadata.role);

// Si les deux sont undefined, vérifier la table :
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', session.user.id)
  .single();
console.log('Role dans table users:', profile.role);
```

---

## 6. Diagnostic complet

### Logs à surveiller dans la console

Après avoir appliqué les corrections, surveillez ces logs :

```
[Supabase] Storage diagnostics: { hasIssue, isSafari, isIFrame, ... }
[Supabase] Environment check: { mode, hasSupabaseUrl, hasSupabaseKey, ... }
[AuthContext] Initializing...
[AuthContext] ✅ Session found: { userId, expiresAt, appMetaRole }
[AuthContext] updateRealtimeAndEmit: ✅ Realtime auth updated
[UserDataContext] ✅ Using app_metadata role: admin
[usePlanRestrictions] Calculate: ✅ Admin restrictions set
```

### Si vous voyez ces erreurs

```
❌ STORAGE ISSUE DETECTED: Safari dans iFrame
```
→ Ouvrir l'app dans un nouvel onglet (hors iFrame)

```
⚠️ Auth error (401/403), will retry after token refresh
```
→ Normal, le système va retry automatiquement

```
❌ Failed to update Realtime auth
```
→ Les channels Realtime vont être nettoyés et recréés

---

## 7. Checklist finale

- [ ] Variables ENV identiques partout (local, preview, prod)
- [ ] RLS activé sur toutes les tables sensibles
- [ ] Policy SELECT existe pour `users`, `clients`, `orders`, `tasks`
- [ ] Le rôle admin est dans `app_metadata` ou `users.role`
- [ ] Les logs montrent `✅ Session found` et `✅ Realtime auth updated`
- [ ] Pas d'erreur `PGRST301` répétée dans les logs
- [ ] Le retour sur l'onglet ne perd pas la session

---

## 8. Commandes utiles

### Réinitialiser complètement la session locale

```javascript
// Dans la console du navigateur :
localStorage.clear();
sessionStorage.clear();
await supabase.auth.signOut();
// Puis rafraîchir la page et se reconnecter
```

### Forcer un refresh de session

```javascript
const { data, error } = await supabase.auth.refreshSession();
console.log('Refresh result:', { data, error });
```

### Vérifier les channels Realtime

```javascript
console.log('Realtime channels:', supabase.getChannels());
```

---

## Support

Si le problème persiste après avoir vérifié tous ces points :

1. Vérifier les logs complets dans la console (avec filtres `[AuthContext]`, `[Supabase]`)
2. Tester en navigation privée (pour exclure les extensions)
3. Tester sur un autre navigateur
4. Vérifier les logs côté Supabase Dashboard → Logs

Les erreurs les plus courantes viennent de :
- ENV mal configurées (différence entre preview/prod)
- RLS policies manquantes
- Cache navigateur corrompu
- Safari en iFrame (storage partitionné)

