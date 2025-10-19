-- Etape 10: Fonction pour récupérer les emails des utilisateurs
-- Créer une fonction SQL pour récupérer les emails depuis auth.users

CREATE OR REPLACE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE(id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Permissions pour la fonction
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO authenticated;

-- Vérifier que la fonction a été créée
SELECT 'Fonction get_user_emails créée avec succès!' as status;
