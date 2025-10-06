import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react';

const StorageDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<{
    bucketExists: boolean;
    bucketPublic: boolean;
    policiesExist: boolean;
    canUpload: boolean;
    canRead: boolean;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {
      bucketExists: false,
      bucketPublic: false,
      policiesExist: false,
      canUpload: false,
      canRead: false,
      error: undefined as string | undefined
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        results.error = 'Supabase non configuré';
        setDiagnostics(results);
        return;
      }

      // Test 1: Vérifier si le bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        results.error = `Erreur buckets: ${bucketsError.message}`;
        setDiagnostics(results);
        return;
      }

      const invoiceAssetsBucket = buckets.find(b => b.id === 'invoice-assets');
      results.bucketExists = !!invoiceAssetsBucket;
      results.bucketPublic = invoiceAssetsBucket?.public || false;

      // Test 2: Vérifier les politiques RLS
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'objects')
        .eq('schemaname', 'storage');

      if (!policiesError && policies) {
        results.policiesExist = policies.length > 0;
      }

      // Test 3: Tester l'upload d'un petit fichier de test
      if (results.bucketExists) {
        try {
          const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
          const testPath = `test/${Date.now()}/test.txt`;
          
          const { error: uploadError } = await supabase.storage
            .from('invoice-assets')
            .upload(testPath, testFile);

          results.canUpload = !uploadError;
          
          if (!uploadError) {
            // Nettoyer le fichier de test
            await supabase.storage.from('invoice-assets').remove([testPath]);
          }
        } catch (uploadTestError: any) {
          results.error = `Erreur test upload: ${uploadTestError.message}`;
        }
      }

      // Test 4: Tester la lecture
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('invoice-assets')
          .list('', { limit: 1 });
        
        results.canRead = !listError;
      } catch (readError: any) {
        results.error = `Erreur test lecture: ${readError.message}`;
      }

      setDiagnostics(results);
    } catch (error: any) {
      results.error = `Erreur générale: ${error.message}`;
      setDiagnostics(results);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getRecommendations = () => {
    if (!diagnostics) return null;

    const recommendations = [];

    if (!diagnostics.bucketExists) {
      recommendations.push(
        <div key="bucket" className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            <strong>Action requise:</strong> Le bucket 'invoice-assets' n'existe pas. 
            Exécutez la migration SQL pour le créer.
          </p>
        </div>
      );
    }

    if (diagnostics.bucketExists && !diagnostics.bucketPublic) {
      recommendations.push(
        <div key="public" className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            <strong>Recommandation:</strong> Le bucket n'est pas public. 
            Les URLs publiques ne fonctionneront pas.
          </p>
        </div>
      );
    }

    if (!diagnostics.policiesExist) {
      recommendations.push(
        <div key="policies" className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            <strong>Action requise:</strong> Aucune politique RLS trouvée. 
            Exécutez la migration SQL pour créer les politiques.
          </p>
        </div>
      );
    }

    if (diagnostics.policiesExist && !diagnostics.canUpload) {
      recommendations.push(
        <div key="upload" className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            <strong>Problème:</strong> Impossible d'uploader des fichiers. 
            Vérifiez les politiques RLS et les permissions.
          </p>
        </div>
      );
    }

    return recommendations;
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Database className="w-5 h-5" />
        Diagnostic Storage Supabase
      </h3>
      
      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic storage'}
      </button>

      {diagnostics && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.bucketExists)}
            <span>Bucket 'invoice-assets' existe: {diagnostics.bucketExists ? 'Oui' : 'Non'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.bucketPublic)}
            <span>Bucket public: {diagnostics.bucketPublic ? 'Oui' : 'Non'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.policiesExist)}
            <span>Politiques RLS: {diagnostics.policiesExist ? 'Configurées' : 'Manquantes'}</span>
          </div>

          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.canUpload)}
            <span>Upload possible: {diagnostics.canUpload ? 'Oui' : 'Non'}</span>
          </div>

          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.canRead)}
            <span>Lecture possible: {diagnostics.canRead ? 'Oui' : 'Non'}</span>
          </div>

          {diagnostics.error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Erreur:</strong> {diagnostics.error}
              </p>
            </div>
          )}

          {getRecommendations()}

          {diagnostics.bucketExists && diagnostics.policiesExist && diagnostics.canUpload && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">
                <strong>✓ Configuration correcte!</strong> Le storage est correctement configuré.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StorageDiagnostic;
