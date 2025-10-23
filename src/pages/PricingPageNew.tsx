import React, { useState } from 'react';

import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { 
  Check, 
  Star, 
  Zap, 
  Rocket, 
  Crown,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Headphones,
  FileText,
  Network,
  Clock
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  gradient: boolean;
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline';
}

const PricingPageNew: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: Plan[] = [
    {
      id: 'lunch',
      name: 'Lunch',
      subtitle: 'Perfect to get started',
      price: billingPeriod === 'yearly' ? '0' : '0',
      period: 'free',
      description: 'All essential features to start your freelance business.',
      features: [
        'Up to 5 clients',
        'Up to 10 orders per month',
        'Basic calendar',
        'Simple billing',
        'Email support',
        'Basic dashboard'
      ],
      icon: <Users size={24} />,
      gradient: false,
      buttonText: 'Start for free',
      buttonVariant: 'outline'
    },
    {
      id: 'boost',
      name: 'Boost',
      subtitle: 'For active freelancers',
      price: billingPeriod === 'yearly' ? '19' : '22',
      period: 'month',
      description: 'Increase your productivity with advanced tools and more capacity.',
      features: [
        'Unlimited clients',
        'Unlimited orders',
        'Advanced calendar',
        'Professional billing',
        'Detailed statistics',
        'Priority support',
        'Custom templates',
        'Third-party integrations'
      ],
      icon: <Zap size={24} />,
      gradient: true,
      popular: true,
      buttonText: 'Try Boost',
      buttonVariant: 'primary'
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'For businesses',
      price: billingPeriod === 'yearly' ? '39' : '39',
      period: 'month',
      description: 'The complete solution to scale your business to new heights.',
      features: [
        'Everything from Boost',
        'Team management',
        'Complete API',
        'Advanced reports',
        '24/7 support',
        'Custom training',
        'Premium integrations',
        'Automatic backup',
        'Multi-accounts'
      ],
      icon: <Rocket size={24} />,
      gradient: true,
      buttonText: 'Choose Scale',
      buttonVariant: 'primary'
    }
  ];

  const features = [
    {
      icon: <Calendar size={20} />,
      title: 'Calendrier intelligent',
      description: 'Planifiez vos rendez-vous et gérez votre emploi du temps efficacement.'
    },
    {
      icon: <FileText size={20} />,
      title: 'Facturation automatisée',
      description: 'Créez et envoyez vos factures en quelques clics.'
    },
    {
      icon: <BarChart3 size={20} />,
      title: 'Analytics avancés',
      description: 'Suivez vos performances et optimisez votre activité.'
    },
    {
      icon: <Network size={20} />,
      title: 'Réseau de partenaires',
      description: 'Connectez-vous avec d\'autres professionnels et développez votre réseau.'
    },
    {
      icon: <Shield size={20} />,
      title: 'Sécurité garantie',
      description: 'Vos données sont protégées avec un chiffrement de niveau bancaire.'
    },
    {
      icon: <Headphones size={20} />,
      title: 'Support premium',
      description: 'Une équipe dédiée pour vous accompagner dans votre réussite.'
    }
  ];

  return (
    <div className="p-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Des solutions adaptées à chaque étape de votre parcours freelance
          </p>
          
          {/* Toggle billing */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-[#9c68f2]' : 'bg-[#35414e]'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Annuel
            </span>
            {billingPeriod === 'yearly' && (
              <span className="text-sm text-[#9c68f2] font-medium">
                -20% d'économies
              </span>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star size={16} />
                    Most Popular
                  </div>
                </div>
              )}
              
              <ModernCard 
                className={`h-full flex flex-col ${plan.popular ? 'ring-2 ring-[#9c68f2]' : ''}`}
                gradient={plan.gradient}
              >
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#35414e] text-white mx-auto mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.subtitle}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">
                      {plan.price === '0' ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price !== '0' && (
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>

                <div className="flex-1 mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white mt-0.5">
                          <Check size={12} />
                        </div>
                        <span className="text-sm text-white">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <ModernButton 
                  variant={plan.buttonVariant}
                  className="w-full"
                  size="lg"
                >
                  {plan.buttonText}
                </ModernButton>
              </ModernCard>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pourquoi choisir FiverFlow ?
            </h2>
            <p className="text-gray-400">
              Des fonctionnalités puissantes conçues pour les freelances modernes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ModernCard key={index}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#35414e] text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400">{feature.description}</p>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Can I change my plan at any time?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Are there any setup fees?",
                answer: "No, there are no setup fees. You only pay your monthly or annual subscription."
              },
              {
                question: "What happens if I cancel my subscription?",
                answer: "You keep access to all features until the end of your billing period."
              },
              {
                question: "Do you offer a free trial?",
                answer: "The Launch plan is completely free. For Boost and Scale, we offer a 14-day trial."
              }
            ].map((faq, index) => (
              <ModernCard key={index}>
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </ModernCard>
            ))}
          </div>
        </div>
      </div>
  );
};

export default PricingPageNew;
