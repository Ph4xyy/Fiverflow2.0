import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import { useProfile } from '../hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  MessageSquare, 
  Share2, 
  Plus,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Award,
  Settings,
  TrendingUp,
  Save,
  X,
  Loader2,
  Activity,
  Shield,
  Crown,
  Coffee,
  Heart,
  Eye,
  UserPlus,
  User
} from 'lucide-react';

interface UniversalProfilePageNewProps {
  username?: string;
}

const UniversalProfilePageNew: React.FC<UniversalProfilePageNewProps> = ({ username }) => {
  const { profileData, loading, error, isOwnProfile } = useProfile(username);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'activity'>('overview');
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  // Données simulées pour l'instant (à remplacer par de vraies données)
  const [skills] = useState([
    { id: '1', name: 'React', level: 90, category: 'Frontend' },
    { id: '2', name: 'TypeScript', level: 85, category: 'Frontend' },
    { id: '3', name: 'Node.js', level: 80, category: 'Backend' },
    { id: '4', name: 'UI/UX Design', level: 95, category: 'Design' }
  ]);

  const [awards] = useState([
    { id: '1', title: 'Best Designer 2023', issuer: 'Design Awards', date: '2023-12-01', description: 'Awarded for exceptional design work' },
    { id: '2', title: 'Top Performer', issuer: 'Company', date: '2023-11-01', description: 'Recognized for outstanding performance' }
  ]);

  const [orders] = useState([
    { id: '1', title: 'Website Redesign', client: 'Tech Corp', amount: 2500, status: 'completed', deadline: '2024-01-15' },
    { id: '2', title: 'Mobile App UI', client: 'StartupXYZ', amount: 1800, status: 'in_progress', deadline: '2024-02-01' }
  ]);

  const [activities] = useState([
    { id: '1', type: 'order_completed', title: 'Completed Website Redesign', description: 'Successfully delivered the project', timestamp: '2024-01-10T10:00:00Z' },
    { id: '2', type: 'skill_added', title: 'Added new skill', description: 'Learned React Native', timestamp: '2024-01-08T14:30:00Z' }
  ]);

  const [statistics] = useState({
    clients: 12,
    orders: 8,
    rating: 4.8,
    experience: 3
  });

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
    // TODO: Implémenter la messagerie
    console.log('Message à', profileData?.username);
  };

  const handleFollow = () => {
    // TODO: Implémenter le système de suivi
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 max-w-md">
              <div className="text-red-500 mb-4">
                <X className="h-12 w-12 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
                {error}
              </h1>
              <p className="text-red-600 dark:text-red-300 mb-6">
                {error === 'Profil introuvable' 
                  ? 'Ce profil n\'existe pas ou a été supprimé.'
                  : 'Une erreur est survenue lors du chargement du profil.'
                }
              </p>
              <ModernButton
                onClick={() => navigate('/')}
                variant="primary"
                size="md"
              >
                Retour à l'accueil
              </ModernButton>
            </div>
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
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 max-w-md">
              <div className="text-gray-500 mb-4">
                <User className="h-12 w-12 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Profil non trouvé
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Impossible de charger les données du profil.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const { public_data } = profileData;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header avec bannière */}
        <div className="relative">
          {/* Bannière */}
          <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
            {public_data.banner_url && (
              <img
                src={public_data.banner_url}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>

          {/* Contenu du header */}
          <div className="relative -mt-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                {/* Section principale du profil */}
                <div className="px-6 py-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Avatar et infos de base */}
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-gray-800">
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

                      {/* Infos du profil */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                              {public_data.full_name || 'Utilisateur'}
                            </h1>
                            {public_data.username && (
                              <p className="text-gray-600 dark:text-gray-400 text-lg">@{public_data.username}</p>
                            )}
                            {public_data.bio && (
                              <p className="mt-2 text-gray-700 dark:text-gray-300 max-w-2xl">{public_data.bio}</p>
                            )}
                          </div>

                          {/* Boutons d'action */}
                          <div className="flex gap-3">
                            {isOwnProfile ? (
                              <ModernButton
                                onClick={handleEditProfile}
                                variant="primary"
                                size="md"
                                className="flex items-center gap-2"
                              >
                                <Edit3 className="w-4 h-4" />
                                Modifier mon profil
                              </ModernButton>
                            ) : (
                              <>
                                <ModernButton
                                  onClick={handleMessage}
                                  variant="primary"
                                  size="md"
                                  className="flex items-center gap-2"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Message
                                </ModernButton>
                                <ModernButton
                                  onClick={handleFollow}
                                  variant="secondary"
                                  size="md"
                                  className="flex items-center gap-2"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  Suivre
                                </ModernButton>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Informations de contact */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                className="hover:text-blue-500 transition-colors"
                              >
                                {public_data.website}
                              </a>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-5 h-5" />
                            <span>Membre depuis {formatDate(public_data.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.clients}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Clients</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.orders}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Projets</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.rating}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Note</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.experience}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Années</div>
                    </div>
                  </div>
                </div>

                {/* Onglets de navigation */}
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: 'Aperçu', icon: Eye },
                      { id: 'projects', label: 'Projets', icon: Briefcase },
                      { id: 'activity', label: 'Activité', icon: Activity }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Contenu des onglets */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Compétences */}
                      <ModernCard>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compétences</h3>
                          {isOwnProfile && (
                            <ModernButton variant="secondary" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter
                            </ModernButton>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {skills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{skill.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{skill.category}</div>
                              </div>
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{skill.level}%</div>
                            </div>
                          ))}
                        </div>
                      </ModernCard>

                      {/* Récompenses */}
                      <ModernCard>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Récompenses</h3>
                          {isOwnProfile && (
                            <ModernButton variant="secondary" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter
                            </ModernButton>
                          )}
                        </div>
                        <div className="space-y-4">
                          {awards.map((award) => (
                            <div key={award.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <Award className="w-6 h-6 text-yellow-500 mt-1" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">{award.title}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{award.issuer}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-500">{formatDate(award.date)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ModernCard>
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <ModernCard key={order.id}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{order.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Client: {order.client}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900 dark:text-white">${order.amount}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-500">{order.status}</div>
                            </div>
                          </div>
                        </ModernCard>
                      ))}
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <ModernCard key={activity.id}>
                          <div className="flex items-start gap-4">
                            <Activity className="w-5 h-5 text-blue-500 mt-1" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{activity.title}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-500">{formatDate(activity.timestamp)}</div>
                            </div>
                          </div>
                        </ModernCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UniversalProfilePageNew;
