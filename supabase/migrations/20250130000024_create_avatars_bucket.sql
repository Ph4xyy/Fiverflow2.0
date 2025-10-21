-- Migration pour créer le bucket avatars pour les images de profil
-- Ce bucket stockera les avatars et bannières des utilisateurs

-- Créer le bucket avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS pour permettre aux utilisateurs authentifiés de voir toutes les images
CREATE POLICY "Public avatars are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Politique RLS pour permettre aux utilisateurs de télécharger leurs propres images
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS pour permettre aux utilisateurs de mettre à jour leurs propres images
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Vérifier que le bucket a été créé
SELECT 'Bucket avatars créé avec succès!' as status;
