import React, { useState } from 'react';
import ConversationMenu from './ConversationMenu';
import UserSearchModal from './UserSearchModal';
import ConversationChat from './ConversationChat';
import { useConversationManager } from './ConversationManager';

interface ConversationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConversationSystem: React.FC<ConversationSystemProps> = ({ isOpen, onClose }) => {
  const { isConversationOpen, currentConversationId, closeConversation } = useConversationManager();
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

  const handleStartConversation = (userId: string) => {
    // TODO: Créer ou récupérer la conversation
    console.log('Démarrer conversation avec:', userId);
    
    // Pour l'instant, on simule une conversation
    setSelectedConversation({
      id: 'new-conversation',
      title: 'Nouvelle conversation',
      otherParticipant: {
        name: 'Utilisateur',
        username: 'utilisateur',
        avatar: ''
      }
    });
    setCurrentView('chat');
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
  React.useEffect(() => {
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
      {currentView === 'menu' && (
        <ConversationMenu
          isOpen={isOpen}
          onClose={handleClose}
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
            />
          </div>
        </div>
      )}

      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onStartConversation={handleStartConversation}
      />
    </>
  );
};

export default ConversationSystem;
