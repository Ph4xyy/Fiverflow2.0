import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ConversationService } from '../services/conversationService';

interface ConversationContextType {
  isConversationOpen: boolean;
  currentConversationId: string | null;
  openConversation: (conversationId: string) => void;
  closeConversation: () => void;
  startConversationWithUser: (userId: string, userName: string, userUsername: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversationManager = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationManager must be used within a ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: React.ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const openConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    setIsConversationOpen(true);
  }, []);

  const closeConversation = useCallback(() => {
    setIsConversationOpen(false);
    setCurrentConversationId(null);
  }, []);

  const startConversationWithUser = useCallback(async (
    userId: string, 
    userName: string, 
    userUsername: string
  ) => {
    if (!user) return;

    try {
      // Vérifier si une conversation existe déjà
      const existingConversations = await ConversationService.getUserConversations(user.id);
      const existingConversation = existingConversations.find(conv => 
        conv.other_participant_name === userName || 
        conv.other_participant_username === userUsername
      );

      if (existingConversation) {
        // Ouvrir la conversation existante
        openConversation(existingConversation.id);
      } else {
        // Créer une nouvelle conversation
        const conversationId = await ConversationService.createDirectConversation(user.id, userId);
        openConversation(conversationId);
      }
    } catch (error) {
      console.error('Erreur lors de la création/démarrage de la conversation:', error);
      console.log('Détails de l\'erreur:', error);
      
      // En cas d'erreur, créer une conversation de test
      console.log('Création d\'une conversation de test...');
      const testConversationId = `test-conversation-${userId}-${Date.now()}`;
      openConversation(testConversationId);
    }
  }, [user, openConversation]);

  const value: ConversationContextType = {
    isConversationOpen,
    currentConversationId,
    openConversation,
    closeConversation,
    startConversationWithUser
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
