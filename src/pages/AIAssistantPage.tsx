/**
 * Page Assistant AI - Interface style ChatGPT
 * Accès réservé au plan Scale ou aux admins
 * 
 * Cette page affiche simplement que l'assistant AI sera disponible bientôt.
 * La logique complète sera restaurée une fois que tous les bugs seront résolus.
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Bot, Sparkles } from 'lucide-react';

const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Assistant AI
          </h1>

          {/* Description */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Bientôt disponible
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  L'Assistant AI est en cours de finalisation. Cette fonctionnalité vous permettra de gérer vos tâches, clients, commandes et événements via des commandes en langage naturel.
                </p>
              </div>
            </div>
          </div>

          {/* Features preview */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Création de tâches et clients via commandes vocales</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Gestion de vos commandes et événements</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Interface de chat intuitive style ChatGPT</span>
            </div>
          </div>

          {/* Information */}
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Disponible prochainement
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
