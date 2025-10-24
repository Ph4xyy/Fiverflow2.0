import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  CreditCard,
  Users,
  Zap,
  Crown,
  Shield
} from 'lucide-react';

interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const PageSettings: React.FC = () => {
  const { user } = useAuth();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
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
    instagram: '',
    tiktok: '',
    youtube: '',
    website: ''
  });

  // Skills et récompenses
  const [skills, setSkills] = useState<Skill[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [isEditingAward, setIsEditingAward] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingAward, setEditingAward] = useState<Award | null>(null);

  // Thème
  const [currentTheme, setCurrentTheme] = useState('dark');

  // Helper pour les boutons de thème
  const getThemeButtonStyle = (themeName: string) => ({
    backgroundColor: themeColors.primary,
    color: 'white'
  });

  // Settings categories
  const categories: SettingsCategory[] = [
    {
      id: 'profile',
      name: 'Profile',
      icon: <User size={20} />,
      description: 'Personal and professional information'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: <Shield size={20} />,
      description: 'Privacy and visibility settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell size={20} />,
      description: 'Notification preferences'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: <Palette size={20} />,
      description: 'Theme and visual preferences'
    },
    {
      id: 'social',
      name: 'Social Networks',
      icon: <Globe size={20} />,
      description: 'Links to your social networks'
    },
    {
      id: 'skills',
      name: 'Skills & Awards',
      icon: <Award size={20} />,
      description: 'Manage your skills and awards'
    },
    {
      id: 'subscription',
      name: 'Subscription & Payment',
      icon: <CreditCard size={20} />,
      description: 'Manage your subscription and payment methods'
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

        // Load skills
        const userSkills = await SkillsService.getUserSkills(user.id);
        setSkills(userSkills);

        // Load awards
        const userAwards = await AwardsService.getUserAwards(user.id);
        setAwards(userAwards);

        // Load theme
        if (data && data.theme) {
          setCurrentTheme(data.theme);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Save profile
  const handleThemeChange = async (theme: string) => {
    if (!user) return;
    
    setCurrentTheme(theme);
    
    // Save theme to database
    try {
      await ProfileService.updateProfile(user.id, { theme });
      showSuccessNotification('Theme saved!');
    } catch (error) {
      console.error('Error saving theme:', error);
      showErrorNotification('Error saving theme');
    }
  };

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
        instagram_url: socialNetworks.instagram,
        tiktok_url: socialNetworks.tiktok,
        youtube_url: socialNetworks.youtube,
        website: socialNetworks.website
      };

      const success = await ProfileService.updateProfile(user.id, dataToSave);
      const privacySuccess = await ProfileService.updatePrivacySettings(user.id, privacySettings);
      
      if (success && privacySuccess) {
        // Show success message and navigate back
        showSuccessNotification('Settings saved successfully!');
        
        // Reload profile data
        const updatedData = await ProfileService.getProfile(user.id);
        if (updatedData) {
          setProfileData(updatedData);
          setSocialNetworks({
            github: updatedData.github_url || '',
            linkedin: updatedData.linkedin_url || '',
            twitter: updatedData.twitter_url || '',
            discord: updatedData.discord_username || '',
            instagram: updatedData.instagram_url || '',
            tiktok: updatedData.tiktok_url || '',
            youtube: updatedData.youtube_url || '',
            website: updatedData.website || ''
          });
        }
        
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        showErrorNotification('Error saving settings');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showErrorNotification('An error occurred while saving');
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
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
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
                    Professional Title
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
                    Location
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
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileData.website || ''}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    placeholder="https://your-website.com"
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
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email
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
                    Contact Phone
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
              <h3 className="text-lg font-semibold text-white mb-4">Information Visibility</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#35414e] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Show email</div>
                      <div className="text-xs text-gray-400">Allow other users to see your email</div>
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
                      <div className="text-sm font-medium text-white">Show phone</div>
                      <div className="text-xs text-gray-400">Allow other users to see your phone</div>
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

            {/* Modification du mot de passe */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your new password"
                      className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    />
                  </div>
                  <button 
                    className="w-full py-2 rounded-lg transition-colors text-white hover:opacity-80"
                    style={getThemeButtonStyle('password')}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </ModernCard>

            {/* Modification de l'email */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Change Email</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#1e2938] rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your new email"
                      className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Email
                    </label>
                    <input
                      type="email"
                      placeholder="Confirm your new email"
                      className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                    />
                  </div>
                  <button 
                    className="w-full py-2 rounded-lg transition-colors text-white hover:opacity-80"
                    style={getThemeButtonStyle('email')}
                  >
                    Change Email
                  </button>
                </div>
              </div>
            </ModernCard>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Social Networks</h3>
              <p className="text-gray-400 text-sm mb-6">Enter your username (without @ or https://), links will be generated automatically</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="username"
                    value={socialNetworks.github}
                    onChange={(e) => setSocialNetworks({...socialNetworks, github: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                  <p className="text-xs text-gray-400 mt-1">github.com/{socialNetworks.github || 'your-name'}</p>
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
                    placeholder="username"
                    value={socialNetworks.linkedin}
                    onChange={(e) => setSocialNetworks({...socialNetworks, linkedin: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                  <p className="text-xs text-gray-400 mt-1">linkedin.com/in/{socialNetworks.linkedin || 'your-name'}</p>
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
                    placeholder="username"
                    value={socialNetworks.twitter}
                    onChange={(e) => setSocialNetworks({...socialNetworks, twitter: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                  <p className="text-xs text-gray-400 mt-1">twitter.com/{socialNetworks.twitter || 'your-name'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-pink-600 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      Instagram
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="username"
                    value={socialNetworks.instagram}
                    onChange={(e) => setSocialNetworks({...socialNetworks, instagram: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                  <p className="text-xs text-gray-400 mt-1">instagram.com/{socialNetworks.instagram || 'your-name'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </div>
                      TikTok
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="username"
                    value={socialNetworks.tiktok}
                    onChange={(e) => setSocialNetworks({...socialNetworks, tiktok: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                  <p className="text-xs text-gray-400 mt-1">tiktok.com/@{socialNetworks.tiktok || 'your-name'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      YouTube
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="channel name"
                    value={socialNetworks.youtube}
                    onChange={(e) => setSocialNetworks({...socialNetworks, youtube: e.target.value})}
                    className="w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]"
                  />
                  <p className="text-xs text-gray-400 mt-1">youtube.com/c/{socialNetworks.youtube || 'your-channel'}</p>
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
                      <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                        <Globe size={12} className="text-white" />
                      </div>
                      Website
                    </div>
                  </label>
                  <input
                    type="url"
                    placeholder="https://mywebsite.com"
                    value={socialNetworks.website}
                    onChange={(e) => setSocialNetworks({...socialNetworks, website: e.target.value})}
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
              <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
                <p className="text-gray-400">Notification settings will be available soon</p>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Appearance Preferences</h3>
              
              {/* Thème spécial Halloween */}
              <div className="mb-8">
                <div className="relative rounded-xl p-6 border-2 border-orange-400 overflow-hidden" style={{
                  backgroundImage: 'url(/src/assets/Images/grunge-halloween-background.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative z-10">
                    <div className="absolute top-2 right-2">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        SPÉCIAL
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">🎃 Halloween Theme</h4>
                        <p className="text-orange-100 text-sm">Special theme with Halloween grunge background</p>
                      </div>
                      <button 
                        onClick={() => handleThemeChange('halloween')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentTheme === 'halloween' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        {currentTheme === 'halloween' ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thèmes normaux */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Dark Theme</h4>
                    <div className="w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Classic dark interface</p>
                  <button 
                    onClick={() => handleThemeChange('dark')}
                    className="w-full py-2 rounded-lg transition-colors text-white hover:opacity-80"
                    style={{
                      backgroundColor: themeColors.primary
                    }}
                  >
                    {currentTheme === 'dark' ? 'Active' : 'Activate'}
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Light Theme</h4>
                    <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-300"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Clean and modern interface</p>
                  <button 
                    onClick={() => handleThemeChange('light')}
                    className="w-full py-2 rounded-lg transition-colors text-white hover:opacity-80"
                    style={getThemeButtonStyle('light')}
                  >
                    {currentTheme === 'light' ? 'Active' : 'Activate'}
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Blue Theme</h4>
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-blue-400"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface with blue accents</p>
                  <button 
                    onClick={() => handleThemeChange('blue')}
                    className="w-full py-2 rounded-lg transition-colors text-white hover:opacity-80"
                    style={getThemeButtonStyle('blue')}
                  >
                    {currentTheme === 'blue' ? 'Active' : 'Activate'}
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Green Theme</h4>
                    <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-green-400"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface with green accents</p>
                  <button 
                    onClick={() => handleThemeChange('green')}
                    className="w-full py-2 rounded-lg transition-colors text-white hover:opacity-80"
                    style={getThemeButtonStyle('green')}
                  >
                    {currentTheme === 'green' ? 'Active' : 'Activate'}
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Pink Theme</h4>
                    <div className="w-4 h-4 bg-pink-600 rounded-full border-2 border-pink-400"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface with pink accents</p>
                  <button 
                    onClick={() => handleThemeChange('pink')}
                    className="w-full py-2 rounded-lg transition-colors text-white hover:opacity-80"
                    style={getThemeButtonStyle('pink')}
                  >
                    {currentTheme === 'pink' ? 'Active' : 'Activate'}
                  </button>
                </div>

                <div className="bg-[#35414e] rounded-lg p-4 border border-[#1e2938]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Purple Theme</h4>
                    <div className="w-4 h-4 bg-purple-600 rounded-full border-2 border-purple-400"></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Interface with purple accents</p>
                  <button 
                    onClick={() => handleThemeChange('purple')}
                    className="w-full py-2 rounded-lg transition-colors text-white hover:opacity-80"
                    style={getThemeButtonStyle('purple')}
                  >
                    {currentTheme === 'purple' ? 'Active' : 'Activate'}
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
                    <h3 className="text-xl font-semibold text-white">Skills</h3>
                    <p className="text-gray-400 text-sm">Manage your skills and levels</p>
                  </div>
                  <ModernButton
                    onClick={() => {
                      setEditingSkill(null);
                      setIsEditingSkill(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Skill
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
                             skill.level === 'advanced' ? 'Advanced' :
                             skill.level === 'intermediate' ? 'Intermediate' : 'Beginner'}
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
                                showSuccessNotification('Skill deleted');
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
                      <p className="text-lg font-medium mb-2">No skills</p>
                      <p className="text-sm">Add your first skills</p>
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
                    <h3 className="text-xl font-semibold text-white">Awards</h3>
                    <p className="text-gray-400 text-sm">Manage your awards and certifications</p>
                  </div>
                  <ModernButton
                    onClick={() => {
                      setEditingAward(null);
                      setIsEditingAward(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Award
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
                                <span>{new Date(award.date_received).toLocaleDateString('en-US')}</span>
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
                                showSuccessNotification('Award deleted');
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
                      <p className="text-lg font-medium mb-2">No awards</p>
                      <p className="text-sm">Add your first awards</p>
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
            {/* Subscription Management */}
            <ModernCard>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Want to upgrade or change your plan?</h3>
                <p className="text-gray-400 mb-6">Discover our premium plans and unlock new features for your freelance business</p>
                <div className="flex justify-center">
                  <ModernButton 
                    onClick={() => navigate('/upgrade')}
                    className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] hover:from-[#8a5ae8] hover:to-[#3a2580]"
                  >
                    <Crown size={16} className="mr-2" />
                    View Plans & Upgrade
                  </ModernButton>
                </div>
              </div>
            </ModernCard>

            {/* Historique des factures */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Invoice History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#35414e] rounded-lg">
                    <div>
                      <p className="text-white font-medium">Invoice #001</p>
                      <p className="text-sm text-gray-400">Boost Plan - January 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">29€</p>
                      <button className="text-[#9c68f2] hover:text-[#8a5cf0] text-sm">
                        Download
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-[#9c68f2] animate-spin mb-4" />
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-[#9c68f2]" />
            <h1 className="text-2xl font-bold text-white">Settings</h1>
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
                  Categories
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save
                      </>
                    )}
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
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
            // Reload skills
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
            // Reload awards
            if (user) {
              AwardsService.getUserAwards(user.id).then(setAwards);
            }
          }}
          award={editingAward}
        />
      </div>
  );
};

export default PageSettings;
