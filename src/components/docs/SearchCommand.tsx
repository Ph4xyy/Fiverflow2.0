import React, { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchCommandProps {
  onSearch?: (query: string) => void;
}

export const SearchCommand: React.FC<SearchCommandProps> = ({ onSearch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mockResults = [
    { title: "Welcome to FiverFlow", category: "Getting Started" },
    { title: "Creating Your First Project", category: "Projects" }
  ];

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); }} className="relative w-full">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search className="text-neutral-500" size={18} />
        </div>
        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsModalOpen(true)}
          className="w-full pl-12 pr-24 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          aria-label="Search documentation"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-neutral-400 text-xs">
          <Command size={12} />
          <span>K</span>
        </div>
      </form>
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-50 flex items-start justify-center pt-20"
            >
              <div className="w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden" role="dialog" aria-modal="true">
                <div className="p-4 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search documentation…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {query ? (
                    <div className="space-y-1">
                      {mockResults.map((result, i) => (
                        <div key={i} className="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                          <div className="text-white text-sm font-medium">{result.title}</div>
                          <div className="text-neutral-500 text-xs mt-1">{result.category}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500 text-sm">Start typing to search...</div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
