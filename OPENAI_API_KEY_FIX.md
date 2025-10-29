# 🔧 Résolution Erreur 401 - Clé API OpenAI

## ❌ **Problème Identifié**

```
api.openai.com/v1/chat/completions:1 Failed to load resource: the server responded with a status of 401 ()
Erreur OpenAI: 401 Incorrect API key provided
```

## 🔍 **Cause du Problème**

La clé API OpenAI n'est pas correctement configurée en production sur Vercel. L'erreur 401 indique que :
1. La variable d'environnement `VITE_OPENAI_API_KEY` n'est pas définie sur Vercel
2. Ou la clé fournie n'est pas valide

## ✅ **Solutions**

### **Solution 1 : Configurer la Variable d'Environnement sur Vercel**

1. **Aller sur Vercel Dashboard** :
   - Ouvrir [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sélectionner votre projet FiverFlow

2. **Configurer la Variable** :
   - Aller dans "Settings" > "Environment Variables"
   - Cliquer sur "Add New"
   - **Name** : `VITE_OPENAI_API_KEY`
   - **Value** : `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`
   - **Environment** : Production, Preview, Development (tous)
   - Cliquer sur "Save"

3. **Redéployer** :
   - Aller dans "Deployments"
   - Cliquer sur "Redeploy" sur le dernier déploiement
   - Ou faire un commit et push pour déclencher un nouveau déploiement

### **Solution 2 : Vérifier la Clé API**

1. **Vérifier sur OpenAI** :
   - Aller sur [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
   - Vérifier que la clé est active
   - Vérifier les quotas et limites

2. **Tester la Clé** :
   ```bash
   curl -H "Authorization: Bearer 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" \
        https://api.openai.com/v1/models
   ```

### **Solution 3 : Debug Local**

Pour tester en local, créer un fichier `.env.local` :

```bash
# Dans le répertoire racine du projet
echo "VITE_OPENAI_API_KEY=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" > .env.local
```

Puis redémarrer le serveur :
```bash
npm run dev
```

## 🔍 **Vérification**

### **1. Vérifier les Variables d'Environnement**

Dans la console du navigateur (production) :
```javascript
console.log('Clé API:', import.meta.env.VITE_OPENAI_API_KEY);
```

Si `undefined`, la variable n'est pas configurée.

### **2. Vérifier les Logs Vercel**

1. Aller dans Vercel Dashboard > Deployments
2. Cliquer sur le dernier déploiement
3. Vérifier les logs de build pour les erreurs

### **3. Test de l'Assistant**

1. Aller sur `https://fiverflow.com/ai-assistant`
2. Poser une question simple
3. Vérifier qu'il n'y a plus d'erreur 401

## 🚨 **Problèmes Courants**

### **Variable d'Environnement Non Définie**
- **Symptôme** : `import.meta.env.VITE_OPENAI_API_KEY` retourne `undefined`
- **Solution** : Configurer la variable sur Vercel

### **Clé API Invalide**
- **Symptôme** : Erreur 401 même avec la variable configurée
- **Solution** : Vérifier la clé sur OpenAI Dashboard

### **Quota Dépassé**
- **Symptôme** : Erreur 429 ou 401
- **Solution** : Vérifier les quotas sur OpenAI

### **Cache de Build**
- **Symptôme** : Ancienne version déployée
- **Solution** : Redéployer ou vider le cache

## 📋 **Checklist de Résolution**

- [ ] Variable `VITE_OPENAI_API_KEY` configurée sur Vercel
- [ ] Clé API valide et active sur OpenAI
- [ ] Redéploiement effectué
- [ ] Test en production réussi
- [ ] Pas d'erreur 401 dans la console

## 🎯 **Résultat Attendu**

Après configuration :
- ✅ L'assistant répond aux questions
- ✅ Pas d'erreur 401 dans la console
- ✅ Messages d'erreur "Impossible de contacter l'assistant" disparaissent
- ✅ Interface de chat fonctionnelle

---

**Une fois la variable configurée sur Vercel, l'assistant devrait fonctionner parfaitement !** 🚀
