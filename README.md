# Fiverflow

## Problème: Bucket invoice-assets n'existe pas

Si vous rencontrez l'erreur "bucket invoice-assets n'existe pas", voici comment la résoudre :

### Solution automatique (recommandée)

1. **Via l'interface web** :
   - Allez dans votre profil (onglet "Diagnostic & Debug")
   - Utilisez le composant "Diagnostic Bucket invoice-assets"
   - Cliquez sur "Créer le bucket" si nécessaire

2. **Via script PowerShell** (Windows) :
   ```powershell
   # Définir vos variables d'environnement
   $env:VITE_SUPABASE_URL="votre-url-supabase"
   $env:SUPABASE_SERVICE_ROLE_KEY="votre-cle-service"
   
   # Exécuter le script
   .\scripts\create-bucket.ps1
   ```

3. **Via script Node.js** :
   ```bash
   # Définir vos variables d'environnement
   export VITE_SUPABASE_URL="votre-url-supabase"
   export SUPABASE_SERVICE_ROLE_KEY="votre-cle-service"
   
   # Exécuter le script
   node scripts/create-bucket.js
   ```

### Solution manuelle

1. Allez dans votre dashboard Supabase
2. Allez dans **Storage > Buckets**
3. Cliquez sur **"New bucket"**
4. Configurez le bucket :
   - **Nom** : `invoice-assets`
   - **Public** : Oui
   - **File size limit** : 5MB
   - **Allowed MIME types** : `image/*`
5. Cliquez sur **"Create bucket"**

### Vérification

Après création du bucket, les fonctionnalités suivantes devraient fonctionner :
- Upload de logos dans les templates de facture
- Affichage des images dans les factures
- Gestion des assets utilisateur

### Migration SQL

Si vous préférez utiliser les migrations SQL, exécutez :
```sql
-- Dans le SQL Editor de Supabase
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoice-assets',
  'invoice-assets', 
  true,
  5242880, -- 5MB
  ARRAY['image/*']
)
ON CONFLICT (id) DO NOTHING;
```

## Problème: Erreur RLS "new row violates row-level security policy"

Si vous rencontrez cette erreur lors de l'upload de fichiers, les politiques RLS sont incorrectes.

### Solution automatique

1. **Via l'interface web** :
   - Allez dans votre profil → onglet "Diagnostic & Debug"
   - Utilisez le composant "Diagnostic Politiques RLS Storage"
   - Suivez les instructions SQL affichées

2. **Via script PowerShell** :
   ```powershell
   .\scripts\fix-storage-rls.ps1
   ```

### Solution manuelle (SQL)

Exécutez ce code dans le SQL Editor de Supabase :

```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;

-- Créer les nouvelles politiques (structure: logos/${userId}/${filename})
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
)
WITH CHECK (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'invoice-assets' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'invoice-assets');
```

### Vérification

Après correction des politiques RLS, les fonctionnalités suivantes devraient fonctionner :
- Upload de logos sans erreur RLS
- Affichage des images dans les factures
- Suppression des fichiers par les utilisateurs
