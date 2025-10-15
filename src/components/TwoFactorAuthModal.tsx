import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTwoFactorAuth } from '../hooks/useTwoFactorAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TwoFactorAuthStep {
  step: 'password' | 'email' | 'qr' | 'verification';
  title: string;
  description: string;
}

const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { generateSecret, verifyAndEnable, loading: twoFactorLoading } = useTwoFactorAuth();
  const [currentStep, setCurrentStep] = useState<TwoFactorAuthStep['step']>('password');
  const [loading, setLoading] = useState(false);
  
  // Password step
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Email step
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCodeError, setEmailCodeError] = useState('');
  
  // QR step
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  // Verification step
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const steps: TwoFactorAuthStep[] = [
    {
      step: 'password',
      title: 'Vérification du mot de passe',
      description: 'Entrez votre mot de passe actuel pour continuer'
    },
    {
      step: 'email',
      title: 'Vérification par email',
      description: 'Un code de vérification a été envoyé à votre adresse email'
    },
    {
      step: 'qr',
      title: 'Configuration 2FA',
      description: 'Scannez ce QR code avec votre application d\'authentification'
    },
    {
      step: 'verification',
      title: 'Activation 2FA',
      description: 'Entrez le code à 6 chiffres de votre application'
    }
  ];

  const currentStepData = steps.find(s => s.step === currentStep);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('password');
      setPassword('');
      setEmailCode('');
      setVerificationCode('');
      setQrCode(null);
      setSecret(null);
      setBackupCodes([]);
      setPasswordError('');
      setEmailCodeError('');
      setVerificationError('');
      setEmailCodeSent(false);
    }
  }, [isOpen]);

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      setPasswordError('Veuillez entrer votre mot de passe');
      return;
    }

    setLoading(true);
    setPasswordError('');

    try {
      if (!isSupabaseConfigured || !supabase || !user) {
        throw new Error('Configuration manquante');
      }

      // Vérifier le mot de passe
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: password
      });

      if (error) {
        setPasswordError('Mot de passe incorrect');
        return;
      }

      // Envoyer le code de vérification par email
      const { error: emailError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email || ''
      });

      if (emailError) {
        console.warn('Erreur envoi email:', emailError);
        // Continuer même si l'email échoue
      }

      setEmailCodeSent(true);
      setCurrentStep('email');
      toast.success('Code de vérification envoyé par email');
    } catch (error) {
      console.error('Erreur vérification mot de passe:', error);
      setPasswordError('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    if (!emailCode.trim()) {
      setEmailCodeError('Veuillez entrer le code de vérification');
      return;
    }

    setLoading(true);
    setEmailCodeError('');

    try {
      if (!isSupabaseConfigured || !supabase || !user) {
        throw new Error('Configuration manquante');
      }

      // Vérifier le code email (simulation - en production, vous auriez un vrai système)
      // Pour l'instant, on accepte n'importe quel code de 6 chiffres
      if (emailCode.length === 6 && /^\d+$/.test(emailCode)) {
      // Générer le QR code 2FA avec le nouveau hook
      const result = await generateSecret();
      if (result) {
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setBackupCodes(result.backupCodes);
        setCurrentStep('qr');
        toast.success('QR code généré avec succès');
      }
      } else {
        setEmailCodeError('Code de vérification invalide');
      }
    } catch (error) {
      console.error('Erreur vérification email:', error);
      setEmailCodeError('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleQrStep = () => {
    setCurrentStep('verification');
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Veuillez entrer le code à 6 chiffres');
      return;
    }

    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setVerificationError('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setVerificationError('');

    try {
      // Vérifier et activer 2FA avec le nouveau hook
      const success = await verifyAndEnable(verificationCode);
      
      if (success) {
        onSuccess();
        onClose();
      } else {
        setVerificationError('Code invalide ou expiré');
      }
    } catch (error) {
      console.error('Erreur vérification 2FA:', error);
      setVerificationError('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'email':
        setCurrentStep('password');
        break;
      case 'qr':
        setCurrentStep('email');
        break;
      case 'verification':
        setCurrentStep('qr');
        break;
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
              {currentStepData?.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {currentStepData?.description}
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
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.step
                      ? 'bg-purple-500 text-white'
                      : steps.findIndex(s => s.step === currentStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-[#1C2230] text-slate-400'
                  }`}
                >
                  {steps.findIndex(s => s.step === currentStep) > index ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      steps.findIndex(s => s.step === currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-[#1C2230]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          {currentStep === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                />
                {passwordError && (
                  <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 'email' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-300 text-sm">
                  Un code de vérification a été envoyé à<br />
                  <span className="font-medium text-white">{user?.email}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
                {emailCodeError && (
                  <p className="text-red-400 text-sm mt-1">{emailCodeError}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 'qr' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Scannez ce QR code avec votre application d'authentification
                </p>
                {qrCode && (
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-4">
                  Applications recommandées : Google Authenticator, Authy, Microsoft Authenticator
                </p>
                {backupCodes.length > 0 && (
                  <div className="mt-4 p-3 bg-[#0E121A] border border-[#1C2230] rounded-lg">
                    <p className="text-xs text-slate-300 mb-2 font-medium">
                      Codes de sauvegarde (gardez-les en sécurité) :
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="text-xs font-mono text-slate-400 bg-[#11151D] px-2 py-1 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-red-400 mt-2">
                      ⚠️ Ces codes ne seront affichés qu'une seule fois. Sauvegardez-les !
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'verification' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-300 text-sm">
                  Entrez le code à 6 chiffres affiché dans votre application
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Code d'authentification
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
                {verificationError && (
                  <p className="text-red-400 text-sm mt-1">{verificationError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#1C2230]">
          <button
            onClick={handleBack}
            disabled={currentStep === 'password' || loading}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Retour
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                switch (currentStep) {
                  case 'password':
                    handlePasswordVerification();
                    break;
                  case 'email':
                    handleEmailVerification();
                    break;
                  case 'qr':
                    handleQrStep();
                    break;
                  case 'verification':
                    handleVerification();
                    break;
                }
              }}
              disabled={loading}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span>
                {currentStep === 'qr' ? 'Continuer' : 
                 currentStep === 'verification' ? 'Activer 2FA' : 'Continuer'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthModal;
