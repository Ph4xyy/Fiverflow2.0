import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import MessagingSystem from '../components/MessagingSystem';
import ThemeSelector from '../components/ThemeSelector';
import StatusSelector from '../components/StatusSelector';
import ImageUpload from '../components/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProfileService, ProfileData, PrivacySettings } from '../services/profileService';
import { ProjectsService, Project as UserProject } from '../services/projectsService';
// import { SkillsService, Skill as UserSkill } from '../services/skillsService';
import { ActivityService, Activity as UserActivity } from '../services/activityService';
import { StatisticsService } from '../services/statisticsService';
import ProjectCard from '../components/ProjectCard';
// import SocialLinks from '../components/SocialLinks';
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
  Coffee
} from 'lucide-react';

// Interfaces supprimées - utilise maintenant les types des services

// Interface Project supprimée - utilise maintenant UserProject du service

// Interface Achievement supprimée - utilise maintenant les vraies données

const ProfilePageNew: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'activity'>('overview');
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [isOwnProfile] = useState(true); // Simulate if it's the user's own profile
  const [isAdmin, setIsAdmin] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile data - utilise les vraies données de l'utilisateur
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: 'Utilisateur', // Valeur par défaut, sera mise à jour
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

  // Paramètres de confidentialité
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_email: true,
    show_phone: true
  });

  // Nouvelles données
  // skills supprimé - utilise maintenant les vraies données
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [statistics, setStatistics] = useState({
    clients: 0,
    orders: 0,
    rating: 4.5,
    experience: 1
  });
  const [socialNetworks, setSocialNetworks] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    discord: '',
    website: ''
  });

  // Charger les données du profil depuis la base de données
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        console.log('🔍 ProfilePage: Pas d\'utilisateur connecté');
        return;
      }

      // setIsLoading(true);
      console.log('🔍 ProfilePage: Chargement du profil pour user:', user.id, 'email:', user.email);

      try {
        const data = await ProfileService.getProfile(user.id);
        
        if (data) {
          setProfileData((prev: ProfileData) => ({
            ...prev,
            ...data,
            email: data.email || user.email || 'john@example.com'
          }));
          
          // Mettre à jour les paramètres de confidentialité
          setPrivacySettings({
            show_email: data.show_email ?? true,
            show_phone: data.show_phone ?? true
          });
        } else {
          // Utiliser les données de l'utilisateur auth comme fallback
          setProfileData((prev: ProfileData) => ({
            ...prev,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
            email: user.email || 'john@example.com'
          }));
        }

        // Charger les compétences (TODO: implémenter l'affichage des compétences)

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

        // Charger les statistiques
        try {
          const userStats = await StatisticsService.getProfileStatistics(user.id);
          setStatistics(userStats);
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
        }

        // Charger les réseaux sociaux
        if (data) {
          setSocialNetworks({
            github: data.github_url || '',
            linkedin: data.linkedin_url || '',
            twitter: data.twitter_url || '',
            discord: data.discord_username || '',
            website: data.website || ''
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        // Fallback vers les données auth
        setProfileData((prev: ProfileData) => ({
          ...prev,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
          email: user.email || 'john@example.com'
        }));
      } finally {
        // setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Vérifier le statut admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        if (!supabase) return;
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setIsAdmin(data.is_admin);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fonctions pour gérer les uploads d'images
  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    if (!user) return null;
    return await ProfileService.uploadProfileImage(user.id, file, 'avatar');
  };

  const handleBannerUpload = async (file: File): Promise<string | null> => {
    if (!user) return null;
    return await ProfileService.uploadProfileImage(user.id, file, 'banner');
  };

  const handleAvatarRemove = async (): Promise<boolean> => {
    if (!user) return false;
    return await ProfileService.deleteProfileImage(user.id, 'avatar');
  };

  const handleBannerRemove = async (): Promise<boolean> => {
    if (!user) return false;
    return await ProfileService.deleteProfileImage(user.id, 'banner');
  };

  // Fonction pour sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Préparer les données à sauvegarder incluant les réseaux sociaux
      const dataToSave = {
        ...profileData,
        github_url: socialNetworks.github,
        linkedin_url: socialNetworks.linkedin,
        twitter_url: socialNetworks.twitter,
        discord_username: socialNetworks.discord,
        website: socialNetworks.website
      };

      const success = await ProfileService.updateProfile(user.id, dataToSave);
      if (success) {
        setIsEditMenuOpen(false);
        // Recharger les données
        const updatedData = await ProfileService.getProfile(user.id);
        if (updatedData) {
          setProfileData((prev: ProfileData) => ({ ...prev, ...updatedData }));
          // Mettre à jour les réseaux sociaux
          setSocialNetworks({
            github: updatedData.github_url || '',
            linkedin: updatedData.linkedin_url || '',
            twitter: updatedData.twitter_url || '',
            discord: updatedData.discord_username || '',
            website: updatedData.website || ''
          });
        }
      } else {
        console.error('Erreur lors de la sauvegarde du profil');
        // Ne pas afficher d'alerte, juste log l'erreur
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Ne pas afficher d'alerte, juste log l'erreur
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour sauvegarder les paramètres
  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Préparer les données à sauvegarder incluant les réseaux sociaux
      const dataToSave = {
        ...profileData,
        github_url: socialNetworks.github,
        linkedin_url: socialNetworks.linkedin,
        twitter_url: socialNetworks.twitter,
        discord_username: socialNetworks.discord,
        website: socialNetworks.website
      };

      const success = await ProfileService.updateProfile(user.id, dataToSave);
      const privacySuccess = await ProfileService.updatePrivacySettings(user.id, privacySettings);
      
      if (success && privacySuccess) {
        setIsSettingsMenuOpen(false);
        // Recharger les données
        const updatedData = await ProfileService.getProfile(user.id);
        if (updatedData) {
          setProfileData((prev: ProfileData) => ({ ...prev, ...updatedData }));
          setPrivacySettings({
            show_email: updatedData.show_email ?? true,
            show_phone: updatedData.show_phone ?? true
          });
          // Mettre à jour les réseaux sociaux
          setSocialNetworks({
            github: updatedData.github_url || '',
            linkedin: updatedData.linkedin_url || '',
            twitter: updatedData.twitter_url || '',
            discord: updatedData.discord_username || '',
            website: updatedData.website || ''
          });
        }
      } else {
        console.error('Erreur lors de la sauvegarde des paramètres');
        // Ne pas afficher d'alerte, juste log l'erreur
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Ne pas afficher d'alerte, juste log l'erreur
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour changer le statut
  const handleStatusChange = async (status: 'available' | 'busy' | 'away' | 'do_not_disturb') => {
    if (!user) return;

    try {
      const success = await ProfileService.updateStatus(user.id, status);
      if (success) {
        setProfileData((prev: ProfileData) => ({ ...prev, status }));
      } else {
        console.error('Erreur lors de la mise à jour du statut');
        // Ne pas afficher d'alerte, juste log l'erreur
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      // Ne pas afficher d'alerte, juste log l'erreur
    }
  };

  // badges supprimé - utilise maintenant les vraies données

  // Social networks data (utilise la déclaration plus haut)

  // socialLinks supprimé - utilise maintenant les vraies données

  // projects statiques supprimés - utilise maintenant les vraies données

  // achievements supprimé - utilise maintenant les vraies données

  // stats supprimé - utilise maintenant les vraies données

  // recentActivity supprimé - utilise maintenant les vraies données

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header Profile */}
        <ModernCard className="relative overflow-hidden p-0">
          {/* Background gradient */}
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
              {isOwnProfile && (
                <div className="absolute inset-0 group">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ImageUpload
                        currentImageUrl={profileData.banner_url}
                        onImageChange={handleBannerUpload}
                        onImageRemove={handleBannerRemove}
                        type="banner"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="p-6 -mt-16 relative">
              <div className="flex items-end justify-between">
                <div className="flex items-end gap-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    {profileData.avatar_url ? (
                      <img 
                        src={profileData.avatar_url} 
                        alt="Avatar" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#2a3441]"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-[#2a3441]">
                        {profileData.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                      </div>
                    )}
                    {isOwnProfile && (
                      <div className="absolute inset-0 group">
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-full transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ImageUpload
                              currentImageUrl={profileData.avatar_url}
                              onImageChange={handleAvatarUpload}
                              onImageRemove={handleAvatarRemove}
                              type="avatar"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{profileData.full_name || 'Utilisateur'}</h1>
                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {/* Badge Administrateur */}
                        {isAdmin && (
                          <div className="relative group">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center cursor-pointer">
                              <Shield size={16} className="text-white" />
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border border-gray-700">
                                <div className="font-semibold">Administrateur</div>
                                <div className="text-gray-300 text-xs">Accès complet au système</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Badge Abonnement - supprimé temporairement */}
                        <div className="w-8 h-8 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center cursor-pointer">
                          <Crown size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-gray-400 mb-2">{profileData.professional_title || 'Professionnel'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {profileData.location || 'Non spécifié'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        Membre depuis {new Date().getFullYear()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Coffee size={16} />
                        {profileData.status === 'available' && 'Disponible'}
                        {profileData.status === 'busy' && 'Occupé'}
                        {profileData.status === 'away' && 'Absent'}
                        {profileData.status === 'do_not_disturb' && 'Ne pas déranger'}
                        {!profileData.status && 'Disponible'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pb-4">
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
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsMessagingOpen(!isMessagingOpen)}
                      >
                        <MessageSquare size={16} className="mr-2" />
                        Message
                      </ModernButton>
                      <ModernButton variant="outline" size="sm">
                        <Share2 size={16} className="mr-2" />
                        Share
                      </ModernButton>
                      <ModernButton size="sm">
                        <Plus size={16} className="mr-2" />
                        Follow
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, full_name: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titre professionnel
                  </label>
                  <input
                    type="text"
                    value={profileData.professional_title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, professional_title: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={profileData.location || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={profileData.website || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    placeholder="https://votre-site.com"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.contact_email || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, contact_email: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] resize-none"
                    placeholder="Parlez-nous de vous..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <StatusSelector
                    currentStatus={profileData.status || 'available'}
                    onStatusChange={handleStatusChange}
                  />
                </div>
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
                          // Navigation vers la page des paramètres
                          window.location.href = '/settings';
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
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={profileData.full_name || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, full_name: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titre professionnel
                        </label>
                        <input
                          type="text"
                          value={profileData.professional_title || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, professional_title: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Lieu
                        </label>
                        <input
                          type="text"
                          value={profileData.location || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, location: e.target.value})}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileData.bio || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfileData({...profileData, bio: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] resize-none"
                        />
                      </div>

                      {/* Paramètres de confidentialité */}
                      <div className="pt-4 border-t border-[#35414e]">
                        <h5 className="text-md font-semibold text-white mb-3">Confidentialité</h5>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-300">
                                Afficher l'email
                              </label>
                              <p className="text-xs text-gray-400">
                                Permet aux autres utilisateurs de voir votre email
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.show_email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrivacySettings({...privacySettings, show_email: e.target.checked})}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-300">
                                Afficher le téléphone
                              </label>
                              <p className="text-xs text-gray-400">
                                Permet aux autres utilisateurs de voir votre téléphone
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacySettings.show_phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrivacySettings({...privacySettings, show_phone: e.target.checked})}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Contact & Social Networks */}
                    <div className="space-y-6">
                      {/* Contact Section */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Informations de contact</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Email de contact
                            </label>
                            <input
                              type="email"
                              value={profileData.contact_email || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, contact_email: e.target.value})}
                              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                              placeholder="contact@example.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Email professionnel pour les clients
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Téléphone de contact
                            </label>
                            <input
                              type="tel"
                              value={profileData.contact_phone || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, contact_phone: e.target.value})}
                              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                              placeholder="+33 6 12 34 56 78"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Numéro professionnel pour les clients
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Social Networks Section */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Réseaux sociaux</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                </div>
                                GitHub
                              </div>
                            </label>
                            <input
                              type="text"
                              placeholder="https://github.com/username"
                              value={socialNetworks.github}
                              onChange={(e) => setSocialNetworks({...socialNetworks, github: e.target.value})}
                              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                  </svg>
                                </div>
                                Discord
                              </div>
                            </label>
                            <input
                              type="text"
                              placeholder="username#1234"
                              value={socialNetworks.discord}
                              onChange={(e) => setSocialNetworks({...socialNetworks, discord: e.target.value})}
                              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                  </svg>
                                </div>
                                Twitter (X)
                              </div>
                            </label>
                            <input
                              type="text"
                              placeholder="@username"
                              value={socialNetworks.twitter}
                              onChange={(e) => setSocialNetworks({...socialNetworks, twitter: e.target.value})}
                              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                </div>
                                LinkedIn
                              </div>
                            </label>
                            <input
                              type="text"
                              placeholder="https://linkedin.com/in/username"
                              value={socialNetworks.linkedin}
                              onChange={(e) => setSocialNetworks({...socialNetworks, linkedin: e.target.value})}
                              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              <div className="flex items-center gap-2">
                                <Globe size={16} className="text-[#9c68f2]" />
                                Website
                              </div>
                            </label>
                            <input
                              type="url"
                              placeholder="https://yourwebsite.com"
                              value={socialNetworks.website}
                              onChange={(e) => setSocialNetworks({...socialNetworks, website: e.target.value})}
                              className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Theme Preferences */}
                    <div className="mt-6 pt-6 border-t border-[#35414e]">
                      <ThemeSelector />
                    </div>
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
            <MessagingSystem />
          </ModernCard>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ModernCard>
            <div className="relative">
              <div>
                <p className="text-2xl font-bold text-white">{statistics.orders}</p>
                <p className="text-sm text-gray-400">Commandes</p>
              </div>
              <Briefcase size={20} className="absolute top-0 right-0 text-[#9c68f2]" />
            </div>
          </ModernCard>
          <ModernCard>
            <div className="relative">
              <div>
                <p className="text-2xl font-bold text-white">{statistics.clients}</p>
                <p className="text-sm text-gray-400">Clients</p>
              </div>
              <Users size={20} className="absolute top-0 right-0 text-[#9c68f2]" />
            </div>
          </ModernCard>
          <ModernCard>
            <div className="relative">
              <div>
                <p className="text-2xl font-bold text-white">{statistics.rating}</p>
                <p className="text-sm text-gray-400">Note</p>
              </div>
              <Star size={20} className="absolute top-0 right-0 text-[#9c68f2]" />
            </div>
          </ModernCard>
          <ModernCard>
            <div className="relative">
              <div>
                <p className="text-2xl font-bold text-white">{statistics.experience}+</p>
                <p className="text-sm text-gray-400">Années d'exp.</p>
              </div>
              <TrendingUp size={20} className="absolute top-0 right-0 text-[#9c68f2]" />
            </div>
          </ModernCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <ModernCard>
              <div className="flex gap-1 mb-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'activity', label: 'Activity' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#9c68f2] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#35414e]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* About */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {profileData.bio || 'Aucune bio disponible.'}
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'React', 'TypeScript', 'Web Design', 'Mobile Design', 'Prototyping'].map(skill => (
                        <span key={skill} className="px-3 py-1 bg-[#35414e] text-white rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
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
                      onLike={(projectId: string) => {
                        console.log('Projet liké:', projectId);
                      }}
                      onView={(projectId: string) => {
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
              <div className="space-y-3">
                {socialNetworks.github && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <a href={socialNetworks.github} target="_blank" rel="noopener noreferrer" className="text-sm text-[#9c68f2] hover:text-white transition-colors">
                      GitHub
                    </a>
                  </div>
                )}
                {socialNetworks.linkedin && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <a href={socialNetworks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-[#9c68f2] hover:text-white transition-colors">
                      LinkedIn
                    </a>
                  </div>
                )}
                {socialNetworks.twitter && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <a href={socialNetworks.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-[#9c68f2] hover:text-white transition-colors">
                      Twitter
                    </a>
                  </div>
                )}
                {socialNetworks.discord && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">{socialNetworks.discord}</span>
                  </div>
                )}
                {socialNetworks.website && (
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-gray-400" />
                    <a href={socialNetworks.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#9c68f2] hover:text-white transition-colors">
                      Site web
                    </a>
                  </div>
                )}
                {!socialNetworks.github && !socialNetworks.linkedin && !socialNetworks.twitter && !socialNetworks.discord && !socialNetworks.website && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Aucun réseau social configuré
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Achievements */}
            <ModernCard title="Récompenses" icon={<Award size={20} className="text-white" />}>
              <div className="text-center py-8">
                <Award size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Aucune récompense</h3>
                <p className="text-gray-400">Vos récompenses apparaîtront ici</p>
              </div>
            </ModernCard>

            {/* Contact */}
            <ModernCard title="Contact" icon={<Mail size={20} className="text-white" />}>
              <div className="space-y-3">
                {profileData.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">{profileData.contact_email}</span>
                  </div>
                )}
                {profileData.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">{profileData.contact_phone}</span>
                  </div>
                )}
                {profileData.website && (
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-gray-400" />
                    <a 
                      href={profileData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#9c68f2] hover:text-white transition-colors"
                    >
                      {profileData.website}
                    </a>
                  </div>
                )}
                {!profileData.show_email && !profileData.show_phone && !profileData.website && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Aucune information de contact visible
                  </div>
                )}
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePageNew;
