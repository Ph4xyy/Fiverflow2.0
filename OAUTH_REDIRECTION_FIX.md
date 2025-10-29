# 🔧 Guide de Correction des Redirections OAuth

## Problème identifié
Les redirections OAuth pointent vers localhost au lieu de votre application de production.

## ✅ Solution implémentée

### 1. Configuration automatique des URLs
J'ai créé un système qui détecte automatiquement l'environnement :
- **Développement** : Utilise `window.location.origin` (localhost:5173)
- **Production** : Utilise l'URL Vercel configurée

### 2. Fichiers modifiés
- `src/lib/oauth-config.ts` - Configuration centralisée OAuth
- `src/pages/AuthRegister.tsx` - Utilise la nouvelle config
- `src/pages/AuthSignIn.tsx` - Utilise la nouvelle config
- `env.example` - Ajout de `VITE_APP_URL`

## 🚀 Configuration requise

### 1. Variables d'environnement
Ajoutez dans votre fichier `.env` (ou `.env.local`) :
```env
VITE_APP_URL=https://votre-app.vercel.app
```

### 2. URLs à configurer dans Supabase Dashboard

#### Site URL :
```
http://localhost:5173
```

#### Redirect URLs :
```
http://localhost:5173/auth/callback
https://localhost:5173/auth/callback
http://127.0.0.1:5173/auth/callback
https://127.0.0.1:5173/auth/callback
https://votre-app.vercel.app/auth/callback
```

### 3. URLs pour les providers OAuth

#### Google OAuth Console :
```
https://arnuyyyryvbfcvqauqur.supabase.co/auth/v1/callback
```

#### GitHub OAuth App :
```
https://arnuyyyryvbfcvqauqur.supabase.co/auth/v1/callback
```

#### Discord Developer Portal :
```
https://arnuyyyryvbfcvqauqur.supabase.co/auth/v1/callback
```

## 🔄 Comment ça fonctionne maintenant

1. **En développement** (`npm run dev`) :
   - Redirige vers `http://localhost:5173/auth/callback`

2. **En production** (Vercel) :
   - Redirige vers `https://votre-app.vercel.app/auth/callback`

## 📝 Étapes pour corriger

1. **Déployez sur Vercel** pour obtenir votre URL de production
2. **Mettez à jour** `VITE_APP_URL` avec votre vraie URL Vercel
3. **Configurez Supabase** avec les URLs ci-dessus
4. **Configurez les providers OAuth** avec l'URL Supabase

## ⚠️ Important

- L'URL Supabase (`https://arnuyyyryvbfcvqauqur.supabase.co/auth/v1/callback`) ne change JAMAIS
- Les providers OAuth doivent TOUJOURS pointer vers l'URL Supabase
- Supabase redirige ensuite vers votre application

## 🧪 Test

1. Démarrez l'app : `npm run dev`
2. Allez sur `/login` ou `/register`
3. Cliquez sur un bouton OAuth
4. Vérifiez que vous êtes redirigé vers `/auth/callback` de votre app
5. Vérifiez que vous arrivez sur `/dashboard` ou `/create-username`
