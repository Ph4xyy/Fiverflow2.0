import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoImage from '../assets/LogoFiverFlow.png';

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/docs/dashboard' },
  { label: 'Calendar', path: '/docs/calendar' },
  { label: 'Statistics', path: '/docs/statistics' },
  { label: 'Referrals', path: '/docs/referrals' },
  { label: 'Assistant', path: '/docs/assistant' },
  { label: 'Clients', path: '/docs/clients' },
  { label: 'Orders', path: '/docs/orders' },
  { label: 'Invoices', path: '/docs/invoices' },
  { label: 'Workboard', path: '/docs/workboard' },
  { label: 'Profile', path: '/docs/profile' },
  { label: 'Admin', path: '/docs/admin' },
  { label: 'Upgrade', path: '/docs/upgrade' },
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleScroll = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Top Navigation Bar - Same as Landing */}
      <nav className="sticky top-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-md border-b border-white/10">
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
                  onClick={(e) => {
                    if (link.href.startsWith('#')) {
                      e.preventDefault();
                      handleScroll(link.href);
                    }
                  }}
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
                  onClick={(e) => {
                    if (link.href.startsWith('#')) {
                      e.preventDefault();
                      handleScroll(link.href);
                    }
                  }}
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

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 h-screen bg-[#0B0E14] border-r border-[#1C2230] w-64 overflow-y-auto z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  block px-3 py-2.5 text-sm transition-all duration-200 relative
                  ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                {/* Purple line indicator for active page */}
                {isActive(item.path) && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#8B5CF6]" />
                )}
                <span>{item.label}</span>
              </Link>
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

