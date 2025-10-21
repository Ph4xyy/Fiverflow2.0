import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Shield, 
  Palette, 
  Globe, 
  Award,
  Briefcase,
  Heart,
  Eye,
  Activity,
  Save,
  Plus,
  X,
  Edit3,
  Trash2
} from 'lucide-react';
import { ProfileService, ProfileData } from '../services/profileService';

interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

interface SocialNetwork {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: string;
}

const ProfileSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    professional_title: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    contact_email: '',
    contact_phone: '',
    status: 'available',
    show_email: true,
    show_phone: true,
    avatar_url: '',
    banner_url: '',
    github_url: '',
    discord_username: '',
    twitter_url: '',
    linkedin_url: ''
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' as const, category: '' });
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'Général', icon: <User size={20} /> },
    { id: 'skills', label: 'Compétences', icon: <Award size={20} /> },
    { id: 'social', label: 'Réseaux sociaux', icon: <Globe size={20} /> },
    { id: 'projects', label: 'Projets', icon: <Briefcase size={20} /> },
    { id: 'privacy', label: 'Confidentialité', icon: <Shield size={20} /> },
    { id: 'appearance', label: 'Apparence', icon: <Palette size={20} /> }
  ];

  const socialNetworkTemplates: SocialNetwork[] = [
    {
      id: 'github',
      name: 'GitHub',
      url: '',
      icon: <Globe size={20} />,
      color: '#333'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: '',
      icon: <Globe size={20} />,
      color: '#0077b5'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      url: '',
      icon: <Globe size={20} />,
      color: '#1da1f2'
    },
    {
      id: 'discord',
      name: 'Discord',
      url: '',
      icon: <Globe size={20} />,
      color: '#7289da'
    },
    {
      id: 'website',
      name: 'Site web',
      url: '',
      icon: <Globe size={20} />,
      color: '#6c757d'
    }
  ];

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await ProfileService.getProfile();
      setProfileData(data);
      
      // Load skills, social networks, and projects
      // TODO: Implement these services
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await ProfileService.updateProfile(profileData);
      console.log('Profil sauvegardé avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name,
        level: newSkill.level,
        category: newSkill.category || 'Général'
      };
      setSkills([...skills, skill]);
      setNewSkill({ name: '', level: 'beginner', category: '' });
    }
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const updateSocialNetwork = (id: string, url: string) => {
    setSocialNetworks(prev => 
      prev.map(social => 
        social.id === id ? { ...social, url } : social
      )
    );
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nom complet
          </label>
          <input
            type="text"
            value={profileData.full_name}
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
            value={profileData.professional_title}
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
          value={profileData.bio}
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
            value={profileData.location}
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
            value={profileData.website}
            onChange={(e) => setProfileData({...profileData, website: e.target.value})}
            className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
            placeholder="https://votre-site.com"
          />
        </div>
      </div>
    </div>
  );

  const renderSkillsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Mes compétences</h3>
        <button
          onClick={addSkill}
          className="flex items-center gap-2 px-4 py-2 bg-[#9c68f2] text-white rounded-lg hover:bg-[#8b5cf6] transition-colors"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Nom de la compétence"
          value={newSkill.name}
          onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
          className="px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
        />
        
        <select
          value={newSkill.level}
          onChange={(e) => setNewSkill({...newSkill, level: e.target.value as any})}
          className="px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
        >
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
          <option value="expert">Expert</option>
        </select>

        <input
          type="text"
          placeholder="Catégorie (optionnel)"
          value={newSkill.category}
          onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
          className="px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
        />
      </div>

      <div className="space-y-3">
        {skills.map(skill => (
          <div key={skill.id} className="flex items-center justify-between p-4 bg-[#35414e] rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-medium text-white">{skill.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  skill.level === 'expert' ? 'bg-green-500/20 text-green-400' :
                  skill.level === 'advanced' ? 'bg-blue-500/20 text-blue-400' :
                  skill.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {skill.level === 'expert' ? 'Expert' :
                   skill.level === 'advanced' ? 'Avancé' :
                   skill.level === 'intermediate' ? 'Intermédiaire' : 'Débutant'}
                </span>
                {skill.category && (
                  <span className="text-sm text-gray-400">{skill.category}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => removeSkill(skill.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Réseaux sociaux</h3>
      
      <div className="space-y-4">
        {socialNetworkTemplates.map(social => (
          <div key={social.id} className="flex items-center gap-4 p-4 bg-[#35414e] rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: social.color }}
              >
                {social.icon}
              </div>
              <span className="font-medium text-white">{social.name}</span>
            </div>
            <input
              type="url"
              placeholder={`Votre ${social.name.toLowerCase()}`}
              value={socialNetworks.find(s => s.id === social.id)?.url || ''}
              onChange={(e) => updateSocialNetwork(social.id, e.target.value)}
              className="flex-1 px-3 py-2 bg-[#1e2938] border border-[#35414e] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Mes projets</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#9c68f2] text-white rounded-lg hover:bg-[#8b5cf6] transition-colors">
          <Plus size={16} />
          Nouveau projet
        </button>
      </div>

      <div className="space-y-4">
        {projects.map(project => (
          <div key={project.id} className="p-4 bg-[#35414e] rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-white">{project.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {project.isPublic ? 'Public' : 'Privé'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Heart size={14} />
                    {project.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    {project.views}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-[#1e2938] rounded-lg transition-colors">
                  <Edit3 size={16} />
                </button>
                <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Paramètres de confidentialité</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#35414e] rounded-lg">
          <div>
            <h4 className="font-medium text-white">Afficher l'email</h4>
            <p className="text-sm text-gray-400">Permettre aux autres de voir votre email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profileData.show_email}
              onChange={(e) => setProfileData({...profileData, show_email: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#35414e] rounded-lg">
          <div>
            <h4 className="font-medium text-white">Afficher le téléphone</h4>
            <p className="text-sm text-gray-400">Permettre aux autres de voir votre numéro</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profileData.show_phone}
              onChange={(e) => setProfileData({...profileData, show_phone: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9c68f2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9c68f2]"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Apparence</h3>
      <p className="text-gray-400">Paramètres d'apparence du profil</p>
      {/* TODO: Implement theme selector and other appearance settings */}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'skills': return renderSkillsTab();
      case 'social': return renderSocialTab();
      case 'projects': return renderProjectsTab();
      case 'privacy': return renderPrivacyTab();
      case 'appearance': return renderAppearanceTab();
      default: return renderGeneralTab();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#9c68f2]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button className="p-2 hover:bg-[#35414e] rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Paramètres du profil</h1>
            <p className="text-gray-400">Gérez votre profil et vos préférences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ModernCard>
              <div className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
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
            </ModernCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ModernCard>
              {renderActiveTab()}
              
              {/* Save Button */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#35414e]">
                <ModernButton 
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Annuler
                </ModernButton>
                <ModernButton 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
      </div>
    </Layout>
  );
};

export default ProfileSettingsPage;
