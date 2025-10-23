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
      subtitle: 'Parfait pour commencer',
      price: billingPeriod === 'yearly' ? '0' : '0',
      period: 'gratuit',
      description: 'Toutes les fonctionnalités essentielles pour débuter votre activité freelance.',
      features: [
        'Jusqu\'à 5 clients',
        'Jusqu\'à 10 commandes par mois',
        'Calendrier de base',
        'Facturation simple',
        'Support par email',
        'Tableau de bord basique'
      ],
      icon: <Users size={24} />,
      gradient: false,
      buttonText: 'Commencer gratuitement',
      buttonVariant: 'outline'
    },
    {
      id: 'boost',
      name: 'Boost',
      subtitle: 'Pour les freelances actifs',
      price: billingPeriod === 'yearly' ? '19' : '24',
      period: 'mois',
      description: 'Augmentez votre productivité avec des outils avancés et plus de capacité.',
      features: [
        'Clients illimités',
        'Commandes illimitées',
        'Calendrier avancé',
        'Facturation professionnelle',
        'Statistiques détaillées',
        'Support prioritaire',
        'Templates personnalisés',
        'Intégrations tierces'
      ],
      icon: <Zap size={24} />,
      gradient: true,
      popular: true,
      buttonText: 'Essayer Boost',
      buttonVariant: 'primary'
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'Pour les entreprises',
      price: billingPeriod === 'yearly' ? '49' : '59',
      period: 'mois',
      description: 'La solution complète pour faire évoluer votre entreprise vers de nouveaux sommets.',
      features: [
        'Tout de Boost',
        'Gestion d\'équipe',
        'API complète',
        'Rapports avancés',
        'Support 24/7',
        'Formation personnalisée',
        'Intégrations premium',
        'Sauvegarde automatique',
        'Multi-comptes'
      ],
      icon: <Rocket size={24} />,
      gradient: true,
      buttonText: 'Choisir Scale',
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
                    Le plus populaire
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
                      {plan.price === '0' ? 'Gratuit' : `€${plan.price}`}
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
                question: "Puis-je changer de plan à tout moment ?",
                answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement."
              },
              {
                question: "Y a-t-il des frais de configuration ?",
                answer: "Non, il n'y a aucun frais de configuration. Vous payez seulement votre abonnement mensuel ou annuel."
              },
              {
                question: "Que se passe-t-il si j'annule mon abonnement ?",
                answer: "Vous gardez accès à toutes les fonctionnalités jusqu'à la fin de votre période de facturation."
              },
              {
                question: "Proposez-vous un essai gratuit ?",
                answer: "Le plan Lunch est entièrement gratuit. Pour Boost et Scale, nous offrons un essai de 14 jours."
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
