import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { docsNav } from '../../lib/docsNav';
import { SearchCommand } from './SearchCommand';

export const DocsSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[260px] flex-shrink-0">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl max-h-[calc(100vh-4rem)] sticky top-16 p-4 overflow-y-auto text-sm text-neutral-300">
        {/* Search */}
        <div className="mb-6">
          <SearchCommand />
        </div>

        {/* Nav sections */}
        <nav className="space-y-6">
          {docsNav.map((section, sectionIndex) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              {/* Section label */}
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium mb-3">
                {section.label}
              </div>

              {/* Section items */}
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.02) }}
                    >
                      <Link
                        to={item.href}
                        className={`block px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

