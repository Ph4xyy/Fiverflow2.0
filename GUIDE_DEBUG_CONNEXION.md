# 🔍 Guide de Debug - Problème de Connexion

## 🎯 **Problème Identifié**

Sur votre autre ordinateur, votre compte test n'est pas correctement connecté :
- Message "Layout: Pas d'utilisateur connecté"
- Nom de profil affiché : "Utilisateur"
- Session non persistée

## 🔧 **Logs de Debug Ajoutés**

J'ai ajouté des logs de debug détaillés pour identifier le problème :

### **📊 Logs d'Authentification (AuthContext)**
```javascript
🔐 AuthContext: Récupération de la session initiale...
🔐 AuthContext: Session récupérée: [user_id] email: [email]
🔐 Auth state changed: [event] [user_id] email: [email]
```

### **📋 Logs de Layout**
```javascript
🔍 Layout: Pas d'utilisateur connecté
🔍 Layout: Vérification admin pour user: [user_id]
```

### **👤 Logs de Profil**
```javascript
🔍 ProfilePage: Pas d'utilisateur connecté
🔍 ProfilePage: Chargement du profil pour user: [user_id] email: [email]
🔍 ProfilePage: Données du profil: { data: {...}, error: {...} }
```

## 🧪 **Tests de Debug à Effectuer**

### **Test 1: Vérifier la Session Initiale**
1. **Ouvrez** la console du navigateur (F12)
2. **Rechargez** la page
3. **Regardez** les logs d'authentification :
   ```
   🔐 AuthContext: Récupération de la session initiale...
   🔐 AuthContext: Session récupérée: [user_id] email: [email]
   ```
4. **Vérifiez** si une session est récupérée

### **Test 2: Vérifier les Changements d'État**
1. **Connectez-vous** avec votre compte test
2. **Regardez** les logs :
   ```
   🔐 Auth state changed: SIGNED_IN [user_id] email: [email]
   ```
3. **Vérifiez** que l'événement est `SIGNED_IN`

### **Test 3: Vérifier le Chargement du Profil**
1. **Allez** sur la page de profil
2. **Regardez** les logs :
   ```
   🔍 ProfilePage: Chargement du profil pour user: [user_id] email: [email]
   🔍 ProfilePage: Données du profil: { data: {...}, error: {...} }
   ```
3. **Vérifiez** que les données du profil sont chargées

### **Test 4: Vérifier la Persistance**
1. **Fermez** l'onglet
2. **Rouvrez** l'application
3. **Regardez** si la session est automatiquement restaurée

## 🔍 **Diagnostic du Problème**

### **✅ Si la session est récupérée**
- Le problème vient de l'affichage du nom
- Les données du profil ne sont pas chargées correctement

### **❌ Si aucune session n'est récupérée**
- Le problème vient de la persistance de session
- La session n'est pas stockée dans localStorage

### **❌ Si l'événement n'est pas SIGNED_IN**
- Le problème vient du processus de connexion
- La connexion n'est pas complétée

## 🛠️ **Solutions Possibles**

### **Solution 1: Problème de Persistance**
Si la session n'est pas récupérée :
- Vérifier le localStorage du navigateur
- Vérifier les paramètres de session Supabase
- Vérifier les cookies du navigateur

### **Solution 2: Problème de Données de Profil**
Si la session existe mais le nom est "Utilisateur" :
- Vérifier que le profil existe dans `user_profiles`
- Vérifier que `full_name` est défini
- Vérifier les permissions RLS

### **Solution 3: Problème de Connexion**
Si la connexion ne fonctionne pas :
- Vérifier les identifiants
- Vérifier la configuration Supabase
- Vérifier les erreurs de réseau

## 📋 **Informations à Fournir**

Après avoir effectué les tests, fournissez-moi :

1. **Logs d'authentification** (AuthContext)
2. **Logs de layout** (Layout)
3. **Logs de profil** (ProfilePage)
4. **Description** de ce qui se passe vs ce qui devrait se passer

## 🔧 **Actions de Debug Supplémentaires**

### **Vérifier le localStorage**
1. **Ouvrez** les outils de développement (F12)
2. **Allez** dans l'onglet "Application" ou "Storage"
3. **Regardez** dans "Local Storage" pour `supabase.auth.token`
4. **Vérifiez** si le token existe

### **Vérifier la Base de Données**
1. **Connectez-vous** à Supabase
2. **Allez** dans "Table Editor" > "user_profiles"
3. **Vérifiez** que votre compte test a un profil
4. **Vérifiez** que `full_name` est défini

### **Vérifier les Erreurs Réseau**
1. **Ouvrez** l'onglet "Network" dans les outils de développement
2. **Rechargez** la page
3. **Regardez** les requêtes vers Supabase
4. **Vérifiez** s'il y a des erreurs 401, 403, ou 500

## 🎯 **Résultat Attendu**

### **✅ Comportement Correct**
- **Session récupérée** automatiquement au chargement
- **Nom d'utilisateur** affiché correctement
- **Profil chargé** depuis la base de données
- **Persistance** entre les onglets

### **❌ Comportement Problématique**
- **Aucune session** récupérée
- **Nom "Utilisateur"** affiché
- **Erreurs** dans les logs
- **Pas de persistance** entre les onglets

---

**🔍 Effectuez ces tests et partagez-moi les logs pour que je puisse identifier et corriger le problème de connexion !**
