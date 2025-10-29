import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoImage from '../assets/LogoFiverFlow.png';

interface NavItem {
  label: string;
  path: string;
  items?: string[];
}

const navItems = [
  { 
    label: 'Dashboard', 
    path: '/docs/dashboard',
    items: ['Overview', 'Quick Stats', 'Recent Activity', 'Performance Metrics']
  },
  { 
    label: 'Calendar', 
    path: '/docs/calendar',
    items: ['Create Events', 'Manage Deadlines', 'Multiple Views', 'Smart Notifications']
  },
  { 
    label: 'Statistics', 
    path: '/docs/statistics',
    items: ['Revenue Analytics', 'Client Metrics', 'Time Tracking', 'Custom Reports']
  },
  { 
    label: 'Referrals', 
    path: '/docs/referrals',
    items: ['Share Links', 'Track Invites', 'Earn Rewards', 'Manage Payouts']
  },
  { 
    label: 'Assistant', 
    path: '/docs/assistant',
    items: ['AI Suggestions', 'Task Automation', 'Natural Language', 'Custom Workflows']
  },
  { 
    label: 'Clients', 
    path: '/docs/clients',
    items: ['Add Clients', 'Manage Contacts', 'Track History', 'Custom Fields']
  },
  { 
    label: 'Orders', 
    path: '/docs/orders',
    items: ['Create Orders', 'Track Progress', 'Set Deadlines', 'Attach Files']
  },
  { 
    label: 'Invoices', 
    path: '/docs/invoices',
    items: ['Create Invoices', 'Custom Templates', 'Track Payments', 'Recurring Invoices']
  },
  { 
    label: 'Workboard', 
    path: '/docs/workboard',
    items: ['Task Management', 'Time Tracking', 'Kanban Board', 'Set Priorities']
  },
  { 
    label: 'Profile', 
    path: '/docs/profile',
    items: ['Account Settings', 'Security', 'Notifications', 'Integrations']
  },
  { 
    label: 'Admin', 
    path: '/docs/admin',
    items: ['User Management', 'System Monitoring', 'Analytics', 'Support Tools']
  },
  { 
    label: 'Upgrade', 
    path: '/docs/upgrade',
    items: ['Compare Plans', 'See Features', 'Manage Billing', 'Usage Limits']
  },
];

const navLinks = [
  { label: "Features", href: "/home#features" },
  { label: "Benefits", href: "/home#benefits" },
  { label: "Testimonials", href: "/home#testimonials" },
  { label: "Pricing", href: "/home#pricing" },
  { label: "FAQ", href: "/home#faq" },
  { label: "Docs", href: "/docs" }
];

const DocsLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  const isActive = (path: string, currentPath: string) => {
    // For index page, only active if exactly /docs
    if (path === '/docs' && currentPath === '/docs') {
      return true;
    }
    // For other pages, check if it starts with the path
    if (path !== '/docs') {
      return currentPath.startsWith(path);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Top Navigation Bar - Same as Landing */}
      <nav className="sticky top-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Brand with Docs label */}
            <Link to="/home" className="flex items-center space-x-3">
              <img src={LogoImage} alt="FiverFlow Logo" className="h-6 w-auto" />
              <span className="text-[#8B5CF6] font-semibold text-sm">DOCS</span>
            </Link>

            {/* Desktop Navigation - Same links as Landing */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="hidden lg:inline-flex items-center justify-center rounded-full text-white font-medium text-sm px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow"
              >
                Try FiverFlow for free
              </Link>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {sidebarOpen && (
            <div className="lg:hidden mt-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block py-2 text-neutral-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full text-white font-medium text-sm px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow mt-2"
              >
                Try FiverFlow for free
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="flex justify-center">
        {/* Sidebar - More centered */}
        <aside
          className={`
            fixed lg:sticky top-0 h-screen bg-transparent w-72 overflow-y-auto z-40
            transition-transform duration-300 ease-in-out pl-24
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-6 space-y-6 pt-24">
            {navItems.map((item) => (
              <div key={item.path} className="relative">
                {/* Category Title - Not clickable */}
                <div
                  className={`
                    block text-sm font-semibold mb-2
                    ${isActive(item.path, location.pathname) ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  {item.label}
                </div>
                
                {/* Feature Items with line */}
                {item.items && (
                  <div className="relative ml-4">
                    {/* Line running from first to last item in category */}
                    <div className="absolute left-0 top-2 bottom-0 w-0.5 bg-gray-700" />
                    
                    {/* Purple line for active category */}
                    {isActive(item.path, location.pathname) && (
                      <div className="absolute left-0 top-2 bottom-0 w-0.5 bg-[#8B5CF6] z-10" />
                    )}
                    
                    <div className="space-y-1 pl-3">
                      {item.items.map((feature, idx) => (
                        <Link
                          key={idx}
                          to={`${item.path}/${feature.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`
                            block text-sm py-1.5 transition-all duration-200
                            ${isActive(item.path, location.pathname) ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                          `}
                        >
                          {feature}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl px-8 py-8 ml-0">
          <Outlet />
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

