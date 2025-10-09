# Guide du Système de Traduction - FiverFlow

## 📋 Vue d'ensemble

Le système de traduction de FiverFlow permet de traduire automatiquement toute l'application lorsque l'utilisateur choisit une langue différente.

## 🌍 Langues Supportées

L'application supporte actuellement 10 langues :
- 🇺🇸 **Anglais** (en) - Par défaut
- 🇫🇷 **Français** (fr)
- 🇪🇸 **Espagnol** (es)
- 🇩🇪 **Allemand** (de)
- 🇨🇳 **Chinois** (zh)
- 🇮🇹 **Italien** (it)
- 🇵🇹 **Portugais** (pt)
- 🇷🇺 **Russe** (ru)
- 🇯🇵 **Japonais** (ja)
- 🇰🇷 **Coréen** (ko)

## 🔧 Comment ça fonctionne

### 1. Architecture

Le système de traduction repose sur trois composants principaux :

#### a) `LanguageContext.tsx`
- Contient toutes les traductions pour toutes les langues
- Gère l'état de la langue actuelle
- Sauvegarde la préférence de langue dans `localStorage`
- Fournit la fonction `t()` pour accéder aux traductions

#### b) `LanguageSwitcher.tsx`
- Composant UI pour changer de langue
- Affiche un dropdown avec toutes les langues disponibles
- Met à jour la langue dans le contexte

#### c) Hook `useLanguage()`
- Hook React pour accéder au contexte de langue
- Utilisé dans tous les composants qui ont besoin de traductions

### 2. Utilisation dans les composants

```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MonComposant() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <p>{t('dashboard.welcome.guest')}</p>
    </div>
  );
}
```

### 3. Structure des clés de traduction

Les clés de traduction suivent une nomenclature organisée par section :

```
section.sous-section.élément
```

Exemples :
- `nav.dashboard` → Navigation : Dashboard
- `common.save` → Commun : Enregistrer
- `profile.tabs.security` → Profil : Onglet Sécurité
- `toast.profile.updated` → Toast : Profil mis à jour

## 📝 Sections de traduction disponibles

### Navigation (`nav.*`)
Tous les éléments de navigation principale :
- Dashboard, Clients, Orders, Tasks, Invoices, Calendar, Network, Stats, Profile, Support, Todo, Admin, Upgrade

### Recherche (`search.*`)
Éléments de la barre de recherche

### Commun (`common.*`)
Éléments réutilisables : boutons, actions, statuts, etc.

### Dashboard (`dashboard.*`)
Page d'accueil et actions rapides

### Clients (`clients.*`)
Gestion des clients

### Commandes (`orders.*`)
Gestion des commandes

### Tâches (`tasks.*`)
Gestion des tâches et sous-tâches

### Factures (`invoices.*`)
Gestion des factures

### Calendrier (`calendar.*`)
Vue calendrier

### Réseau (`network.*`)
Programme de recommandations

### Statistiques (`stats.*`)
Analyses et métriques

### Profil (`profile.*`)
Paramètres du profil utilisateur incluant :
- Informations personnelles
- Notifications
- Sécurité
- Facturation
- Préférences
- Image de marque & Email

### Authentification (`auth.*`)
Pages de connexion et d'inscription

### Modèles (`templates.*`)
Modèles de messages

### Onboarding (`onboarding.*`)
Processus d'intégration des nouveaux utilisateurs

### Upgrade (`upgrade.*`)
Page des plans d'abonnement

### Support (`support.*`)
Page de support et FAQ

### Activités (`activity.*`)
Liste des activités professionnelles

### Pays (`country.*`)
Liste des pays

### Toast (`toast.*`)
Messages de notification

## ➕ Comment ajouter de nouvelles traductions

### Étape 1 : Ajouter la clé en anglais

Dans `src/contexts/LanguageContext.tsx`, section `en`:

```typescript
'section.nouvelle.cle': 'New Text in English',
```

### Étape 2 : Ajouter la traduction française

Dans la section `fr`:

```typescript
'section.nouvelle.cle': 'Nouveau texte en français',
```

### Étape 3 : Ajouter les autres langues (optionnel)

Pour les autres langues (es, de, zh, it, pt, ru, ja, ko), ajoutez la traduction dans chaque section correspondante.

### Étape 4 : Utiliser dans un composant

```tsx
const { t } = useLanguage();

// Dans le JSX
<p>{t('section.nouvelle.cle')}</p>
```

## 🎯 Composants déjà traduits

Les composants suivants utilisent déjà le système de traduction :

✅ **Navigation & Layout**
- `Layout.tsx` - Navigation complète
- `DashboardTopbar.tsx` - Barre supérieure

✅ **Pages principales**
- `LoginPage.tsx` - Connexion
- `RegisterPage.tsx` - Inscription (RegistrationForm.tsx)
- `DashboardPage.tsx` - Tableau de bord
- `ClientsPage.tsx` - Clients
- `OrdersPage.tsx` - Commandes
- `TasksPage.tsx` - Tâches
- `InvoicesPage.tsx` - Factures
- `CalendarPage.tsx` - Calendrier
- `NetworkPage.tsx` - Réseau
- `StatsPage.tsx` - Statistiques
- `SupportPage.tsx` - Support
- `TemplatesPage.tsx` - Modèles

✅ **Composants**
- `LanguageSwitcher.tsx` - Sélecteur de langue
- `CentralizedSearchBar.tsx` - Barre de recherche

## 🚀 Prochaines étapes

Pour compléter la traduction de l'application, il faudrait :

1. **Mettre à jour les pages restantes** :
   - `ProfilePage.tsx` - Utiliser les clés `profile.*`
   - `OnboardingPage.tsx` - Utiliser les clés `onboarding.*`
   - `UpgradePage.tsx` - Utiliser les clés `upgrade.*`
   - Autres pages spécifiques

2. **Mettre à jour les messages toast** :
   - Remplacer les textes en dur par `t('toast.*')`

3. **Ajouter les traductions manquantes** pour les autres langues (es, de, zh, it, pt, ru, ja, ko)

## 💡 Bonnes pratiques

1. **Toujours utiliser `t()` pour les textes** - Ne jamais mettre de texte en dur
2. **Nomenclature cohérente** - Suivre le pattern `section.sous-section.élément`
3. **Traductions complètes** - Ajouter la traduction pour toutes les langues supportées
4. **Contexte clair** - Les clés doivent être explicites sur leur contenu
5. **Variables dynamiques** - Utiliser `{variable}` pour les contenus dynamiques

Exemple avec variable :
```typescript
// Dans LanguageContext
'templates.used.times': 'Used {count} times',

// Dans le composant
t('templates.used.times').replace('{count}', '5')
// Résultat: "Used 5 times"
```

## 🔄 Changement de langue

L'utilisateur peut changer de langue de deux façons :

1. **Via le LanguageSwitcher** dans la barre de navigation
2. **Programmatiquement** :
```tsx
const { setLanguage } = useLanguage();
setLanguage('fr'); // Changer en français
```

La langue est automatiquement sauvegardée dans `localStorage` et persiste entre les sessions.

## ✨ Résultat

Quand l'utilisateur change de langue :
- ✅ Toute l'interface change instantanément
- ✅ La langue est sauvegardée pour les prochaines visites
- ✅ Aucun rechargement de page nécessaire
- ✅ Tous les textes statiques sont traduits
- ✅ L'expérience utilisateur est fluide

---

**Note** : Ce système est extensible. Pour ajouter une nouvelle langue, il suffit d'ajouter une nouvelle section dans le fichier `LanguageContext.tsx` avec toutes les traductions.

