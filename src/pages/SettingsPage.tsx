import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProfileService, ProfileData, PrivacySettings } from '../services/profileService';
import { SkillsService, Skill } from '../services/skillsService';
import { AwardsService, Award } from '../services/awardsService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';
import SkillModal from '../components/SkillModal';
import AwardModal from '../components/AwardModal';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  X,
  Loader2,
  Settings,
  ChevronRight,
  Check,
  Award,
  Plus,
  Edit,
  CreditCard
} from 'lucide-react';

interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    professional_title: '',
    location: '',
    bio: '',
    website: '',
    email: user?.email || '',
    phone: '',
    contact_email: '',
    contact_phone: '',
    status: 'available',
    show_email: true,
    show_phone: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_email: true,
    show_phone: true
  });

  // Social networks
  const [socialNetworks, setSocialNetworks] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    discord: '',
    website: ''
  });

  // Skills et récompenses
  const [skills, setSkills] = useState<Skill[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [isEditingAward, setIsEditingAward] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingAward, setEditingAward] = useState<Award | null>(null);

  // Settings categories
  const categories: SettingsCategory[] = [
    {
      id: 'profile',
      name: 'Profil',
      icon: <User size={20} />,
      description: 'Informations personnelles et professionnelles'
    },
    {
      id: 'privacy',
      name: 'Confidentialité',
      icon: <Shield size={20} />,
      description: 'Paramètres de confidentialité et visibilité'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell size={20} />,
      description: 'Préférences de notifications'
    },
    {
      id: 'appearance',
      name: 'Apparence',
      icon: <Palette size={20} />,
      description: 'Thème et préférences visuelles'
    },
    {
      id: 'social',
      name: 'Réseaux sociaux',
      icon: <Globe size={20} />,
      description: 'Liens vers vos réseaux sociaux'
    },
    {
      id: 'skills',
      name: 'Compétences & Récompenses',
      icon: <Award size={20} />,
      description: 'Gérer vos compétences et récompenses'
    },
    {
      id: 'subscription',
      name: 'Abonnement & Paiement',
      icon: <CreditCard size={20} />,
      description: 'Gérer votre abonnement et méthodes de paiement'
    }
  ];

  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && ['profile', 'privacy', 'notifications', 'appearance', 'social', 'skills', 'subscription'].includes(category)) {
      setActiveCategory(category);
    }
  }, [searchParams]);

  // Load profile data
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
            email: data.email || user.email || ''
          }));
          
          setPrivacySettings({
            show_email: data.show_email ?? true,
            show_phone: data.show_phone ?? true
          });

          setSocialNetworks({
            github: data.github_url || '',
            linkedin: data.linkedin_url || '',
            twitter: data.twitter_url || '',
            discord: data.discord_username || '',
            website: data.website || ''
          });
        }

        // Charger les compétences
        const userSkills = await SkillsService.getUserSkills(user.id);
        setSkills(userSkills);

        // Charger les récompenses
        const userAwards = await AwardsService.getUserAwards(user.id);
        setAwards(userAwards);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Save profile
  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
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
        // Show success message and navigate back
        showSuccessNotification('Paramètres sauvegardés avec succès !');
        
        // Recharger les données du profil
        const updatedData = await ProfileService.getProfile(user.id);
        if (updatedData) {
          setProfileData(updatedData);
          setSocialNetworks({
            github: updatedData.github_url || '',
            linkedin: updatedData.linkedin_url || '',
            twitter: updatedData.twitter_url || '',
            discord: updatedData.discord_username || '',
            website: updatedData.website || ''
          });
        }
        
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        showErrorNotification('Erreur lors de la sauvegarde des paramètres');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showErrorNotification('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Render category content
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Informations personnelles</h3>
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={profileData.location || ''}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
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
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    placeholder="https://votre-site.com"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] resize-none"
                  placeholder="Parlez-nous de vous..."
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Informations de contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={profileData.contact_email || ''}
                    onChange={(e) => setProfileData({...profileData, contact_email: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone de contact
                  </label>
                  <input
                    type="tel"
                    value={profileData.contact_phone || ''}
                    onChange={(e) => setProfileData({...profileData, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Visibilité des informations</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#35414e] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Afficher l'email</div>
                      <div className="text-xs text-gray-400">Permet aux autres utilisateurs de voir votre email</div>
                    </div>
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
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Afficher le téléphone</div>
                      <div className="text-xs text-gray-400">Permet aux autres utilisateurs de voir votre téléphone</div>
                    </div>
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
        );

      case 'social':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Réseaux sociaux</h3>
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
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Préférences de notifications</h3>
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
                <p className="text-gray-400">Les paramètres de notifications seront disponibles prochainement</p>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Préférences d'apparence</h3>
              
              {/* Thème spécial Halloween */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 border-2 border-orange-400 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      SPÉCIAL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">🎃 Thème Halloween</h4>
                      <p className="text-orange-100 text-sm">Thème spécial avec des couleurs orange et noir</p>
                    </div>
                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                      Activer
                    </button>
                  </div>
                </div>
              </div>

              {/* Thèmes normaux */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Thème Sombre</h4>
                    <div className="w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface sombre classique</p>
                  <button className="w-full bg-[#9c68f2] hover:bg-[#8a5cf0] text-white py-2 rounded-lg transition-colors">
                    Activer
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Thème Clair</h4>
                    <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-300"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface claire et moderne</p>
                  <button className="w-full bg-[#9c68f2] hover:bg-[#8a5cf0] text-white py-2 rounded-lg transition-colors">
                    Activer
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Thème Bleu</h4>
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-blue-400"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface avec accents bleus</p>
                  <button className="w-full bg-[#9c68f2] hover:bg-[#8a5cf0] text-white py-2 rounded-lg transition-colors">
                    Activer
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Thème Vert</h4>
                    <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-green-400"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface avec accents verts</p>
                  <button className="w-full bg-[#9c68f2] hover:bg-[#8a5cf0] text-white py-2 rounded-lg transition-colors">
                    Activer
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Thème Rose</h4>
                    <div className="w-4 h-4 bg-pink-600 rounded-full border-2 border-pink-400"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface avec accents roses</p>
                  <button className="w-full bg-[#9c68f2] hover:bg-[#8a5cf0] text-white py-2 rounded-lg transition-colors">
                    Activer
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Thème Violet</h4>
                    <div className="w-4 h-4 bg-purple-600 rounded-full border-2 border-purple-400"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface avec accents violets</p>
                  <button className="w-full bg-[#9c68f2] hover:bg-[#8a5cf0] text-white py-2 rounded-lg transition-colors">
                    Activer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-8">
            {/* Compétences */}
            <ModernCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Compétences</h3>
                    <p className="text-gray-400 text-sm">Gérez vos compétences et niveaux</p>
                  </div>
                  <ModernButton
                    onClick={() => {
                      setEditingSkill(null);
                      setIsEditingSkill(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Ajouter une compétence
                  </ModernButton>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938] hover:border-[#9c68f2]/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{skill.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{skill.category}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            skill.level === 'expert' ? 'bg-orange-500/20 text-orange-400' :
                            skill.level === 'advanced' ? 'bg-purple-500/20 text-purple-400' :
                            skill.level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {skill.level === 'expert' ? 'Expert' :
                             skill.level === 'advanced' ? 'Avancé' :
                             skill.level === 'intermediate' ? 'Intermédiaire' : 'Débutant'}
                          </span>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => {
                              setEditingSkill(skill);
                              setIsEditingSkill(true);
                            }}
                            className="p-1 hover:bg-[#1e2938] rounded transition-colors"
                          >
                            <Edit size={14} className="text-gray-400" />
                          </button>
                          <button
                            onClick={async () => {
                              if (await SkillsService.deleteSkill(skill.id)) {
                                setSkills(skills.filter(s => s.id !== skill.id));
                                showSuccessNotification('Compétence supprimée');
                              }
                            }}
                            className="p-1 hover:bg-[#1e2938] rounded transition-colors"
                          >
                            <X size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {skills.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <Award size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Aucune compétence</p>
                      <p className="text-sm">Ajoutez vos premières compétences</p>
                    </div>
                  )}
                </div>
              </div>
            </ModernCard>

            {/* Récompenses */}
            <ModernCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Récompenses</h3>
                    <p className="text-gray-400 text-sm">Gérez vos récompenses et certifications</p>
                  </div>
                  <ModernButton
                    onClick={() => {
                      setEditingAward(null);
                      setIsEditingAward(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Ajouter une récompense
                  </ModernButton>
                </div>
                
                <div className="space-y-4">
                  {awards.map((award) => (
                    <div key={award.id} className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938] hover:border-[#9c68f2]/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <Award size={20} className="text-yellow-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-white font-medium mb-1">{award.title}</h4>
                              <p className="text-sm text-gray-400 mb-2">{award.issuer}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{award.category}</span>
                                <span>•</span>
                                <span>{new Date(award.date_received).toLocaleDateString('fr-FR')}</span>
                              </div>
                              {award.description && (
                                <p className="text-sm text-gray-400 mt-2">{award.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <button
                            onClick={() => {
                              setEditingAward(award);
                              setIsEditingAward(true);
                            }}
                            className="p-1 hover:bg-[#1e2938] rounded transition-colors"
                          >
                            <Edit size={14} className="text-gray-400" />
                          </button>
                          <button
                            onClick={async () => {
                              if (await AwardsService.deleteAward(award.id)) {
                                setAwards(awards.filter(a => a.id !== award.id));
                                showSuccessNotification('Récompense supprimée');
                              }
                            }}
                            className="p-1 hover:bg-[#1e2938] rounded transition-colors"
                          >
                            <X size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {awards.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Award size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Aucune récompense</p>
                      <p className="text-sm">Ajoutez vos premières récompenses</p>
                    </div>
                  )}
                </div>
              </div>
            </ModernCard>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            {/* Plan actuel */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Plan actuel</h3>
                <div className="bg-gradient-to-r from-[#9c68f2] to-[#8a5cf0] rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">Plan Gratuit</h4>
                      <p className="text-sm opacity-90">Accès aux fonctionnalités de base</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">0€</p>
                      <p className="text-sm opacity-90">/mois</p>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Plans disponibles */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Plans disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                    <h4 className="text-white font-semibold mb-2">Boost</h4>
                    <p className="text-2xl font-bold text-[#9c68f2] mb-2">29€<span className="text-sm text-gray-400">/mois</span></p>
                    <ul className="text-sm text-gray-400 space-y-1 mb-4">
                      <li>• Toutes les fonctionnalités</li>
                      <li>• Support prioritaire</li>
                      <li>• Analytics avancés</li>
                    </ul>
                    <ModernButton variant="outline" className="w-full">
                      Choisir Boost
                    </ModernButton>
                  </div>

                  <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938] relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">Populaire</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Scale</h4>
                    <p className="text-2xl font-bold text-[#9c68f2] mb-2">59€<span className="text-sm text-gray-400">/mois</span></p>
                    <ul className="text-sm text-gray-400 space-y-1 mb-4">
                      <li>• Tout Boost +</li>
                      <li>• API avancée</li>
                      <li>• Intégrations premium</li>
                    </ul>
                    <ModernButton className="w-full">
                      Choisir Scale
                    </ModernButton>
                  </div>

                  <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                    <h4 className="text-white font-semibold mb-2">Enterprise</h4>
                    <p className="text-2xl font-bold text-[#9c68f2] mb-2">Sur mesure</p>
                    <ul className="text-sm text-gray-400 space-y-1 mb-4">
                      <li>• Solution personnalisée</li>
                      <li>• Support dédié</li>
                      <li>• Formation incluse</li>
                    </ul>
                    <ModernButton variant="outline" className="w-full">
                      Nous contacter
                    </ModernButton>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Méthodes de paiement */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Méthodes de paiement</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <CreditCard size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Carte bancaire</p>
                        <p className="text-sm text-gray-400">•••• •••• •••• 4242</p>
                      </div>
                    </div>
                    <button className="text-red-400 hover:text-red-300 text-sm">
                      Supprimer
                    </button>
                  </div>

                  <ModernButton variant="outline" className="w-full">
                    <Plus size={16} className="mr-2" />
                    Ajouter une méthode de paiement
                  </ModernButton>
                </div>
              </div>
            </ModernCard>

            {/* Historique des factures */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Historique des factures</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg">
                    <div>
                      <p className="text-white font-medium">Facture #001</p>
                      <p className="text-sm text-gray-400">Plan Boost - Janvier 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">29€</p>
                      <button className="text-[#9c68f2] hover:text-[#8a5cf0] text-sm">
                        Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-[#9c68f2] animate-spin mb-4" />
            <p className="text-gray-400">Chargement des paramètres...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-[#9c68f2]" />
            <h1 className="text-2xl font-bold text-white">Paramètres</h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ModernCard className="p-0">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Catégories
                </h3>
                <nav className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-[#9c68f2] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-[#35414e]'
                      }`}
                    >
                      {category.icon}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{category.name}</div>
                        <div className="text-xs opacity-75">{category.description}</div>
                      </div>
                      <ChevronRight size={16} className="opacity-50" />
                    </button>
                  ))}
                </nav>
              </div>
            </ModernCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ModernCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {categories.find(c => c.id === activeCategory)?.name}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {categories.find(c => c.id === activeCategory)?.description}
                    </p>
                  </div>
                </div>

                {renderCategoryContent()}

                {/* Save Button */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#35414e]">
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
              </div>
            </ModernCard>
          </div>
        </div>
      </div>

      {/* Modales */}
      <SkillModal
        isOpen={isEditingSkill}
        onClose={() => {
          setIsEditingSkill(false);
          setEditingSkill(null);
        }}
        onSuccess={() => {
          // Recharger les skills
          if (user) {
            SkillsService.getUserSkills(user.id).then(setSkills);
          }
        }}
        skill={editingSkill}
      />

      <AwardModal
        isOpen={isEditingAward}
        onClose={() => {
          setIsEditingAward(false);
          setEditingAward(null);
        }}
        onSuccess={() => {
          // Recharger les awards
          if (user) {
            AwardsService.getUserAwards(user.id).then(setAwards);
          }
        }}
        award={editingAward}
      />
    </Layout>
  );
};

export default SettingsPage;
