-- Migration pour corriger les politiques RLS du storage
-- Cette migration configure les permissions pour l'upload d'images

-- 1. Activer RLS sur le bucket invoice-assets (si pas déjà fait)
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- 2. Créer une politique pour permettre aux utilisateurs authentifiés d'uploader des fichiers
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Créer une politique pour permettre aux utilisateurs de voir leurs propres fichiers
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Créer une politique pour permettre aux utilisateurs de mettre à jour leurs propres fichiers
CREATE POLICY "Users can update their own files" ON storage.objects
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

-- 5. Créer une politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Créer une politique pour permettre l'accès public en lecture (pour les URLs publiques)
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'invoice-assets');

-- 7. S'assurer que le bucket invoice-assets existe et est public
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-assets', 'invoice-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. Activer RLS sur les objets de storage (si pas déjà fait)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
