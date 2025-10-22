import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ConversationService } from '../services/conversationService';

interface ConversationContextType {
  isConversationOpen: boolean;
  currentConversationId: string | null;
  currentFriendInfo: { name: string; username: string; avatar: string } | null;
  openConversation: (conversationId: string, friendInfo?: { name: string; username: string; avatar: string }) => void;
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
  const [currentFriendInfo, setCurrentFriendInfo] = useState<{
    name: string;
    username: string;
    avatar: string;
  } | null>(null);

  const openConversation = useCallback((conversationId: string, friendInfo?: { name: string; username: string; avatar: string }) => {
    setCurrentConversationId(conversationId);
    if (friendInfo) {
      setCurrentFriendInfo(friendInfo);
    }
    setIsConversationOpen(true);
  }, []);

  const closeConversation = useCallback(() => {
    setIsConversationOpen(false);
    setCurrentConversationId(null);
    setCurrentFriendInfo(null);
  }, []);

  const startConversationWithUser = useCallback(async (
    userId: string, 
    userName: string, 
    userUsername: string
  ) => {
    if (!user) return;

    console.log('🚀 Démarrage de conversation avec:', { userId, userName, userUsername });

    try {
      // Essayer d'utiliser le système réel
      console.log('📡 Tentative de connexion à la base de données...');
      
      // Vérifier si une conversation existe déjà
      const existingConversations = await ConversationService.getUserConversations(user.id);
      console.log('📋 Conversations existantes:', existingConversations);
      
      const existingConversation = existingConversations.find(conv => 
        conv.other_participant_name === userName || 
        conv.other_participant_username === userUsername
      );

      if (existingConversation) {
        console.log('✅ Conversation existante trouvée:', existingConversation.id);
        openConversation(existingConversation.id, {
          name: userName,
          username: userUsername,
          avatar: ''
        });
        return;
      }

      // Créer une nouvelle conversation
      console.log('🆕 Création d\'une nouvelle conversation...');
      const conversationId = await ConversationService.createDirectConversation(user.id, userId);
      console.log('✅ Conversation créée:', conversationId);
      openConversation(conversationId, {
        name: userName,
        username: userUsername,
        avatar: ''
      });
      
      // Déclencher un événement pour rafraîchir la liste des conversations
      window.dispatchEvent(new CustomEvent('conversationCreated', { 
        detail: { conversationId, userName, userUsername } 
      }));
      
    } catch (error) {
      console.error('❌ Erreur avec le système réel:', error);
      console.log('🚨 Impossible de créer la conversation - base de données non déployée');
      
      // Ne pas créer de conversation de test - forcer l'utilisateur à déployer la base
      alert('Erreur: Le système de conversation n\'est pas déployé. Veuillez exécuter le script SQL dans Supabase.');
    }
  }, [user, openConversation]);

  const value: ConversationContextType = {
    isConversationOpen,
    currentConversationId,
    currentFriendInfo,
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
