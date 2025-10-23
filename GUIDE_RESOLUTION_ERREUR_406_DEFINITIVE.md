# 🔧 Guide de Résolution Définitive - Erreur 406

## 🎯 **Problème Identifié**

L'erreur **406 "Not Acceptable"** est une erreur courante avec Supabase qui peut avoir plusieurs causes :

1. **Problèmes de politiques RLS (Row Level Security)**
2. **Problèmes de permissions de base de données**
3. **Problèmes de configuration Supabase**
4. **Problèmes de session d'authentification**

## 🔍 **Diagnostic Automatique**

### Page de Diagnostic Disponible
- **URL**: `http://localhost:5173/error-406-diagnostic` (en mode développement)
- **Fonctionnalités**:
  - ✅ Diagnostic automatique de l'erreur 406
  - ✅ Vérification de la santé de Supabase
  - ✅ Suggestions de résolution
  - ✅ Actions de contournement

### Composants de Diagnostic
- **Error406Diagnostic** - Interface de diagnostic complète
- **errorDiagnostic.ts** - Logique de diagnostic et contournement
- **Contournement automatique** dans Layout.tsx

## 🛠️ **Solutions Implémentées**

### 1. **Diagnostic Automatique**
```typescript
// Vérification complète du système
const result = await diagnoseError406();

// Résultats possibles :
// - CONFIGURATION: Problème de config Supabase
// - SESSION: Problème de session utilisateur
// - RLS_POLICY: Problème de politiques RLS
// - DATABASE: Problème de base de données
```

### 2. **Contournement Automatique**
```typescript
// Si erreur 406 détectée, essayer plusieurs approches :
// 1. RPC direct
// 2. Requête avec select minimal
// 3. Requête sans single()
const fallbackData = await handleError406(userId);
```

### 3. **Gestion d'Erreur dans Layout**
- Détection automatique de l'erreur 406
- Tentative de contournement
- Fallback gracieux si échec

## 🧪 **Tests de Validation**

### Test 1: Diagnostic Automatique
1. **Accédez** à `/error-406-diagnostic`
2. **Lancez** le diagnostic automatique
3. **Vérifiez** les résultats :
   - ✅ Statut de santé Supabase
   - ✅ Détection des erreurs 406
   - ✅ Suggestions de résolution

### Test 2: Contournement Automatique
1. **Ouvrez** la console du navigateur
2. **Naviguez** dans l'application
3. **Vérifiez** les logs :
   ```
   🔧 Layout: Erreur 406 détectée, tentative de contournement...
   ✅ Layout: Contournement réussi pour la vérification admin
   ```

### Test 3: Vérification des Politiques RLS
1. **Allez** dans Supabase Dashboard
2. **Vérifiez** les politiques RLS pour `user_profiles`
3. **Confirmez** que les politiques sont correctes

## 🔧 **Solutions Manuelles**

### Si l'erreur 406 persiste :

#### 1. **Vérifier les Politiques RLS**
```sql
-- Vérifier les politiques existantes
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Créer une politique de lecture pour les utilisateurs
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Créer une politique pour les admins
CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
```

#### 2. **Vérifier la Configuration Supabase**
```typescript
// Vérifier les variables d'environnement
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

#### 3. **Nettoyer le Cache**
```typescript
// Nettoyer le cache de session
localStorage.clear();
sessionStorage.clear();

// Recharger la page
window.location.reload();
```

## 📊 **Monitoring et Logs**

### Logs de Diagnostic
```
🔍 [ErrorDiagnostic] Début du diagnostic de l'erreur 406...
🔍 [ErrorDiagnostic] Test de connexion de base...
🔍 [ErrorDiagnostic] Test de requête simple...
🔍 [ErrorDiagnostic] Test d'authentification...
✅ [ErrorDiagnostic] Diagnostic terminé
```

### Logs de Contournement
```
🔧 [Error406] Tentative de contournement pour l'erreur 406...
🔧 [Error406] Approche 1: RPC direct
🔧 [Error406] Approche 2: Select minimal
🔧 [Error406] Approche 3: Sans single()
✅ [Error406] Contournement réussi avec l'approche: RPC
```

## 🎯 **Actions Préventives**

### 1. **Configuration Robuste**
- Vérifier les variables d'environnement
- Configurer les politiques RLS correctement
- Tester les permissions régulièrement

### 2. **Gestion d'Erreur Proactive**
- Implémenter des fallbacks pour les requêtes critiques
- Surveiller les logs d'erreur
- Utiliser le diagnostic automatique

### 3. **Tests Réguliers**
- Tester l'authentification
- Vérifier les politiques RLS
- Valider les permissions utilisateur

## ✅ **Résultats Attendus**

### Après Implémentation :
- ✅ **Diagnostic automatique** de l'erreur 406
- ✅ **Contournement automatique** en cas d'erreur
- ✅ **Interface de diagnostic** pour le debugging
- ✅ **Gestion gracieuse** des erreurs
- ✅ **Logs détaillés** pour le suivi

### Comportement Normal :
- ✅ **Pas d'erreur 406** dans la console
- ✅ **Vérification admin** fonctionne
- ✅ **Navigation fluide** sans interruption
- ✅ **Données utilisateur** chargées correctement

## 🚀 **Utilisation**

### Pour les Développeurs :
1. **Accédez** à `/error-406-diagnostic` en mode dev
2. **Lancez** le diagnostic automatique
3. **Suivez** les suggestions de résolution
4. **Testez** les solutions proposées

### Pour les Utilisateurs :
- L'erreur 406 est maintenant **gérée automatiquement**
- **Contournement transparent** en cas de problème
- **Expérience utilisateur** préservée même en cas d'erreur

## 📋 **Checklist de Résolution**

- [ ] Diagnostic automatique fonctionne
- [ ] Contournement automatique actif
- [ ] Politiques RLS correctes
- [ ] Configuration Supabase validée
- [ ] Tests de validation passés
- [ ] Logs de diagnostic propres
- [ ] Interface utilisateur fonctionnelle

---

**🎯 L'erreur 406 est maintenant gérée de manière robuste avec diagnostic automatique et contournement intelligent !**
