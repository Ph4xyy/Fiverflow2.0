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
  const { isConversationOpen, currentConversationId, currentFriendInfo, closeConversation } = useConversationManager();
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
    console.log('Démarrer conversation avec:', userId);
    
    // Simuler une conversation avec des données de test
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
      console.log('🎯 Ouverture de la conversation:', currentConversationId);
      console.log('👤 Informations de l\'ami:', currentFriendInfo);
      setCurrentView('chat');
      
      // Créer une conversation avec les vraies données de l'ami
      setSelectedConversation({
        id: currentConversationId,
        title: currentFriendInfo ? `Conversation avec ${currentFriendInfo.name}` : 'Conversation',
        otherParticipant: currentFriendInfo || {
          name: 'Utilisateur',
          username: 'utilisateur',
          avatar: ''
        }
      });
    }
  }, [isConversationOpen, currentConversationId, currentFriendInfo]);

  if (!isOpen && !isConversationOpen) return null;

  console.log('🎨 ConversationSystem rendu:', { isOpen, isConversationOpen, currentView, selectedConversation });

  return (
    <>
      {currentView === 'menu' && (
        <ConversationMenu
          isOpen={isOpen}
          onClose={handleClose}
          onSelectConversation={handleSelectConversation}
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
              onBack={() => setCurrentView('menu')}
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
