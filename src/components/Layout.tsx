import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import NotificationsDropdown from './NotificationsDropdown';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  ShoppingCart, 
  Calendar as CalendarIcon,
  CheckSquare,
  BarChart3, 
  Crown,
  User,
  LogOut,
  Share2,
  Moon,
  Sun,
  Lock,
  Receipt,
  CheckCircle2,
  Shield,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

/* ---------- Shared UI classes (use across all pages) ---------- */
export const pageBgClass = 'bg-gray-50 dark:bg-slate-950';
export const cardClass   = 'bg-white dark:bg-slate-800 rounded-lg shadow';
export const subtleBg    = 'bg-gray-100 dark:bg-slate-700';

/* ---------- Helper: détecte admin depuis toutes les sources dispo ---------- */
const useIsAdminFromEverywhere = (user: any, userRole?: string | null) => {
  const roleFromMeta =
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    null;

  const roleFromCache = (typeof window !== 'undefined'
    ? sessionStorage.getItem('role')
    : null) as string | null;

  const effectiveRole = roleFromMeta || userRole || roleFromCache;
  return effectiveRole === 'admin';
};

class LocalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('[Layout ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 dark:border-red-700 bg-red-50/60 dark:bg-red-900/20 rounded-lg">
          <div className="text-sm text-red-700 dark:text-red-300 font-medium">
            Le layout a rencontré une erreur. L’interface minimale reste affichée.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LayoutInner: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState<'Pro' | 'Excellence'>('Pro');

  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { restrictions, checkAccess } = usePlanRestrictions();

  const SAFE_MODE_DISABLE_NOTIFICATIONS = false;

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user || !isSupabaseConfigured || !supabase) {
        setUserRole('user');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        } else {
          setUserRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole('user');
      }
    };

    checkUserRole();
  }, [user]);

  const isAdmin = useIsAdminFromEverywhere(user, userRole);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { 
      path: '/invoices',
      label: 'Invoices',
      icon: Receipt,
      restricted: !(restrictions?.isAdmin || checkAccess('invoices')),
      requiredPlan: 'Excellence' as const
    },
    { 
      path: '/tasks', 
      label: 'Tasks', 
      icon: CheckSquare,
      restricted: !checkAccess('tasks') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const
    },
    { 
      path: '/calendar', 
      label: 'Calendar', 
      icon: CalendarIcon,
      restricted: !checkAccess('calendar') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const
    },
    { 
      path: '/stats', 
      label: 'Statistics', 
      icon: BarChart3,
      restricted: !checkAccess('stats') && !restrictions?.isAdmin,
      requiredPlan: 'Excellence' as const
    },
    { 
      path: '/network', 
      label: 'Referrals', 
      icon: Share2,
      restricted: !checkAccess('referrals') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const
    },
    // ✅ corrige le lien Admin pour matcher la route déclarée
    ...(isAdmin ? [{
      path: '/admin/dashboard',
      label: 'Admin',
      icon: Shield
    }] as const : []),
    { path: '/upgrade', label: 'Upgrade', icon: Crown },
  ];

  const accountItems = [
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`min-h-screen ${pageBgClass} transition-colors duration-300`}>
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700 fixed w-full top-0 z-50">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1 sm:p-2 rounded-md text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/dashboard" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-accent-blue dark:to-accent-purple bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
              FiverFlow
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="p-1 sm:p-2 rounded-md text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {!SAFE_MODE_DISABLE_NOTIFICATIONS && (
              <LocalErrorBoundary>
                <NotificationsDropdown />
              </LocalErrorBoundary>
            )}

            <button 
              onClick={handleSignOut}
              className="p-1 sm:p-2 rounded-md text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg dark:shadow-dark-lg transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-slate-700
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          pt-16 lg:pt-0
        `}>
          <nav className="h-full px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            <LocalErrorBoundary>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isUpgrade = item.path === '/upgrade';
                const isRestricted = 'restricted' in item && (item as any).restricted;
                const isActive =
                  location.pathname === item.path ||
                  (item.path.startsWith('/admin') && location.pathname.startsWith('/admin'));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => {
                      if (isRestricted) {
                        e.preventDefault();
                        setRequiredPlan((item as any).requiredPlan || 'Pro');
                        setUpgradeOpen(true);
                        return;
                      }
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-medium transition-colors relative
                      ${isUpgrade
                        ? 'bg-gradient-to-r from-accent-orange to-accent-yellow dark:from-accent-orange dark:to-accent-yellow text-white shadow-lg hover:shadow-glow-orange transform hover:-translate-y-0.5 transition-all duration-200'
                        : isRestricted
                          ? 'text-gray-400 dark:text-slate-500 cursor-pointer'
                          : isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-accent-blue border-r-2 border-blue-700 dark:border-accent-blue shadow-sm dark:shadow-glow-sm'
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transform hover:translate-x-1 transition-all duration-200'
                      }
                    `}
                  >
                    <div className="relative">
                      <Icon size={18} />
                      {isRestricted && (
                        <Lock className="absolute -top-1 -right-1 w-3 h-3 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-full" />
                      )}
                    </div>
                    <span>{item.label}</span>
                    {isRestricted && 'requiredPlan' in item && (
                      <span className="ml-auto text-xs bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-full">
                        {(item as any).requiredPlan}
                      </span>
                    )}
                    {isUpgrade && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </LocalErrorBoundary>
            
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="px-3 sm:px-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Account
                </span>
              </div>
              <LocalErrorBoundary>
                <Link
                  to="/profile"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-medium transition-colors
                    ${location.pathname === '/profile'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-accent-blue border-r-2 border-blue-700 dark:border-accent-blue shadow-sm dark:shadow-glow-sm'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transform hover:translate-x-1 transition-all duration-200'
                    }
                  `}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </Link>
              </LocalErrorBoundary>
            </div>
          </nav>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className={`p-0 sm:p-6 dark:text-slate-100 ${pageBgClass} min-h-screen transition-colors duration-300`}>
            <LocalErrorBoundary>{children}</LocalErrorBoundary>
          </div>
        </main>
      </div>

      {upgradeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setUpgradeOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
            className="
              relative w-full max-w-lg
              rounded-3xl overflow-hidden
              shadow-2xl
              border border-white/10
              bg-gradient-to-b from-white/90 to-white/70
              dark:from-slate-900/90 dark:to-slate-900/70
              backdrop-blur-xl
            "
          >
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500" />

            <div className="px-6 pt-6 pb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="
                    p-2.5 rounded-2xl
                    bg-gradient-to-br from-indigo-600 to-fuchsia-600
                    text-white shadow-md shadow-indigo-900/20
                  "
                  aria-hidden="true"
                >
                  <Crown size={20} />
                </div>
                <div>
                  <h3 id="upgrade-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                    Upgrade required
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                    Unlock this feature on the <span className="font-medium">{requiredPlan}</span> plan.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setUpgradeOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
                aria-label="Close upgrade modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="mb-4">
                <span
                  className="
                    inline-flex items-center gap-1.5
                    text-xs font-medium
                    px-2.5 py-1.5 rounded-full
                    bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white
                    shadow-md shadow-indigo-900/10
                  "
                >
                  <Lock size={14} />
                  {requiredPlan} features
                </span>
              </div>

              <div
                className="
                  rounded-2xl p-4
                  border border-gray-200 dark:border-slate-700
                  bg-white/70 dark:bg-slate-900/50
                "
              >
                <p className="text-sm mb-3 text-gray-700 dark:text-gray-300">
                  You’ll get:
                </p>

                {requiredPlan === "Pro" ? (
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-600 dark:text-green-500" size={16} />
                      Calendar & Tasks access
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-600 dark:text-green-500" size={16} />
                      Referral program & commissions
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-600 dark:text-green-500" size={16} />
                      Priority support
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-600 dark:text-green-500" size={16} />
                      Everything in Pro
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-600 dark:text-green-500" size={16} />
                      Invoices + Advanced Statistics
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-600 dark:text-green-500" size={16} />
                      Premium features & higher limits
                    </li>
                  </ul>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2.5">
                <button
                  onClick={() => setUpgradeOpen(false)}
                  className="
                    px-4 py-2 rounded-lg
                    border border-gray-300 dark:border-slate-700
                    bg-white/70 dark:bg-slate-900/50
                    text-gray-800 dark:text-gray-200
                    hover:bg-gray-50 dark:hover:bg-slate-800
                    transition
                  "
                >
                  Not now
                </button>
                <button
                  onClick={() => {
                    setUpgradeOpen(false);
                    navigate('/upgrade');
                  }}
                  className="
                    px-4 py-2 rounded-lg
                    text-white
                    bg-gradient-to-r from-indigo-600 to-fuchsia-600
                    hover:from-indigo-700 hover:to-fuchsia-700
                    shadow-lg shadow-indigo-900/20
                    transition
                  "
                >
                  See plans
                </button>
              </div>

              <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                You can change or cancel your plan anytime.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LocalErrorBoundary>
      <LayoutInner>{children}</LayoutInner>
    </LocalErrorBoundary>
  );
};

export default Layout;
