# 🎨 Configuration du Branding OAuth pour FiverFlow

## 🎯 Objectif
Personnaliser l'affichage OAuth pour montrer "FiverFlow Security" au lieu de l'URL Supabase.

## 🔧 Configuration requise

### 1. **Google OAuth Console**

#### **Étapes :**
1. Allez sur : https://console.developers.google.com/
2. Sélectionnez votre projet OAuth
3. Allez dans "OAuth consent screen"

#### **Configuration :**
- **App name** : `FiverFlow Security`
- **User support email** : `support@fiverflow.com`
- **App logo** : Upload du logo FiverFlow
- **App domain** : `fiverflow.com`
- **Authorized domains** : `fiverflow.com`
- **Developer contact** : `contact@fiverflow.com`

#### **Scopes à configurer :**
- `email`
- `profile`
- `openid`

### 2. **GitHub OAuth App**

#### **Étapes :**
1. Allez sur : https://github.com/settings/developers
2. Sélectionnez votre OAuth App
3. Cliquez sur "Edit"

#### **Configuration :**
- **Application name** : `FiverFlow Security`
- **Homepage URL** : `https://fiverflow.com`
- **Application description** : `Secure authentication for FiverFlow platform`
- **Authorization callback URL** : `https://arnuyyyryvbfcvqauqur.supabase.co/auth/v1/callback`

### 3. **Discord Developer Portal**

#### **Étapes :**
1. Allez sur : https://discord.com/developers/applications
2. Sélectionnez votre application
3. Allez dans "General Information"

#### **Configuration :**
- **Name** : `FiverFlow Security`
- **Description** : `Secure authentication for FiverFlow platform`
- **Icon** : Upload du logo FiverFlow

## 🎨 Personnalisation avancée

### **Google - Personnalisation complète :**

#### **OAuth consent screen :**
```
App name: FiverFlow Security
User support email: support@fiverflow.com
App logo: [Logo FiverFlow]
App domain: fiverflow.com
Authorized domains: fiverflow.com
Developer contact: contact@fiverflow.com
```

#### **Scopes personnalisés :**
```
email - See your primary Google Account email address
profile - See your personal info, including any personal info you've made publicly available
openid - Associate you with your personal info on Google
```

### **GitHub - Personnalisation complète :**

#### **OAuth App settings :**
```
Application name: FiverFlow Security
Homepage URL: https://fiverflow.com
Application description: Secure authentication for FiverFlow platform. Connect your GitHub account to access your FiverFlow dashboard.
Authorization callback URL: https://arnuyyyryvbfcvqauqur.supabase.co/auth/v1/callback
```

## 🔄 Messages d'autorisation

### **Avant (actuel) :**
- Google : "Google autorisera arnuyyyryvbfcvqauqur.supabase.co à accéder..."
- GitHub : "Redirect vers arnuyyyryvbfcvqauqur.supabase.co"

### **Après (souhaité) :**
- Google : "Google autorisera FiverFlow Security à accéder..."
- GitHub : "Redirect vers FiverFlow Security"

## 📝 Étapes de configuration

### **1. Google OAuth :**
1. Console Google → OAuth consent screen
2. Modifier le nom de l'application
3. Ajouter le logo FiverFlow
4. Configurer les domaines autorisés
5. Sauvegarder

### **2. GitHub OAuth :**
1. GitHub Settings → Developer settings → OAuth Apps
2. Modifier le nom de l'application
3. Ajouter la description
4. Sauvegarder

### **3. Discord OAuth :**
1. Discord Developer Portal → Applications
2. Modifier le nom et la description
3. Ajouter l'icône
4. Sauvegarder

## ⚠️ Important

- **L'URL de callback reste la même** : `https://arnuyyyryvbfcvqauqur.supabase.co/auth/v1/callback`
- **Seul l'affichage change** dans les écrans d'autorisation
- **Le branding** sera "FiverFlow Security" au lieu de l'URL Supabase
- **Les utilisateurs verront** un écran plus professionnel

## 🎯 Résultat attendu

- **Google** : "FiverFlow Security souhaite accéder à votre compte Google"
- **GitHub** : "Authorize FiverFlow Security"
- **Discord** : "Authorize FiverFlow Security"

## 🚀 Avantages

- **Branding professionnel** : Plus de confiance utilisateur
- **Cohérence visuelle** : Logo et nom FiverFlow partout
- **Sécurité apparente** : "FiverFlow Security" inspire confiance
- **Expérience utilisateur** : Plus claire et rassurante
