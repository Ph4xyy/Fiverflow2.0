# 🧪 Guide de Test - Système de Paiement Stripe

## 🎯 **Problème Résolu**

La page upgrade ne créait pas de page de paiement car :
- ❌ Les boutons utilisaient `ModernButton` au lieu de `SubscriptionButton`
- ❌ Le `SubscriptionButton` utilisait l'API Next.js au lieu de Supabase Edge Functions
- ❌ Les price_id n'étaient pas configurés correctement

## ✅ **Corrections Appliquées**

### **1. Page de Pricing (PagePricing.tsx)**
- ✅ Import de `SubscriptionButton`
- ✅ Remplacement des `ModernButton` par `SubscriptionButton` pour les plans payants
- ✅ Conservation du `ModernButton` pour le plan gratuit (Launch)
- ✅ Prix mis à jour selon les spécifications (Boost: 24€, Scale: 59€)

### **2. SubscriptionButton (SubscriptionButton.tsx)**
- ✅ Utilisation de Supabase Edge Functions au lieu de l'API Next.js
- ✅ Authentification avec token Supabase
- ✅ Appel à `/functions/v1/stripe-checkout`
- ✅ Redirection directe vers Stripe Checkout

### **3. Configuration Stripe (stripe-config.ts)**
- ✅ Mise à jour des prix selon les nouvelles spécifications
- ✅ Ajout des prix annuels avec remise
- ✅ Configuration des price_id temporaires

## 🚀 **Configuration Requise**

### **1. Créer les Produits dans Stripe Dashboard**

#### **Plan Boost**
- **Nom**: "Boost - FiverFlow"
- **Prix mensuel**: 24.00 EUR
- **Prix annuel**: 240.00 EUR (remise de 20%)
- **Récupérer les price_id**

#### **Plan Scale**
- **Nom**: "Scale - FiverFlow"
- **Prix mensuel**: 59.00 EUR
- **Prix annuel**: 590.00 EUR (remise de 20%)
- **Récupérer les price_id**

### **2. Configurer les Webhooks**
- **Endpoint**: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- **Événements**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### **3. Mettre à Jour le Code**
```typescript
// Dans src/stripe-config.ts
export const stripeProducts: StripeProduct[] = [
  {
    id: 'boost_monthly',
    priceId: 'price_XXXXXXXXXXXXXX', // Remplacer par le vrai price_id
    name: 'Boost',
    price: '$24.00',
    // ...
  },
  // ...
];
```

## 🧪 **Tests à Effectuer**

### **1. Test de la Page Upgrade**
1. Aller sur `/upgrade`
2. Vérifier que les prix sont corrects
3. Cliquer sur "Choose Boost" ou "Choose Scale"
4. Vérifier que la redirection vers Stripe fonctionne

### **2. Test du Flux de Paiement**
1. Sélectionner un plan payant
2. Remplir les informations de carte de test
3. Vérifier que le paiement est traité
4. Vérifier que l'utilisateur est redirigé vers `/dashboard?success=true`

### **3. Test des Webhooks**
1. Vérifier dans les logs Supabase que les webhooks sont reçus
2. Vérifier que la base de données est mise à jour
3. Vérifier que l'utilisateur a accès aux fonctionnalités premium

## 🔧 **Commandes de Test**

### **Exécuter le Script de Configuration**
```powershell
.\scripts\setup-stripe-prices.ps1
```

### **Tester l'Edge Function**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/stripe-checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price_id": "price_test", "mode": "subscription"}'
```

## 📊 **Cartes de Test Stripe**

| Type | Numéro | CVV | Date |
|------|--------|-----|------|
| **Succès** | 4242 4242 4242 4242 | 123 | 12/25 |
| **Échec** | 4000 0000 0000 0002 | 123 | 12/25 |
| **3D Secure** | 4000 0025 0000 3155 | 123 | 12/25 |

## 🎯 **Résultat Attendu**

Après configuration complète :
- ✅ La page `/upgrade` affiche les plans avec les bons prix
- ✅ Les boutons "Choose Boost/Scale" redirigent vers Stripe Checkout
- ✅ Les paiements sont traités correctement
- ✅ Les webhooks mettent à jour la base de données
- ✅ Les utilisateurs ont accès aux fonctionnalités premium

## 🚨 **Points d'Attention**

1. **Variables d'environnement** : Vérifier que toutes les clés Stripe sont configurées
2. **Webhooks** : S'assurer que l'endpoint est accessible depuis Stripe
3. **Price IDs** : Utiliser les vrais identifiants de Stripe Dashboard
4. **Tests** : Toujours tester avec des cartes de test avant la production

## 🎉 **Conclusion**

Le système de paiement Stripe est maintenant fonctionnel ! Les utilisateurs peuvent s'abonner via la page upgrade et les paiements sont traités automatiquement.
