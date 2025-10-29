import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface CategoryItem {
  label: string;
  path: string;
  subpages?: Array<{ label: string; path: string }>;
}

const categories: CategoryItem[] = [
  {
    label: 'Overview',
    path: '/docs/overview',
    subpages: [
      { label: 'Dashboard', path: '/docs/dashboard' },
      { label: 'Calendar', path: '/docs/calendar' },
      { label: 'Statistics', path: '/docs/statistics' },
      { label: 'Referrals', path: '/docs/referrals' },
    ],
  },
  {
    label: 'AI',
    path: '/docs/ai',
    subpages: [{ label: 'Assistant', path: '/docs/assistant' }],
  },
  {
    label: 'Workspace',
    path: '/docs/workspace',
    subpages: [
      { label: 'Clients', path: '/docs/clients' },
      { label: 'Orders', path: '/docs/orders' },
      { label: 'Invoices', path: '/docs/invoices' },
      { label: 'Workboard', path: '/docs/workboard' },
    ],
  },
  {
    label: 'More',
    path: '/docs/more',
    subpages: [
      { label: 'Profile', path: '/docs/profile' },
      { label: 'Admin', path: '/docs/admin' },
      { label: 'Upgrade', path: '/docs/upgrade' },
    ],
  },
];

interface DocsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocsSidebar: React.FC<DocsSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryPath: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryPath) ? prev.filter((p) => p !== categoryPath) : [...prev, categoryPath]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isLinkActive = (linkPath: string) => {
    return location.pathname === linkPath;
  };

  const isCategoryExpanded = (categoryPath: string) => {
    return expandedCategories.includes(categoryPath);
  };

  const hasActiveSubpage = (category: CategoryItem) => {
    return category.subpages?.some((subpage) => isLinkActive(subpage.path)) || false;
  };

  // Auto-expand categories with active subpages
  React.useEffect(() => {
    const activeCategories = categories
      .filter((cat) => hasActiveSubpage(cat))
      .map((cat) => cat.path);
    setExpandedCategories(activeCategories);
  }, [location.pathname]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed top-[73px] left-0 right-0 bottom-0 bg-black/70 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen || window.innerWidth >= 1024 ? 0 : -260,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full w-full bg-[#0A0A0A] border-r border-[rgba(255,255,255,0.04)] z-40 overflow-y-auto"
      >
        <div className="p-6">
          {/* Docs Home Link */}
          <Link
            to="/docs"
            className={`block py-2 text-sm font-medium transition-colors ${
              location.pathname === '/docs' ? 'text-[#FAFAFA]' : 'text-[#A6A6A6] hover:text-[#FAFAFA]'
            }`}
          >
            Docs home
          </Link>

          {/* Separator */}
          <div className="h-px bg-[rgba(255,255,255,0.04)] my-4" />

          {/* Categories */}
          <nav className="space-y-1">
            {categories.map((category) => {
              const expanded = isCategoryExpanded(category.path);
              const active = hasActiveSubpage(category);

              return (
                <div key={category.path} className="relative">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.path)}
                    className={`group w-full flex items-center justify-between py-2 px-3 text-sm font-medium transition-colors ${
                      active ? 'text-[#FAFAFA]' : 'text-[#A6A6A6] hover:text-[#FAFAFA]'
                    }`}
                  >
                    <span>{category.label}</span>
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {/* Active Indicator Line */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#8B5CF6]"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Subpages */}
                  <AnimatePresence>
                    {expanded && category.subpages && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-3 space-y-1">
                          {category.subpages.map((subpage) => {
                            const linkActive = isLinkActive(subpage.path);
                            return (
                              <Link
                                key={subpage.path}
                                to={subpage.path}
                                className={`relative block py-2 px-3 text-sm transition-colors ${
                                  linkActive
                                    ? 'text-[#FAFAFA]'
                                    : 'text-[#A6A6A6] hover:text-[#FAFAFA]'
                                }`}
                              >
                                {subpage.label}
                                {/* Active Indicator for Subpage */}
                                {linkActive && (
                                  <motion.div
                                    layoutId="activeSubpageIndicator"
                                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#8B5CF6]"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                  />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default DocsSidebar;