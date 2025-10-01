import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { useLoading } from '../contexts/LoadingContext';

/**
 * Composant de test pour vérifier que les corrections fonctionnent
 */
export const LoadingTest: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserData();
  const { loading, isLoading } = useLoading();
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, [authLoading, roleLoading, user, role]); // Ajouter les dépendances pour éviter les re-renders infinis

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">Loading Test</h3>
      <div className="space-y-1">
        <p>Renders: {renderCount}</p>
        <p>Auth Loading: {authLoading ? '✅' : '❌'}</p>
        <p>Role Loading: {roleLoading ? '✅' : '❌'}</p>
        <p>Any Loading: {isLoading() ? '✅' : '❌'}</p>
        <p>User: {user ? '✅' : '❌'}</p>
        <p>Role: {role || 'none'}</p>
        <p>Loading States: {JSON.stringify(loading)}</p>
      </div>
    </div>
  );
};

export default LoadingTest;
