import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoImage from '../assets/LogoFiverFlow.png';
import DocsSidebar from './docs/DocsSidebar';
import DocsTableOfContents from './docs/DocsTableOfContents';
import HelpfulWidget from './docs/HelpfulWidget';

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
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Extract headings from page content for TOC
  useEffect(() => {
    const extractHeadings = () => {
      const elements = document.querySelectorAll('h2, h3');
      const extracted = Array.from(elements).map((el) => ({
        id: el.id || '',
        text: el.textContent || '',
        level: parseInt(el.tagName.replace('H', ''), 10),
      }));
      setHeadings(extracted);
    };

    // Small delay to ensure DOM is rendered
    setTimeout(extractHeadings, 100);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top Navigation Bar - Same as Landing */}
      <nav className="sticky top-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Brand with Docs label */}
            <a href="/home" className="flex items-center space-x-3">
              <img src={LogoImage} alt="FiverFlow Logo" className="h-6 w-auto" />
              <span className="text-[#8B5CF6] font-semibold text-sm">DOCS</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="hidden lg:inline-flex items-center justify-center rounded-full text-white font-medium text-sm px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow"
              >
                Try FiverFlow for free
              </a>

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
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-2 text-neutral-300 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full text-white font-medium text-sm px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow mt-2"
              >
                Try FiverFlow for free
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hamburger button for mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-[#0F0F0F] border border-[rgba(255,255,255,0.1)] rounded"
        aria-label="Toggle menu"
      >
        <Menu size={20} className="text-white" />
      </button>

      {/* Three Column Layout */}
      <div className="flex">
        {/* Left: Sidebar */}
        <DocsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Middle: Main Content */}
        <main className="flex-1 max-w-4xl px-8 py-8 lg:pl-64 lg:pr-16 bg-[#0A0A0A] min-h-screen">
          <Outlet />
        </main>

        {/* Right: TOC and Helpful Widget */}
        <aside className="hidden xl:block w-64 flex-shrink-0 pr-8 pt-20">
          {headings.length > 0 && <DocsTableOfContents headings={headings} />}
          <HelpfulWidget />
        </aside>
      </div>
    </div>
  );
};

export default DocsLayout;