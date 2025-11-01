# Fix: Erreur "Database error saving new user"

## Problème
Lors de la création d'un nouveau compte, une erreur "Database error saving new user" se produit.

## Cause
La fonction `handle_new_user()` appelait `generate_unique_username()`, qui pouvait échouer à cause des politiques RLS (Row Level Security) lors de la vérification de l'existence d'un username.

## Solution appliquée
1. **Intégration de la génération de username** : La logique de génération de username a été intégrée directement dans `handle_new_user()` pour éviter les problèmes RLS
2. **Gestion d'erreur améliorée** : Ajout d'un bloc `EXCEPTION` pour capturer les erreurs sans bloquer la création de l'utilisateur
3. **Vérification du trigger** : Le trigger `on_auth_user_created` est maintenant recréé dans la migration

## Fichier modifié
- `supabase/migrations/20250210000000_fix_user_profile_rls.sql`

## Pour appliquer la correction

### Option 1: Via Supabase Dashboard
1. Allez dans votre projet Supabase
2. Naviguez vers **SQL Editor**
3. Copiez le contenu de `supabase/migrations/20250210000000_fix_user_profile_rls.sql`
4. Exécutez la migration

### Option 2: Via CLI Supabase
```bash
# Si vous utilisez Supabase CLI
supabase db reset
# ou
supabase migration up
```

### Option 3: Appliquer uniquement la fonction corrigée
Si vous voulez juste corriger la fonction sans relancer toute la migration :

```sql
-- Recréer la fonction handle_new_user avec la correction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
  username_exists BOOLEAN;
BEGIN
  -- Obtenir le username de base
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Nettoyer le username de base (enlever caractères spéciaux, limiter la longueur)
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');
  base_username := left(base_username, 15); -- Limiter à 15 caractères
  
  -- Si le username est vide après nettoyage, utiliser "user"
  IF base_username = '' OR base_username IS NULL THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- Vérifier si le username existe déjà (avec bypass RLS grâce à SECURITY DEFINER)
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.user_profiles 
      WHERE username = final_username
    ) INTO username_exists;
    
    -- Si le username n'existe pas, on peut l'utiliser
    IF NOT username_exists THEN
      EXIT;
    END IF;
    
    -- Sinon, ajouter un numéro
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
    
    -- Sécurité : éviter les boucles infinies
    IF counter > 999 THEN
      final_username := base_username || extract(epoch from now())::bigint::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  generated_username := final_username;
  
  -- Insérer dans user_profiles avec le username généré
  INSERT INTO public.user_profiles (
    email, 
    username, 
    subscription, 
    role, 
    created_at,
    user_id,
    full_name
  )
  VALUES (
    NEW.email,
    generated_username,
    'Lunch',
    'member',
    NOW(),
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas bloquer la création de l'utilisateur auth
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Retourner NEW quand même pour ne pas bloquer l'inscription
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que le trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
```

## Vérification
Après avoir appliqué la correction, testez en créant un nouveau compte. L'inscription devrait maintenant fonctionner correctement.

## Notes
- La fonction `handle_new_user()` utilise `SECURITY DEFINER` pour bypasser les politiques RLS lors de la création du profil
- Si une erreur survient, elle sera loggée mais n'empêchera pas la création de l'utilisateur dans `auth.users`
- Le username est automatiquement généré de manière unique même si plusieurs utilisateurs ont le même email de base

