import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de redirection racine avec diagnostic amélioré
 */
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Debug info pour diagnostiquer les problèmes
  useEffect(() => {
    const info = `User: ${user ? '✅' : '❌'} | Loading: ${loading ? '⏳' : '✅'} | Timeout: ${timeoutReached ? '🚨' : '⏱️'}`;
    setDebugInfo(info);
    console.log('🔍 RootRedirect Debug:', info);
  }, [user, loading, timeoutReached]);

  // Timeout de sécurité pour éviter un écran bleu infini
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ RootRedirect timeout reached - forcing redirect');
      console.warn('🔍 Debug info at timeout:', { user: !!user, loading, timestamp: Date.now() });
      setTimeoutReached(true);
    }, 3000); // 3 secondes max

    return () => clearTimeout(timeout);
  }, []);

  // Si timeout atteint ou loading terminé, on redirige
  if (timeoutReached || !loading) {
    const target = user ? '/dashboard' : '/login';
    console.log('🚀 RootRedirect: Redirecting to', target, '| Reason:', timeoutReached ? 'timeout' : 'auth-ready');
    console.log('🔍 Final state:', { user: user?.id, loading, timeoutReached, target });
    return <Navigate to={target} replace />;
  }

  // Écran de chargement avec debug
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-500"></div>
        <p className="text-slate-400 text-sm">Chargement...</p>
        <div className="text-xs text-slate-600 text-center max-w-xs">
          Redirection automatique en cours...
        </div>
        <div className="text-xs text-slate-500 text-center">
          {debugInfo}
        </div>
        <div className="text-xs text-slate-500 text-center">
          Environment: {import.meta.env.MODE}
        </div>
      </div>
    </div>
  );
};

export default RootRedirect;
