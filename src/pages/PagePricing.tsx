import React, { useState } from 'react';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
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
      subtitle: 'Free plan',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect to get started',
      features: [
        { text: '1 active project', included: true },
        { text: '5 clients maximum', included: true },
        { text: '1 GB storage', included: true },
        { text: 'Email support', included: true },
        { text: 'Basic templates', included: true },
        { text: 'Basic reports', included: false },
        { text: 'Limited integrations', included: false },
        { text: 'Priority support', included: false }
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline'
    },
    {
      id: 'boost',
      name: 'Boost',
      subtitle: 'For freelancers',
      monthlyPrice: 22,
      yearlyPrice: 220, // 20% discount
      description: 'Perfect for active freelancers',
      features: [
        { text: 'Unlimited projects', included: true },
        { text: 'Unlimited clients', included: true },
        { text: 'Unlimited storage', included: true },
        { text: 'Priority support', included: true },
        { text: 'Premium templates', included: true },
        { text: 'Advanced reports', included: true },
        { text: 'Full integrations', included: true },
        { text: 'API access', included: true },
        { text: 'Automations', included: true },
        { text: 'Advanced analytics', included: true }
      ],
      popular: true,
      buttonText: 'Choose Boost',
      buttonVariant: 'primary'
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'For businesses',
      monthlyPrice: 39,
      yearlyPrice: 390, // 20% discount
      description: 'Complete solution for businesses',
      features: [
        { text: 'Unlimited projects', included: true },
        { text: 'Unlimited clients', included: true },
        { text: 'Unlimited storage', included: true },
        { text: 'Dedicated support', included: true },
        { text: 'Premium templates', included: true },
        { text: 'Advanced reports', included: true },
        { text: 'Full integrations', included: true },
        { text: 'API access', included: true },
        { text: 'Team collaboration', included: true },
        { text: 'Automations', included: true },
        { text: 'White label', included: true },
        { text: 'Advanced analytics', included: true }
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
    const discountedPrice = monthlyPrice * 10; // 20% de réduction
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

                <ModernButton
                  variant={plan.buttonVariant as any}
                  className="w-full"
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.buttonText}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </ModernButton>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Comparaison des fonctionnalités
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ModernCard className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Performance</h3>
              <p className="text-gray-400">
                Interface ultra-rapide et optimisée pour maximiser votre productivité
              </p>
            </ModernCard>

            <ModernCard className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Sécurité</h3>
              <p className="text-gray-400">
                Vos données sont protégées avec un chiffrement de niveau bancaire
              </p>
            </ModernCard>

            <ModernCard className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Support</h3>
              <p className="text-gray-400">
                Équipe de support dédiée disponible 24/7 pour vous accompagner
              </p>
            </ModernCard>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Questions fréquentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ModernCard>
              <h3 className="text-lg font-semibold text-white mb-3">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-400">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement.
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
                Vous gardez l'accès à votre compte jusqu'à la fin de votre période 
                de facturation. Vos données sont conservées pendant 30 jours.
              </p>
            </ModernCard>

            <ModernCard>
              <h3 className="text-lg font-semibold text-white mb-3">
                Puis-je avoir une facture ?
              </h3>
              <p className="text-gray-400">
                Oui, nous fournissons des factures détaillées pour tous nos plans. 
                Parfait pour les entreprises et les freelancers.
              </p>
            </ModernCard>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <ModernCard className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] border-0">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Prêt à transformer votre business ?
              </h2>
              <p className="text-purple-100 mb-8 text-lg">
                Rejoignez des milliers de freelancers qui ont déjà choisi FiverFlow
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ModernButton size="lg" variant="secondary">
                  Commencer l'essai gratuit
                  <ArrowRight className="h-5 w-5 ml-2" />
                </ModernButton>
                <ModernButton size="lg" variant="outline">
                  Contacter les ventes
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