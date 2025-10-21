import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ConversationService } from '../services/conversationService';

interface Conversation {
  id: string;
  title: string;
  type: string;
  last_message_content: string;
  last_message_at: string;
  unread_count: number;
  other_participant_name: string;
  other_participant_username: string;
  other_participant_avatar: string;
}

interface UseConversationReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  startConversation: (userId: string) => Promise<string | null>;
  refreshConversations: () => Promise<void>;
}

export const useConversation = (): UseConversationReturn => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les conversations
  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await ConversationService.getUserConversations(user.id);
      setConversations(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError(err.message || 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  // Démarrer une conversation avec un utilisateur
  const startConversation = async (userId: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Vérifier si une conversation existe déjà
      const existingConversation = conversations.find(conv => 
        conv.other_participant_name && conv.type === 'direct'
      );
      
      if (existingConversation) {
        return existingConversation.id;
      }
      
      // Créer une nouvelle conversation
      const conversationId = await ConversationService.createDirectConversation(user.id, userId);
      
      // Recharger les conversations
      await loadConversations();
      
      return conversationId;
    } catch (err: any) {
      console.error('Erreur lors de la création de la conversation:', err);
      setError(err.message || 'Erreur lors de la création de la conversation');
      return null;
    }
  };

  // Rafraîchir les conversations
  const refreshConversations = async () => {
    await loadConversations();
  };

  // Charger les conversations au montage
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  return {
    conversations,
    loading,
    error,
    startConversation,
    refreshConversations
  };
};
