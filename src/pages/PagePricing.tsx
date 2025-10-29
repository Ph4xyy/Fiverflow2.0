import React, { useState } from 'react';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import SubscriptionButton from '../components/SubscriptionButton';
import { 
  Check, 
  Star, 
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  Shield,
  Users,
  BarChart3,
  Headphones,
  FileText,
  Calendar,
  Network,
  Clock,
  Award,
  Lock,
  Unlock,
  Rocket,
  Target,
  TrendingUp
} from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline';
}

const PagePricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('boost');

  const plans: Plan[] = [
    {
      id: 'lunch',
      name: 'Lunch',
      subtitle: 'Parfait pour démarrer',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Les essentiels pour démarrer en freelance',
      features: [
        { text: 'Up to 5 clients', included: true },
        { text: '10 orders / month', included: true },
        { text: 'Dashboard, Clients, Orders', included: true },
        { text: 'Email support', included: true },
        { text: 'Calendar access', included: false },
        { text: 'Workboard access', included: false },
        { text: 'Referrals program', included: false },
        { text: 'Statistics', included: false },
        { text: 'Invoices', included: false },
        { text: 'AI Assistant', included: false }
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline'
    },
    {
      id: 'boost',
      name: 'Boost',
      subtitle: 'Pour freelances actifs',
      monthlyPrice: 24,
      yearlyPrice: 240, // 20% discount
      description: 'Plus de pages et de capacités pour booster votre activité',
      features: [
        { text: 'Unlimited clients & orders', included: true },
        { text: 'Dashboard, Clients, Orders', included: true },
        { text: 'Calendar access', included: true },
        { text: 'Workboard access', included: true },
        { text: 'Referrals program', included: true },
        { text: 'Priority support', included: true },
        { text: 'Statistics', included: false },
        { text: 'Invoices', included: false },
        { text: 'AI Assistant', included: false }
      ],
      popular: true,
      buttonText: 'Choose Boost',
      buttonVariant: 'primary'
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'Pour freelances avancés',
      monthlyPrice: 39,
      yearlyPrice: 390, // 20% discount
      description: 'Le pack complet pour passer au niveau supérieur',
      features: [
        { text: 'Everything in Boost', included: true },
        { text: 'Statistics', included: true },
        { text: 'Invoices', included: true },
        { text: 'AI Assistant', included: true },
        { text: 'Priority support', included: true }
      ],
      buttonText: 'Choose Scale',
      buttonVariant: 'primary'
    }
  ];

  const formatPrice = (price: number) => {
    return price === 0 ? '$0' : `$${price}`;
  };

  const getYearlyDiscount = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12;
    const discountedPrice = monthlyPrice * 10; // 20% discount
    const savings = yearlyPrice - discountedPrice;
    return savings;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock the full potential of your freelance business with our plans optimized for every stage of your growth.
          </p>

          {/* Toggle Billing */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                isYearly ? 'bg-[#9c68f2]' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  isYearly ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Yearly
            </span>
            {!isYearly && (
              <div className="text-white text-sm">
                Save <span className="font-bold">20%</span> on yearly subscription
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = isYearly ? 'year' : 'month';
            const savings = isYearly && plan.monthlyPrice > 0 ? getYearlyDiscount(plan.monthlyPrice) : 0;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-[#1e2938] rounded-2xl p-8 ${
                  plan.popular 
                    ? 'ring-2 ring-[#9c68f2] shadow-2xl shadow-[#9c68f2]/20' 
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.subtitle}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(price)}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-400">/{period}</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mt-2">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-white' : 'text-gray-500'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.id === 'lunch' ? (
                  <ModernButton
                    variant={plan.buttonVariant as any}
                    className="w-full"
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.buttonText}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </ModernButton>
                ) : (
                  plan.id === 'boost' ? (
                    <SubscriptionButton
                      priceId={isYearly ? `price_${plan.id}_yearly` : `price_${plan.id}_monthly`}
                      planName={plan.name}
                      amount={`$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}/${isYearly ? 'year' : 'month'}`}
                      className="w-full bg-gradient-to-r from-[#9c68f2] to-[#422ca5] hover:from-[#8a5cf0] hover:to-[#3a2590] text-white"
                      trialDays={7}
                      label="Start 7-day free trial"
                      onSuccess={() => {
                        console.log(`Successfully started trial for ${plan.name}`);
                        setSelectedPlan(plan.id);
                      }}
                    />
                  ) : (
                    <SubscriptionButton
                      priceId={isYearly ? `price_${plan.id}_yearly` : `price_${plan.id}_monthly`}
                      planName={plan.name}
                      amount={`$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}/${isYearly ? 'year' : 'month'}`}
                      className="w-full bg-gradient-to-r from-[#9c68f2] to-[#422ca5] hover:from-[#8a5cf0] hover:to-[#3a2590] text-white"
                      onSuccess={() => {
                        console.log(`Successfully subscribed to ${plan.name}`);
                        setSelectedPlan(plan.id);
                      }}
                    />
                  )
                )}
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Feature Comparison
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ModernCard className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Performance</h3>
              <p className="text-gray-400">
                Ultra-fast and optimized interface to maximize your productivity
              </p>
            </ModernCard>

            <ModernCard className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Security</h3>
              <p className="text-gray-400">
                Your data is protected with bank-level encryption
              </p>
            </ModernCard>

            <ModernCard className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Support</h3>
              <p className="text-gray-400">
                Dedicated support team available 24/7 to assist you
              </p>
            </ModernCard>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ModernCard>
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I change my plan at any time?
              </h3>
              <p className="text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. 
                Changes take effect immediately.
              </p>
            </ModernCard>

            <ModernCard>
              <h3 className="text-lg font-semibold text-white mb-3">
                Y a-t-il un essai gratuit ?
              </h3>
              <p className="text-gray-400">
                Oui, tous nos plans payants incluent un essai gratuit de 14 jours 
                sans engagement.
              </p>
            </ModernCard>

            <ModernCard>
              <h3 className="text-lg font-semibold text-white mb-3">
                Que se passe-t-il si j'annule ?
              </h3>
              <p className="text-gray-400">
                You keep access to your account until the end of your billing period. 
                Your data is kept for 30 days.
              </p>
            </ModernCard>

            <ModernCard>
              <h3 className="text-lg font-semibold text-white mb-3">
                Puis-je avoir une facture ?
              </h3>
              <p className="text-gray-400">
                Yes, we provide detailed invoices for all our plans. 
                Perfect for businesses and freelancers.
              </p>
            </ModernCard>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <ModernCard className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] border-0">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to transform your business?
              </h2>
              <p className="text-purple-100 mb-8 text-lg">
                Join thousands of freelancers who have already chosen FiverFlow
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ModernButton size="lg" variant="secondary">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </ModernButton>
                <ModernButton size="lg" variant="outline">
                  Contact Sales
                </ModernButton>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default PagePricing;