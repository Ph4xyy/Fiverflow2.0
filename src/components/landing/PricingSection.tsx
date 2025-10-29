import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Sparkles, Zap, Crown } from 'lucide-react';
import SubscriptionButton from '../../components/SubscriptionButton';

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  popular?: boolean;
  icon: React.ComponentType<any>;
  features: string[];
}

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans: Plan[] = [
    {
      id: 'lunch',
      name: 'Lunch',
      subtitle: 'Perfect to get started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Essentials to start your freelance journey',
      icon: Sparkles,
      features: [
        'Up to 5 clients',
        '10 orders / month',
        'Pages: Dashboard, Clients, Orders',
        'Email support',
        'Calendar, Workboard, Referrals: not included',
        'Statistics & Invoices: not included',
        'AI Assistant: not included'
      ]
    },
    {
      id: 'boost',
      name: 'Boost',
      subtitle: 'For active freelancers',
      monthlyPrice: 24,
      yearlyPrice: 240,
      description: 'More pages and capabilities to boost your activity',
      popular: true,
      icon: Zap,
      features: [
        'Unlimited clients & orders',
        'Pages: Dashboard, Clients, Orders',
        'Calendar access',
        'Workboard access',
        'Referrals program',
        'Priority support',
        'Statistics & Invoices: not included',
        'AI Assistant: not included'
      ]
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'For advanced freelancers',
      monthlyPrice: 39,
      yearlyPrice: 390,
      description: 'Complete pack to reach the next level',
      icon: Crown,
      features: [
        'Everything in Boost',
        'Statistics',
        'Invoices',
        'AI Assistant',
        'Priority support'
      ]
    }
  ];

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const handleGetStarted = (planId: string) => {
    window.location.href = '/register';
  };

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Start free, upgrade as you grow. All plans include a 14-day free trial.
          </p>
        </motion.div>

        {/* Toggle Billing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-lg transition-colors ${!isYearly ? 'text-white' : 'text-neutral-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-16 h-8 rounded-full bg-white/10 border border-white/20 transition-colors hover:bg-white/15"
          >
            <motion.div
              animate={{ x: isYearly ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 left-1 w-6 h-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full shadow-lg"
            />
          </button>
          <span className={`text-lg transition-colors ${isYearly ? 'text-white' : 'text-neutral-400'}`}>
            Yearly
          </span>
          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-sm font-medium"
            >
              Save 20%
            </motion.span>
          )}
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, index) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = isYearly ? 'year' : 'month';
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${
                  plan.popular
                    ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent'
                    : 'border-white/10 bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                {plan.popular && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                    >
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                        <Star className="h-4 w-4" fill="currentColor" />
                        Most Popular
                      </div>
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
                  </>
                )}

                <div className="p-8 relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                      plan.popular
                        ? 'from-indigo-500 to-purple-500'
                        : 'from-white/10 to-white/5'
                    } flex items-center justify-center mb-6`}
                  >
                    <Icon className="text-white" size={28} />
                  </motion.div>

                  {/* Name & Subtitle */}
                  <h3 className="text-2xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-neutral-400 mb-6">{plan.subtitle}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-neutral-400">/{period}</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <Check className="text-green-400" size={14} />
                        </div>
                        <span className="text-sm text-neutral-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {plan.monthlyPrice === 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGetStarted(plan.id)}
                      className="w-full py-3 rounded-xl font-medium transition-all border border-white/20 text-white hover:bg-white/10"
                    >
                      Get Started
                    </motion.button>
                  ) : plan.id === 'boost' ? (
                    <SubscriptionButton
                      priceId={isYearly ? `price_${plan.id}_yearly` : `price_${plan.id}_monthly`}
                      planName={plan.name}
                      amount={`$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}/${isYearly ? 'year' : 'month'}`}
                      className="w-full"
                      trialDays={7}
                      label="Start 7-day free trial"
                    />
                  ) : (
                    <SubscriptionButton
                      priceId={isYearly ? `price_${plan.id}_yearly` : `price_${plan.id}_monthly`}
                      planName={plan.name}
                      amount={`$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}/${isYearly ? 'year' : 'month'}`}
                      className="w-full"
                    />
                  )}
                </div>

                {/* Animated gradient border for popular plan */}
                {plan.popular && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #06b6d4)',
                      backgroundSize: '200% 200%',
                      opacity: 0.3,
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-neutral-400">
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;

