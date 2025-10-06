#!/usr/bin/env node

/**
 * Script pour créer le bucket invoice-assets dans Supabase
 * Usage: node scripts/create-bucket.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  console.log('🔍 Vérification des buckets existants...');
  
  try {
    // Lister les buckets existants
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des buckets:', listError.message);
      return;
    }

    console.log('📦 Buckets existants:', buckets.map(b => `${b.id} (${b.public ? 'public' : 'privé'})`));

    // Vérifier si le bucket invoice-assets existe déjà
    const invoiceAssetsBucket = buckets.find(b => b.id === 'invoice-assets');
    
    if (invoiceAssetsBucket) {
      console.log('✅ Bucket "invoice-assets" existe déjà');
      console.log('   - Public:', invoiceAssetsBucket.public);
      console.log('   - Taille max:', invoiceAssetsBucket.file_size_limit);
      console.log('   - Types autorisés:', invoiceAssetsBucket.allowed_mime_types);
      return;
    }

    console.log('🔨 Création du bucket "invoice-assets"...');
    
    // Créer le bucket
    const { data, error } = await supabase.storage.createBucket('invoice-assets', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('❌ Erreur lors de la création du bucket:', error.message);
      return;
    }

    console.log('✅ Bucket "invoice-assets" créé avec succès!');
    console.log('   - Public: true');
    console.log('   - Taille max: 5MB');
    console.log('   - Types autorisés: image/*');

    // Tester l'upload d'un fichier de test
    console.log('🧪 Test d\'upload...');
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const testPath = `test/${Date.now()}/test.txt`;
    
    const { error: uploadError } = await supabase.storage
      .from('invoice-assets')
      .upload(testPath, testFile);

    if (uploadError) {
      console.warn('⚠️  Test d\'upload échoué:', uploadError.message);
    } else {
      console.log('✅ Test d\'upload réussi');
      
      // Nettoyer le fichier de test
      await supabase.storage.from('invoice-assets').remove([testPath]);
      console.log('🧹 Fichier de test supprimé');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Exécuter le script
createBucket().then(() => {
  console.log('🏁 Script terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
