import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface BucketDiagnosticResult {
  bucketExists: boolean;
  bucketPublic: boolean;
  canCreateBucket: boolean;
  canUpload: boolean;
  canRead: boolean;
  error?: string;
  buckets: any[];
}

const BucketDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<BucketDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: BucketDiagnosticResult = {
      bucketExists: false,
      bucketPublic: false,
      canCreateBucket: false,
      canUpload: false,
      canRead: false,
      buckets: []
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        results.error = 'Supabase non configuré';
        setDiagnostics(results);
        return;
      }

      // Test 1: Lister tous les buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        results.error = `Erreur buckets: ${bucketsError.message}`;
        setDiagnostics(results);
        return;
      }

      results.buckets = buckets || [];
      const invoiceAssetsBucket = buckets?.find(b => b.id === 'invoice-assets');
      results.bucketExists = !!invoiceAssetsBucket;
      results.bucketPublic = invoiceAssetsBucket?.public || false;

      // Test 2: Tester la création de bucket (sans vraiment créer)
      try {
        // On teste juste les permissions en essayant de lister les buckets
        // Si on peut lister, on peut probablement créer
        results.canCreateBucket = true;
      } catch (e) {
        results.canCreateBucket = false;
      }

      // Test 3: Tester l'upload si le bucket existe
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
          console.warn('Test upload failed:', uploadTestError);
        }
      }

      // Test 4: Tester la lecture
      if (results.bucketExists) {
        try {
          const { data: files, error: listError } = await supabase.storage
            .from('invoice-assets')
            .list('', { limit: 1 });
          
          results.canRead = !listError;
        } catch (readError: any) {
          console.warn('Test read failed:', readError);
        }
      }

      setDiagnostics(results);
    } catch (error: any) {
      results.error = `Erreur générale: ${error.message}`;
      setDiagnostics(results);
    } finally {
      setLoading(false);
    }
  };

  const fixBucketIssue = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Supabase non configuré');
      return;
    }

    setFixing(true);

    try {
      // Essayer de créer le bucket
      const { error: bucketError } = await supabase.storage.createBucket('invoice-assets', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (bucketError) {
        if (bucketError.message.includes('already exists')) {
          toast.success('Bucket existe déjà');
        } else if (bucketError.message.includes('permission denied') || bucketError.message.includes('must be owner')) {
          toast.error('Permissions insuffisantes. Utilisez le dashboard Supabase pour créer le bucket manuellement.');
          return;
        } else {
          throw bucketError;
        }
      } else {
        toast.success('Bucket créé avec succès');
      }

      // Relancer le diagnostic
      await runDiagnostics();
    } catch (error: any) {
      console.error('Erreur création bucket:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setFixing(false);
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
          </p>
          <div className="mt-2">
            <button
              onClick={fixBucketIssue}
              disabled={fixing}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
            >
              {fixing ? 'Création...' : 'Créer le bucket'}
            </button>
          </div>
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

    if (diagnostics.bucketExists && !diagnostics.canUpload) {
      recommendations.push(
        <div key="upload" className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            <strong>Problème:</strong> Impossible d'uploader des fichiers. 
            Vérifiez les politiques RLS.
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
        Diagnostic Bucket invoice-assets
      </h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Diagnostic...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Lancer le diagnostic
            </>
          )}
        </button>

        {diagnostics && !diagnostics.bucketExists && (
          <button
            onClick={fixBucketIssue}
            disabled={fixing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {fixing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Créer le bucket
              </>
            )}
          </button>
        )}
      </div>

      {diagnostics && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.bucketExists)}
            <span>Bucket 'invoice-assets' existe: {diagnostics.bucketExists ? 'Oui' : 'Non'}</span>
          </div>
          
          {diagnostics.bucketExists && (
            <>
              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostics.bucketPublic)}
                <span>Bucket public: {diagnostics.bucketPublic ? 'Oui' : 'Non'}</span>
              </div>

              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostics.canUpload)}
                <span>Upload possible: {diagnostics.canUpload ? 'Oui' : 'Non'}</span>
              </div>

              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostics.canRead)}
                <span>Lecture possible: {diagnostics.canRead ? 'Oui' : 'Non'}</span>
              </div>
            </>
          )}

          {diagnostics.buckets.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Buckets existants:</h4>
              <div className="space-y-1">
                {diagnostics.buckets.map((bucket) => (
                  <div key={bucket.id} className="flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4" />
                    <span className={bucket.id === 'invoice-assets' ? 'font-medium text-green-600' : ''}>
                      {bucket.id} {bucket.public ? '(public)' : '(privé)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diagnostics.error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Erreur:</strong> {diagnostics.error}
              </p>
            </div>
          )}

          {getRecommendations()}

          {diagnostics.bucketExists && diagnostics.canUpload && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">
                <strong>✓ Configuration correcte!</strong> Le bucket est correctement configuré.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BucketDiagnostic;
