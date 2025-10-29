# Guide de Configuration OAuth pour FiverFlow

Ce guide vous explique comment configurer les providers OAuth (GitHub, Google, Discord) pour permettre la connexion sociale sur FiverFlow.

## 🚀 Configuration Rapide

Exécutez le script PowerShell pour une configuration guidée :

```powershell
.\scripts\setup-oauth-providers.ps1
```

## 📋 Configuration Manuelle

### 1. GitHub OAuth

1. **Créer une application GitHub :**
   - Allez sur [GitHub Developer Settings](https://github.com/settings/applications/new)
   - **Application name:** `FiverFlow`
   - **Homepage URL:** `http://localhost:3000` (ou votre domaine de production)
   - **Authorization callback URL:** `http://localhost:3000/auth/callback`

2. **Récupérer les clés :**
   - Copiez le **Client ID**
   - Copiez le **Client Secret**

### 2. Google OAuth

1. **Créer un projet Google Cloud :**
   - Allez sur [Google Cloud Console](https://console.developers.google.com/)
   - Créez un nouveau projet ou sélectionnez un existant

2. **Activer l'API :**
   - Allez dans "APIs & Services" > "Library"
   - Recherchez et activez "Google+ API"

3. **Créer des identifiants OAuth 2.0 :**
   - Allez dans "APIs & Services" > "Credentials"
   - Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
   - **Application type:** Web application
   - **Authorized redirect URIs:** `http://localhost:3000/auth/callback`

4. **Récupérer les clés :**
   - Copiez le **Client ID**
   - Copiez le **Client Secret**

### 3. Discord OAuth

1. **Créer une application Discord :**
   - Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
   - Cliquez sur "New Application"
   - **Name:** `FiverFlow`

2. **Configurer OAuth2 :**
   - Allez dans l'onglet "OAuth2" > "General"
   - **Redirects:** Ajoutez `http://localhost:3000/auth/callback`
   - Copiez le **Client ID**

3. **Récupérer le secret :**
   - Dans "OAuth2" > "General"
   - Cliquez sur "Reset Secret" pour générer un nouveau secret
   - Copiez le **Client Secret**

## 🔧 Configuration des Variables d'Environnement

Ajoutez ces variables à votre fichier `.env.local` :

```env
# OAuth Providers Configuration
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=votre_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=votre_github_client_secret
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=votre_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=votre_google_client_secret
SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID=votre_discord_client_id
SUPABASE_AUTH_EXTERNAL_DISCORD_SECRET=votre_discord_client_secret
```

## 🚀 Redémarrage de Supabase

Après avoir configuré les variables d'environnement :

```bash
supabase stop
supabase start
```

## ✅ Test de la Configuration

1. **Démarrez l'application :**
   ```bash
   npm run dev
   ```

2. **Testez les connexions sociales :**
   - Allez sur `/login` ou `/register`
   - Cliquez sur les boutons GitHub, Google, ou Discord
   - Vérifiez que la redirection fonctionne

## 🌐 Configuration pour la Production

Pour la production, remplacez `localhost:3000` par votre domaine :

- **Homepage URL:** `https://votre-domaine.com`
- **Authorization callback URL:** `https://votre-domaine.com/auth/callback`

## 🔒 Sécurité

- ⚠️ **Ne commitez jamais vos secrets OAuth dans Git**
- 🔐 Utilisez des variables d'environnement
- 🛡️ Configurez des URLs de redirection spécifiques
- 🔄 Régénérez les secrets régulièrement

## 🐛 Dépannage

### Erreur "Invalid redirect URI"
- Vérifiez que l'URL de redirection correspond exactement à celle configurée
- Assurez-vous que l'URL utilise le bon protocole (http/https)

### Erreur "Client ID not found"
- Vérifiez que les variables d'environnement sont correctement définies
- Redémarrez Supabase après avoir modifié les variables

### Erreur "Invalid client secret"
- Vérifiez que le secret est correctement copié
- Régénérez le secret si nécessaire

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Supabase : `supabase logs`
2. Consultez la [documentation Supabase Auth](https://supabase.com/docs/guides/auth)
3. Vérifiez la configuration de votre provider OAuth

---

**Note :** Ce guide est pour le développement local. Pour la production, suivez les mêmes étapes mais avec vos URLs de production.


