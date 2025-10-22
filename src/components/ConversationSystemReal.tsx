import React, { useState, useEffect } from 'react';
import ConversationMenu from './ConversationMenu';
import UserSearchModal from './UserSearchModal';
import ConversationChat from './ConversationChat';
import { useConversationManager } from './ConversationManager';
import { ConversationService } from '../services/conversationService';
import { useAuth } from '../contexts/AuthContext';

interface ConversationSystemRealProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConversationSystemReal: React.FC<ConversationSystemRealProps> = ({ isOpen, onClose }) => {
  const { isConversationOpen, currentConversationId, closeConversation } = useConversationManager();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'menu' | 'chat'>('menu');
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    title: string;
    otherParticipant: {
      name: string;
      username: string;
      avatar: string;
    };
  } | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isRealSystemEnabled, setIsRealSystemEnabled] = useState(false);

  // Vérifier si le système réel est disponible
  useEffect(() => {
    const checkRealSystem = async () => {
      if (!user) return;
      
      try {
        // Tenter de charger les conversations réelles
        const conversations = await ConversationService.getUserConversations(user.id);
        setIsRealSystemEnabled(true);
        console.log('✅ Système de conversation réel activé');
      } catch (error) {
        console.log('⚠️ Système de conversation en mode test (base de données non configurée)');
        setIsRealSystemEnabled(false);
      }
    };

    if (isOpen && user) {
      checkRealSystem();
    }
  }, [isOpen, user]);

  const handleStartConversation = async (userId: string) => {
    if (!user) return;
    
    try {
      if (isRealSystemEnabled) {
        // Utiliser le vrai système
        const conversationId = await ConversationService.createDirectConversation(user.id, userId);
        
        // Récupérer les informations de l'utilisateur
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('full_name, username, avatar_url')
          .eq('user_id', userId)
          .single();
        
        setSelectedConversation({
          id: conversationId,
          title: `Conversation avec ${userData?.full_name || 'Utilisateur'}`,
          otherParticipant: {
            name: userData?.full_name || 'Utilisateur',
            username: userData?.username || 'utilisateur',
            avatar: userData?.avatar_url || ''
          }
        });
      } else {
        // Utiliser le système de test
        const mockUsers = {
          '1': { name: 'John Doe', username: 'johndoe', avatar: '' },
          '2': { name: 'Jane Smith', username: 'janesmith', avatar: '' },
          '3': { name: 'Mike Johnson', username: 'mikej', avatar: '' }
        };
        
        const user = mockUsers[userId as keyof typeof mockUsers] || { 
          name: 'Utilisateur', 
          username: 'utilisateur', 
          avatar: '' 
        };
        
        setSelectedConversation({
          id: `conversation-${userId}`,
          title: `Conversation avec ${user.name}`,
          otherParticipant: user
        });
      }
      
      setCurrentView('chat');
    } catch (error) {
      console.error('Erreur lors du démarrage de la conversation:', error);
    }
  };

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation({
      id: conversation.id,
      title: conversation.title,
      otherParticipant: {
        name: conversation.other_participant_name,
        username: conversation.other_participant_username,
        avatar: conversation.other_participant_avatar
      }
    });
    setCurrentView('chat');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setSelectedConversation(null);
  };

  const handleClose = () => {
    setCurrentView('menu');
    setSelectedConversation(null);
    setShowUserSearch(false);
    closeConversation();
    onClose();
  };

  // Si une conversation est ouverte via le contexte, passer en mode chat
  useEffect(() => {
    if (isConversationOpen && currentConversationId) {
      setCurrentView('chat');
      // TODO: Charger les données de la conversation
      setSelectedConversation({
        id: currentConversationId,
        title: 'Conversation',
        otherParticipant: {
          name: 'Utilisateur',
          username: 'utilisateur',
          avatar: ''
        }
      });
    }
  }, [isConversationOpen, currentConversationId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Indicateur du mode système */}
      {isRealSystemEnabled ? (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
          ✅ Système Réel Actif
        </div>
      ) : (
        <div className="fixed top-4 right-4 z-50 bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm">
          ⚠️ Mode Test
        </div>
      )}

      {currentView === 'menu' && (
        <ConversationMenu
          isOpen={isOpen}
          onClose={handleClose}
          onSelectConversation={handleSelectConversation}
          useRealData={isRealSystemEnabled}
        />
      )}
      
      {currentView === 'chat' && selectedConversation && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          {/* Chat */}
          <div className="absolute right-0 top-0 h-full w-full lg:w-96 bg-gray-900 shadow-xl">
            <ConversationChat
              conversationId={selectedConversation.id}
              conversationTitle={selectedConversation.title}
              otherParticipant={selectedConversation.otherParticipant}
              onClose={handleBackToMenu}
              useRealData={isRealSystemEnabled}
            />
          </div>
        </div>
      )}

      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onStartConversation={handleStartConversation}
        useRealData={isRealSystemEnabled}
      />
    </>
  );
};

export default ConversationSystemReal;
