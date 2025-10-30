import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What platforms does FiverFlow support?",
    a: "Track clients and orders from Fiverr, Upwork, TikTok Shop, Instagram DMs, and private clients — all in one workspace."
  },
  {
    q: "How do clients and orders get organized?",
    a: "Add them as you work. FiverFlow centralizes your pipeline so you always know what’s active, due, and delivered."
  },
  {
    q: "Can I create invoices and get paid?",
    a: "Yes. Generate invoices from your orders and accept payments through Stripe. Funds go directly to your Stripe account."
  },
  {
    q: "Does FiverFlow include an AI assistant?",
    a: "Yes. The AI Assistant helps draft replies, summarize orders, and speed up admin tasks so you can focus on delivery."
  },
  {
    q: "Is it only for solo freelancers?",
    a: "No. It works great for solo freelancers and small studios that need a shared, organized workflow."
  },
  {
    q: "Can I change or cancel my plan anytime?",
    a: "Yes. You can switch plans or cancel anytime from your billing settings."
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            FAQ
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {item.q}
                </h3>
                <div className="flex-shrink-0 text-neutral-400">
                  {openIndex === index ? (
                    <Minus size={24} />
                  ) : (
                    <Plus size={24} />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="p-6 pt-0 text-neutral-300">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

