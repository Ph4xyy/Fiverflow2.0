import React, { useState } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import MessagingSystem from '../components/MessagingSystem';
import { useAuth } from '../contexts/AuthContext';
import { 
  Edit3, 
  Camera, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Plus,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Award,
  Heart,
  ThumbsUp,
  Eye,
  Send,
  Settings,
  Bell,
  Shield,
  Zap,
  TrendingUp,
  Target,
  Coffee,
  ExternalLink,
  Crown,
  ChevronDown,
  User,
  Palette,
  Save,
  X
} from 'lucide-react';

interface SocialLink {
  platform: string;
  url: string;
  followers: number;
  icon: React.ReactNode;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProfileData {
  name: string;
  title: string;
  location: string;
  memberSince: string;
  bio: string;
  website: string;
  email: string;
  phone: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  likes: number;
  views: number;
  date: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  date: string;
}

const ProfilePageNew: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'activity'>('overview');
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true); // Simulate if it's the user's own profile
  
  // Profile data - utilise les vraies données de l'utilisateur
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur',
    title: 'UI/UX Designer & Frontend Developer',
    location: 'Paris, France',
    memberSince: 'Jan 2019',
    bio: 'Passionate about design and development, I create exceptional user experiences for 5 years.',
    website: 'https://johndoe.design',
    email: user?.email || 'john@example.com',
    phone: '+33 6 12 34 56 78'
  });

  // Badges data
  const badges: Badge[] = [
    {
      id: 'boost_subscriber',
      name: 'Boost Subscriber',
      description: 'Boost subscriber for 2 years',
      icon: '/badges/boost-badge.png',
      rarity: 'epic'
    }
  ];

  // Social networks data
  const [socialNetworks, setSocialNetworks] = useState({
    github: '',
    discord: '',
    twitter: '',
    linkedin: '',
    website: ''
  });

  const socialLinks: SocialLink[] = [
    {
      platform: 'Twitter',
      url: '@johndoe',
      followers: 12500,
      icon: <Globe size={20} />
    },
    {
      platform: 'LinkedIn',
      url: 'linkedin.com/in/johndoe',
      followers: 8500,
      icon: <Briefcase size={20} />
    },
    {
      platform: 'GitHub',
      url: 'github.com/johndoe',
      followers: 3200,
      icon: <Zap size={20} />
    },
    {
      platform: 'Dribbble',
      url: 'dribbble.com/johndoe',
      followers: 6800,
      icon: <Target size={20} />
    }
  ];

  const projects: Project[] = [
    {
      id: '1',
      title: 'Application Mobile E-commerce',
      description: 'Design complet d\'une application mobile moderne pour une boutique en ligne.',
      image: '/api/placeholder/300/200',
      tags: ['UI/UX', 'Mobile', 'E-commerce'],
      likes: 142,
      views: 1250,
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'Site Web Portfolio',
      description: 'Portfolio interactif avec animations et design responsive.',
      image: '/api/placeholder/300/200',
      tags: ['Web Design', 'Portfolio', 'Animation'],
      likes: 89,
      views: 890,
      date: '2024-01-10'
    },
    {
      id: '3',
      title: 'Logo Design Collection',
      description: 'Collection de logos modernes pour différentes entreprises.',
      image: '/api/placeholder/300/200',
      tags: ['Logo', 'Branding', 'Identity'],
      likes: 156,
      views: 2100,
      date: '2024-01-05'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Designer of the Month',
      description: 'Reconnu comme designer du mois par la communauté',
      icon: <Award size={20} />,
      date: 'Janvier 2024'
    },
    {
      id: '2',
      title: '1000+ Followers',
      description: 'Atteint 1000 followers sur Twitter',
      icon: <Users size={20} />,
      date: 'Décembre 2023'
    },
    {
      id: '3',
      title: 'Project of the Year',
      description: 'Projet sélectionné dans le top 10 des projets de l\'année',
      icon: <Star size={20} />,
      date: 'Novembre 2023'
    }
  ];

  const stats = [
    { label: 'Projets', value: '24', icon: <Briefcase size={20} /> },
    { label: 'Clients', value: '18', icon: <Users size={20} /> },
    { label: 'Note', value: '4.9', icon: <Star size={20} /> },
    { label: 'Années d\'exp.', value: '5+', icon: <TrendingUp size={20} /> }
  ];

  const recentActivity = [
    {
      type: 'project',
      title: 'Nouveau projet publié',
      description: 'Application Mobile E-commerce',
      time: 'Il y a 2 heures'
    },
    {
      type: 'achievement',
      title: 'Nouveau badge obtenu',
      description: 'Designer of the Month',
      time: 'Il y a 1 jour'
    },
    {
      type: 'connection',
      title: 'Nouvelle connexion',
      description: 'Marie Dubois vous a ajouté',
      time: 'Il y a 3 jours'
    },
    {
      type: 'project',
      title: 'Projet mis à jour',
      description: 'Site Web Portfolio',
      time: 'Il y a 1 semaine'
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header Profile */}
        <ModernCard className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] opacity-10" />
          
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-t-xl relative">
              <button className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition-colors">
                <Camera size={20} className="text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="p-6 -mt-16 relative">
              <div className="flex items-end justify-between">
                <div className="flex items-end gap-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <button className="absolute bottom-2 right-2 p-2 bg-[#35414e] rounded-full hover:bg-[#3d4a57] transition-colors">
                      <Camera size={16} className="text-white" />
                    </button>
                  </div>

                  {/* Basic Info */}
                  <div className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{profileData.name}</h1>
                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {badges.map((badge) => (
                          <div key={badge.id} className="relative group">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center cursor-pointer">
                              <Crown size={16} className="text-white" />
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg border border-gray-700">
                                <div className="font-semibold">{badge.name}</div>
                                <div className="text-gray-300 text-xs">{badge.description}</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-lg text-gray-400 mb-2">{profileData.title}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {profileData.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        Member since {profileData.memberSince}
                      </div>
                      <div className="flex items-center gap-1">
                        <Coffee size={16} />
                        Available
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
                    Full name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Professional title
                  </label>
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
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
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#35414e]">
              <ModernButton 
                variant="outline" 
                onClick={() => setIsEditMenuOpen(false)}
              >
                Cancel
              </ModernButton>
              <ModernButton>
                <Save size={16} className="mr-2" />
                Save
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
              <button 
                onClick={() => setIsSettingsMenuOpen(false)}
                className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Profile Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">Basic information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Professional title
                  </label>
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2] resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Social Networks */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">Social networks</h4>
                
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

            {/* Save Button */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#35414e]">
              <ModernButton 
                variant="outline" 
                onClick={() => setIsSettingsMenuOpen(false)}
              >
                Cancel
              </ModernButton>
              <ModernButton>
                <Save size={16} className="mr-2" />
                Save
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
          {stats.map((stat, index) => (
            <ModernCard key={index}>
              <div className="relative">
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
                <div className="absolute top-0 right-0 opacity-50">
                  <div className="text-gray-400">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </ModernCard>
          ))}
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
                      Passionate designer with over 5 years of experience in creating modern and intuitive user interfaces. 
                      Specialized in mobile and web application design, I put my expertise at the service of innovative projects.
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
                <div className="space-y-6">
                  {projects.map(project => (
                    <ModernCard key={project.id}>
                      <div className="flex gap-4">
                        <div className="w-24 h-16 bg-[#35414e] rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">Image</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">{project.title}</h4>
                          <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {project.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-[#35414e] text-gray-300 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <ThumbsUp size={14} />
                                {project.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye size={14} />
                                {project.views}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ModernCard>
                  ))}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[#35414e] rounded-lg">
                      <div className="w-8 h-8 bg-[#9c68f2] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {activity.type === 'project' ? 'P' : activity.type === 'achievement' ? 'A' : 'C'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                        <p className="text-xs text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Links */}
            <ModernCard title="Social networks" icon={<Globe size={20} className="text-white" />}>
              <div className="space-y-3">
                {socialLinks.map(link => (
                  <div key={link.platform} className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#9c68f2] rounded-lg flex items-center justify-center text-white">
                        {link.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{link.platform}</p>
                        <p className="text-xs text-gray-400">{link.followers.toLocaleString()} followers</p>
                      </div>
                    </div>
                    <button className="text-[#9c68f2] hover:text-white transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </ModernCard>

            {/* Achievements */}
            <ModernCard title="Récompenses" icon={<Award size={20} className="text-white" />}>
              <div className="space-y-3">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="flex items-start gap-3 p-3 bg-[#35414e] rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-lg flex items-center justify-center text-white">
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{achievement.title}</h4>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCard>

            {/* Contact */}
            <ModernCard title="Contact" icon={<Mail size={20} className="text-white" />}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-300">john.doe@example.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-300">+33 6 12 34 56 78</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-300">johndoe.design</span>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePageNew;
