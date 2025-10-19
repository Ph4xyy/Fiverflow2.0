import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Import logo
import LogoImage from '../assets/LogoFiverFlow.png';

import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import NotificationsDropdown from './NotificationsDropdown';
import CentralizedSearchBar from './CentralizedSearchBar';
import { useAuth } from '../contexts/AuthContext';

import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Package, 
  Calendar as CalendarIcon,
  ClipboardList,
  TrendingUp, 
  Crown,
  User,
  LogOut,
  Network,
  Lock,
  CheckCircle2,
  Shield,
  Receipt,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

/* ---------- Nouveau thème visuel professionnel ---------- */
export const pageBgClass = 'bg-[#111726] text-white';
export const cardClass   = 'rounded-xl border border-[#1e2938] bg-[#1e2938] shadow-lg';
export const subtleBg    = 'bg-[#1e2938]';
export const buttonClass = 'bg-[#35414e] hover:bg-[#3d4a57] text-white';
export const gradientClass = 'bg-gradient-to-r from-[#9c68f2] to-[#422ca5]';

/* ---------- Helper: détecte admin ---------- */
const useIsAdminFromEverywhere = (user: any, userRole?: string | null) => {
  // 🔥 AUTHENTIFICATION SUPPRIMÉE - Plus d'admin par défaut
  const isAdmin = false; // Plus d'authentification, donc plus d'admin
  
  return isAdmin;
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
            The layout encountered an error. Minimal interface is displayed.
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
  const { user, signOut } = useAuth();
  const { restrictions, checkAccess } = usePlanRestrictions();
  useEffect(() => {
    // Définir le rôle utilisateur basé sur l'authentification
    if (user) {
      setUserRole('user');
    } else {
      setUserRole(null);
    }
  }, [user]);

  const isAdmin = useIsAdminFromEverywhere(user, userRole);

  /* ---------- NAV STRUCTURE EN 3 SECTIONS + MICRO SECTION BAS ---------- */
  // Section 1: Overview (principales)
  const overviewItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard
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
      icon: TrendingUp,
      restricted: !checkAccess('stats') && !restrictions?.isAdmin,
      requiredPlan: 'Excellence' as const
    },
    { 
      path: '/network', 
      label: 'Referrals', 
      icon: Network,
      restricted: !checkAccess('referrals') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const
    },
  ];

  // Section 2: AI (vide pour l'instant)
  // const aiItems: any[] = [];

  // Section 3: Workspace
  const workspaceItems = [
    { 
      path: '/clients', 
      label: 'Clients', 
      icon: Users
    },
    { 
      path: '/orders',  
      label: 'Orders',  
      icon: Package
    },
    { 
      path: '/invoices',
      label: 'Invoices',
      icon: Receipt,
      restricted: !(restrictions?.isAdmin || checkAccess('invoices')),
      requiredPlan: 'Excellence' as const
    },
    { 
      path: '/tasks', 
      label: 'Workboard', 
      icon: ClipboardList,
      restricted: !checkAccess('tasks') && !restrictions?.isAdmin,
      requiredPlan: 'Pro' as const
    },
  ];

  // Micro section (tout en bas)
  const bottomItems = [
    { 
      path: '/profile', 
      label: 'Profile', 
      icon: User
    },
    ...(isAdmin ? [{
      path: '/admin/dashboard',
      label: 'Admin',
      icon: Shield
    }] as const : []),
    { 
      path: '/upgrade', 
      label: 'Upgrade', 
      icon: Crown,
      special: 'upgrade' as const 
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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

    // 🎨 Nouveau style professionnel
    const rowClass = isActive
      ? 'text-white bg-[#35414e] rounded-lg'
      : 'text-gray-300 hover:text-white hover:bg-[#35414e] hover:rounded-lg transition-all duration-200';

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
        className={`group relative flex items-center gap-3 px-4 py-3 mx-2 text-sm font-medium transition-all duration-200 ${rowClass}`}
      >
        {/* Icône simple et blanche */}
        <div className="flex items-center justify-center w-5 h-5">
          <Icon size={18} className="text-white" />
        </div>

        <span className="truncate font-medium">{item.label}</span>

        {isRestricted && 'requiredPlan' in item && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-[#35414e] text-gray-300">
            {(item as any).requiredPlan}
          </span>
        )}

        {isUpgrade && (
          <div className="ml-auto">
            <div className="w-2 h-2 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full animate-pulse" />
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className={`min-h-screen ${pageBgClass} transition-colors duration-300`}>
      {/* Topbar - Nouveau style professionnel */}
      <header className="bg-[#1e2938] backdrop-blur-xl border-b border-[#35414e] shadow-lg fixed w-full top-0 z-50">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          {/* Left section - Logo and mobile menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#35414e] transition-all duration-200"
            >
              {isSidebarOpen ? <X size={40} /> : <Menu size={20} />}
            </button>
            <Link to="/dashboard" className="text-2xl font-extrabold leading-none">
              <div className="flex items-center space-x-3">
                <img src={LogoImage} alt="full" className="h-6 w-auto" />
              </div>
            </Link>
          </div>

          {/* Center section - Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <CentralizedSearchBar />
          </div>
          
          {/* Right section - Notifications, logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LocalErrorBoundary>
              <div className="size-10 rounded-lg grid place-items-center text-white bg-[#35414e] hover:bg-[#3d4a57] transition-all duration-200">
                <NotificationsDropdown />
              </div>
            </LocalErrorBoundary>

            <button 
              onClick={handleSignOut}
              className="size-10 rounded-lg grid place-items-center text-white bg-[#35414e] hover:bg-[#3d4a57] transition-all duration-200"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Nouveau style professionnel */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64
            bg-[#1e2938] backdrop-blur-xl
            border-r border-[#35414e]
            shadow-xl
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-16 lg:pt-16
          `}
        >
          <nav className="h-full px-3 sm:px-4 py-5 space-y-2 overflow-y-auto scrollbar-hide">
            <LocalErrorBoundary>
              {/* -------- Section: Overview -------- */}
              <div className="px-3 sm:px-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overview</span>
              </div>
              <div className="space-y-1">
                {overviewItems.map((item) => (
                  <LinkRow key={item.path} item={item} />
                ))}
              </div>

              {/* -------- Section: AI -------- */}
              <div className="px-3 sm:px-4 pt-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI</span>
              </div>
              <div className="mx-3 sm:mx-4 mt-2">
                <div className="text-xs text-gray-400 px-3 py-2 rounded-lg bg-[#35414e]">
                  Coming soon!
                </div>
              </div>

              {/* -------- Section: Workspace -------- */}
              <div className="px-3 sm:px-4 pt-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspace</span>
              </div>
              <div className="space-y-1">
                {workspaceItems.map((item) => (
                  <LinkRow key={item.path} item={item} />
                ))}
              </div>

              {/* -------- Section: More (collée avec les autres) -------- */}
              <div className="pt-4 mt-2 border-t border-[#35414e]">
                <div className="px-3 sm:px-4 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">More</span>
                </div>
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
              </div>
            </LocalErrorBoundary>
          </nav>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-64 min-h-screen">
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
                      {'Invoices + Advanced Statistics'}
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
      
      {/* 🔥 AUTHENTIFICATION SUPPRIMÉE - Debug panel supprimé */}
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
