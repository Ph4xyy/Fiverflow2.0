import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const CTASection = () => {
  const handleGetStarted = () => {
    window.location.href = '/dashboard';
  };

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Ready to get organized?
          </h2>
          <p className="text-lg text-neutral-300">
            Start free. Upgrade when you're growing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0_20px_80px_rgba(99,102,241,0.6)',
                  '0_20px_80px_rgba(99,102,241,0.9)',
                  '0_20px_80px_rgba(99,102,241,0.6)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="inline-flex items-center justify-center rounded-full text-white font-medium text-lg px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow"
            >
              Get Started
            </motion.button>
          </div>

          <ul className="space-y-3 pt-8">
            {['No credit card required', 'Cancel anytime', 'Designed for freelancers, agencies, and studios'].map((point, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-neutral-300 justify-center"
              >
                <Check size={20} className="text-green-400 flex-shrink-0" />
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

