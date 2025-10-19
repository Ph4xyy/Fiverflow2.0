# 👑 Guide de Test - Promotion/Rétrogradation Admin

## 🎯 **Fonctionnalité Activée**

### **✅ Promotion Admin**
- ✅ **Promouvoir un utilisateur** en administrateur
- ✅ **Utilisation de la fonction SQL** `promote_user_to_admin`
- ✅ **Vérification des permissions** admin requises
- ✅ **Mise à jour automatique** des rôles et permissions

### **✅ Rétrogradation Admin**
- ✅ **Rétrograder un admin** en utilisateur normal
- ✅ **Utilisation de la fonction SQL** `demote_admin_to_user`
- ✅ **Vérification des permissions** admin requises
- ✅ **Mise à jour automatique** des rôles et permissions

## 🧪 **Tests à Effectuer**

### **Test 1: Promotion User → Admin**
1. **Connectez-vous** avec un compte admin
2. **Allez** sur `/admin/dashboard`
3. **Trouvez** un utilisateur avec le statut "Utilisateur" (pas admin)
4. **Cliquez** sur le menu d'action (⋮) de cet utilisateur
5. **Cliquez** sur "Promouvoir Admin" (bouton bleu avec icône Crown)
6. **Vérifiez** qu'un message s'affiche : `✅ Utilisateur promu administrateur avec succès!`
7. **Vérifiez** que le menu se ferme automatiquement
8. **Vérifiez** que la colonne "Admin" passe de "Utilisateur" à "Admin"
9. **Vérifiez** que la colonne "Rôle" passe à "Admin"

### **Test 2: Rétrogradation Admin → User**
1. **Trouvez** un utilisateur avec le statut "Admin"
2. **Cliquez** sur le menu d'action (⋮) de cet utilisateur
3. **Cliquez** sur "Retirer Admin" (bouton rouge avec icône UserX)
4. **Vérifiez** qu'un message s'affiche : `✅ Utilisateur rétrogradé en utilisateur normal avec succès!`
5. **Vérifiez** que le menu se ferme automatiquement
6. **Vérifiez** que la colonne "Admin" passe de "Admin" à "Utilisateur"
7. **Vérifiez** que la colonne "Rôle" passe à "User"

### **Test 3: Vérification des Permissions**
1. **Promouvez** un utilisateur en admin
2. **Connectez-vous** avec ce nouvel admin
3. **Vérifiez** qu'il a accès à `/admin/dashboard`
4. **Vérifiez** qu'il voit le badge "Administrateur" dans son profil
5. **Vérifiez** qu'il a accès à toutes les pages (même celles normalement verrouillées)

### **Test 4: Rétrogradation et Vérification**
1. **Rétrogradez** l'admin en utilisateur normal
2. **Connectez-vous** avec cet utilisateur
3. **Vérifiez** qu'il n'a plus accès à `/admin/dashboard`
4. **Vérifiez** qu'il ne voit plus le badge "Administrateur"
5. **Vérifiez** qu'il est soumis aux restrictions d'abonnement

### **Test 5: Gestion des Erreurs**
1. **Testez** avec un utilisateur inexistant (si possible)
2. **Vérifiez** que les messages d'erreur s'affichent correctement
3. **Vérifiez** que l'interface ne se casse pas en cas d'erreur

## 🔧 **Fonctionnalités Techniques**

### **👑 Promotion Admin**
```typescript
// Utilisation de la fonction SQL
const { data, error } = await supabase
  .rpc('promote_user_to_admin', {
    target_user_id: userId,
    admin_user_id: user?.id // ID de l'admin qui fait le changement
  });
```

### **⬇️ Rétrogradation Admin**
```typescript
// Utilisation de la fonction SQL
const { data, error } = await supabase
  .rpc('demote_admin_to_user', {
    target_user_id: userId,
    admin_user_id: user?.id // ID de l'admin qui fait le changement
  });
```

### **🔄 Mise à Jour Automatique**
- **Rechargement** des données utilisateurs
- **Mise à jour** des statistiques
- **Fermeture** automatique du menu
- **Feedback** visuel immédiat

## 📊 **Logs de Debug**

### **Console Logs Attendus**
```javascript
// Promotion admin
🔍 AdminDashboard: Changement de statut admin pour user: [user_id] actuel: false
🔍 AdminDashboard: Utilisateur promu admin avec succès: [data]

// Rétrogradation admin
🔍 AdminDashboard: Changement de statut admin pour user: [user_id] actuel: true
🔍 AdminDashboard: Admin rétrogradé avec succès: [data]
```

## 🎯 **Résultats Attendus**

### **✅ Promotion Admin**
- **Message de succès** : `✅ Utilisateur promu administrateur avec succès!`
- **Colonne "Admin"** : Passe de "Utilisateur" à "Admin"
- **Colonne "Rôle"** : Passe à "Admin"
- **Badge admin** : Apparaît dans le profil de l'utilisateur
- **Accès admin** : L'utilisateur peut accéder au panel admin

### **✅ Rétrogradation Admin**
- **Message de succès** : `✅ Utilisateur rétrogradé en utilisateur normal avec succès!`
- **Colonne "Admin"** : Passe de "Admin" à "Utilisateur"
- **Colonne "Rôle"** : Passe à "User"
- **Badge admin** : Disparaît du profil de l'utilisateur
- **Accès admin** : L'utilisateur n'a plus accès au panel admin

### **✅ Interface**
- **Boutons colorés** : Bleu pour promotion, Rouge pour rétrogradation
- **Icônes appropriées** : Crown pour promotion, UserX pour rétrogradation
- **Menu se ferme** automatiquement après action
- **Mise à jour immédiate** du tableau

## 🚨 **Points d'Attention**

### **⚠️ Sécurité**
- **Vérification admin** requise pour toutes les promotions/rétrogradations
- **Fonctions SQL** avec `SECURITY DEFINER`
- **Logs** de toutes les actions admin
- **Impossibilité** de se rétrograder soi-même

### **⚠️ Permissions**
- **Seuls les admins** peuvent promouvoir/rétrograder
- **Vérification** de l'ID de l'admin qui fait l'action
- **RLS** respecté pour toutes les opérations
- **Cascade** des permissions (admin → accès complet)

### **⚠️ Interface**
- **Feedback immédiat** avec messages de succès/erreur
- **Mise à jour automatique** des données
- **Fermeture du menu** après action
- **Rechargement** des statistiques

## 🎉 **Fonctionnalités Complètes**

### **✅ Gestion des Rôles**
- ✅ **Promotion** User → Admin
- ✅ **Rétrogradation** Admin → User
- ✅ **Changement d'abonnement** (Launch/Boost/Scale)
- ✅ **Activation/Désactivation** des comptes

### **✅ Interface Admin**
- ✅ **Menu d'action** pour chaque utilisateur
- ✅ **Boutons colorés** selon l'action
- ✅ **Messages de feedback** informatifs
- ✅ **Mise à jour automatique** des données

---

**👑 La fonctionnalité de promotion/rétrogradation admin est maintenant entièrement opérationnelle !**

**Vous pouvez maintenant promouvoir et rétrograder les utilisateurs directement depuis le panel admin !** ✅
