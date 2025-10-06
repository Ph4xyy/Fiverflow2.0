-- Migration pour corriger les politiques RLS du storage
-- Cette migration corrige les politiques pour correspondre à la structure de fichiers réelle
-- Structure: logos/${userId}/${unique}.${ext}

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;

-- 1. Politique pour permettre aux utilisateurs authentifiés d'uploader des fichiers
-- Structure: logos/${userId}/${filename} - l'ID utilisateur est dans le 2ème dossier
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 2. Politique pour permettre aux utilisateurs de voir leurs propres fichiers
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 3. Politique pour permettre aux utilisateurs de mettre à jour leurs propres fichiers
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
)
WITH CHECK (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 4. Politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 5. Politique pour permettre l'accès public en lecture (pour les URLs publiques)
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'invoice-assets');

-- 6. Politique alternative plus permissive pour les tests (à supprimer en production)
-- Cette politique permet à tous les utilisateurs authentifiés d'uploader dans invoice-assets
-- CREATE POLICY "Authenticated users can upload to invoice-assets" ON storage.objects
-- FOR INSERT 
-- TO authenticated
-- WITH CHECK (bucket_id = 'invoice-assets');

-- 7. Politique alternative pour la lecture (à supprimer en production)
-- CREATE POLICY "Authenticated users can read from invoice-assets" ON storage.objects
-- FOR SELECT 
-- TO authenticated
-- USING (bucket_id = 'invoice-assets');
