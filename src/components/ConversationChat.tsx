import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Info } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  sender_name: string;
  sender_username: string;
  sender_avatar: string;
}

interface ConversationChatProps {
  conversationId: string;
  conversationTitle: string;
  otherParticipant: {
    name: string;
    username: string;
    avatar: string;
  };
  onClose: () => void;
}

const ConversationChat: React.FC<ConversationChatProps> = ({
  conversationId,
  conversationTitle,
  otherParticipant,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les messages
  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Pour l'instant, utiliser des données de test
      // TODO: Remplacer par les vraies données quand la DB sera créée
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Salut ! Comment ça va ?',
          sender_id: otherParticipant.username,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_edited: false,
          is_deleted: false,
          sender_name: otherParticipant.name,
          sender_username: otherParticipant.username,
          sender_avatar: otherParticipant.avatar
        },
        {
          id: '2',
          content: 'Ça va bien, merci ! Et toi ?',
          sender_id: 'me',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          is_edited: false,
          is_deleted: false,
          sender_name: 'Moi',
          sender_username: 'moi',
          sender_avatar: ''
        },
        {
          id: '3',
          content: 'Super ! J\'ai un nouveau projet à te proposer',
          sender_id: otherParticipant.username,
          created_at: new Date(Date.now() - 900000).toISOString(),
          is_edited: false,
          is_deleted: false,
          sender_name: otherParticipant.name,
          sender_username: otherParticipant.username,
          sender_avatar: otherParticipant.avatar
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      // Pour l'instant, simuler l'envoi de message
      // TODO: Remplacer par les vraies données quand la DB sera créée
      const tempMessage: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender_id: 'me',
        created_at: new Date().toISOString(),
        is_edited: false,
        is_deleted: false,
        sender_name: 'Moi',
        sender_username: 'moi',
        sender_avatar: ''
      };
      
      // Ajouter le message à la liste
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Simuler une réponse automatique après 2 secondes
      setTimeout(() => {
        const autoReply: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Merci pour votre message ! Je vous répondrai bientôt.',
          sender_id: otherParticipant.username,
          created_at: new Date().toISOString(),
          is_edited: false,
          is_deleted: false,
          sender_name: otherParticipant.name,
          sender_username: otherParticipant.username,
          sender_avatar: otherParticipant.avatar
        };
        setMessages(prev => [...prev, autoReply]);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
            ←
          </button>
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            {otherParticipant.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={otherParticipant.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-300">
                {otherParticipant.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">{otherParticipant.name}</h3>
            <p className="text-sm text-gray-400">@{otherParticipant.username}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Info className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isMe = message.sender_id === 'me';
              const showDate = index === 0 || 
                new Date(message.created_at).toDateString() !== 
                new Date(messages[index - 1].created_at).toDateString();
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-full">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      {message.sender_avatar ? (
                        <img
                          src={message.sender_avatar}
                          alt={message.sender_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-300">
                          {message.sender_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className={`max-w-xs lg:max-w-md ${isMe ? 'text-right' : 'text-left'}`}>
                      <div className={`px-4 py-2 rounded-lg ${
                        isMe 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`text-xs text-gray-400 mt-1 ${
                        isMe ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.created_at)}
                        {message.is_edited && (
                          <span className="ml-1">(modifié)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Smile className="w-5 h-5 text-gray-400" />
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationChat;
