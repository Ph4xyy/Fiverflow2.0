import React, { useState, useEffect } from 'react';
import { useTwoFactorAuth } from '../hooks/useTwoFactorAuth';
import { toast } from 'react-hot-toast';

interface TwoFactorVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
  userEmail: string;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({ 
  onSuccess, 
  onCancel, 
  userEmail 
}) => {
  const { verifyCode, loading } = useTwoFactorAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);

  const maxAttempts = 5;
  const lockDuration = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (isLocked && lockTime > 0) {
      const timer = setInterval(() => {
        setLockTime(prev => {
          if (prev <= 1000) {
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error('Trop de tentatives échouées. Veuillez attendre.');
      return;
    }

    if (!code.trim()) {
      setError('Veuillez entrer le code à 6 chiffres');
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setError('');

    try {
      const success = await verifyCode(code);
      
      if (success) {
        toast.success('Code vérifié avec succès !');
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          setIsLocked(true);
          setLockTime(lockDuration);
          toast.error('Trop de tentatives échouées. Compte verrouillé pendant 5 minutes.');
        } else {
          setError(`Code invalide. ${maxAttempts - newAttempts} tentatives restantes.`);
        }
      }
    } catch (error) {
      console.error('Erreur vérification 2FA:', error);
      setError('Erreur lors de la vérification');
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#11151D] border border-[#1C2230] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-[#1C2230]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Vérification 2FA
              </h2>
              <p className="text-sm text-slate-400">
                Entrez le code de votre application d'authentification
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-slate-300 text-sm mb-2">
              Un code de vérification a été envoyé à
            </p>
            <p className="text-white font-medium">{userEmail}</p>
            <p className="text-slate-400 text-xs mt-2">
              Entrez le code à 6 chiffres affiché dans votre application d'authentification
            </p>
          </div>

          {isLocked ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Compte temporairement verrouillé
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Trop de tentatives échouées. Veuillez attendre avant de réessayer.
              </p>
              <div className="text-2xl font-mono text-red-400">
                {formatTime(lockTime)}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Code d'authentification
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                )}
              </div>

              {attempts > 0 && attempts < maxAttempts && (
                <div className="text-center">
                  <p className="text-yellow-400 text-sm">
                    {maxAttempts - attempts} tentatives restantes
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>Vérifier</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 p-3 bg-[#0E121A] border border-[#1C2230] rounded-lg">
            <p className="text-xs text-slate-400 text-center">
              💡 Vous pouvez également utiliser un code de sauvegarde si vous n'avez pas accès à votre application d'authentification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification;
