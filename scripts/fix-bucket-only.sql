-- Script pour créer SEULEMENT le bucket avatars
-- Sans toucher aux politiques existantes

-- 1. Créer le bucket avatars (seulement s'il n'existe pas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Vérifier que le bucket a été créé
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'avatars') 
    THEN '✅ Bucket avatars créé avec succès!'
    ELSE '❌ Erreur: Le bucket avatars n''a pas pu être créé'
  END as result;

-- 3. Afficher les informations du bucket
SELECT name, public, created_at 
FROM storage.buckets 
WHERE name = 'avatars';
