# 🗓️ Guide de Test - Calendrier Corrigé

## ✅ **Corrections Appliquées**

### **1. Suppression des Données de Démonstration**
- ✅ Supprimé les événements statiques hardcodés
- ✅ Remplacé par de vraies données depuis la base de données
- ✅ Statistiques calculées en temps réel

### **2. Ajout des Commandes avec Deadlines**
- ✅ Récupération des commandes via `useOrders`
- ✅ Conversion des commandes avec `deadline` en événements
- ✅ Affichage avec icône 📦 pour les commandes

### **3. Amélioration de la Logique de Chargement**
- ✅ Chargement des tâches ET des commandes
- ✅ Indicateur de chargement pendant le fetch
- ✅ Logs détaillés pour le debugging
- ✅ Gestion des erreurs améliorée

## 🧪 **Tests à Effectuer**

### **Test 1: Vérifier les Données dans la Base**
Exécute ce script dans **Supabase SQL Editor** :

```sql
-- Vérifier les commandes avec deadlines
SELECT 
  COUNT(*) as total_orders_with_deadlines
FROM orders 
WHERE deadline IS NOT NULL;

-- Vérifier les tâches avec due_date
SELECT 
  COUNT(*) as total_tasks_with_due_date
FROM tasks 
WHERE due_date IS NOT NULL;

-- Voir quelques exemples
SELECT 
  id, title, deadline, status
FROM orders 
WHERE deadline IS NOT NULL
ORDER BY deadline DESC
LIMIT 3;
```

### **Test 2: Tester l'Application**
1. **Ouvre l'application** : http://localhost:5173/
2. **Va sur la page Calendrier**
3. **Vérifie que** :
   - Les tâches avec `due_date` apparaissent avec 📋
   - Les commandes avec `deadline` apparaissent avec 📦
   - Les statistiques sont correctes
   - Pas d'erreurs dans la console

### **Test 3: Créer des Données de Test**
Si tu ne vois pas d'événements :

1. **Créer une tâche avec deadline** :
   - Va sur la page des tâches
   - Crée une nouvelle tâche
   - Assigne-lui une `due_date`
   - Retourne au calendrier

2. **Créer une commande avec deadline** :
   - Va sur la page des commandes
   - Crée une nouvelle commande
   - Assigne-lui une `deadline`
   - Retourne au calendrier

## 🔍 **Vérifications dans la Console**

Ouvre les **Developer Tools** (F12) et regarde l'onglet **Console** :

Tu devrais voir des messages comme :
```
📅 Loading calendar events...
✅ Calendar events loaded: {
  tasks: 2,
  orders: 1,
  calendar: 0,
  total: 3
}
```

## 🎯 **Résultats Attendus**

### **Si Tu As des Données**
- ✅ Tâches avec `due_date` apparaissent avec 📋
- ✅ Commandes avec `deadline` apparaissent avec 📦
- ✅ Statistiques réelles affichées
- ✅ Navigation du calendrier fonctionne

### **Si Tu N'As Pas de Données**
- ✅ Message "No events today" affiché
- ✅ Statistiques à 0
- ✅ Possibilité de créer des tâches/commandes

## 🐛 **Dépannage**

### **Si Rien N'Apparaît**
1. **Vérifie la console** pour les erreurs
2. **Exécute le script de vérification** SQL
3. **Crée des données de test** avec deadlines
4. **Vérifie que Supabase est configuré**

### **Si Erreurs dans la Console**
1. **Partage les erreurs** exactes
2. **Vérifie que les hooks `useTasks` et `useOrders` fonctionnent**
3. **Vérifie que l'utilisateur est connecté**

## 📊 **Types d'Événements Affichés**

- **📋 Tâches** : Tâches avec `due_date` (heure 09:00)
- **📦 Commandes** : Commandes avec `deadline` (heure 17:00)
- **📅 Événements** : Événements du calendrier (heure définie)

## 🚀 **Prochaines Étapes**

1. **Teste l'application** avec les corrections
2. **Crée des données de test** si nécessaire
3. **Partage les résultats** (ce qui fonctionne/ne fonctionne pas)
4. **Optimise** si nécessaire

---

**🎉 Le calendrier est maintenant connecté aux vraies données ! Teste et dis-moi ce que tu vois !**
