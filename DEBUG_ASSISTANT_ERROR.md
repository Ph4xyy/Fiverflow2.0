# Debug Assistant AI Error

## Erreur actuelle
"The layout encountered an error. Minimal interface is displayed."

## Modifications effectuées

### 1. Layout.tsx
- ✅ Import de `useSubscriptionPermissions`
- ✅ Appel du hook pour vérifier le plan
- ✅ Calcul `hasAssistantAccess` pour décider d'afficher l'entrée AI

### 2. AIAssistantPage.tsx
- ✅ Import et appel de `useSubscriptionPermissions`
- ✅ Extraction de `subscription`, `isUserAdmin`, `permissionsLoading`
- ✅ Calcul de `hasScaleAccess`
- ✅ Vérifications de loading pour `user` et `permissionsLoading`
- ✅ Écran d'upsell pour non-scale

### 3. guards.ts
- ✅ Fonction `assertAssistantEntitlement()` ajoutée
- ✅ Vérification admin AVANT vérification plan

### 4. actions.ts
- ✅ Suppression de tous les appels webhook n8n
- ✅ Ajout de `await assertAssistantEntitlement(user)`

## Tests à faire

1. Ouvrir les DevTools (Console)
2. Aller sur `/assistant`
3. Vérifier les erreurs dans la console
4. Voir si l'erreur vient de :
   - useSubscriptionPermissions
   - useAuth
   - permissionsLoading qui reste true
   - subscription qui est null

## Points de vérification

- [ ] `user` est défini dans useAuth
- [ ] `permissionsLoading` passe à `false` après chargement
- [ ] `subscription` est bien récupéré
- [ ] `isAdmin` est correctement calculé
- [ ] `hasScaleAccess` est calculé correctement

## Pour déboguer

Ajouter des console.log dans AIAssistantPage.tsx :

```typescript
console.log('AIAssistantPage - user:', user);
console.log('AIAssistantPage - permissions:', permissions);
console.log('AIAssistantPage - subscription:', subscription);
console.log('AIAssistantPage - isUserAdmin:', isUserAdmin);
console.log('AIAssistantPage - permissionsLoading:', permissionsLoading);
console.log('AIAssistantPage - hasScaleAccess:', hasScaleAccess);
```

