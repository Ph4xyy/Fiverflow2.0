# Script PowerShell pour créer le bucket invoice-assets
# Usage: .\scripts\create-bucket.ps1

Write-Host "🔍 Vérification des variables d'environnement..." -ForegroundColor Blue

# Vérifier les variables d'environnement
$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl) {
    Write-Host "❌ VITE_SUPABASE_URL non définie" -ForegroundColor Red
    Write-Host "   Définissez-la avec: `$env:VITE_SUPABASE_URL='votre-url'" -ForegroundColor Yellow
    exit 1
}

if (-not $supabaseServiceKey) {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY non définie" -ForegroundColor Red
    Write-Host "   Définissez-la avec: `$env:SUPABASE_SERVICE_ROLE_KEY='votre-cle'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Variables d'environnement trouvées" -ForegroundColor Green

# Créer un fichier temporaire pour le script Node.js
$nodeScript = @"
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  console.log('🔍 Vérification des buckets existants...');
  
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des buckets:', listError.message);
      return;
    }

    console.log('📦 Buckets existants:', buckets.map(b => \`\${b.id} (\${b.public ? 'public' : 'privé'})\`));

    const invoiceAssetsBucket = buckets.find(b => b.id === 'invoice-assets');
    
    if (invoiceAssetsBucket) {
      console.log('✅ Bucket "invoice-assets" existe déjà');
      console.log('   - Public:', invoiceAssetsBucket.public);
      console.log('   - Taille max:', invoiceAssetsBucket.file_size_limit);
      console.log('   - Types autorisés:', invoiceAssetsBucket.allowed_mime_types);
      return;
    }

    console.log('🔨 Création du bucket "invoice-assets"...');
    
    const { data, error } = await supabase.storage.createBucket('invoice-assets', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880
    });

    if (error) {
      console.error('❌ Erreur lors de la création du bucket:', error.message);
      return;
    }

    console.log('✅ Bucket "invoice-assets" créé avec succès!');
    console.log('   - Public: true');
    console.log('   - Taille max: 5MB');
    console.log('   - Types autorisés: image/*');

    console.log('🧪 Test d\'upload...');
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const testPath = \`test/\${Date.now()}/test.txt\`;
    
    const { error: uploadError } = await supabase.storage
      .from('invoice-assets')
      .upload(testPath, testFile);

    if (uploadError) {
      console.warn('⚠️  Test d\'upload échoué:', uploadError.message);
    } else {
      console.log('✅ Test d\'upload réussi');
      await supabase.storage.from('invoice-assets').remove([testPath]);
      console.log('🧹 Fichier de test supprimé');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

createBucket().then(() => {
  console.log('🏁 Script terminé');
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
});
"@

# Écrire le script temporaire
$tempScript = "temp-create-bucket.js"
$nodeScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
    Write-Host "🚀 Exécution du script de création de bucket..." -ForegroundColor Blue
    node $tempScript
} catch {
    Write-Host "❌ Erreur lors de l'exécution du script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    # Nettoyer le fichier temporaire
    if (Test-Path $tempScript) {
        Remove-Item $tempScript
    }
}

Write-Host "`n📋 Instructions manuelles si le script échoue:" -ForegroundColor Yellow
Write-Host "1. Allez dans votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Allez dans Storage > Buckets" -ForegroundColor White
Write-Host "3. Cliquez sur 'New bucket'" -ForegroundColor White
Write-Host "4. Nom: invoice-assets" -ForegroundColor White
Write-Host "5. Public: Oui" -ForegroundColor White
Write-Host "6. File size limit: 5MB" -ForegroundColor White
Write-Host "7. Allowed MIME types: image/*" -ForegroundColor White
