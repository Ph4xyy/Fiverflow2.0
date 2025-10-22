# 🚨 Guide de Résolution d'Urgence - Système de Conversation

## ❌ **Erreurs Détectées**

### **1. Erreur SQL : `column reference "conversation_id" is ambiguous`**
- **Cause** : Conflit de noms de colonnes dans la fonction `get_user_conversations`
- **Impact** : Impossible de charger les conversations

### **2. Erreur RLS : `infinite recursion detected in policy`**
- **Cause** : Politiques RLS récursives sur `conversation_participants`
- **Impact** : Impossible de créer des conversations

## 🔧 **Solutions par Ordre de Priorité**

### **Solution 1 : Réparation Complète (Recommandée)**
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier : scripts/fix-conversation-system-errors.sql
```

**Étapes :**
1. Ouvrir Supabase Dashboard
2. Aller dans SQL Editor
3. Copier-coller le contenu de `scripts/fix-conversation-system-errors.sql`
4. Exécuter le script
5. Vérifier que les fonctions sont créées

### **Solution 2 : Désactivation Temporaire RLS (Urgence)**
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier : scripts/disable-conversation-rls-temporarily.sql
```

**⚠️ ATTENTION :** Cette solution désactive la sécurité RLS temporairement.

### **Solution 3 : Nettoyage Complet (Dernier Recours)**
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier : scripts/clean-conversation-system.sql
```

**⚠️ ATTENTION :** Cette solution supprime TOUT le système de conversation.

## 🧪 **Test de Vérification**

### **1. Vérifier les Fonctions**
```sql
-- Vérifier que les fonctions existent
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname IN ('get_user_conversations', 'create_direct_conversation');
```

### **2. Vérifier RLS**
```sql
-- Vérifier l'état RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages');
```

### **3. Test Frontend**
1. Aller sur le profil d'un ami
2. Clic sur "Message"
3. Vérifier que la conversation s'ouvre
4. Envoyer un message
5. Vérifier qu'il n'y a pas d'erreur dans la console

## 📊 **Logs à Surveiller**

### **Console Frontend :**
- ✅ `✅ Système de conversation réel activé`
- ❌ `⚠️ Système de conversation en mode test`
- ❌ `Erreur lors du chargement des conversations`

### **Supabase Logs :**
- ❌ `column reference "conversation_id" is ambiguous`
- ❌ `infinite recursion detected in policy`

## 🚀 **Déploiement**

1. **Exécuter** `scripts/fix-conversation-system-errors.sql`
2. **Tester** le système de conversation
3. **Vérifier** les logs
4. **Commit** les changements si tout fonctionne

## 📞 **Support**

Si les erreurs persistent :
1. Exécuter `scripts/disable-conversation-rls-temporarily.sql`
2. Tester le système
3. Réactiver RLS avec `scripts/fix-conversation-system-errors.sql`
