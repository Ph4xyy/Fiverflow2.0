# 🤖 Guide de Configuration de l'Assistant IA FiverFlow

## 📋 Vue d'ensemble

L'Assistant IA FiverFlow est un système intelligent intégré qui aide les utilisateurs à optimiser leur workflow freelance. Il utilise OpenAI GPT-4 pour fournir des conseils personnalisés et des réponses contextuelles.

## 🚀 Fonctionnalités

### ✨ **Assistant Chat Complet**
- Interface de chat intuitive avec historique de conversation
- Suggestions de questions rapides
- Réponses en temps réel avec indicateur de chargement
- Gestion des erreurs et fallbacks

### 🎯 **Widget Flottant**
- Bouton flottant accessible depuis toutes les pages
- Interface compacte et moderne
- Questions rapides prédéfinies
- Ouverture/fermeture fluide

### 🧠 **Intelligence Contextuelle**
- Connaissance approfondie de FiverFlow
- Conseils personnalisés pour freelancers
- Optimisation des workflows
- Gestion des clients et projets

## 🛠️ Configuration

### 1. **Variables d'environnement**

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Configuration OpenAI
VITE_OPENAI_API_KEY=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

# Limite d'utilisation pour le plan Scale
VITE_ASSISTANT_USAGE_LIMIT_TEAMS=10000
```

### 2. **Installation des dépendances**

```bash
npm install openai
```

### 3. **Configuration du système**

L'assistant est configuré avec un prompt système spécialisé pour FiverFlow :

```typescript
const SYSTEM_PROMPT = `Tu es l'assistant IA de FiverFlow, une plateforme de gestion pour freelancers et entrepreneurs.

CONTEXTE:
- FiverFlow aide les freelancers à gérer leurs clients, commandes, factures et statistiques
- La plateforme propose 3 plans: Lunch (gratuit), Boost (premium), Scale (entreprise)
- Les utilisateurs peuvent gérer leurs projets, clients, commandes et générer des factures
- Il y a un système de parrainage et de commissions

TON RÔLE:
- Aider les utilisateurs avec leurs questions sur FiverFlow
- Expliquer les fonctionnalités de la plateforme
- Guider les utilisateurs dans l'utilisation des outils
- Proposer des conseils pour optimiser leur workflow freelance
- Répondre aux questions techniques de manière claire et professionnelle
`;
```

## 📁 Structure des fichiers

```
src/
├── lib/
│   └── openai.ts                 # Configuration OpenAI et classe Assistant
├── components/
│   ├── AssistantChat.tsx         # Interface de chat complète
│   └── AssistantWidget.tsx       # Widget flottant
└── pages/
    └── AIAssistantPage.tsx       # Page dédiée à l'assistant
```

## 🎨 Interface utilisateur

### **Page Assistant IA** (`/ai-assistant`)
- Interface complète avec onglets
- Présentation des fonctionnalités
- Chat intégré en plein écran
- Actions rapides et suggestions

### **Widget Flottant**
- Bouton flottant en bas à droite
- Interface modale compacte
- Questions rapides prédéfinies
- Accessible depuis toutes les pages

## 🔧 Utilisation

### **Pour les utilisateurs :**

1. **Accès via le menu** : Cliquez sur "Assistant IA" dans la sidebar
2. **Widget flottant** : Cliquez sur le bouton violet en bas à droite
3. **Questions suggérées** : Utilisez les questions prédéfinies pour commencer
4. **Chat libre** : Posez vos questions personnalisées

### **Questions populaires :**
- "Comment gérer mes clients efficacement ?"
- "Quelle est la différence entre les plans Lunch, Boost et Scale ?"
- "Comment créer une facture professionnelle ?"
- "Comment optimiser mon workflow freelance ?"
- "Comment utiliser le système de parrainage ?"

## ⚙️ Configuration avancée

### **Personnalisation du prompt système**

Modifiez `src/lib/openai.ts` pour ajuster le comportement de l'assistant :

```typescript
const SYSTEM_PROMPT = `Votre prompt personnalisé ici...`;
```

### **Limites d'utilisation**

Configurez les limites par plan dans `env.example` :

```env
# Limite pour le plan Scale (équipes)
VITE_ASSISTANT_USAGE_LIMIT_TEAMS=10000

# Limite pour le plan Boost (individuel)
VITE_ASSISTANT_USAGE_LIMIT_BOOST=1000

# Limite pour le plan Lunch (gratuit)
VITE_ASSISTANT_USAGE_LIMIT_LUNCH=100
```

### **Modèle OpenAI**

Changez le modèle dans `src/lib/openai.ts` :

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini', // ou 'gpt-4', 'gpt-3.5-turbo'
  // ...
});
```

## 🔒 Sécurité

### **Clé API**
- La clé OpenAI est exposée côté client (nécessaire pour le fonctionnement)
- Utilisez des limites de taux dans OpenAI Dashboard
- Surveillez l'utilisation via les logs OpenAI

### **Validation des entrées**
- Tous les messages utilisateur sont validés
- Limitation de la longueur des messages
- Gestion des erreurs robuste

## 📊 Monitoring

### **Logs de l'assistant**
```typescript
// Les erreurs sont loggées dans la console
console.error('Erreur OpenAI:', error);

// L'utilisation des tokens est trackée
console.log('Usage tokens:', response.usage);
```

### **Métriques importantes**
- Nombre de requêtes par utilisateur
- Tokens consommés
- Taux d'erreur
- Temps de réponse

## 🚀 Déploiement

### **Variables d'environnement de production**

Assurez-vous que ces variables sont configurées sur Vercel :

```env
VITE_OPENAI_API_KEY=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
VITE_ASSISTANT_USAGE_LIMIT_TEAMS=10000
```

### **Vérification post-déploiement**

1. Testez l'assistant sur `/ai-assistant`
2. Vérifiez le widget flottant
3. Testez quelques questions
4. Vérifiez les logs d'erreur

## 🐛 Dépannage

### **Problèmes courants**

1. **"Impossible de contacter l'assistant"**
   - Vérifiez la clé API OpenAI
   - Vérifiez la connexion internet
   - Consultez les logs de la console

2. **Réponses vides ou incomplètes**
   - Vérifiez les limites de tokens
   - Vérifiez les quotas OpenAI
   - Testez avec des questions plus simples

3. **Widget ne s'affiche pas**
   - Vérifiez que `AssistantWidget` est importé dans `Layout.tsx`
   - Vérifiez les styles CSS
   - Consultez les erreurs de la console

### **Logs de débogage**

Activez les logs détaillés :

```typescript
// Dans src/lib/openai.ts
console.log('Envoi message:', userMessage);
console.log('Réponse OpenAI:', response);
```

## 📈 Optimisations futures

### **Fonctionnalités à ajouter**
- [ ] Sauvegarde des conversations
- [ ] Export des conversations
- [ ] Intégration avec les données utilisateur
- [ ] Suggestions contextuelles basées sur l'historique
- [ ] Support multilingue
- [ ] Intégration avec les webhooks Discord

### **Améliorations techniques**
- [ ] Cache des réponses fréquentes
- [ ] Compression des messages
- [ ] Optimisation des tokens
- [ ] Rate limiting côté client

---

**Assistant IA FiverFlow** - Votre partenaire intelligent pour le freelancing 🚀
