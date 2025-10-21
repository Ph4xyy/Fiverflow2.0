import React, { useState } from 'react';
import { MessageCircle, Bell } from 'lucide-react';
import ConversationSystem from './ConversationSystem';

interface NavigationWithConversationProps {
  children: React.ReactNode;
}

const NavigationWithConversation: React.FC<NavigationWithConversationProps> = ({ children }) => {
  const [isConversationOpen, setIsConversationOpen] = useState(false);

  const handleOpenConversation = () => {
    setIsConversationOpen(true);
  };

  const handleCloseConversation = () => {
    setIsConversationOpen(false);
  };

  return (
    <div className="relative">
      {/* Contenu principal */}
      {children}
      
      {/* Bouton de conversation flottant */}
      <button
        onClick={handleOpenConversation}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 flex items-center justify-center group"
        title="Ouvrir les messages"
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Badge de notification (optionnel) */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          3
        </div>
      </button>

      {/* Système de conversation */}
      <ConversationSystem
        isOpen={isConversationOpen}
        onClose={handleCloseConversation}
      />
    </div>
  );
};

export default NavigationWithConversation;
