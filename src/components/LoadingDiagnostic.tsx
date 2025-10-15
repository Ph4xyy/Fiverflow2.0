import React, { useState, useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';

const LoadingDiagnostic: React.FC = () => {
  const { loading, isLoading } = useLoading();
  const { user, loading: authLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState<Array<{
    timestamp: string;
    state: any;
    duration?: number;
  }>>([]);

  useEffect(() => {
    const logEvent = (event: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setLoadingHistory(prev => [...prev.slice(-9), {
        timestamp,
        state: { ...loading },
        event
      }]);
    };

    // Écouter les changements de loading
    const interval = setInterval(() => {
      if (isLoading()) {
        logEvent('Loading active');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isLoading]);

  // Raccourci clavier pour afficher/masquer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-[#11151D] border border-[#1C2230] rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Loading Diagnostic</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Auth Loading:</span>
          <span className={authLoading ? 'text-yellow-400' : 'text-green-400'}>
            {authLoading ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Global Loading:</span>
          <span className={isLoading() ? 'text-yellow-400' : 'text-green-400'}>
            {isLoading() ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="space-y-1">
          {Object.entries(loading).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-slate-400 capitalize">{key}:</span>
              <span className={value ? 'text-red-400' : 'text-green-400'}>
                {value ? 'Loading' : 'Ready'}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#1C2230]">
          <div className="text-slate-400 mb-1">User Status:</div>
          <div className="text-xs">
            {user ? (
              <span className="text-green-400">Connected: {user.email}</span>
            ) : (
              <span className="text-red-400">Not connected</span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#1C2230]">
          <div className="text-slate-400 mb-1">History:</div>
          <div className="max-h-20 overflow-y-auto space-y-1">
            {loadingHistory.slice(-5).map((entry, index) => (
              <div key={index} className="text-xs text-slate-300">
                {entry.timestamp}: {entry.event}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#1C2230] text-xs text-slate-500">
        Press Ctrl+Shift+L to toggle
      </div>
    </div>
  );
};

export default LoadingDiagnostic;
