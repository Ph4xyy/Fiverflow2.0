import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackSection: React.FC = () => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showThanks, setShowThanks] = useState(false);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    setShowThanks(true);
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
                className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-green-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <Check size={16} className="text-gray-400 hover:text-green-500" />
              </button>
              <button
                onClick={() => handleFeedback('negative')}
                className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-red-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
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
                w-8 h-8 rounded-full border-2 flex items-center justify-center
                ${feedback === 'positive' ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'}
              `}>
                {feedback === 'positive' ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <X size={16} className="text-red-500" />
                )}
              </div>
              <span className="text-sm text-gray-300 animate-fade-in">
                Thanks for your feedback!
              </span>
              <span className="text-sm text-gray-500">
                Join our Discord to talk with us
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeedbackSection;

