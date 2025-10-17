import React, { useState } from 'react';
import { useAuthWith2FA } from '../hooks/useAuthWith2FA';
import Login2FAVerification from './Login2FAVerification';
import { toast } from 'react-hot-toast';

interface LoginWith2FAProps {
  onSuccess: () => void;
  onError?: (error: string) => void;
}

const LoginWith2FA: React.FC<LoginWith2FAProps> = ({ onSuccess, onError }) => {
  const { 
    signInWithPassword, 
    verify2FAAndComplete, 
    cancel2FA,
    loading, 
    requires2FA, 
    pendingUser 
  } = useAuthWith2FA();

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: typeof errors = {};
    if (!credentials.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!credentials.password.trim()) {
      newErrors.password = 'Mot de passe requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Tentative de connexion
    const result = await signInWithPassword(credentials);
    
    if (result.success) {
      toast.success('Connexion réussie !');
      onSuccess();
    } else if (result.requires2FA) {
      // 2FA requis, le modal s'affichera automatiquement
      toast.success('Connexion initiale réussie. Vérification 2FA requise.');
    } else {
      const errorMessage = result.error || 'Erreur de connexion';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    }
  };

  const handle2FASuccess = () => {
    onSuccess();
  };

  const handle2FACancel = () => {
    cancel2FA();
    toast.info('Connexion annulée');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Adresse email
          </label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            className="w-full px-4 py-3 bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="votre@email.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="w-full px-4 py-3 bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="••••••••"
            disabled={loading}
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
        </button>
      </form>

      {/* Modal de vérification 2FA */}
      <Login2FAVerification
        isOpen={requires2FA}
        onClose={handle2FACancel}
        onSuccess={handle2FASuccess}
        userEmail={pendingUser?.email}
      />
    </>
  );
};

export default LoginWith2FA;
