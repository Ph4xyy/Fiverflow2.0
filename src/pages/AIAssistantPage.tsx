/**
 * Page Assistant AI - Interface style ChatGPT
 * Accès réservé au plan Scale ou aux admins
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Simple loading state
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Assistant AI - En construction
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center">
            Cette fonctionnalité sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
