# Script PowerShell pour corriger les politiques RLS du storage
# Usage: .\scripts\fix-storage-rls.ps1

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

async function fixStorageRLS() {
  console.log('🔍 Vérification des politiques RLS existantes...');
  
  try {
    // Lister les politiques existantes
    const { data: policies, error: listError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage');
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des politiques:', listError.message);
      return;
    }

    console.log('📋 Politiques existantes:', policies.map(p => \`\${p.policyname} (\${p.cmd})\`));

    // Note: Les politiques RLS doivent être créées via SQL car elles nécessitent des permissions d'admin
    console.log('⚠️  Les politiques RLS doivent être appliquées via le SQL Editor de Supabase');
    console.log('📝 Utilisez le code SQL fourni dans le composant StorageRLSDiagnostic');
    
    // Tester l'upload pour voir si les politiques fonctionnent
    console.log('🧪 Test d\'upload...');
    const testFile = new File(['test rls'], 'rls-test.txt', { type: 'text/plain' });
    const testPath = \`test/rls-test-\${Date.now()}.txt\`;
    
    const { error: uploadError } = await supabase.storage
      .from('invoice-assets')
      .upload(testPath, testFile);

    if (uploadError) {
      console.warn('⚠️  Test d\'upload échoué:', uploadError.message);
      console.log('💡 Cela confirme que les politiques RLS doivent être corrigées');
    } else {
      console.log('✅ Test d\'upload réussi');
      await supabase.storage.from('invoice-assets').remove([testPath]);
      console.log('🧹 Fichier de test supprimé');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

fixStorageRLS().then(() => {
  console.log('🏁 Script terminé');
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
});
"@

# Écrire le script temporaire
$tempScript = "temp-fix-rls.js"
$nodeScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
    Write-Host "🚀 Exécution du script de diagnostic RLS..." -ForegroundColor Blue
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

Write-Host "`n📋 Instructions pour corriger les politiques RLS:" -ForegroundColor Yellow
Write-Host "1. Allez dans votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Allez dans SQL Editor" -ForegroundColor White
Write-Host "3. Exécutez le code SQL fourni dans le composant StorageRLSDiagnostic" -ForegroundColor White
Write-Host "4. Ou utilisez le fichier: supabase/migrations/20250127000002_fix_storage_policies_correct.sql" -ForegroundColor White
