import React from 'react';
import { Crown, Clock, X, Zap } from 'lucide-react';

interface TrialBannerProps {
  daysRemaining: number;
  hoursRemaining: number;
  onUpgrade: () => void;
  onDismiss?: () => void;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ 
  daysRemaining, 
  hoursRemaining, 
  onUpgrade, 
  onDismiss 
}) => {
  const isLastDay = daysRemaining === 0;
  const isUrgent = daysRemaining <= 1;

  const getTimeDisplay = () => {
    if (daysRemaining > 0) {
      return `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`;
    } else if (hoursRemaining > 0) {
      return `${hoursRemaining} heure${hoursRemaining > 1 ? 's' : ''}`;
    } else {
      return 'Quelques minutes';
    }
  };

  const getBannerStyle = () => {
    if (isUrgent) {
      return 'bg-gradient-to-r from-red-500 to-pink-600';
    }
    return 'bg-gradient-to-r from-purple-500 to-blue-600';
  };

  return (
    <div className={`${getBannerStyle()} text-white p-4 rounded-lg shadow-lg dark:shadow-dark-xl mb-6 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            {isUrgent ? (
              <Clock className="text-white animate-pulse-slow" size={24} />
            ) : (
              <Crown className="text-white" size={24} />
            )}
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold">
                {isUrgent ? '⚠️ Essai Pro - Expire bientôt !' : '✨ Essai Pro Actif'}
              </h3>
              {!isUrgent && <Zap className="text-blue-300 animate-pulse" size={16} />}
            </div>
            <p className="text-white/90">
              {isLastDay ? (
                <>
                  <strong>Dernières {getTimeDisplay()}</strong> pour profiter de toutes les fonctionnalités Pro !
                </>
              ) : (
                <>
                  <strong>{getTimeDisplay()} restant{daysRemaining > 1 ? 's' : ''}</strong> pour profiter de toutes les fonctionnalités Pro
                </>
              )}
            </p>
            <p className="text-white/75 text-sm mt-1">
              Clients illimités • Templates illimités • Statistiques avancées
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onUpgrade}
            className={`px-6 py-3 bg-white dark:bg-slate-100 text-gray-900 dark:text-slate-900 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              isUrgent ? 'animate-pulse' : ''
            }`}
          >
            {isUrgent ? 'Continuer Pro' : 'Passer à Pro'}
          </button>
          
          {onDismiss && !isUrgent && (
            <button
              onClick={onDismiss}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all duration-200 hover:scale-110"
              title="Masquer temporairement"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 bg-white/20 dark:bg-white/10 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white dark:bg-white/90 h-full transition-all duration-1000 ease-out shadow-sm"
          style={{ 
            width: `${Math.max(0, Math.min(100, ((7 * 24 - (daysRemaining * 24 + hoursRemaining)) / (7 * 24)) * 100))}%` 
          }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-white/75 dark:text-white/60 mt-2">
        <span>Début de l'essai</span>
        <span>{isLastDay ? 'Expire aujourd\'hui' : `${getTimeDisplay()} restant${daysRemaining > 1 ? 's' : ''}`}</span>
      </div>
    </div>
  );
};

export default TrialBanner;