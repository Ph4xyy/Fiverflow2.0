# Corrections du système d'IA - Complet

## ✅ Corrections effectuées

### 1. **Import manquant corrigé**
- Fichier : `src/lib/assistant/guards.ts`
- Ajout de l'import : `import { supabase } from '../supabase';`

### 2. **Mapping owner_id → user_id**
- Fichier : `src/lib/assistant/actions.ts`
- Toutes les requêtes sur `tasks` maintenant utilisent `user_id` au lieu de `owner_id`
- Toutes les requêtes sur `events` gardent `owner_id` (car c'est la colonne de la table)

### 3. **Ajout de user_id pour clients et orders**
- Fichier : `src/lib/assistant/actions.ts`
- Toutes les insertions, lectures, mises à jour et suppressions filtrent maintenant par `user_id`
- Garantit que chaque utilisateur ne voit que ses propres données

### 4. **Correction des schémas pour orders**
- Fichier : `src/lib/assistant/schemas.ts`
- Ajout de `budget` (colonne principale de la DB)
- Ajout de `amount` (pour compatibilité)
- Ajout de `deadline` (pour compatibilité)
- Les deux champs sont supportés

### 5. **Mapping données pour orders**
- Fichier : `src/lib/assistant/actions.ts`
- Les fonctions `createOrder` et `updateOrder` mappent maintenant correctement les données
- `amount` → `budget` dans la DB
- `deadline` → `due_date` dans la DB

## 📋 Ce qui reste à faire

### 1. **Appliquer la migration SQL**
Exécuter la migration pour créer les tables manquantes :
```bash
cd supabase
supabase migration up --file 20250130000033_create_ai_system_tables.sql
```

Ou manuellement dans Supabase Dashboard :
```sql
-- Exécuter le contenu de : supabase/migrations/20250130000033_create_ai_system_tables.sql
```

Cette migration crée :
- Table `assistant_actions` (logs des actions IA)
- Table `ai_usage` (suivi des quotas)
- Table `events` (pour le système d'événements)
- Ajoute `user_id` à la table `clients` si manquante
- Crée les index et politiques RLS

### 2. **Variables d'environnement**
Ajouter dans `.env` :
```env
# n8n Webhooks (optionnel)
VITE_N8N_BASE_URL=https://votre-instance-n8n.com
VITE_N8N_WEBHOOK_SECRET=votre-secret

# Quotas par plan (optionnel, valeurs par défaut disponibles)
VITE_ASSISTANT_USAGE_LIMIT_FREE=100
VITE_ASSISTANT_USAGE_LIMIT_PRO=2000
VITE_ASSISTANT_USAGE_LIMIT_TEAMS=10000
```

### 3. **Vérifier les colonnes dans la DB**
Vérifier que la table `tasks` a bien toutes les colonnes :
```sql
-- Dans Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
```

Si manquant, ajouter :
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
```

### 4. **Tester le système**
1. Se connecter à l'application
2. Aller sur `/ai-assistant`
3. Tester quelques commandes :
   - "Créer une tâche test"
   - "Liste mes tâches"
   - "Ajouter un client Acme Corp"
   - "Créer une commande Site web 2000€"

## 🎯 État actuel

### ✅ Fonctionnel
- Interface UI complète (ChatGPT-style)
- Parser d'intentions FR/EN
- Slash-commands
- Validation Zod
- Guards de sécurité
- Système de quotas
- Exemples prédéfinis

### ⚠️ Requiert migration DB
- Tables `assistant_actions` (CRITIQUE)
- Table `ai_usage` (CRITIQUE)
- Table `events` (nécessaire pour les événements)
- Colonne `user_id` sur `clients` (si manquante)

### 📝 Next steps
1. ✅ Toutes les corrections de code sont terminées
2. ⏳ Appliquer la migration SQL
3. ⏳ Ajouter les variables d'environnement
4. ⏳ Tester le système

## 🔍 Fichiers modifiés

1. `src/lib/assistant/guards.ts` - Import supabase ajouté
2. `src/lib/assistant/actions.ts` - Mapping user_id corrigé pour toutes les ressources
3. `src/lib/assistant/schemas.ts` - Schémas orders mis à jour pour support budget/amount
4. `supabase/migrations/20250130000033_create_ai_system_tables.sql` - **NOUVELLE MIGRATION CRITIQUE**

## 🚨 Action requise IMMÉDIATE

**Exécuter la migration SQL pour que le système fonctionne !**

Sans cette migration, le système d'IA ne peut pas :
- Logger les actions (erreur sur table `assistant_actions`)
- Tracker les quotas (erreur sur table `ai_usage`)
- Créer des événements (erreur sur table `events`)

Une fois la migration appliquée, le système devrait être 100% fonctionnel.

