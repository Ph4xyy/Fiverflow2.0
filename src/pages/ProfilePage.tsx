// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useStripeSubscription } from '../hooks/useStripeSubscription';
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
  Moon,
  Sun,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

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
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const { subscription: stripeSubscription } = useStripeSubscription();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'preferences'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preferences, setPreferences] = useState({
    notify_tasks: true,
    notify_invoices: true,
    notify_email: false
  });

  // Form states
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

  // Mock data for when Supabase is not configured
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ] as const;

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
  }, [user]);

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
    } catch (error) {
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

  const getInitials = (name: string | null, email: string) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : email.slice(0, 2).toUpperCase();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ---------- UI class helpers (dark‑ready)
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
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">Theme</h4>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                      {isDarkMode ? <Moon className="text-blue-600" size={20} /> : <Sun className="text-yellow-500" size={20} />}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isDarkMode ? 'Dark theme is enabled' : 'Light theme is enabled'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!isDarkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className={`${soft} p-3 sm:p-4 rounded-lg`}>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">Default Currency</h4>
                  <select className={selectBase}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <div>
          <h1 className={h1}>My Profile</h1>
          <p className={pSub}>Manage your personal information and account settings.</p>
        </div>

        {/* Profile Card */}
        <div className={card}>
          {/* Header with background */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24 sm:h-32"></div>
          
          {/* Profile Content */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-900 rounded-full border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center mx-auto sm:mx-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {getInitials(profile.name, profile.email)}
                    </span>
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

        {/* Account Information */}
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

        {/* Settings Tabs */}
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
                      onClick={() => setActiveTab(tab.id)}
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
    </Layout>
  );
};

export default ProfilePage;
