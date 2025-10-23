import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StoragePolicyFixer: React.FC = () => {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const applyStoragePolicies = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Supabase non configuré');
      return;
    }

    setApplying(true);

    try {
      // Essayer de créer le bucket via l'API Supabase
      const { error: bucketError } = await supabase.storage.createBucket('invoice-assets', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (bucketError) {
        if (bucketError.message.includes('already exists')) {
          toast.success('Bucket existe déjà');
        } else if (bucketError.message.includes('permission denied') || bucketError.message.includes('must be owner')) {
          toast.error('Permissions insuffisantes. Utilisez la configuration manuelle ci-dessous.');
          setApplied(false);
          return;
        } else {
          throw bucketError;
        }
      } else {
        toast.success('Bucket créé avec succès');
      }

      // Note: Les politiques RLS doivent être créées manuellement via le dashboard
      toast.info('Bucket créé. Les politiques RLS doivent être configurées manuellement.');
      setApplied(true);
    } catch (error: any) {
      console.error('Erreur application politiques:', error);
      if (error.message.includes('permission denied') || error.message.includes('must be owner')) {
        toast.error('Permissions insuffisantes. Utilisez la configuration manuelle ci-dessous.');
      } else {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-blue-600" />
        Correction automatique des politiques Storage
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Cette fonction va automatiquement configurer les politiques RLS nécessaires pour l'upload d'images.
        </p>
        <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1 ml-4">
          <li>• Créer le bucket 'invoice-assets' s'il n'existe pas</li>
          <li>• Configurer les politiques RLS pour l'upload</li>
          <li>• Permettre l'accès public en lecture</li>
          <li>• Autoriser les utilisateurs à gérer leurs propres fichiers</li>
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={applyStoragePolicies}
          disabled={applying || applied}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {applying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Application en cours...
            </>
          ) : applied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Politiques appliquées
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Appliquer les politiques
            </>
          )}
        </button>

        {applied && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Configuration terminée</span>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium">Note importante:</p>
            <p>
              Si cette correction automatique ne fonctionne pas, vous devrez appliquer manuellement 
              la migration SQL <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">20250127000000_fix_storage_policies.sql</code> 
              dans votre dashboard Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoragePolicyFixer;
