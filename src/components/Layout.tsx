import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// Import logo
import LogoImage from '../assets/LogoTransparent.png';

import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import NotificationsDropdown from './NotificationsDropdown';
import CentralizedSearchBar from './CentralizedSearchBar';
import LanguageSwitcher from './LanguageSwitcher';
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
  Lock,
  Receipt,
  CheckCircle2,
  Shield,
  ListChecks,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

/* ---------- Thème visuel partagé (Dark-only) ---------- */
export const pageBgClass = 'bg-[#0B0E14] text-slate-100';
export const cardClass   = 'rounded-2xl border border-[#1C2230] bg-[#11151D]/95 shadow-lg';
export const subtleBg    = 'bg-[#141922]';

/* ---------- Helper: détecte admin ---------- */
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
        <div className="p-4 border border-red-300/30 bg-red-900/10 rounded-lg">
          <div className="text-sm text-red-300 font-medium">
            Le layout a rencontré une erreur. L’interface minimale reste affichée.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LayoutInner: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [requiredPlan, setRequiredPlan] = useState<'Pro' | 'Excellence'>('Pro');

  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
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

  /* ---------- NAV STRUCTURE EN 3 SECTIONS + MICRO SECTION BAS ---------- */
  // Section 1: Overview (principales)
  const overviewItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, tone: 'from-accent-blue to-accent-purple' },
    { 
      path: '/calendar', 
      label: 'Calendar', 
      icon: CalendarIcon,
      restricted: !checkAccess('calendar') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const,
      tone: 'from-purple-500 to-violet-600'
    },
    { 
      path: '/stats', 
      label: 'Statistics', 
      icon: BarChart3,
      restricted: !checkAccess('stats') && !restrictions?.isAdmin,
      requiredPlan: 'Excellence' as const,
      tone: 'from-cyan-500 to-sky-600'
    },
    { 
      path: '/network', 
      label: 'Referrals', 
      icon: Share2,
      restricted: !checkAccess('referrals') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const,
      tone: 'from-rose-500 to-red-600'
    },
  ];

  // Section 2: AI (vide pour l’instant)
  const aiItems: any[] = [];

  // Section 3: Workspace
  const workspaceItems = [
    { path: '/clients', label: 'Clients', icon: Users, tone: 'from-emerald-500 to-teal-600' },
    { path: '/orders',  label: 'Orders',  icon: ShoppingCart, tone: 'from-amber-500 to-orange-600' },
    { 
      path: '/invoices',
      label: 'Invoices',
      icon: Receipt,
      restricted: !(restrictions?.isAdmin || checkAccess('invoices')),
      requiredPlan: 'Excellence' as const,
      tone: 'from-fuchsia-500 to-pink-600'
    },
    { 
      path: '/tasks', 
      label: 'Tasks', 
      icon: CheckSquare,
      restricted: !checkAccess('tasks') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const,
      tone: 'from-indigo-500 to-blue-600'
    },
    // 👇 To-Do List (Pro & Plus/Excellence, pas Free)
    { 
      path: '/workspace/todo',
      label: 'To-Do List',
      icon: ListChecks,
      restricted: !checkAccess('todo') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const, // badge "Pro" si restreint
      tone: 'from-violet-500 to-fuchsia-600'
    },
  ];

  // Micro section (tout en bas)
  const bottomItems = [
    { path: '/profile', label: 'Account', icon: User, tone: 'from-accent-blue to-accent-purple' },
    ...(isAdmin ? [{
      path: '/admin/dashboard',
      label: 'Admin',
      icon: Shield,
      tone: 'from-lime-500 to-green-600'
    }] as const : []),
    { path: '/upgrade', label: 'Upgrade', icon: Crown, tone: 'from-accent-orange to-accent-yellow', special: 'upgrade' as const },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const LinkRow: React.FC<{
    item: any;
    activeMatcher?: (p: string) => boolean;
  }> = ({ item, activeMatcher }) => {
    const Icon = item.icon;
    const isRestricted = 'restricted' in item && (item as any).restricted;
    const isUpgrade = item.special === 'upgrade';
    const isActive =
      activeMatcher
        ? activeMatcher(item.path)
        : (location.pathname === item.path ||
          (item.path?.startsWith?.('/admin') && location.pathname.startsWith('/admin')));

    // ✅ Build-safe classes
    const rowClass =
      isUpgrade
        ? 'text-white bg-gradient-to-r from-accent-orange to-accent-yellow shadow-glow-orange hover:shadow-lg hover:-translate-y-0.5'
        : isRestricted
        ? 'text-slate-500/70 cursor-pointer'
        : isActive
        ? 'text-white bg-[#121722] ring-1 ring-inset ring-[#2A3347] shadow-glow-sm'
        : 'text-slate-300 hover:text-white hover:bg-[#11161F] ring-1 ring-inset ring-transparent hover:ring-[#21293C]';

    const iconClassBase = 'size-9 rounded-xl grid place-items-center text-white/90';
    const iconClass =
      isRestricted
        ? `${iconClassBase} bg-[#151A22] ring-1 ring-inset ring-[#202839]`
        : isActive
        ? `${iconClassBase} bg-gradient-to-br ${item.tone} shadow-glow-sm`
        : `${iconClassBase} bg-[#151A22] group-hover:bg-[#17202C] ring-1 ring-inset ring-[#202839] group-hover:ring-[#2A3347]`;

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
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${rowClass}`}
      >
        <div className={iconClass}>
          <Icon size={16} />
        </div>

        <span className="truncate">{item.label}</span>

        {isRestricted && 'requiredPlan' in item && (
          <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-[#121722] text-slate-300 ring-1 ring-inset ring-[#202839]">
            {(item as any).requiredPlan}
          </span>
        )}

        {isUpgrade && (
          <div className="ml-auto">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow" />
          </div>
        )}

        {isActive && (
          <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-accent-blue/10 shadow-[0_0_20px_rgba(74,158,255,0.12)]" />
        )}
      </Link>
    );
  };

  return (
    <div className={`min-h-screen ${pageBgClass} transition-colors duration-300`}>
      {/* Topbar (dark-only) */}
      <header className="bg-[#0D1117]/80 backdrop-blur-xl border-b border-[#1C2230] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] fixed w-full top-0 z-50">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          {/* Left section - Logo and mobile menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#141922] transition-all duration-200"
            >
              {isSidebarOpen ? <X size={40} /> : <Menu size={20} />}
            </button>
            <Link to="/dashboard" className="text-2xl font-extrabold leading-none">
              <div className="flex items-center space-x-3">
                <img src={LogoImage} alt="Logo" className="h-8 w-auto" />
                <span className="text-2x1 font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-accent-blue dark:to-accent-purple bg-clip-text text-transparent">
                  FiverFlow
                </span>
              </div>
            </Link>
          </div>

          {/* Center section - Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <CentralizedSearchBar />
          </div>
          
          {/* Right section - Language switcher, notifications, logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            
            <LocalErrorBoundary>
              <div className="size-10 rounded-xl grid place-items-center text-slate-300 hover:text-white bg-[#121722] hover:bg-[#141A26] ring-1 ring-inset ring-[#202839] hover:ring-[#2A3347] transition-all duration-200">
                <NotificationsDropdown />
              </div>
            </LocalErrorBoundary>

            <button 
              onClick={handleSignOut}
              className="size-10 rounded-xl grid place-items-center text-slate-300 hover:text-white bg-[#121722] hover:bg-[#141A26] ring-1 ring-inset ring-[#202839] hover:ring-[#2A3347] transition-all duration-200"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-72
            bg-[#0D1117]/85 backdrop-blur-xl
            border-r border-[#1C2230]
            shadow-[20px_0_40px_-30px_rgba(0,0,0,0.6)]
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-16 lg:pt-0
          `}
        >
          <nav className="h-full px-3 sm:px-4 py-5 space-y-2 overflow-y-auto flex flex-col">
            <LocalErrorBoundary>
              {/* -------- Section: Overview -------- */}
              <div className="px-3 sm:px-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overview</span>
              </div>
              <div className="space-y-1">
                {overviewItems.map((item) => (
                  <LinkRow key={item.path} item={item} />
                ))}
              </div>

              {/* -------- Section: AI -------- */}
              <div className="px-3 sm:px-4 pt-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI</span>
              </div>
              <div className="mx-3 sm:mx-4 mt-2">
                <div className="text-xs text-slate-400 px-3 py-2 rounded-xl bg-[#0E121A] ring-1 ring-inset ring-[#1C2230]">
                  Coming soon!
                </div>
              </div>

              {/* -------- Section: Workspace -------- */}
              <div className="px-3 sm:px-4 pt-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace</span>
              </div>
              <div className="space-y-1">
                {workspaceItems.map((item) => (
                  <LinkRow key={item.path} item={item} />
                ))}
              </div>
            </LocalErrorBoundary>

            {/* push le bas */}
            <div className="flex-1" />

            {/* -------- Micro section: Account / Admin / Upgrade -------- */}
            <div className="pt-4 mt-2 border-t border-[#1C2230]">
              <div className="px-3 sm:px-4 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">More</span>
              </div>
              <LocalErrorBoundary>
                <div className="space-y-1">
                  {bottomItems.map((item) => (
                    <LinkRow
                      key={item.path}
                      item={item}
                      activeMatcher={(p) =>
                        p === '/profile'
                          ? location.pathname === '/profile'
                          : p.startsWith('/admin')
                          ? location.pathname.startsWith('/admin')
                          : location.pathname === p
                      }
                    />
                  ))}
                </div>
              </LocalErrorBoundary>
            </div>
          </nav>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className={`p-0 sm:p-6 min-h-screen transition-colors duration-300`}>
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
              border border-[#1C2230]
              bg-[#0D1117]/90
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
                  <h3 id="upgrade-modal-title" className="text-xl font-semibold text-white">
                    Upgrade required
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-300">
                    Unlock this feature on the <span className="font-medium">{requiredPlan}</span> plan.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setUpgradeOpen(false)}
                className="p-2 rounded-lg hover:bg-[#141A26] text-slate-300"
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
                  border border-[#1C2230]
                  bg-[#0D1117]/70
                "
              >
                <p className="text-sm mb-3 text-slate-200">
                  You’ll get:
                </p>

                {requiredPlan === "Pro" ? (
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-500" size={16} />
                      Calendar & Tasks access
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-500" size={16} />
                      Referral program & commissions
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-500" size={16} />
                      Priority support
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-500" size={16} />
                      Everything in Pro
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-500" size={16} />
                      Invoices + Advanced Statistics
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 flex-none text-green-500" size={16} />
                      Premium features & higher limits
                    </li>
                  </ul>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2.5">
                <button
                  onClick={() => setUpgradeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#1C2230] bg-[#0F141C] text-slate-200 hover:bg-[#121822] transition"
                >
                  Not now
                </button>
                <button
                  onClick={() => {
                    setUpgradeOpen(false);
                    navigate('/upgrade');
                  }}
                  className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-accent-blue to-accent-purple hover:shadow-glow-sm transition"
                >
                  See plans
                </button>
              </div>

              <p className="mt-3 text-center text-xs text-slate-400">
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
