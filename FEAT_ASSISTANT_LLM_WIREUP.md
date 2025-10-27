# Feature: Assistant AI avec LLM réel

## ✅ Résumé des changements

Cette feature branche un vrai modèle LLM (GPT-4) derrière la page `/assistant` déjà existante.

### Architecture

```
Frontend (AIAssistantPage.tsx)
    ↓
apiRoute.ts (handleAssistantMessage)
    ↓
llmService.ts (callLLM avec OpenAI)
    ↓
tools.ts (exécution des actions Supabase)
```

### Fichiers créés

1. **src/lib/assistant/systemPrompt.ts**
   - System prompt pour GPT-4
   - Définition des fonctions disponibles

2. **src/lib/assistant/tools.ts**
   - 6 outils implémentés :
     - `create_client`
     - `create_tasks_bulk`
     - `schedule_event`
     - `update_order`
     - `list_items`
     - `delete_items` (nécessite confirmation)
   - Chaque tool vérifie `assertAssistantEntitlement(user)`
   - Log dans `assistant_actions` et `ai_usage`

3. **src/lib/assistant/llmService.ts**
   - Appelle l'API OpenAI
   - Gère les function calls
   - Retourne la réponse textuelle ou exécute un tool

4. **src/lib/assistant/apiRoute.ts**
   - Point d'entrée `handleAssistantMessage(user, request)`
   - Vérifie l'entitlement (plan === "scale")
   - Gère l'historique de conversation
   - Gère les confirmations

### Fichiers modifiés

1. **src/pages/AIAssistantPage.tsx**
   - Appelle `handleAssistantMessage` au lieu de `assistantExecute`
   - Gère l'historique de conversation
   - Affiche le modal d'upgrade si `error === "entitlement_denied"`

## 🔒 Sécurité

- ✅ Toutes les tools vérifient `assertAssistantEntitlement(user)` (plan === "scale")
- ✅ Le `apiRoute` refuse immédiatement si plan !== "scale"
- ✅ RLS Supabase déjà en place
- ✅ Logs dans `assistant_actions` et `ai_usage`

## 🎨 UI

- ✅ Style ChatGPT conservé
- ✅ Dark mode respecté
- ✅ Modèle d'upgrade si plan non-Scale
- ✅ Scrollbar uniquement sur la section messages
- ✅ Responsive

## 🚀 Déploiement

Les tables `assistant_actions` et `ai_usage` sont déjà créées via la migration SQL.

Pour tester :
1. Assure-toi que `VITE_OPENAI_API_KEY` est défini dans `.env`
2. Navigue vers `/assistant` avec un compte plan "scale"
3. Envoie un message comme "Crée un client ACME avec l'email jane@acme.com"

## 📝 Notes importantes

- ❌ Pas de n8n
- ❌ Pas de Stripe/Slack/email dans cette feature
- Les tools réutilisent les fonctions existantes
- Les admins ont accès par défaut (via `assertAssistantEntitlement`)

