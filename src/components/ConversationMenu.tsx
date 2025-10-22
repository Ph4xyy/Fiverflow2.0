import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Plus, Users, Settings, Bell, X } from 'lucide-react';
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

interface ConversationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation?: (conversation: Conversation) => void;
  useRealData?: boolean;
}

const ConversationMenu: React.FC<ConversationMenuProps> = ({ isOpen, onClose, onSelectConversation, useRealData = false }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger les conversations
  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  // Écouter les événements de création de conversation
  useEffect(() => {
    const handleConversationCreated = () => {
      console.log('🔄 Rafraîchissement de la liste des conversations');
      if (user) {
        loadConversations();
      }
    };

    window.addEventListener('conversationCreated', handleConversationCreated);
    return () => {
      window.removeEventListener('conversationCreated', handleConversationCreated);
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📋 Chargement des conversations pour:', user.id);
      
      // Toujours essayer de charger les vraies données
      try {
        const { data } = await ConversationService.getUserConversations(user.id);
        console.log('✅ Conversations réelles chargées:', data);
        setConversations(data || []);
        return;
      } catch (error) {
        console.log('⚠️ Erreur avec les vraies conversations, liste vide:', error);
      }
      
      // Si erreur, liste vide (pas de fausses conversations)
      setConversations([]);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = () => {
    setShowUserSearch(true);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute right-0 top-0 h-full w-96 bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Messages</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearchUsers}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Nouvelle conversation"
            >
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageCircle className="w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Aucune conversation</h3>
              <p className="text-gray-500 text-center mb-4">
                Commencez une nouvelle conversation avec un utilisateur
              </p>
              <button
                onClick={handleSearchUsers}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Nouvelle conversation
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations
                .filter(conv => 
                  conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.other_participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.last_message_content.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => onSelectConversation?.(conversation)}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        {conversation.other_participant_avatar ? (
                          <img
                            src={conversation.other_participant_avatar}
                            alt={conversation.other_participant_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-gray-300">
                            {conversation.other_participant_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white truncate">
                          {conversation.other_participant_name}
                        </h4>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.last_message_content}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationMenu;
