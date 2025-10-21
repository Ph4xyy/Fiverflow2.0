import React from 'react';
import { useProfile } from '../hooks/useProfile';
import Layout from './Layout';
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  Edit3, 
  MessageCircle, 
  UserPlus, 
  Shield,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UniversalProfilePageProps {
  username?: string;
}

const UniversalProfilePage: React.FC<UniversalProfilePageProps> = ({ username }) => {
  const { profileData, loading, error, isOwnProfile } = useProfile(username);
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditProfile = () => {
    navigate('/settings');
  };

  const handleMessage = () => {
    // TODO: Implémenter la fonctionnalité de messagerie
    console.log('Message à', profileData?.username);
  };

  const handleFollow = () => {
    // TODO: Implémenter la fonctionnalité de suivi
    console.log('Suivre', profileData?.username);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error === 'Profil introuvable' 
                ? 'Ce profil n\'existe pas ou a été supprimé.'
                : 'Une erreur est survenue lors du chargement du profil.'
              }
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Profil non trouvé
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Impossible de charger les données du profil.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const { public_data } = profileData;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          {public_data.banner_url && (
            <img
              src={public_data.banner_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {public_data.avatar_url ? (
                      <img
                        src={public_data.avatar_url}
                        alt={public_data.full_name || public_data.username || 'Avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                      <Shield className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {public_data.full_name || 'Utilisateur'}
                      </h1>
                      {public_data.username && (
                        <p className="text-gray-600 dark:text-gray-400">@{public_data.username}</p>
                      )}
                      {public_data.bio && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300">{public_data.bio}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {isOwnProfile ? (
                        <button
                          onClick={handleEditProfile}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Modifier mon profil
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleMessage}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </button>
                          <button
                            onClick={handleFollow}
                            className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Suivre
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informations
                  </h3>
                  
                  <div className="space-y-3">
                    {public_data.location && (
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-5 h-5" />
                        <span>{public_data.location}</span>
                      </div>
                    )}
                    
                    {public_data.website && (
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Globe className="w-5 h-5" />
                        <a
                          href={public_data.website.startsWith('http') ? public_data.website : `https://${public_data.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-500 transition-colors flex items-center gap-1"
                        >
                          {public_data.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-5 h-5" />
                      <span>Membre depuis {formatDate(public_data.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats (placeholder pour futures fonctionnalités) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Activité
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Projets</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Clients</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UniversalProfilePage;
