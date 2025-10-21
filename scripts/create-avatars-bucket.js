/**
 * Script pour créer le bucket avatars dans Supabase
 * À exécuter manuellement dans la console Supabase ou via l'API
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacer par vos vraies valeurs)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAvatarsBucket() {
  try {
    console.log('🔄 Création du bucket avatars...');
    
    // Créer le bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (error) {
      console.error('❌ Erreur lors de la création du bucket:', error);
      return;
    }

    console.log('✅ Bucket avatars créé avec succès:', data);

    // Créer les politiques RLS
    console.log('🔄 Création des politiques RLS...');
    
    // Politique pour voir toutes les images
    const { error: selectError } = await supabase.rpc('create_storage_policy', {
      policy_name: 'Public avatars are viewable by everyone',
      table_name: 'objects',
      policy_definition: "bucket_id = 'avatars'",
      policy_operation: 'SELECT'
    });

    if (selectError) {
      console.warn('⚠️ Erreur lors de la création de la politique SELECT:', selectError);
    }

    // Politique pour uploader ses propres images
    const { error: insertError } = await supabase.rpc('create_storage_policy', {
      policy_name: 'Users can upload their own avatars',
      table_name: 'objects',
      policy_definition: "bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]",
      policy_operation: 'INSERT'
    });

    if (insertError) {
      console.warn('⚠️ Erreur lors de la création de la politique INSERT:', insertError);
    }

    console.log('✅ Politiques RLS créées avec succès');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
createAvatarsBucket();
