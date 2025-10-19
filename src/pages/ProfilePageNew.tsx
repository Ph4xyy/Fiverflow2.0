import React, { useState } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'activity'>('overview');
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true); // Simulate if it's the user's own profile
  
  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'John Doe',
    title: 'UI/UX Designer & Frontend Developer',
    location: 'Paris, France',
    memberSince: 'Jan 2019',
    bio: 'Passionné par le design et le développement, je crée des expériences utilisateur exceptionnelles depuis 5 ans.',
    website: 'https://johndoe.design',
    email: 'john@example.com',
    phone: '+33 6 12 34 56 78'
  });

  // Badges data
  const badges: Badge[] = [
    {
      id: 'boost_subscriber',
      name: 'Boost Subscriber',
      description: 'Abonné Boost depuis 2 ans',
      icon: '/badges/boost-badge.png',
      rarity: 'epic'
    }
  ];

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
                      JD
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
                        Membre depuis {profileData.memberSince}
                      </div>
                      <div className="flex items-center gap-1">
                        <Coffee size={16} />
                        Disponible
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
                        Modifier le profil
                      </ModernButton>
                      <ModernButton variant="outline" size="sm">
                        <Settings size={16} className="mr-2" />
                        Paramètres
                      </ModernButton>
                    </>
                  ) : (
                    <>
                      <ModernButton variant="outline" size="sm">
                        <MessageSquare size={16} className="mr-2" />
                        Message
                      </ModernButton>
                      <ModernButton variant="outline" size="sm">
                        <Share2 size={16} className="mr-2" />
                        Partager
                      </ModernButton>
                      <ModernButton size="sm">
                        <Plus size={16} className="mr-2" />
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
          <ModernCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Modifier le profil</h3>
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
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titre professionnel
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
                    Localisation
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
                    Site web
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
                    Téléphone
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
                Annuler
              </ModernButton>
              <ModernButton>
                <Save size={16} className="mr-2" />
                Sauvegarder
              </ModernButton>
            </div>
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
                  { id: 'overview', label: 'Aperçu' },
                  { id: 'projects', label: 'Projets' },
                  { id: 'activity', label: 'Activité' }
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
                    <h3 className="text-lg font-semibold text-white mb-3">À propos</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Designer passionné avec plus de 5 ans d'expérience dans la création d'interfaces utilisateur modernes et intuitives. 
                      Spécialisé dans le design d'applications mobiles et web, je mets mon expertise au service de projets innovants.
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Compétences</h3>
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
            <ModernCard title="Réseaux sociaux" icon={<Globe size={20} className="text-white" />}>
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
