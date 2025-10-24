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
      id: 'free',
      name: 'Free',
      subtitle: 'Pour commencer',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Parfait pour découvrir FiverFlow',
      features: [
        { text: '1 projet actif', included: true },
        { text: '5 clients maximum', included: true },
        { text: '1 Go de stockage', included: true },
        { text: 'Support par email', included: true },
        { text: 'Templates de base', included: true },
        { text: 'Rapports basiques', included: false },
        { text: 'Intégrations limitées', included: false },
        { text: 'Support prioritaire', included: false }
      ],
      buttonText: 'Commencer gratuitement',
      buttonVariant: 'outline'
    },
    {
      id: 'launch',
      name: 'Launch',
      subtitle: 'Pour les freelancers',
      monthlyPrice: 29,
      yearlyPrice: 290, // 20% de réduction
      description: 'Idéal pour les freelancers indépendants',
      features: [
        { text: '5 projets actifs', included: true },
        { text: '25 clients maximum', included: true },
        { text: '10 Go de stockage', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'Templates premium', included: true },
        { text: 'Rapports avancés', included: true },
        { text: 'Intégrations complètes', included: true },
        { text: 'API access', included: false }
      ],
      popular: true,
      buttonText: 'Choisir Launch',
      buttonVariant: 'primary'
    },
    {
      id: 'boost',
      name: 'Boost',
      subtitle: 'Pour les petites équipes',
      monthlyPrice: 79,
      yearlyPrice: 790, // 20% de réduction
      description: 'Parfait pour les équipes en croissance',
      features: [
        { text: '15 projets actifs', included: true },
        { text: '100 clients maximum', included: true },
        { text: '50 Go de stockage', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'Templates premium', included: true },
        { text: 'Rapports avancés', included: true },
        { text: 'Intégrations complètes', included: true },
        { text: 'API access', included: true },
        { text: 'Collaboration équipe', included: true },
        { text: 'Automatisations', included: true }
      ],
      buttonText: 'Choisir Boost',
      buttonVariant: 'primary'
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'Pour les entreprises',
      monthlyPrice: 199,
      yearlyPrice: 1990, // 20% de réduction
      description: 'Solution complète pour les entreprises',
      features: [
        { text: 'Projets illimités', included: true },
        { text: 'Clients illimités', included: true },
        { text: '200 Go de stockage', included: true },
        { text: 'Support dédié', included: true },
        { text: 'Templates premium', included: true },
        { text: 'Rapports avancés', included: true },
        { text: 'Intégrations complètes', included: true },
        { text: 'API access', included: true },
        { text: 'Collaboration équipe', included: true },
        { text: 'Automatisations', included: true },
        { text: 'White label', included: true },
        { text: 'Analytics avancés', included: true }
      ],
      buttonText: 'Choisir Scale',
      buttonVariant: 'primary'
    }
  ];

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuit' : `€${price}`;
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Nouveau: 20% de réduction annuelle
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Débloquez tout le potentiel de votre business freelance avec nos plans optimisés pour chaque étape de votre croissance.
          </p>

          {/* Toggle Billing */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              Mensuel
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
              Annuel
            </span>
            {isYearly && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                -20%
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = isYearly ? 'an' : 'mois';
            const savings = isYearly && plan.monthlyPrice > 0 ? getYearlyDiscount(plan.monthlyPrice) : 0;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-[#1e2938] rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'ring-2 ring-[#9c68f2] shadow-2xl shadow-[#9c68f2]/20' 
                    : 'hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Populaire
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
                  {savings > 0 && (
                    <div className="text-green-400 text-sm font-medium">
                      Économisez €{savings}/an
                    </div>
                  )}
                  <p className="text-gray-300 text-sm mt-2">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included 
                          ? 'bg-green-500' 
                          : 'bg-gray-600'
                      }`}>
                        {feature.included && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
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