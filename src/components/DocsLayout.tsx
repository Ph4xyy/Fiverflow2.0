import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Network, 
  Bot, 
  Users, 
  ShoppingBag, 
  FileText, 
  CheckSquare, 
  User, 
  Shield, 
  ArrowUp, 
  Menu, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  items?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Overview',
    path: '/docs',
    icon: <LayoutDashboard size={18} />,
    items: [
      { label: 'Dashboard', path: '/docs/dashboard', icon: <LayoutDashboard size={18} /> },
      { label: 'Calendar', path: '/docs/calendar', icon: <Calendar size={18} /> },
      { label: 'Statistics', path: '/docs/statistics', icon: <BarChart3 size={18} /> },
      { label: 'Referrals', path: '/docs/referrals', icon: <Network size={18} /> },
    ]
  },
  {
    label: 'AI',
    path: '/docs/ai',
    icon: <Bot size={18} />,
    items: [
      { label: 'Assistant', path: '/docs/assistant', icon: <Bot size={18} /> },
    ]
  },
  {
    label: 'Workspace',
    path: '/docs/workspace',
    icon: <Users size={18} />,
    items: [
      { label: 'Clients', path: '/docs/clients', icon: <Users size={18} /> },
      { label: 'Orders', path: '/docs/orders', icon: <ShoppingBag size={18} /> },
      { label: 'Invoices', path: '/docs/invoices', icon: <FileText size={18} /> },
      { label: 'Workboard', path: '/docs/workboard', icon: <CheckSquare size={18} /> },
    ]
  },
  {
    label: 'More',
    path: '/docs/more',
    icon: <User size={18} />,
    items: [
      { label: 'Profile', path: '/docs/profile', icon: <User size={18} /> },
      { label: 'Admin', path: '/docs/admin', icon: <Shield size={18} /> },
      { label: 'Upgrade', path: '/docs/upgrade', icon: <ArrowUp size={18} /> },
    ]
  },
];

const DocsLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'AI', 'Workspace', 'More']);
  const location = useLocation();

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  const toggleSection = (label: string) => {
    setExpandedSections(prev => 
      prev.includes(label) 
        ? prev.filter(s => s !== label)
        : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Top Navigation Bar */}
      <header className="bg-[#1e2938] backdrop-blur-xl border-b border-[#35414e] shadow-lg fixed w-full top-0 z-50">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#35414e] transition-all duration-200"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-white">FiverFlow</span>
              <span className="text-[#8B5CF6] font-semibold">DOCS</span>
            </Link>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <span className="hidden sm:inline">Go to App</span>
            <ExternalLink size={16} />
          </Link>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-14 h-[calc(100vh-3.5rem)] bg-[#0B0E14] border-r border-[#1C2230] w-64 overflow-y-auto z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((section) => (
              <div key={section.label} className="space-y-1">
                <button
                  onClick={() => section.items && toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  <span>{section.label}</span>
                  {section.items && (
                    <ChevronRight 
                      size={16} 
                      className={`transition-transform ${
                        expandedSections.includes(section.label) ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </button>
                
                {section.items && expandedSections.includes(section.label) && (
                  <div className="ml-4 space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`
                          flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                          ${
                            isActive(item.path)
                              ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-l-2 border-[#8B5CF6]'
                              : 'text-gray-400 hover:text-white hover:bg-[#1C2230]'
                          }
                        `}
                      >
                        <span className={isActive(item.path) ? 'text-[#8B5CF6]' : ''}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DocsLayout;

