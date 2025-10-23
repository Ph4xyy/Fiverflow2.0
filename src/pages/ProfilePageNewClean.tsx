import React, { useState, useEffect } from 'react';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ThemeSelector from '../components/ThemeSelector';
import StatusSelector from '../components/StatusSelector';
import ImageUpload from '../components/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ProfileService, ProfileData, PrivacySettings } from '../services/profileService';
import { ProjectsService, Project as UserProject } from '../services/projectsService';
import { SkillsService, Skill as UserSkill } from '../services/skillsService';
import { ActivityService, Activity as UserActivity } from '../services/activityService';
import ProjectCard from '../components/ProjectCard';
import SocialLinks from '../components/SocialLinks';
import { 
  Edit3, 
  Camera,
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Share2, 
  Plus,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Award,
  ThumbsUp,
  Eye,
  Settings,
  Shield,
  Zap,
  TrendingUp,
  Target,
  Coffee,
  ExternalLink,
  Crown,
  Save,
  X,
  Loader2,
  Activity
} from 'lucide-react';

interface SocialLink {
  platform: string;
  url: string;
  followers: number;
  icon: React.ReactNode;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  date: string;
}

const ProfilePageNewClean: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'activity'>('overview');
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isOwnProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: 'Utilisateur',
    professional_title: 'UI/UX Designer & Frontend Developer',
    location: 'Paris, France',
    bio: 'Passionate about design and development, I create exceptional user experiences for 5 years.',
    website: 'https://johndoe.design',
    email: user?.email || 'john@example.com',
    phone: '+33 6 12 34 56 78',
    status: 'available',
    show_email: true,
    show_phone: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_email: true,
    show_phone: true
  });

  // Nouvelles données
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [socialNetworks, setSocialNetworks] = useState([
    { id: 'github', name: 'GitHub', url: '', icon: <Globe size={20} />, color: '#333' },
    { id: 'linkedin', name: 'LinkedIn', url: '', icon: <Globe size={20} />, color: '#0077b5' },
    { id: 'twitter', name: 'Twitter', url: '', icon: <Globe size={20} />, color: '#1da1f2' },
    { id: 'discord', name: 'Discord', url: '', icon: <Globe size={20} />, color: '#7289da' },
    { id: 'website', name: 'Site web', url: '', icon: <Globe size={20} />, color: '#6c757d' }
  ]);

  // Charger les données du profil
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const data = await ProfileService.getProfile(user.id);
        
        if (data) {
          setProfileData(prev => ({
            ...prev,
            ...data,
            email: data.email || user.email || 'john@example.com'
          }));
          
          setPrivacySettings({
            show_email: data.show_email ?? true,
            show_phone: data.show_phone ?? true
          });
        }

        // Charger les compétences
        try {
          const userSkills = await SkillsService.getUserSkills(user.id);
          setSkills(userSkills);
        } catch (error) {
          console.error('Erreur lors du chargement des compétences:', error);
        }

        // Charger les projets
        try {
          const userProjects = await ProjectsService.getUserProjects(user.id);
          setProjects(userProjects);
        } catch (error) {
          console.error('Erreur lors du chargement des projets:', error);
        }

        // Charger l'activité
        try {
          const userActivity = await ActivityService.getUserActivity(user.id);
          setActivities(userActivity);
        } catch (error) {
          console.error('Erreur lors du chargement de l\'activité:', error);
        }

        // Charger les réseaux sociaux
        setSocialNetworks(prev => prev.map(social => ({
          ...social,
          url: data?.[`${social.id}_url`] || ''
        })));
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Fonction pour sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const success = await ProfileService.updateProfile(user.id, profileData);
      if (success) {
        setIsEditMenuOpen(false);
        console.log('Profil sauvegardé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour sauvegarder les paramètres
  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const success = await ProfileService.updateProfile(user.id, profileData);
      const privacySuccess = await ProfileService.updatePrivacySettings(user.id, privacySettings);
      
      if (success && privacySuccess) {
        setIsSettingsMenuOpen(false);
        console.log('Paramètres sauvegardés avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour changer le statut
  const handleStatusChange = async (newStatus: string) => {
    if (!user) return;

    try {
      await ProfileService.updateStatus(user.id, newStatus);
      setProfileData(prev => ({ ...prev, status: newStatus as any }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#9c68f2]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header Profile */}
        <ModernCard className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] opacity-10" />
          
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-t-xl relative overflow-hidden">
              {profileData.banner_url ? (
                <img 
                  src={profileData.banner_url} 
                  alt="Bannière" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#9c68f2] to-[#422ca5]" />
              )}
              
              <ImageUpload
                onUpload={(file) => {
                  // TODO: Implémenter l'upload de bannière
                  console.log('Upload bannière:', file);
                }}
                onRemove={() => {
                  // TODO: Implémenter la suppression de bannière
                  console.log('Suppression bannière');
                }}
                currentImage={profileData.banner_url}
                className="absolute inset-0"
                type="banner"
              />
            </div>

            {/* Profile Picture */}
            <div className="relative -mt-16 ml-6">
              <div className="w-32 h-32 rounded-full border-4 border-[#1e2938] overflow-hidden bg-[#35414e]">
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#35414e] flex items-center justify-center">
                    <Users size={48} className="text-gray-400" />
                  </div>
                )}
                
                <ImageUpload
                  onUpload={(file) => {
                    // TODO: Implémenter l'upload d'avatar
                    console.log('Upload avatar:', file);
                  }}
                  onRemove={() => {
                    // TODO: Implémenter la suppression d'avatar
                    console.log('Suppression avatar');
                  }}
                  currentImage={profileData.avatar_url}
                  className="absolute inset-0"
                  type="avatar"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {profileData.full_name}
                  </h1>
                  <p className="text-[#9c68f2] text-lg mb-2">
                    {profileData.professional_title}
                  </p>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    {profileData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {profileData.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      Membre depuis {new Date().getFullYear()}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#35414e] rounded-full">
                      <div className={`w-2 h-2 rounded-full ${
                        profileData.status === 'available' ? 'bg-green-500' :
                        profileData.status === 'busy' ? 'bg-red-500' :
                        profileData.status === 'away' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-sm text-white capitalize">
                        {profileData.status === 'available' ? 'Disponible' :
                         profileData.status === 'busy' ? 'Occupé' :
                         profileData.status === 'away' ? 'Absent' :
                         'Ne pas déranger'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {isOwnProfile ? (
                    <>
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditMenuOpen(!isEditMenuOpen)}
                      >
                        <Edit3 size={16} className="mr-2" />
                        Edit profile
                      </ModernButton>
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                      >
                        <Settings size={16} className="mr-2" />
                        Settings
                      </ModernButton>
                    </>
                  ) : (
                    <>
                      <ModernButton size="sm">
                        <Share2 size={16} className="mr-2" />
                        Suivre
                      </ModernButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Edit Profile Menu */}
        {isEditMenuOpen && isOwnProfile && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setIsEditMenuOpen(false)}></div>
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <ModernCard>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Edit profile</h3>
                    <button 
                      onClick={() => setIsEditMenuOpen(false)}
                      className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={profileData.full_name || ''}
                          onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                          placeholder="Votre nom complet"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titre professionnel
                        </label>
                        <input
                          type="text"
                          value={profileData.professional_title || ''}
                          onChange={(e) => setProfileData({...profileData, professional_title: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                          placeholder="Développeur, Designer, etc."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio || ''}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                        rows={4}
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Localisation
                        </label>
                        <input
                          type="text"
                          value={profileData.location || ''}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                          placeholder="Paris, France"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Site web
                        </label>
                        <input
                          type="url"
                          value={profileData.website || ''}
                          onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                          placeholder="https://votre-site.com"
                        />
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Statut
                      </label>
                      <StatusSelector
                        value={profileData.status || 'available'}
                        onChange={handleStatusChange}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#35414e]">
                    <ModernButton 
                      variant="outline" 
                      onClick={() => setIsEditMenuOpen(false)}
                      disabled={isSaving}
                    >
                      Annuler
                    </ModernButton>
                    <ModernButton 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Sauvegarder
                        </>
                      )}
                    </ModernButton>
                  </div>
                </ModernCard>
              </div>
            </div>
          </>
        )}

        {/* Settings Menu */}
        {isSettingsMenuOpen && isOwnProfile && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setIsSettingsMenuOpen(false)}></div>
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <ModernCard>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Profile settings</h3>
                    <div className="flex items-center gap-2">
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsSettingsMenuOpen(false);
                          window.location.href = '/profile-settings';
                        }}
                      >
                        <Settings size={16} className="mr-2" />
                        Paramètres avancés
                      </ModernButton>
                      <button 
                        onClick={() => setIsSettingsMenuOpen(false)}
                        className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
                      >
                        <X size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Profile Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Informations de base</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.contact_email || ''}
                          onChange={(e) => setProfileData({...profileData, contact_email: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={profileData.contact_phone || ''}
                          onChange={(e) => setProfileData({...profileData, contact_phone: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                        />
                      </div>
                    </div>

                    {/* Right Column - Privacy Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Confidentialité</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#35414e] rounded-lg">
                          <div>
                            <h5 className="font-medium text-white">Afficher l'email</h5>
                            <p className="text-sm text-gray-400">Permettre aux autres de voir votre email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacySettings.show_email}
                              onChange={(e) => setPrivacySettings({...privacySettings, show_email: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#35414e] rounded-lg">
                          <div>
                            <h5 className="font-medium text-white">Afficher le téléphone</h5>
                            <p className="text-sm text-gray-400">Permettre aux autres de voir votre numéro</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacySettings.show_phone}
                              onChange={(e) => setPrivacySettings({...privacySettings, show_phone: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Preferences */}
                  <div className="mt-6 pt-6 border-t border-[#35414e]">
                    <ThemeSelector />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#35414e]">
                    <ModernButton 
                      variant="outline" 
                      onClick={() => setIsSettingsMenuOpen(false)}
                      disabled={isSaving}
                    >
                      Annuler
                    </ModernButton>
                    <ModernButton 
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Sauvegarder
                        </>
                      )}
                    </ModernButton>
                  </div>
                </ModernCard>
              </div>
            </div>
          </>
        )}

        {/* Messaging System */}
        {isMessagingOpen && (
          <ModernCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Messages</h3>
              <button 
                onClick={() => setIsMessagingOpen(false)}
                className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </ModernCard>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ModernCard>
            <div className="relative">
              <div>
                <p className="text-2xl font-bold text-white">{projects.length}</p>
                <p className="text-gray-400 text-sm">Projets</p>
              </div>
              <Briefcase size={20} className="absolute top-0 right-0 text-[#9c68f2]" />
            </div>
          </ModernCard>
          <ModernCard>
            <div className="relative">
              <div>
                <p className="text-2xl font-bold text-white">18</p>
                <p className="text-gray-400 text-sm">Clients</p>
              </div>
              <Users size={20} className="absolute top-0 right-0 text-[#9c68f2]" />
            </div>
          </ModernCard>
          <ModernCard>
            <div className="relative">
              <div>
                <p className="text-2xl font-bold text-white">4.9</p>
                <p className="text-gray-400 text-sm">Note</p>
              </div>
              <Star size={20} className="absolute top-0 right-0 text-[#9c68f2]" />
            </div>
          </ModernCard>
          <ModernCard>
            <div className="relative">
              <div>
                <p className="text-2xl font-bold text-white">5+</p>
                <p className="text-gray-400 text-sm">Années d'exp.</p>
              </div>
              <TrendingUp size={20} className="absolute top-0 right-0 text-[#9c68f2]" />
            </div>
          </ModernCard>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <ModernCard>
              <div className="flex gap-1 mb-6">
                {[
                  { id: 'overview', label: 'Aperçu', icon: <Users size={16} /> },
                  { id: 'projects', label: 'Projets', icon: <Briefcase size={16} /> },
                  { id: 'activity', label: 'Activité', icon: <Activity size={16} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#9c68f2] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#35414e]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">À propos</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {profileData.bio || 'Aucune bio disponible.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      showAuthor={false}
                      onLike={(projectId) => {
                        console.log('Projet liké:', projectId);
                      }}
                      onView={(projectId) => {
                        console.log('Projet vu:', projectId);
                      }}
                    />
                  ))}
                  {projects.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Aucun projet</h3>
                      <p className="text-gray-400 mb-4">Commencez par créer votre premier projet</p>
                      <ModernButton>
                        <Plus size={16} className="mr-2" />
                        Créer un projet
                      </ModernButton>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-[#35414e] rounded-lg">
                      <div className="w-8 h-8 bg-[#9c68f2] rounded-full flex items-center justify-center">
                        <Activity size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                        <p className="text-xs text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center py-12">
                      <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Aucune activité</h3>
                      <p className="text-gray-400">Votre activité apparaîtra ici</p>
                    </div>
                  )}
                </div>
              )}
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Links */}
            <ModernCard title="Réseaux sociaux" icon={<Globe size={20} className="text-white" />}>
              <SocialLinks socialNetworks={socialNetworks} />
            </ModernCard>

            {/* Contact */}
            <ModernCard title="Contact" icon={<Mail size={20} className="text-white" />}>
              <div className="space-y-3">
                {profileData.contact_email && privacySettings.show_email && (
                  <div className="flex items-center gap-3 p-3 bg-[#35414e] rounded-lg">
                    <Mail size={16} className="text-[#9c68f2]" />
                    <span className="text-white">{profileData.contact_email}</span>
                  </div>
                )}
                {profileData.contact_phone && privacySettings.show_phone && (
                  <div className="flex items-center gap-3 p-3 bg-[#35414e] rounded-lg">
                    <Phone size={16} className="text-[#9c68f2]" />
                    <span className="text-white">{profileData.contact_phone}</span>
                  </div>
                )}
                {profileData.website && (
                  <div className="flex items-center gap-3 p-3 bg-[#35414e] rounded-lg">
                    <Globe size={16} className="text-[#9c68f2]" />
                    <a 
                      href={profileData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-[#9c68f2] transition-colors"
                    >
                      {profileData.website}
                    </a>
                  </div>
                )}
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageNewClean;
