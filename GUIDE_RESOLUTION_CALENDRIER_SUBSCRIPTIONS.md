# 🔧 Guide de Résolution des Problèmes - Calendrier et Subscriptions

## 🎯 **Problèmes Identifiés et Corrigés**

### **1. 🗓️ Problème du Calendrier**

#### **Problème**
- Le calendrier affichait des données statiques (hardcodées) au lieu des vraies tâches
- Aucune connexion avec la base de données
- Les tâches avec `due_date` n'apparaissaient pas dans le calendrier

#### **Solution Appliquée**
```typescript
// Avant: Données statiques
const [events, setEvents] = useState<Event[]>([
  { id: '1', title: 'Client meeting', date: '2024-01-15', ... }
]);

// Après: Connexion avec la DB
const { tasks } = useTasks();
useEffect(() => {
  // Récupérer les événements du calendrier
  const calendarData = await supabase.from('calendar_events').select('*');
  
  // Convertir les tâches en événements
  const taskEvents = tasks.filter(task => task.due_date).map(task => ({
    id: `task-${task.id}`,
    title: task.title,
    date: task.due_date!,
    type: 'deadline',
    priority: task.priority
  }));
  
  setEvents([...taskEvents, ...calendarEventObjects]);
}, [user, tasks]);
```

### **2. 💳 Problème de la Section Subscription**

#### **Problème**
- Le hook `useSubscriptions` cherchait dans une table `subscriptions` inexistante
- Le système d'abonnement utilise `user_subscriptions` et `subscription_plans`
- Erreurs de connexion à la base de données

#### **Solution Appliquée**
```typescript
// Avant: Mauvaise table
const { data } = await supabase.from('subscriptions').select('*');

// Après: Bonnes tables avec jointure
const { data } = await supabase
  .from('user_subscriptions')
  .select(`
    *,
    subscription_plans!inner(
      name, display_name, price_monthly, price_yearly,
      currency, max_projects, max_clients, features
    )
  `)
  .eq('user_id', user.id);
```

### **3. 📋 Problème des Tâches**

#### **Problème**
- Les tâches n'étaient pas synchronisées avec le calendrier
- Le composant `TodoTable` avait une fonction `ensureCalendarSync` non utilisée

#### **Solution Appliquée**
- Création de la table `calendar_events` pour stocker les événements
- Synchronisation automatique des tâches avec `due_date` vers le calendrier
- Amélioration du hook `useTasks` pour une meilleure gestion des données

## 🛠️ **Fichiers Modifiés**

### **1. `src/pages/CalendarPageNew.tsx`**
- ✅ Ajout des imports nécessaires (`useTasks`, `supabase`, `useAuth`)
- ✅ Remplacement des données statiques par des données dynamiques
- ✅ Ajout de la logique de récupération des événements depuis la DB
- ✅ Conversion des tâches en événements du calendrier

### **2. `src/hooks/useSubscriptions.ts`**
- ✅ Correction de la requête pour utiliser `user_subscriptions`
- ✅ Ajout de la jointure avec `subscription_plans`
- ✅ Transformation des données pour correspondre à l'interface
- ✅ Gestion d'erreur améliorée avec fallback

### **3. `supabase/migrations/20250130000021_create_calendar_events.sql`**
- ✅ Création de la table `calendar_events`
- ✅ Index pour les performances
- ✅ RLS (Row Level Security) pour la sécurité
- ✅ Triggers pour `updated_at`

## 🚀 **Comment Appliquer les Corrections**

### **Étape 1: Appliquer la Migration**
```bash
# Dans le terminal
supabase db push
```

### **Étape 2: Redémarrer l'Application**
```bash
npm run dev
```

### **Étape 3: Tester les Fonctionnalités**
1. **Calendrier**: Vérifier que les tâches avec `due_date` apparaissent
2. **Subscriptions**: Vérifier que la section se charge sans erreur
3. **Tâches**: Créer une tâche avec `due_date` et vérifier qu'elle apparaît dans le calendrier

## 🔍 **Vérifications Post-Correction**

### **Calendrier**
- [ ] Les tâches avec `due_date` apparaissent dans le calendrier
- [ ] Les événements sont correctement formatés
- [ ] La navigation entre les mois fonctionne
- [ ] Les filtres fonctionnent correctement

### **Subscriptions**
- [ ] La section se charge sans erreur
- [ ] Les données d'abonnement sont récupérées
- [ ] L'interface s'affiche correctement
- [ ] Pas d'erreurs dans la console

### **Tâches**
- [ ] Les tâches se chargent correctement
- [ ] La synchronisation avec le calendrier fonctionne
- [ ] Les tâches avec `due_date` créent des événements

## 🐛 **Dépannage**

### **Si le calendrier ne s'affiche pas**
1. Vérifier que Supabase est configuré
2. Vérifier que l'utilisateur est connecté
3. Vérifier les logs de la console pour les erreurs

### **Si les subscriptions ne se chargent pas**
1. Vérifier que les tables `user_subscriptions` et `subscription_plans` existent
2. Vérifier que l'utilisateur a des données d'abonnement
3. Vérifier les permissions RLS

### **Si les tâches ne se synchronisent pas**
1. Vérifier que la table `calendar_events` existe
2. Vérifier que les tâches ont des `due_date`
3. Vérifier les logs de synchronisation

## 📊 **Résultats Attendus**

Après application des corrections :

1. **Calendrier fonctionnel** avec les vraies tâches
2. **Section subscription** qui se charge sans erreur
3. **Synchronisation** entre tâches et calendrier
4. **Interface utilisateur** améliorée et cohérente

## 🎯 **Prochaines Étapes**

1. **Tester** toutes les fonctionnalités
2. **Créer des tâches** avec `due_date` pour tester
3. **Vérifier** que les événements apparaissent dans le calendrier
4. **Optimiser** les performances si nécessaire

---

**✅ Les corrections sont maintenant appliquées et prêtes à être testées !**
