// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useStripeSubscription } from '../hooks/useStripeSubscription';
import { useImageUpload } from '../hooks/useImageUpload';
import ImageUpload from '../components/ImageUpload';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Eye,
  EyeOff,
  Lock,
  Save,
  Mail,
  Server,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ---------- Types d'origine ---------- */
interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  activity: string | null;
  country: string | null;
  is_pro: boolean | null;
  referrer_id: string | null;
  role: string | null;
  created_at: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
  avatar_url?: string | null;
}

/* ---------- Types ajoutés pour l’onglet Branding & Email ---------- */
type SmtpSettings = {
  id?: string;
  user_id: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  enabled: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

/* ---------- Composant ---------- */
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { subscription: stripeSubscription } = useStripeSubscription();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  type TabId = 'profile' | 'notifications' | 'security' | 'billing' | 'preferences' | 'branding';
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ---------- Préférences (déjà dans ta page) ---------- */
  const [preferences, setPreferences] = useState({
    notify_tasks: true,
    notify_invoices: true,
    notify_email: false
  });

  // Form states d’origine
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    activity: '',
    country: '',
    timezone: 'UTC-5',
    language: 'English'
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailClients: true,
    pushOrders: false,
    pushPayments: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock data si Supabase non configuré
  const mockProfile: UserProfile = {
    id: 'mock-user',
    email: 'demo@example.com',
    name: 'John Doe',
    activity: 'Web Development',
    country: 'France',
    is_pro: false,
    referrer_id: null,
    role: 'user',
    created_at: new Date().toISOString()
  };

  /* ---------- State Branding & Email ---------- */
  const [smtp, setSmtp] = useState<SmtpSettings | null>(null);
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpSaving, setSmtpSaving] = useState(false);

  /* ---------- State Images ---------- */
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingImages, setSavingImages] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  // Hooks pour l'upload d'images
  const { uploadImage: uploadBanner, uploading: uploadingBanner } = useImageUpload({ 
    bucketName: 'user-assets', 
    folder: 'banners' 
  });
  const { uploadImage: uploadLogo, uploading: uploadingLogo } = useImageUpload({ 
    bucketName: 'user-assets', 
    folder: 'logos' 
  });
  const { uploadImage: uploadAvatar, uploading: uploadingAvatar } = useImageUpload({ 
    bucketName: 'user-assets', 
    folder: 'avatars' 
  });

  // Variables pour l'état de chargement
  const isUploading = uploadingBanner || uploadingLogo || uploadingAvatar || savingImages;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'branding', label: 'Branding & Email', icon: Mail }, // <— nouvel onglet
  ] as const;

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
    // Branding & Email: charger en parallèle
    fetchSmtpSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for session refresh to refetch data
  useEffect(() => {
    const onRefreshed = () => {
      fetchProfile();
      fetchPreferences();
      fetchSmtpSettings();
    };
    window.addEventListener('ff:session:refreshed', onRefreshed as any);
    return () => window.removeEventListener('ff:session:refreshed', onRefreshed as any);
  }, []); // 🔥 FIXED: Empty dependencies to prevent infinite loops

  /* ---------- Chargement profil (d’origine) ---------- */
  const fetchProfile = async () => {
    if (!isSupabaseConfigured || !supabase) {
      const mock = mockProfile;
      setProfile(mock);
      setProfileData({
        name: mock.name || '',
        email: mock.email,
        activity: mock.activity || '',
        country: mock.country || '',
        timezone: 'UTC-5',
        language: 'English'
      });
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        const fallback = {
          id: user.id,
          email: user.email || '',
          name: null,
          activity: null,
          country: null,
          is_pro: false,
          referrer_id: null,
          role: 'user',
          created_at: null
        };
        setProfile(fallback);
        setProfileData({
          name: '',
          email: user.email || '',
          activity: '',
          country: '',
          timezone: 'UTC-5',
          language: 'English'
        });
      } else {
        setProfile(data);
        setProfileData({
          name: data?.name || '',
          email: data?.email || '',
          activity: data?.activity || '',
          country: data?.country || '',
          timezone: 'UTC-5',
          language: 'English'
        });
      }
    } catch {
      const fallback = {
        id: user?.id || 'unknown',
        email: user?.email || '',
        name: null,
        activity: null,
        country: null,
        is_pro: false,
        referrer_id: null,
        role: 'user',
        created_at: null
      };
      setProfile(fallback);
      setProfileData({
        name: '',
        email: user?.email || '',
        activity: '',
        country: '',
        timezone: 'UTC-5',
        language: 'English'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Préférences (d’origine) ---------- */
  const fetchPreferences = async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        setPreferences({ notify_tasks: true, notify_invoices: true, notify_email: false });
      } else if (data) {
        setPreferences({
          notify_tasks: data.notify_tasks,
          notify_invoices: data.notify_invoices,
          notify_email: data.notify_email
        });
      } else {
        await savePreferences({ notify_tasks: true, notify_invoices: true, notify_email: false });
      }
    } catch {
      setPreferences({ notify_tasks: true, notify_invoices: true, notify_email: false });
    }
  };

  const savePreferences = async (newPreferences: typeof preferences) => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            notify_tasks: newPreferences.notify_tasks,
            notify_invoices: newPreferences.notify_invoices,
            notify_email: newPreferences.notify_email
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setPreferences(newPreferences);
      toast.success('Notification preferences updated!');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  /* ---------- Save profil (d’origine) ---------- */
  const handleSaveProfile = async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      toast.error('Database not configured');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Saving profile...');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          activity: profileData.activity,
          country: profileData.country
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!', { id: toastId });
      fetchProfile();
    } catch {
      toast.error('Failed to update profile', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Password (d’origine) ---------- */
  const handleChangePassword = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Updating password...');

    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;

      toast.success('Password updated successfully!', { id: toastId });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to update password', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Helpers UI d’origine ---------- */
  const getInitials = (name: string | null, email: string) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : email.slice(0, 2).toUpperCase();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // UI class helpers (dark-ready)
  const card = 'bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700';
  const soft = 'bg-gray-50 dark:bg-slate-800';
  const h1 = 'text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white';
  const h2 = 'text-lg sm:text-xl font-semibold text-gray-900 dark:text-white';
  const h3 = 'text-base sm:text-lg font-medium text-gray-900 dark:text-white';
  const pSub = 'text-sm sm:text-base text-gray-600 dark:text-gray-400';
  const labelBase = 'block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';
  const inputBase =
    'w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
    'border-gray-300 text-gray-900 placeholder-gray-400 ' +
    'dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400';
  const selectBase = inputBase;
  const monoMuted = 'text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono mt-1 break-all';
  const divider = 'border-t border-gray-200 dark:border-slate-700';

  /* ---------- Fonctions Images ---------- */
  const saveImages = async () => {
    if (!user || !isSupabaseConfigured || !supabase) {
      toast.error('Supabase non configuré');
      return;
    }

    try {
      setSavingImages(true);
      let bannerUrl = profile?.banner_url;
      let logoUrl = profile?.logo_url;

      // Upload bannière si un fichier est sélectionné
      if (bannerFile) {
        const uploadedBannerUrl = await uploadBanner(bannerFile, user.id);
        if (uploadedBannerUrl) {
          bannerUrl = uploadedBannerUrl;
        }
      }

      // Upload logo si un fichier est sélectionné
      if (logoFile) {
        const uploadedLogoUrl = await uploadLogo(logoFile, user.id);
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl;
        }
      }

      // Upload avatar si un fichier est sélectionné
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const uploadedAvatarUrl = await uploadAvatar(avatarFile, user.id);
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl;
        }
      }

      // Mettre à jour le profil avec les nouvelles URLs
      const { error } = await supabase
        .from('users')
        .update({
          banner_url: bannerUrl,
          logo_url: logoUrl,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erreur mise à jour images:', error);
        toast.error('Erreur lors de la sauvegarde des images');
        return;
      }

      // Mettre à jour l'état local
      setProfile(prev => prev ? {
        ...prev,
        banner_url: bannerUrl,
        logo_url: logoUrl,
        avatar_url: avatarUrl
      } : null);

      // Réinitialiser les fichiers
      setBannerFile(null);
      setLogoFile(null);
      setAvatarFile(null);
      setShowAvatarUpload(false);

      toast.success('Images sauvegardées avec succès');

    } catch (error) {
      console.error('Erreur sauvegarde images:', error);
      toast.error('Erreur lors de la sauvegarde des images');
    } finally {
      setSavingImages(false);
    }
  };

  const removeBanner = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          banner_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erreur suppression bannière:', error);
        toast.error('Erreur lors de la suppression de la bannière');
        return;
      }

      setProfile(prev => prev ? { ...prev, banner_url: null } : null);
      toast.success('Bannière supprimée');

    } catch (error) {
      console.error('Erreur suppression bannière:', error);
      toast.error('Erreur lors de la suppression de la bannière');
    }
  };

  const removeLogo = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          logo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erreur suppression logo:', error);
        toast.error('Erreur lors de la suppression du logo');
        return;
      }

      setProfile(prev => prev ? { ...prev, logo_url: null } : null);
      toast.success('Logo supprimé');

    } catch (error) {
      console.error('Erreur suppression logo:', error);
      toast.error('Erreur lors de la suppression du logo');
    }
  };

  const removeAvatar = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erreur suppression avatar:', error);
        toast.error('Erreur lors de la suppression de l\'avatar');
        return;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      toast.success('Avatar supprimé');

    } catch (error) {
      console.error('Erreur suppression avatar:', error);
      toast.error('Erreur lors de la suppression de l\'avatar');
    }
  };

  /* ---------- Onglet Branding & Email : data access ---------- */
  const fetchSmtpSettings = async () => {
    if (!user) return;
    if (!isSupabaseConfigured || !supabase) {
      // DEMO: valeurs factices
      setSmtp({
        user_id: 'mock-user',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        username: 'demo@example.com',
        password: '********',
        from_name: 'Demo Sender',
        from_email: 'demo@example.com',
        reply_to: 'demo@example.com',
        enabled: true,
      });
      return;
    }

    try {
      setSmtpLoading(true);
      // la table doit exister : public.user_smtp_settings
      const { data, error } = await supabase
        .from('user_smtp_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // si la table n'existe pas côté local => on ne casse pas l’UI
        console.warn('[Profile] SMTP table not reachable or not found:', error.message);
        setSmtp(null);
      } else if (data) {
        setSmtp(data as SmtpSettings);
      } else {
        // pas de record => état initial vide
        setSmtp({
          user_id: user.id,
          host: '',
          port: 587,
          secure: false,
          username: '',
          password: '',
          from_name: profileData.name || '',
          from_email: user.email || '',
          reply_to: user.email || '',
          enabled: false,
        });
      }
    } catch (e) {
      console.error('[Profile] fetchSmtpSettings error:', e);
      setSmtp(null);
    } finally {
      setSmtpLoading(false);
    }
  };

  const saveSmtpSettings = async () => {
    if (!user) return;
    if (!smtp) return;

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured (demo only)');
      return;
    }

    // validations simples
    if (smtp.enabled) {
      if (!smtp.host || !smtp.port || !smtp.username || !smtp.password) {
        toast.error('Please complete host, port, username and password.');
        return;
      }
      if (!smtp.from_email) {
        toast.error('Veuillez renseigner un From email.');
        return;
      }
    }

    setSmtpSaving(true);
    const tId = toast.loading('Saving email & SMTP settings…');

    try {
      const payload = {
        user_id: user.id,
        host: smtp.host || null,
        port: Number(smtp.port || 587),
        secure: !!smtp.secure,
        username: smtp.username || null,
        password: smtp.password || null,
        from_name: smtp.from_name || null,
        from_email: smtp.from_email || null,
        reply_to: smtp.reply_to || null,
        enabled: !!smtp.enabled,
        updated_at: new Date().toISOString(),
      };

      // upsert (clé: user_id)
      const { error } = await supabase
        .from('user_smtp_settings')
        .upsert(payload, { onConflict: 'user_id' })
        .select('id')
        .maybeSingle();

      if (error) throw error;

      toast.success('Branding & Email saved!', { id: tId });
      fetchSmtpSettings();
    } catch (e: any) {
      console.error('[Profile] saveSmtpSettings error:', e?.message || e);
      toast.error('Failed to save Branding & Email', { id: tId });
    } finally {
      setSmtpSaving(false);
    }
  };

  /* ---------- Rendu des onglets (on garde tout l’existant + nouveau) ---------- */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className={h3}>Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className={labelBase}>Username</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={inputBase}
                    disabled
                  />
                </div>
                <div>
                  <label className={labelBase}>Activity</label>
                  <select
                    value={profileData.activity}
                    onChange={(e) => setProfileData({ ...profileData, activity: e.target.value })}
                    className={selectBase}
                  >
                    <option value="">Select your activity</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Translation">Translation</option>
                    <option value="Data Entry">Data Entry</option>
                    <option value="Virtual Assistant">Virtual Assistant</option>
                    <option value="Photography">Photography</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Country</label>
                  <select
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    className={selectBase}
                  >
                    <option value="">Select your country</option>
                    <option value="France">France</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Australia">Australia</option>
                    <option value="Brazil">Brazil</option>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Timezone</label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                    className={selectBase}
                  >
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Language</label>
                  <select
                    value={profileData.language}
                    onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                    className={selectBase}
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className={h3}>Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Task Due Notifications',
                    desc: 'Get notified when tasks are overdue or due soon',
                    key: 'notify_tasks' as const,
                  },
                  {
                    title: 'Invoice Notifications',
                    desc: 'Get notified about unpaid invoices and payment reminders',
                    key: 'notify_invoices' as const,
                  },
                  {
                    title: 'Email Notifications',
                    desc: 'Receive notifications via email in addition to in-app notifications',
                    key: 'notify_email' as const,
                  },
                ].map((row) => (
                  <div key={row.key} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-0 ${soft}`}>
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{row.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{row.desc}</p>
                    </div>
                    <button
                      onClick={() => savePreferences({ ...preferences, [row.key]: !preferences[row.key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        preferences[row.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences[row.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={h3}>General Notifications</h3>
              <div className="space-y-4">
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-0 ${soft}`}>
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Order Updates</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Get notified when orders are created or updated</p>
                  </div>
                  <div className="flex space-x-3 sm:space-x-4">
                    <label className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={notifications.emailOrders}
                        onChange={(e) => setNotifications({ ...notifications, emailOrders: e.target.checked })}
                        className="mr-2"
                      />
                      Email
                    </label>
                    <label className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={notifications.pushOrders}
                        onChange={(e) => setNotifications({ ...notifications, pushOrders: e.target.checked })}
                        className="mr-2"
                      />
                      Push
                    </label>
                  </div>
                </div>

                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-0 ${soft}`}>
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">New Clients</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Get notified when new clients are added</p>
                  </div>
                  <div className="flex space-x-3 sm:space-x-4">
                    <label className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={notifications.emailClients}
                        onChange={(e) => setNotifications({ ...notifications, emailClients: e.target.checked })}
                        className="mr-2"
                      />
                      Email
                    </label>
                  </div>
                </div>

                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-0 ${soft}`}>
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Payment Notifications</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Get notified about payment updates</p>
                  </div>
                  <div className="flex space-x-3 sm:space-x-4">
                    <label className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={notifications.pushPayments}
                        onChange={(e) => setNotifications({ ...notifications, pushPayments: e.target.checked })}
                        className="mr-2"
                      />
                      Push
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className={h3}>Security Settings</h3>
              <div className="space-y-4">
                <div className={`${soft} p-3 sm:p-4 rounded-lg`}>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">Change Password</h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className={`${inputBase} pl-10 pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="New password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={inputBase}
                    />
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className={`${inputBase} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                <div className={`${soft} p-3 sm:p-4 rounded-lg`}>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">Add an extra layer of security to your account</p>
                  <button className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className={h3}>Billing Information</h3>
              <div className="space-y-4">
                <div className={`${soft} p-3 sm:p-4 rounded-lg`}>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">Current Plan</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {stripeSubscription?.product_name
                          ? `${stripeSubscription.product_name} - ${stripeSubscription.product_description}`
                          : 'Free Plan - Limited features'}
                      </p>
                      {stripeSubscription?.subscription_status && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          stripeSubscription.subscription_status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {stripeSubscription.subscription_status}
                        </span>
                      )}
                      {profile?.role === 'admin' && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Administrator
                        </span>
                      )}
                    </div>
                    {!stripeSubscription && (
                      <button className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>

                <div className={`${soft} p-3 sm:p-4 rounded-lg`}>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">Payment Method</h4>
                  {stripeSubscription?.payment_method_brand && stripeSubscription?.payment_method_last4 ? (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                        {stripeSubscription.payment_method_brand.toUpperCase()} •••• {stripeSubscription.payment_method_last4}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stripeSubscription.current_period_end && (
                          `Next billing: ${new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString()}`
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No payment method on file</p>
                  )}
                  <button className="mt-2 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                    {stripeSubscription?.payment_method_brand ? 'Update Payment Method' : 'Add Payment Method'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className={h3}>App Preferences</h3>
              <div className="space-y-4">
                <div className={`${soft} p-3 sm:p-4 rounded-lg`}>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">Default Currency</h4>
                  <select 
                    className={selectBase}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                    <option value="AUD">AUD ($) - Australian Dollar</option>
                    <option value="CHF">CHF (CHF) - Swiss Franc</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                    <option value="CNY">CNY (¥) - Chinese Yuan</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="BRL">BRL (R$) - Brazilian Real</option>
                    <option value="MXN">MXN ($) - Mexican Peso</option>
                    <option value="ZAR">ZAR (R) - South African Rand</option>
                    <option value="SEK">SEK (kr) - Swedish Krona</option>
                    <option value="NOK">NOK (kr) - Norwegian Krone</option>
                    <option value="DKK">DKK (kr) - Danish Krone</option>
                    <option value="PLN">PLN (zł) - Polish Zloty</option>
                    <option value="CZK">CZK (Kč) - Czech Koruna</option>
                    <option value="HUF">HUF (Ft) - Hungarian Forint</option>
                    <option value="RUB">RUB (₽) - Russian Ruble</option>
                    <option value="TRY">TRY (₺) - Turkish Lira</option>
                    <option value="KRW">KRW (₩) - South Korean Won</option>
                    <option value="SGD">SGD ($) - Singapore Dollar</option>
                    <option value="HKD">HKD ($) - Hong Kong Dollar</option>
                    <option value="NZD">NZD ($) - New Zealand Dollar</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                    <option value="SAR">SAR (﷼) - Saudi Riyal</option>
                    <option value="ILS">ILS (₪) - Israeli Shekel</option>
                    <option value="THB">THB (฿) - Thai Baht</option>
                    <option value="MYR">MYR (RM) - Malaysian Ringgit</option>
                    <option value="PHP">PHP (₱) - Philippine Peso</option>
                    <option value="IDR">IDR (Rp) - Indonesian Rupiah</option>
                    <option value="VND">VND (₫) - Vietnamese Dong</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Mail size={18} />
              <h3 className={h3}>Branding & Email</h3>
            </div>

            {!isSupabaseConfigured && (
              <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
                Supabase n'est pas configuré — affichage en mode démo, sauvegarde désactivée.
              </div>
            )}

            {/* Section Images */}
            <div className={`${soft} p-3 sm:p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <Palette size={18} />
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Images de profil</h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bannière */}
                <div>
                  <label className={labelBase}>Bannière de profil</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Image d'en-tête de votre profil (recommandé: 1200x400px)
                  </p>
                  <ImageUpload
                    currentImage={profile?.banner_url}
                    onImageChange={setBannerFile}
                    onImageRemove={removeBanner}
                    placeholder="Uploader une bannière"
                    aspectRatio="banner"
                    className="w-full"
                  />
                </div>

                {/* Logo */}
                <div>
                  <label className={labelBase}>Logo de profil</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Logo carré pour votre profil (recommandé: 200x200px)
                  </p>
                  <ImageUpload
                    currentImage={profile?.logo_url}
                    onImageChange={setLogoFile}
                    onImageRemove={removeLogo}
                    placeholder="Uploader un logo"
                    aspectRatio="logo"
                    className="w-full max-w-xs"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={saveImages}
                  disabled={isUploading || (!bannerFile && !logoFile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {uploadingBanner ? 'Upload bannière...' : uploadingLogo ? 'Upload logo...' : 'Sauvegarde...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Sauvegarder les images
                    </>
                  )}
                </button>

                {(bannerFile || logoFile) && (
                  <button
                    onClick={() => {
                      setBannerFile(null);
                      setLogoFile(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Annuler
                  </button>
                )}
              </div>

              {/* Aperçu des images actuelles */}
              {(profile?.banner_url || profile?.logo_url) && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Images actuelles :</h5>
                  <div className="flex items-center gap-4">
                    {profile?.banner_url && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Bannière: <span className="font-mono break-all">{profile.banner_url}</span>
                      </div>
                    )}
                    {profile?.logo_url && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Logo: <span className="font-mono break-all">{profile.logo_url}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${soft} p-3 sm:p-4 rounded-lg`}>
              <div>
                <label className={labelBase}>From name</label>
                <input
                  className={inputBase}
                  placeholder="Ex: John Smith"
                  value={smtp?.from_name || ''}
                  onChange={(e) => setSmtp((s) => s ? { ...s, from_name: e.target.value } : s)}
                />
              </div>
              <div>
                <label className={labelBase}>From email</label>
                <input
                  className={inputBase}
                  placeholder="you@domain.com"
                  value={smtp?.from_email || ''}
                  onChange={(e) => setSmtp((s) => s ? { ...s, from_email: e.target.value } : s)}
                />
              </div>
              <div>
                <label className={labelBase}>Reply-To</label>
                <input
                  className={inputBase}
                  placeholder="reply@domain.com"
                  value={smtp?.reply_to || ''}
                  onChange={(e) => setSmtp((s) => s ? { ...s, reply_to: e.target.value } : s)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className={labelBase}>Enable custom SMTP</label>
                <button
                  type="button"
                  onClick={() => setSmtp((s) => s ? { ...s, enabled: !s.enabled } : s)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    smtp?.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      smtp?.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className={`${soft} p-3 sm:p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-3">
                <Server size={18} />
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">SMTP Server</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Host</label>
                  <input
                    className={inputBase}
                    placeholder="smtp.domain.com"
                    value={smtp?.host || ''}
                    onChange={(e) => setSmtp((s) => s ? { ...s, host: e.target.value } : s)}
                    disabled={!smtp?.enabled}
                  />
                </div>
                <div>
                  <label className={labelBase}>Port</label>
                  <input
                    type="number"
                    className={inputBase}
                    placeholder="587"
                    value={smtp?.port ?? 587}
                    onChange={(e) => setSmtp((s) => s ? { ...s, port: Number(e.target.value || 0) } : s)}
                    disabled={!smtp?.enabled}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className={labelBase}>Secure (SSL/TLS)</label>
                  <button
                    type="button"
                    onClick={() => setSmtp((s) => s ? { ...s, secure: !s.secure } : s)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      smtp?.secure ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                    disabled={!smtp?.enabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        smtp?.secure ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className={labelBase}>Username</label>
                  <input
                    className={inputBase}
                    placeholder="smtp user"
                    value={smtp?.username || ''}
                    onChange={(e) => setSmtp((s) => s ? { ...s, username: e.target.value } : s)}
                    disabled={!smtp?.enabled}
                  />
                </div>
                <div>
                  <label className={labelBase}>Password / App Password</label>
                  <input
                    type="password"
                    className={inputBase}
                    placeholder="••••••••"
                    value={smtp?.password || ''}
                    onChange={(e) => setSmtp((s) => s ? { ...s, password: e.target.value } : s)}
                    disabled={!smtp?.enabled}
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={saveSmtpSettings}
                  disabled={smtpSaving || smtpLoading || !smtp}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {smtpSaving ? 'Saving…' : 'Save Branding & Email'}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ---------- Skeleton quand chargement profil ---------- */
  if (loading) {
    return (
      <Layout>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Unable to load profile</p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ---------- Page ---------- */
  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <div>
          <h1 className={h1}>My Profile</h1>
          <p className={pSub}>Manage your personal information and account settings.</p>
        </div>

        {/* Profile Card (d'origine) */}
        <div className={card}>
          {/* Bannière personnalisée ou par défaut */}
          <div className="h-24 sm:h-32 relative overflow-hidden">
            {profile.banner_url ? (
              <img
                src={profile.banner_url}
                alt="Bannière de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full"></div>
            )}
          </div>
          <div className="relative px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Avatar personnalisé ou par défaut */}
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-900 rounded-full border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center mx-auto sm:mx-0 cursor-pointer hover:opacity-80 transition-opacity relative group"
                  onClick={() => setShowAvatarUpload(true)}
                  title="Cliquer pour changer la photo de profil"
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar de profil"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                    />
                  ) : profile.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt="Logo de profil"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl">
                        {getInitials(profile.name, profile.email)}
                      </span>
                    </div>
                  )}
                  
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-center">
                      <User size={16} className="mx-auto mb-1" />
                      <span className="text-xs">Changer</span>
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-left mb-4 sm:mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.name || 'User'}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{profile.email}</p>
                  {profile.activity && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{profile.activity}</p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      profile.is_pro
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300'
                    }`}>
                      {profile.is_pro ? 'Pro' : 'Free'}
                    </span>
                    {profile.role === 'admin' && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information (d’origine) */}
        <div className={`${card} p-4 sm:p-6`}>
          <h3 className={h2}>Account Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Member since</p>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-1">
                {formatDate(profile.created_at)}
              </p>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
              <p className={monoMuted}>
                {profile.id}
              </p>
            </div>

            {profile.referrer_id && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Referred by</p>
                <p className={monoMuted}>
                  {profile.referrer_id}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Settings Tabs (d’origine + “Branding & Email”) */}
        <div className={card}>
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className={`lg:w-64 ${soft} border-r border-gray-200 dark:border-slate-700 lg:border-b-0 border-b`}>
              <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabId)}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg text-left transition-colors ${
                        active
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 min-w-0">
              {renderTabContent()}

              {/* Footer Save (garde le bouton global pour profil) */}
              <div className={`mt-6 sm:mt-8 pt-4 sm:pt-6 ${divider}`}>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} className="mr-2 flex-shrink-0" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'upload d'avatar */}
      {showAvatarUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Changer la photo de profil
              </h3>
              <button
                onClick={() => {
                  setShowAvatarUpload(false);
                  setAvatarFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <ImageUpload
                currentImage={profile?.avatar_url}
                onImageChange={setAvatarFile}
                onImageRemove={removeAvatar}
                placeholder="Uploader une photo de profil"
                aspectRatio="logo"
                className="w-full max-w-xs mx-auto"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (avatarFile) {
                    await saveImages();
                  }
                }}
                disabled={!avatarFile || isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {uploadingAvatar ? 'Upload...' : 'Sauvegarde...'}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Sauvegarder
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowAvatarUpload(false);
                  setAvatarFile(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Annuler
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Format recommandé: 200x200px, PNG, JPG, GIF jusqu'à 5MB
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProfilePage;
