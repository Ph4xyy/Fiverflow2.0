import React, { useState } from 'react';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Search,
  ArrowLeft,
  Check,
  CheckCheck
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'me' | 'other';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

const MessagingSystem: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Marie Dubois',
      avatar: 'MD',
      lastMessage: 'Hi! I have a new proposal for you',
      timestamp: '14:32',
      unread: 2,
      online: true
    },
    {
      id: '2',
      name: 'Pierre Martin',
      avatar: 'PM',
      lastMessage: 'The project is going well, thanks!',
      timestamp: '12:15',
      unread: 0,
      online: false
    },
    {
      id: '3',
      name: 'Sophie Leroy',
      avatar: 'SL',
      lastMessage: 'Can you send me the files?',
      timestamp: '10:45',
      unread: 1,
      online: true
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      content: 'Hi! How are you?',
      sender: 'other',
      timestamp: '14:30',
      status: 'read'
    },
    {
      id: '2',
      content: 'I\'m doing very well, thank you! And you?',
      sender: 'me',
      timestamp: '14:31',
      status: 'read'
    },
    {
      id: '3',
      content: 'I have a new proposal for you',
      sender: 'other',
      timestamp: '14:32',
      status: 'delivered'
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Ici on enverrait le message
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  return (
    <div className="h-[600px] flex bg-[#1e2938] rounded-xl overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-[#35414e] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#35414e]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Messages</h3>
            <ModernButton size="sm" variant="outline">
              <MoreVertical size={16} />
            </ModernButton>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search a conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-4 border-b border-[#35414e] cursor-pointer hover:bg-[#35414e] transition-colors ${
                selectedConversation === conversation.id ? 'bg-[#35414e]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white font-semibold">
                    {conversation.avatar}
                  </div>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e2938]"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {conversation.name}
                    </h4>
                    <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <div className="bg-[#9c68f2] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#35414e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-[#35414e] rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-400" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedConv?.avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{selectedConv?.name}</h4>
                  <p className="text-xs text-gray-400">
                    {selectedConv?.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ModernButton size="sm" variant="outline">
                  <Phone size={16} />
                </ModernButton>
                <ModernButton size="sm" variant="outline">
                  <Video size={16} />
                </ModernButton>
                <ModernButton size="sm" variant="outline">
                  <MoreVertical size={16} />
                </ModernButton>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === 'me'
                        ? 'bg-[#9c68f2] text-white'
                        : 'bg-[#35414e] text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                      {message.sender === 'me' && (
                        <div className="ml-1">
                          {message.status === 'read' ? (
                            <CheckCheck size={12} className="text-blue-400" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck size={12} className="text-gray-400" />
                          ) : (
                            <Check size={12} className="text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[#35414e]">
              <div className="flex items-center gap-3">
                <ModernButton size="sm" variant="outline">
                  <Paperclip size={16} />
                </ModernButton>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full px-4 py-2 bg-[#35414e] border border-[#1e2938] rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>
                
                <ModernButton size="sm" variant="outline">
                  <Smile size={16} />
                </ModernButton>
                
                <ModernButton onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send size={16} />
                </ModernButton>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#35414e] rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-gray-400">Choose a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;
