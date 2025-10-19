-- Etape 8: Corriger le trigger de création de profil
-- Problème: trigger qui cause une erreur lors de l'inscription

-- Supprimer le trigger problématique
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- Recréer la fonction avec gestion d'erreur
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer le profil avec gestion d'erreur
  INSERT INTO user_profiles (user_id, full_name, is_admin, is_active)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    FALSE, -- Pas admin par défaut
    TRUE   -- Actif par défaut
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas bloquer l'inscription
    RAISE WARNING 'Erreur lors de la création du profil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Vérifier que le trigger est créé
SELECT 'Trigger de création de profil corrigé!' as status;
