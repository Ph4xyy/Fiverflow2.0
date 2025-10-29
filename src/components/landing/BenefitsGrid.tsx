import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Users, 
  Receipt, 
  Calendar, 
  BarChart3, 
  Sparkles,
  LucideIcon
} from 'lucide-react';
import { BENEFITS } from '../../lib/features';

const iconMap: Record<string, LucideIcon> = {
  CheckCircle2,
  Users,
  Receipt,
  Calendar,
  BarChart3,
  Sparkles,
};

export const BenefitsGrid = () => {
  return (
    <section id="benefits" className="py-16 md:py-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Everything you need to succeed
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {BENEFITS.map((benefit, index) => {
            const Icon = iconMap[benefit.icon] || CheckCircle2;
            
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)] p-8 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
                  <Icon className="text-indigo-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-neutral-300">
                  {benefit.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

