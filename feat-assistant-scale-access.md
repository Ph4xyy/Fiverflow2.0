# feat/assistant-scale-access

## 🎯 Résumé

Migration complète du système Assistant AI pour le restreindre au plan **Scale** uniquement, avec suppression de toute dépendance n8n.

## ✅ Modifications

### 1. **Suppression du code n8n**
- ❌ Supprimé : `src/lib/assistant/n8n.ts`
- ❌ Supprimé : Tous les imports et appels webhook dans `actions.ts`
- ✅ Nettoyé : Variables d'environnement `N8N_*` de `env.example`

### 2. **Restriction d'accès au plan Scale**
- ✅ Ajout de `assertAssistantEntitlement()` dans `guards.ts`
- ✅ Vérification au début de `assistantExecute()` dans `actions.ts`
- ✅ Limites de quota mises à jour : retourne 0 pour free/boost
- ✅ Hook `useSubscriptionPermissions` utilisé pour vérifier le plan

### 3. **Interface utilisateur**
- ✅ **Layout/Sidebar** : Section AI masquée si `plan !== 'scale'`
- ✅ **Page `/assistant`** :
  - Écran d'upsell cohérent avec le thème pour les plans free/boost
  - 3 avantages listés
  - Bouton "Voir les plans" → `/billing`
  - Chat complet pour le plan Scale uniquement

### 4. **Gestion des erreurs**
- ✅ Erreur `entitlement_denied` gérée dans l'UI
- ✅ Message clair : "Assistant AI réservé au plan Scale"

## 📁 Fichiers modifiés

```
src/lib/assistant/
├── actions.ts          ✅ Suppression n8n, ajout entitlement check
├── guards.ts           ✅ Ajout assertAssistantEntitlement()
├── usage.ts            ✅ Limites 0 pour free/boost
└── n8n.ts              ❌ SUPPRIMÉ

src/pages/
└── AIAssistantPage.tsx ✅ Écran upsell + restriction plan

src/components/
└── Layout.tsx          ✅ Sidebar masquée si pas scale

env.example             ✅ Variables n8n retirées
```

## 🧪 Tests

```bash
# Vérifier les imports
pnpm build

# Vérifier les tests
pnpm test
```

## 📝 Checklist

- [x] Suppression complète du code n8n
- [x] Fonction d'entitlement ajoutée
- [x] Limites de quota pour free/boost = 0
- [x] Sidebar masquée si pas scale
- [x] Page assistant avec upsell
- [x] Variables d'env nettoyées
- [x] Aucune erreur de lint
- [x] Documentation complète

## 🚀 Déploiement

Aucun changement de base de données requis. Les tables `assistant_actions` et `ai_usage` existent déjà.

## 📊 Fonctionnement

### Pour les plans free/boost
1. L'entrée "AI ▸ Assistant" n'apparaît pas dans la sidebar
2. Si accès direct à `/assistant` → écran d'upsell
3. Aucune action IA possible

### Pour le plan scale
1. Entrée "AI ▸ Assistant" visible dans la sidebar
2. Chat complet avec toutes les fonctionnalités
3. 10000 requêtes/mois incluses
4. Actions CRUD sur tasks, clients, orders, events

## 🎨 Interface Upsell

L'écran d'upsell affiche :
- 🧠 Titre : "Assistant AI (réservé au plan Scale)"
- 📝 Description explicative
- ✅ 3 avantages :
  - Création multi-tâches en une commande
  - Actions directes sur clients et commandes
  - Planification intelligente dans le calendrier
- 🚀 Bouton CTA : "Voir les plans" → `/billing`

## ✨ Améliorations

- Code plus simple (pas de n8n)
- Expérience utilisateur claire (upsell vs chat)
- Sécurité renforcée (vérification d'entitlement)
- Thème cohérent (dark mode respecté)

