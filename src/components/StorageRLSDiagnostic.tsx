import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Database, RefreshCw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface RLSDiagnosticResult {
  policiesExist: boolean;
  canUpload: boolean;
  canRead: boolean;
  canDelete: boolean;
  policies: any[];
  error?: string;
  testResults: {
    uploadTest: boolean;
    readTest: boolean;
    deleteTest: boolean;
  };
}

const StorageRLSDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<RLSDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: RLSDiagnosticResult = {
      policiesExist: false,
      canUpload: false,
      canRead: false,
      canDelete: false,
      policies: [],
      testResults: {
        uploadTest: false,
        readTest: false,
        deleteTest: false
      }
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        results.error = 'Supabase non configuré';
        setDiagnostics(results);
        return;
      }

      // Test 1: Vérifier les politiques RLS existantes
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'objects')
        .eq('schemaname', 'storage');

      if (!policiesError && policies) {
        results.policies = policies;
        results.policiesExist = policies.length > 0;
      }

      // Test 2: Tester l'upload d'un fichier de test
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          results.error = 'Utilisateur non connecté';
          setDiagnostics(results);
          return;
        }

        const userId = session.session.user.id;
        const testFile = new File(['test rls'], 'rls-test.txt', { type: 'text/plain' });
        const testPath = `logos/${userId}/rls-test-${Date.now()}.txt`;
        
        const { error: uploadError } = await supabase.storage
          .from('invoice-assets')
          .upload(testPath, testFile);

        results.canUpload = !uploadError;
        results.testResults.uploadTest = !uploadError;

        if (uploadError) {
          console.warn('Upload test failed:', uploadError);
        } else {
          // Test 3: Tester la lecture
          const { data: files, error: listError } = await supabase.storage
            .from('invoice-assets')
            .list(`logos/${userId}`, { limit: 1 });
          
          results.canRead = !listError;
          results.testResults.readTest = !listError;

          // Test 4: Tester la suppression
          const { error: deleteError } = await supabase.storage
            .from('invoice-assets')
            .remove([testPath]);

          results.canDelete = !deleteError;
          results.testResults.deleteTest = !deleteError;

          if (deleteError) {
            console.warn('Delete test failed:', deleteError);
          }
        }
      } catch (testError: any) {
        console.warn('Test error:', testError);
        results.error = `Erreur de test: ${testError.message}`;
      }

      setDiagnostics(results);
    } catch (error: any) {
      results.error = `Erreur générale: ${error.message}`;
      setDiagnostics(results);
    } finally {
      setLoading(false);
    }
  };

  const fixRLSPolicies = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Supabase non configuré');
      return;
    }

    setFixing(true);

    try {
      // Note: Les politiques RLS doivent être créées via SQL car elles nécessitent des permissions d'admin
      toast.info('Les politiques RLS doivent être appliquées via le dashboard Supabase. Voir les instructions ci-dessous.');
      
      // Relancer le diagnostic après un délai
      setTimeout(() => {
        runDiagnostics();
      }, 2000);
    } catch (error: any) {
      console.error('Erreur correction RLS:', error);
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

    if (!diagnostics.policiesExist) {
      recommendations.push(
        <div key="policies" className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            <strong>Action requise:</strong> Aucune politique RLS trouvée pour storage.objects.
          </p>
        </div>
      );
    }

    if (diagnostics.policiesExist && !diagnostics.canUpload) {
      recommendations.push(
        <div key="upload" className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            <strong>Problème:</strong> Impossible d'uploader des fichiers. Les politiques RLS sont incorrectes.
          </p>
        </div>
      );
    }

    if (diagnostics.policiesExist && !diagnostics.canRead) {
      recommendations.push(
        <div key="read" className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            <strong>Problème:</strong> Impossible de lire les fichiers. Vérifiez les politiques de lecture.
          </p>
        </div>
      );
    }

    return recommendations;
  };

  const getSQLInstructions = () => {
    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Instructions SQL pour corriger les politiques RLS
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Exécutez ce code dans le SQL Editor de votre dashboard Supabase :
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;

-- Créer les nouvelles politiques (structure: logos/\${userId}/\${filename})
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
USING (bucket_id = 'invoice-assets');`}
        </pre>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Diagnostic Politiques RLS Storage
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
              Lancer le diagnostic RLS
            </>
          )}
        </button>

        {diagnostics && (!diagnostics.canUpload || !diagnostics.canRead) && (
          <button
            onClick={fixRLSPolicies}
            disabled={fixing}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            {fixing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Correction...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Corriger les politiques
              </>
            )}
          </button>
        )}
      </div>

      {diagnostics && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.policiesExist)}
            <span>Politiques RLS: {diagnostics.policiesExist ? 'Configurées' : 'Manquantes'}</span>
          </div>

          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.testResults.uploadTest)}
            <span>Test upload: {diagnostics.testResults.uploadTest ? 'Réussi' : 'Échoué'}</span>
          </div>

          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.testResults.readTest)}
            <span>Test lecture: {diagnostics.testResults.readTest ? 'Réussi' : 'Échoué'}</span>
          </div>

          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.testResults.deleteTest)}
            <span>Test suppression: {diagnostics.testResults.deleteTest ? 'Réussi' : 'Échoué'}</span>
          </div>

          {diagnostics.policies.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Politiques existantes:</h4>
              <div className="space-y-1">
                {diagnostics.policies.map((policy, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>{policy.policyname} ({policy.cmd})</span>
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

          {diagnostics.policiesExist && diagnostics.canUpload && diagnostics.canRead && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">
                <strong>✓ Configuration correcte!</strong> Les politiques RLS sont correctement configurées.
              </p>
            </div>
          )}

          {getSQLInstructions()}
        </div>
      )}
    </div>
  );
};

export default StorageRLSDiagnostic;
