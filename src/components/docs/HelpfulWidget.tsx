import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';

const HelpfulWidget: React.FC = () => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    
    // TODO: Hook up to analytics/tracking here
    // Example: analytics.track('docs_feedback', { type, page: window.location.pathname });
  };

  return (
    <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.04)]">
      <p className="text-xs font-medium text-[#A6A6A6] mb-4">Is this helpful?</p>

      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => handleFeedback('positive')}
              className="w-7 h-7 rounded-full border border-[rgba(255,255,255,0.2)] hover:border-green-500 flex items-center justify-center transition-colors"
            >
              <Check size={14} className="text-[#A6A6A6] hover:text-green-500" />
            </button>
            <button
              onClick={() => handleFeedback('negative')}
              className="w-7 h-7 rounded-full border border-[rgba(255,255,255,0.2)] hover:border-red-500 flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-[#A6A6A6] hover:text-red-500" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="thanks"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="flex items-start gap-3"
          >
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 ${
                feedback === 'positive'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-red-500 bg-red-500/10'
              }`}
            >
              {feedback === 'positive' ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <X size={14} className="text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#FAFAFA] mb-2">Thanks for your feedback</p>
              <a
                href="https://discord.gg/n5QkfHZVXV"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-xs text-[#A6A6A6] hover:text-[#FAFAFA] transition-colors"
              >
                Join our Discord
                <ArrowRight
                  size={12}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpfulWidget;
