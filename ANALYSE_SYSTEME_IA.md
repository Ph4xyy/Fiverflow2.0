# Analyse du système d'IA - Fiverflow 2.0

## 📊 État actuel du système d'IA

### ✅ Ce qui existe

#### 1. **Interface utilisateur**
- ✅ `src/pages/AIAssistantPage.tsx` - Interface style ChatGPT pour les utilisateurs
- ✅ `src/pages/admin/AdminAIPage.tsx` - Interface AI pour les admins
- ✅ Support FR/EN avec détection automatique
- ✅ Exemples prédéfinis pour faciliter l'utilisation

#### 2. **Moteur d'exécution**
- ✅ `src/lib/assistant/intent.ts` - Parser d'intentions FR/EN avec slash-commands
- ✅ `src/lib/assistant/actions.ts` - Exécution des actions CRUD (tasks, clients, orders, events)
- ✅ `src/lib/assistant/schemas.ts` - Validation Zod
- ✅ `src/lib/assistant/guards.ts` - Sécurité et permissions
- ✅ `src/lib/assistant/usage.ts` - Système de quotas par plan
- ✅ `src/lib/assistant/examples.ts` - Exemples rapides
- ✅ `src/lib/assistant/n8n.ts` - Intégration webhooks n8n

#### 3. **Hooks React**
- ✅ `src/hooks/useAdminAI.ts` - Hook pour l'admin AI

## ❌ Ce qui manque

### 1. **Tables de base de données manquantes**

#### Table `assistant_actions`
Utilisée pour logger toutes les actions de l'assistant :
```sql
CREATE TABLE IF NOT EXISTS assistant_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  resource TEXT NOT NULL,
  payload_json JSONB,
  result_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE assistant_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assistant actions" ON assistant_actions
  FOR SELECT USING (auth.uid() = user_id);
```

#### Table `ai_usage`
Utilisée pour tracker l'usage par mois :
```sql
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ai usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);
```

### 2. **Problèmes de mapping de colonnes**

#### Problème : `owner_id` vs `user_id`
Dans le code de l'assistant (`actions.ts`), on utilise :
- `owner_id` pour tasks et events

Mais dans la base de données (`tasks`, `calendar_events`), les tables utilisent :
- `user_id` au lieu de `owner_id`

**Fichiers à corriger** : `src/lib/assistant/actions.ts`
- Ligne 240 : `owner_id: user.id` → devrait être `user_id: user.id`
- Ligne 269 : `.eq('owner_id', user.id)` → devrait être `.eq('user_id', user.id)`
- Ligne 292 : `.eq('owner_id', user.id)` → devrait être `.eq('user_id', user.id)`
- Etc. pour toutes les références à `owner_id`

### 3. **Table events manquante**

Le code référence une table `events` mais la migration crée `calendar_events`.

**Solution** : Créer une table `events` ou adapter le code pour utiliser `calendar_events`

Si on crée `events` :
```sql
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  related_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events" ON events
  FOR ALL USING (auth.uid() = owner_id);
```

### 4. **Import supabase manquant**

Dans `src/lib/assistant/guards.ts`, ligne 38, `supabase` est utilisé mais non importé.

**Ligne à ajouter** au début du fichier :
```typescript
import { supabase } from '../supabase';
```

### 5. **Table clients sans colonne owner_id**

Dans `actions.ts`, les requêtes vers `clients` ne filtrent pas par `user_id` ou `owner_id`. 
La table `clients` dans la DB n'a pas de colonne `user_id` ou `owner_id`.

**Solution** : Ajouter une colonne `user_id` à la table `clients` :
```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
```

Et mettre à jour les politiques RLS :
```sql
CREATE POLICY IF NOT EXISTS "Users can manage their own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);
```

### 6. **Table orders sans colonne owner_id**

Même problème pour `orders` - elle utilise `user_id` dans la DB mais le code essaie d'utiliser `owner_id`.

### 7. **Variables d'environnement manquantes**

Le code utilise :
- `VITE_N8N_BASE_URL`
- `VITE_N8N_WEBHOOK_SECRET`
- `VITE_ASSISTANT_USAGE_LIMIT_FREE`
- `VITE_ASSISTANT_USAGE_LIMIT_PRO`
- `VITE_ASSISTANT_USAGE_LIMIT_TEAMS`

Ces variables doivent être définies dans `.env` et `.env.example`.

### 8. **Gestion d'erreur manquante dans guards.ts**

La fonction `isAdmin` utilise `supabase` mais elle n'importe pas le module.

## 📋 Checklist de résolution

### À faire immédiatement

1. ✅ Créer la table `assistant_actions`
2. ✅ Créer la table `ai_usage`
3. ✅ Créer la table `events` ou adapter le code
4. ✅ Ajouter l'import `supabase` dans `guards.ts`
5. ✅ Corriger les références `owner_id` → `user_id` dans `actions.ts`
6. ✅ Ajouter `user_id` à la table `clients`
7. ✅ Vérifier que `orders` utilise bien `user_id`
8. ✅ Ajouter les variables d'environnement manquantes
9. ✅ Tester le système d'IA

### Priorité 2

10. Créer des index de performance pour les nouvelles tables
11. Créer des politiques RLS appropriées
12. Tester les limites de quota par plan
13. Configurer les webhooks n8n (optionnel)

## 🎯 Résumé

Le système d'IA est bien architecturé mais **nécessite des migrations de base de données** pour fonctionner. Les principaux problèmes sont :

1. **Tables manquantes** : `assistant_actions`, `ai_usage`, `events`
2. **Mapping incorrect** : `owner_id` vs `user_id`
3. **Imports manquants** : `supabase` dans guards.ts
4. **Colonnes manquantes** : `user_id` dans `clients`
5. **Variables d'environnement** non définies

Une fois ces corrections appliquées, le système devrait fonctionner correctement.

