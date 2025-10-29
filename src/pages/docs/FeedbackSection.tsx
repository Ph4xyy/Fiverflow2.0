import React, { useState } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackSection: React.FC = () => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showArrow, setShowArrow] = useState(false);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-800">
      <p className="text-sm text-gray-400 mb-4">Is this helpful?</p>
      
      <div className="flex items-center gap-3">
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
                className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-green-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <Check size={16} className="text-gray-400 hover:text-green-500" />
              </button>
              <button
                onClick={() => handleFeedback('negative')}
                className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-red-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <X size={16} className="text-gray-400 hover:text-red-500" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="thanks"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center
                ${feedback === 'positive' ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'}
              `}>
                {feedback === 'positive' ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <X size={18} className="text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Thanks for your feedback!</span>
                <a 
                  href="https://discord.gg/fiverflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
                  onMouseEnter={() => setShowArrow(true)}
                  onMouseLeave={() => setShowArrow(false)}
                >
                  Join our Discord to talk with us
                  {showArrow && (
                    <ArrowRight size={12} className="transition-all" />
                  )}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeedbackSection;

