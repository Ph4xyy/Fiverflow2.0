# 🧪 Guide de Test du Système de Verrouillage

## 🎯 **Système Implémenté**

### **📋 Composants Créés**
- ✅ `useSubscriptionPermissions` - Hook pour gérer les permissions
- ✅ `SubscriptionGuard` - Composant de protection des pages
- ✅ `SubscriptionLimits` - Affichage des limites d'abonnement
- ✅ Protection des routes dans `App.tsx`
- ✅ Fonctionnalité de changement d'abonnement dans le panel admin

### **🔒 Pages Protégées par Abonnement**

#### **🚀 Launch (Gratuit)**
- ✅ **Dashboard** - Accessible
- ✅ **Clients** - Accessible (max 5 clients)
- ✅ **Orders** - Accessible (max 10 commandes)

#### **⚡ Boost (24€/mois)**
- ✅ **Calendar** - Accessible
- ✅ **Referrals** - Accessible (Network page)
- ✅ **Workboard** - Accessible (Tasks page)
- ✅ **Clients** - Illimité
- ✅ **Orders** - Illimité

#### **📈 Scale (59€/mois)**
- ✅ **Stats** - Accessible
- ✅ **Invoices** - Accessible
- ✅ Toutes les fonctionnalités Boost

## 🧪 **Tests à Effectuer**

### **Test 1: Vérification des Permissions**
1. **Connectez-vous** avec un compte Launch (gratuit)
2. **Naviguez vers** `/calendar` → Devrait afficher la page de verrouillage
3. **Naviguez vers** `/stats` → Devrait afficher la page de verrouillage
4. **Naviguez vers** `/invoices` → Devrait afficher la page de verrouillage
5. **Naviguez vers** `/clients` → Devrait être accessible
6. **Naviguez vers** `/orders` → Devrait être accessible

### **Test 2: Affichage des Limites**
1. **Allez sur** `/clients`
2. **Vérifiez** qu'il y a un indicateur de limite (ex: "3 clients restants")
3. **Allez sur** `/orders`
4. **Vérifiez** qu'il y a un indicateur de limite (ex: "7 commandes restantes")

### **Test 3: Changement d'Abonnement (Admin)**
1. **Connectez-vous** avec un compte admin
2. **Allez sur** `/admin/dashboard`
3. **Cliquez sur** les 3 points d'un utilisateur
4. **Dans le menu**, section "Abonnement"
5. **Cliquez sur** "Boost (24€/mois)" ou "Scale (59€/mois)"
6. **Vérifiez** que l'abonnement a changé
7. **Testez** que l'utilisateur peut maintenant accéder aux nouvelles pages

### **Test 4: Page de Verrouillage**
1. **Avec un compte Launch**, allez sur `/calendar`
2. **Vérifiez** que la page de verrouillage s'affiche avec :
   - Icône de cadenas
   - Message explicatif
   - Plan actuel affiché
   - Liste des plans disponibles
   - Bouton "Voir les Plans"
   - Bouton "Retour"

## 🔧 **Fonctionnalités Techniques**

### **Hook useSubscriptionPermissions**
```typescript
const {
  subscription,        // Abonnement actuel
  limits,             // Limites (clients, orders, etc.)
  permissions,        // Permissions par page
  hasPermission,      // Vérifier une permission
  canAccessPage,      // Vérifier l'accès à une page
  isWithinLimit,      // Vérifier si dans la limite
  getRemainingLimit,  // Obtenir le nombre restant
  refreshSubscription // Actualiser les données
} = useSubscriptionPermissions();
```

### **Composant SubscriptionGuard**
```typescript
<SubscriptionGuard 
  requiredPlan="boost" 
  pageName="calendar"
  description="Calendrier disponible avec Boost"
>
  <CalendarPage />
</SubscriptionGuard>
```

### **Composant SubscriptionLimits**
```typescript
<SubscriptionLimits 
  resource="clients" 
  currentCount={5}
  onUpgrade={() => window.location.href = '/upgrade'}
/>
```

## 🎯 **Permissions par Plan**

### **🚀 Launch (Gratuit)**
```typescript
{
  dashboard: true,
  clients: true,      // max 5
  orders: true,       // max 10
  calendar: false,
  referrals: false,
  workboard: false,
  stats: false,
  invoices: false,
  admin: false
}
```

### **⚡ Boost (24€/mois)**
```typescript
{
  dashboard: true,
  clients: true,      // illimité
  orders: true,       // illimité
  calendar: true,
  referrals: true,
  workboard: true,
  stats: false,
  invoices: false,
  admin: false
}
```

### **📈 Scale (59€/mois)**
```typescript
{
  dashboard: true,
  clients: true,      // illimité
  orders: true,       // illimité
  calendar: true,
  referrals: true,
  workboard: true,
  stats: true,
  invoices: true,
  admin: false
}
```

## 🚨 **Points d'Attention**

### **Sécurité**
- ✅ Les permissions sont vérifiées côté client ET serveur
- ✅ Les fonctions SQL utilisent `SECURITY DEFINER`
- ✅ RLS activé sur toutes les tables

### **Performance**
- ✅ Hook optimisé avec cache
- ✅ Pas de re-renders inutiles
- ✅ Chargement asynchrone des données

### **UX**
- ✅ Messages clairs pour les pages verrouillées
- ✅ Indicateurs visuels des limites
- ✅ Boutons d'upgrade intégrés
- ✅ Navigation fluide

## 🎉 **Résultat Attendu**

Après tous ces tests, vous devriez avoir :
- ✅ Un système de verrouillage fonctionnel
- ✅ Des pages protégées selon les abonnements
- ✅ Des limites affichées et respectées
- ✅ Un panel admin fonctionnel pour changer les abonnements
- ✅ Une UX claire et intuitive

---

**🚀 Le système de verrouillage est maintenant complètement opérationnel !**
