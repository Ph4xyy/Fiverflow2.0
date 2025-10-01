import React, { useState, useEffect } from 'react';

/**
 * Composant de fallback d'urgence pour les cas où l'app ne peut pas se charger
 */
export const EmergencyFallback: React.FC = () => {
  const [showEmergency, setShowEmergency] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    // Afficher le fallback après 10 secondes
    const timer = setTimeout(() => {
      setShowEmergency(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showEmergency) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Forcer un reload complet
            window.location.href = window.location.origin;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showEmergency]);

  const handleManualReload = () => {
    console.log('🔄 Manual reload triggered');
    window.location.reload();
  };

  const handleClearCache = () => {
    console.log('🗑️ Clearing cache and reloading');
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        // Clear localStorage
        localStorage.clear();
        sessionStorage.clear();
        // Reload
        window.location.reload();
      });
    } else {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  if (!showEmergency) return null;

  return (
    <div className="fixed inset-0 bg-red-900 text-white z-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="text-2xl font-bold mb-4">Problème de Chargement</h1>
        <p className="mb-6">
          L'application semble bloquée. Cela peut être dû à un problème de cache ou de session.
        </p>
        
        <div className="space-y-4">
          <div className="bg-red-800 p-4 rounded">
            <p className="text-sm mb-2">Rechargement automatique dans :</p>
            <div className="text-3xl font-bold">{countdown}s</div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleManualReload}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              🔄 Recharger Maintenant
            </button>
            
            <button
              onClick={handleClearCache}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded font-semibold"
            >
              🗑️ Vider le Cache et Recharger
            </button>

            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-semibold"
            >
              🏠 Aller à la Page de Connexion
            </button>
          </div>
        </div>

        <div className="mt-6 text-xs text-red-200">
          <p>Si le problème persiste, essayez :</p>
          <ul className="mt-2 space-y-1">
            <li>• Vider le cache de votre navigateur</li>
            <li>• Désactiver les extensions</li>
            <li>• Essayer en navigation privée</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyFallback;
