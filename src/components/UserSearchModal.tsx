import React, { useState, useEffect } from 'react';
import { Search, User, Mail, MessageCircle, UserPlus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_friend?: boolean;
  friend_request_status?: 'pending' | 'accepted' | 'declined' | 'blocked';
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (userId: string) => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartConversation 
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'username' | 'email'>('username');

  // Rechercher des utilisateurs
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchType]);

  const searchUsers = async () => {
    if (!user || searchQuery.length < 2) return;
    
    setLoading(true);
    try {
      // Pour l'instant, utiliser des données de test
      // TODO: Remplacer par les vraies données quand la DB sera créée
      const mockResults: User[] = [
        {
          id: '1',
          full_name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          avatar_url: '',
          is_friend: false,
          friend_request_status: 'pending'
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          username: 'janesmith',
          email: 'jane@example.com',
          avatar_url: '',
          is_friend: true,
          friend_request_status: 'accepted'
        },
        {
          id: '3',
          full_name: 'Mike Johnson',
          username: 'mikej',
          email: 'mike@example.com',
          avatar_url: '',
          is_friend: false,
          friend_request_status: 'none'
        }
      ];
      
      // Filtrer les résultats basés sur la recherche
      const filteredResults = mockResults.filter(user => 
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (searchType === 'email' && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = (userId: string) => {
    onStartConversation(userId);
    onClose();
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      // TODO: Implémenter l'envoi de demande d'amis
      console.log('Envoi de demande d\'amis à:', userId);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
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
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Nouvelle conversation</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSearchType('username')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  searchType === 'username'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Username
              </button>
              <button
                onClick={() => setSearchType('email')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  searchType === 'email'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Email
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Rechercher par ${searchType === 'username' ? 'username' : 'email'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <User className="w-12 h-12 text-gray-500 mb-3" />
                <p className="text-gray-400 text-center">
                  Aucun utilisateur trouvé pour "{searchQuery}"
                </p>
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Search className="w-12 h-12 text-gray-500 mb-3" />
                <p className="text-gray-400 text-center">
                  Tapez au moins 2 caractères pour rechercher
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-800 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-300">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {user.full_name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>@{user.username}</span>
                        {searchType === 'email' && (
                          <>
                            <span>•</span>
                            <span>{user.email}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {user.is_friend ? (
                        <button
                          onClick={() => handleStartConversation(user.id)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          title="Commencer une conversation"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      ) : user.friend_request_status === 'pending' ? (
                        <span className="text-sm text-yellow-400">Demande envoyée</span>
                      ) : (
                        <button
                          onClick={() => handleSendFriendRequest(user.id)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                          title="Envoyer une demande d'amis"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
