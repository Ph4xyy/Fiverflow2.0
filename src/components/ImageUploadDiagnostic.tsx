import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ImageUploadDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<{
    supabase: boolean;
    session: boolean;
    storage: boolean;
    buckets: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {
      supabase: false,
      session: false,
      storage: false,
      buckets: [] as string[]
    };

    try {
      // Test 1: Supabase configuré
      results.supabase = isSupabaseConfigured && !!supabase;

      if (results.supabase) {
        // Test 2: Session utilisateur
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        results.session = !sessionError && !!sessionData.session;

        // Test 3: Storage accessible
        try {
          const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
          results.storage = !bucketsError;
          results.buckets = bucketsData?.map(b => b.name) || [];
        } catch (storageError) {
          console.error('Storage error:', storageError);
          results.storage = false;
        }
      }

      setDiagnostics(results);
    } catch (error) {
      console.error('Diagnostic error:', error);
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

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Diagnostic d'upload d'images
      </h3>
      
      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
      </button>

      {diagnostics && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.supabase)}
            <span>Supabase configuré: {diagnostics.supabase ? 'Oui' : 'Non'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.session)}
            <span>Session utilisateur: {diagnostics.session ? 'Active' : 'Inactive'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.storage)}
            <span>Storage accessible: {diagnostics.storage ? 'Oui' : 'Non'}</span>
          </div>

          {diagnostics.buckets.length > 0 && (
            <div>
              <p className="font-medium mb-2">Buckets disponibles:</p>
              <ul className="list-disc list-inside space-y-1">
                {diagnostics.buckets.map(bucket => (
                  <li key={bucket} className="text-sm">
                    {bucket}
                    {bucket === 'invoice-assets' && (
                      <span className="text-green-500 ml-2">✓ (utilisé par l'app)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!diagnostics.supabase && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Problème:</strong> Supabase n'est pas configuré. Vérifiez les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.
              </p>
            </div>
          )}

          {diagnostics.supabase && !diagnostics.session && (
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                <strong>Problème:</strong> Aucune session utilisateur active. Vous devez être connecté pour uploader des images.
              </p>
            </div>
          )}

          {diagnostics.supabase && diagnostics.session && !diagnostics.storage && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Problème:</strong> Le storage Supabase n'est pas accessible. Vérifiez les permissions RLS et la configuration des buckets.
              </p>
            </div>
          )}

          {diagnostics.supabase && diagnostics.session && diagnostics.storage && !diagnostics.buckets.includes('invoice-assets') && (
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                <strong>Attention:</strong> Le bucket 'invoice-assets' n'existe pas. L'application utilise ce bucket pour stocker les images.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadDiagnostic;
