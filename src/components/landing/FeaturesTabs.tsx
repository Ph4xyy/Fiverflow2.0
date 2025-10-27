import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FEATURES } from '../../lib/features';

export const FeaturesTabs = () => {
  const [activeTab, setActiveTab] = useState('tasks');

  const activeFeature = FEATURES.find(f => f.key === activeTab) || FEATURES[0];

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Features Designed for Freelancers
          </h2>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Everything you usually track across notes, chats, and spreadsheets — unified in one place.
          </p>
        </div>

        <div className="space-y-12">
          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {FEATURES.map((feature) => (
              <motion.button
                key={feature.key}
                onClick={() => setActiveTab(feature.key)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === feature.key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {feature.title}
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-2xl md:text-3xl font-semibold text-white">
                  {activeFeature.title}
                </h3>
                <p className="text-lg text-neutral-300">
                  {activeFeature.description}
                </p>
                <motion.a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Start prioritizing now →
                </motion.a>
              </motion.div>
            </AnimatePresence>

            {/* Right: Screenshot Placeholder */}
            <motion.div
              key={activeFeature.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)] min-h-[320px] flex items-center justify-center p-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 bg-indigo-500/40 rounded" />
                </div>
                <p className="text-neutral-400 text-sm font-mono">{activeFeature.title} Preview</p>
                <p className="text-xs text-neutral-500">Preview screenshot placeholder</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

