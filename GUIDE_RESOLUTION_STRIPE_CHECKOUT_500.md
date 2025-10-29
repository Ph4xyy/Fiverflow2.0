# 🔧 Guide de Résolution - Erreur 500 Stripe Checkout

## 🎯 **Problème Identifié**

**Erreur** : `POST https://arnuyyyryvbfcvqauqur.supabase.co/functions/v1/stripe-checkout 500 (Internal Server Error)`
**Message** : `Failed to fetch customer information`

## 🔍 **Cause Racine**

L'Edge Function `stripe-checkout` essaie d'accéder aux tables `stripe_customers` et `stripe_subscriptions` qui n'existent pas dans la base de données.

## ✅ **Solution Appliquée**

### **1. Migration SQL Créée**
- **Fichier** : `supabase/migrations/20250130000026_create_stripe_tables.sql`
- **Tables créées** :
  - `stripe_customers` - Mapping utilisateurs/clients Stripe
  - `stripe_subscriptions` - Abonnements Stripe
  - `stripe_products` - Produits Stripe (cache)
  - `stripe_prices` - Prix Stripe (cache)

### **2. Structure des Tables**

#### **stripe_customers**
```sql
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_id TEXT UNIQUE, -- ID Stripe
  email TEXT,
  created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);
```

#### **stripe_subscriptions**
```sql
CREATE TABLE stripe_subscriptions (
  id UUID PRIMARY KEY,
  customer_id TEXT, -- ID client Stripe
  subscription_id TEXT UNIQUE, -- ID abonnement Stripe
  status TEXT, -- 'active', 'canceled', etc.
  price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ
);
```

### **3. Politiques RLS Configurées**
- Utilisateurs peuvent voir leurs propres clients Stripe
- Utilisateurs peuvent voir leurs propres abonnements
- Produits et prix en lecture publique

## 🚀 **Étapes de Résolution**

### **Étape 1: Appliquer la Migration**
```sql
-- Dans Supabase SQL Editor
\i supabase/migrations/20250130000026_create_stripe_tables.sql
```

### **Étape 2: Vérifier les Tables**
```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'stripe_%';
```

### **Étape 3: Tester l'Edge Function**
1. Aller sur `/upgrade`
2. Cliquer sur "Choose Boost" ou "Choose Scale"
3. Vérifier qu'il n'y a plus d'erreur 500

### **Étape 4: Vérifier les Logs**
- Supabase Dashboard > Edge Functions > stripe-checkout
- Vérifier qu'il n'y a plus d'erreurs dans les logs

## 🧪 **Tests de Validation**

### **Test 1: Création de Client Stripe**
```sql
-- Vérifier qu'un client est créé lors du premier paiement
SELECT * FROM stripe_customers WHERE user_id = 'your-user-id';
```

### **Test 2: Session de Checkout**
- Doit rediriger vers `https://checkout.stripe.com/...`
- Pas d'erreur 500 dans la console

### **Test 3: Logs Edge Function**
- Pas d'erreur "Failed to fetch customer information"
- Logs de création de client Stripe

## 📊 **Résultats Attendus**

Après application de la migration :
- ✅ **Pas d'erreur 500** dans stripe-checkout
- ✅ **Pas d'erreur "Failed to fetch customer information"**
- ✅ **Redirection vers Stripe Checkout**
- ✅ **Client Stripe créé** dans la base de données
- ✅ **Logs Edge Function** sans erreur

## 🔧 **Commandes de Vérification**

### **Vérifier les Tables**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('stripe_customers', 'stripe_subscriptions');
```

### **Vérifier les Clients**
```sql
SELECT user_id, customer_id, email, created_at 
FROM stripe_customers 
ORDER BY created_at DESC;
```

### **Vérifier les Abonnements**
```sql
SELECT customer_id, subscription_id, status, created_at 
FROM stripe_subscriptions 
ORDER BY created_at DESC;
```

## 🚨 **Dépannage**

### **Si l'erreur 500 persiste :**
1. Vérifier que la migration est appliquée
2. Vérifier les variables d'environnement
3. Redéployer l'Edge Function
4. Vérifier les permissions RLS

### **Si "Failed to fetch customer information" persiste :**
1. Vérifier que la table `stripe_customers` existe
2. Vérifier les permissions sur la table
3. Vérifier que l'utilisateur est authentifié

## 🎉 **Conclusion**

Le problème était l'absence des tables Stripe nécessaires. Avec la migration appliquée, l'Edge Function devrait fonctionner correctement et permettre la création de sessions de paiement Stripe.

### **Prochaines Étapes**
1. Appliquer la migration
2. Tester le flux de paiement
3. Configurer les webhooks Stripe
4. Tester les paiements avec des cartes de test
