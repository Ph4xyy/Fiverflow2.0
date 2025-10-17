import React, { useState } from 'react';
import { useSimpleTwoFactorAuth } from '../hooks/useSimpleTwoFactorAuth';
import { toast } from 'react-hot-toast';

interface Login2FAVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
}

const Login2FAVerification: React.FC<Login2FAVerificationProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userEmail
}) => {
  const { verifyCode, loading } = useSimpleTwoFactorAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerification = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer le code à 6 chiffres');
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifyCode(code);
      
      if (isValid) {
        toast.success('Code de vérification accepté !');
        onSuccess();
        onClose();
      } else {
        setError('Code de vérification invalide ou expiré');
      }
    } catch (error) {
      console.error('Erreur vérification 2FA:', error);
      setError('Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerification();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#11151D] border border-[#1C2230] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1C2230]">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Vérification 2FA
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Entrez le code à 6 chiffres de votre application d'authentification
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-300 text-sm mb-2">
              Vérification requise pour
            </p>
            <p className="text-purple-400 font-medium">
              {userEmail || 'votre compte'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Code d'authentification
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength={6}
                disabled={isVerifying}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400">
                Ouvrez votre application d'authentification et entrez le code affiché
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#1C2230]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          
          <button
            onClick={handleVerification}
            disabled={isVerifying || code.length !== 6}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isVerifying && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span>{isVerifying ? 'Vérification...' : 'Vérifier'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login2FAVerification;
