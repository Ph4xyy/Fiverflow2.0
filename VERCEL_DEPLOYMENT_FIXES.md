# 🚀 Corrections pour le Déploiement Vercel

## Erreurs Vercel Courantes et Solutions

### 1. **Erreur de Build - Variables d'Environnement**

#### Problème
```
Error: Environment variable not found
```

#### Solution
Ajouter dans Vercel Dashboard > Settings > Environment Variables :

```env
# Variables requises pour l'Admin Panel
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook
```

### 2. **Erreur de Build - Dependencies**

#### Problème
```
Module not found: Can't resolve 'recharts'
```

#### Solution
Ajouter les dépendances manquantes dans `package.json` :

```json
{
  "dependencies": {
    "recharts": "^3.1.0",
    "@supabase/supabase-js": "^2.52.0"
  }
}
```

### 3. **Erreur de Build - TypeScript**

#### Problème
```
Type error: Cannot find module
```

#### Solution
Vérifier les imports dans les fichiers créés :

```typescript
// Vérifier que tous les imports sont corrects
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
```

### 4. **Erreur de Build - Edge Functions**

#### Problème
```
Edge Functions not found
```

#### Solution
Les Edge Functions ne sont pas déployées sur Vercel mais sur Supabase. Vérifier que :

1. Les Edge Functions sont déployées sur Supabase
2. Les URLs dans le code pointent vers Supabase, pas Vercel

### 5. **Erreur de Build - Tailwind CSS**

#### Problème
```
Tailwind CSS classes not found
```

#### Solution
Vérifier que `tailwind.config.js` inclut tous les fichiers :

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
}
```

## 🔧 Corrections Spécifiques pour l'Admin Panel

### 1. **Corriger les Imports dans les Services**

```typescript
// src/services/adminService.ts
import { supabase } from '../lib/supabase'

// Vérifier que le fichier lib/supabase.ts existe
```

### 2. **Corriger les Imports dans les Hooks**

```typescript
// src/hooks/useAdminUsers.ts
import { AdminService, AdminUser, UsersListResponse } from '../services/adminService'

// Vérifier que le service existe
```

### 3. **Corriger les Imports dans les Pages**

```typescript
// src/pages/admin/AdminUsersPage.tsx
import Layout, { pageBgClass, cardClass } from '../../components/Layout'
import AdminNavigation from '../../components/AdminNavigation'

// Vérifier que les composants existent
```

## 🛠️ Script de Vérification

Créer un script pour vérifier les imports :

```bash
# Vérifier les imports manquants
grep -r "import.*from" src/ | grep -v "node_modules" | grep -v "\.d\.ts"
```

## 📋 Checklist de Déploiement Vercel

### Avant le Déploiement
- [ ] Toutes les dépendances sont dans `package.json`
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Tous les imports sont corrects
- [ ] Edge Functions déployées sur Supabase
- [ ] Tests locaux passent

### Variables d'Environnement Vercel
```env
# Frontend (Vercel)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook

# Backend (Supabase Edge Functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook
OPENAI_API_KEY=your_openai_api_key
```

## 🚨 Erreurs Spécifiques et Solutions

### Erreur 1: "Cannot resolve module"
```bash
# Solution: Vérifier les chemins d'import
# Remplacer les imports relatifs par des imports absolus si nécessaire
```

### Erreur 2: "Build failed - TypeScript errors"
```bash
# Solution: Vérifier les types
npm run build
# Corriger les erreurs TypeScript affichées
```

### Erreur 3: "Environment variables not found"
```bash
# Solution: Ajouter les variables dans Vercel Dashboard
# Settings > Environment Variables
```

### Erreur 4: "Edge Functions not accessible"
```bash
# Solution: Vérifier que les Edge Functions sont déployées sur Supabase
supabase functions list
```

## 🔍 Debug Vercel

### 1. **Logs de Build**
```bash
# Voir les logs de build dans Vercel Dashboard
# Functions > Logs
```

### 2. **Test Local**
```bash
# Tester localement avant déploiement
npm run build
npm run preview
```

### 3. **Vérifier les Dependencies**
```bash
# Vérifier que toutes les dépendances sont installées
npm install
npm run build
```

## 📞 Support

Si l'erreur persiste, fournir :
1. Le message d'erreur exact
2. Les logs de build Vercel
3. Le fichier `package.json`
4. Les variables d'environnement configurées
