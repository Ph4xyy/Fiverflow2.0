-- Migration pour corriger les politiques RLS du storage
-- Cette migration configure les permissions pour l'upload d'images
-- Note: Cette migration doit être appliquée via le dashboard Supabase car elle nécessite des permissions d'admin

-- Instructions pour appliquer cette migration:
-- 1. Va dans ton dashboard Supabase
-- 2. Va dans "SQL Editor" 
-- 3. Colle ce code SQL et exécute-le

-- 1. Créer une politique pour permettre aux utilisateurs authentifiés d'uploader des fichiers
CREATE POLICY IF NOT EXISTS "Users can upload their own files" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Créer une politique pour permettre aux utilisateurs de voir leurs propres fichiers
CREATE POLICY IF NOT EXISTS "Users can view their own files" ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Créer une politique pour permettre aux utilisateurs de mettre à jour leurs propres fichiers
CREATE POLICY IF NOT EXISTS "Users can update their own files" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Créer une politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY IF NOT EXISTS "Users can delete their own files" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Créer une politique pour permettre l'accès public en lecture (pour les URLs publiques)
CREATE POLICY IF NOT EXISTS "Public can view files" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'invoice-assets');
