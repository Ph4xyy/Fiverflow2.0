# Edge Function: assistant-message

Appelle OpenAI de manière sécurisée pour l'assistant AI.

## Configuration

1. Déployer la fonction :
```bash
supabase functions deploy assistant-message
```

2. Configurer la variable d'environnement dans Supabase Dashboard :
- `OPENAI_API_KEY` = ta clé OpenAI

## Utilisation

Appeler depuis le client :
```typescript
const response = await supabase.functions.invoke('assistant-message', {
  body: {
    message: "Crée un client ACME",
    conversationHistory: []
  }
});
```

