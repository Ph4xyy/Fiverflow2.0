import React, { useState } from 'react';
import Layout from '../components/Layout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { 
  Crown, 
  Zap, 
  Rocket, 
  Check, 
  Star, 
  Users,
  BarChart3,
  Shield,
  Headphones,
  FileText,
  Calendar,
  Network,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react';

interface PlanFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  icon: React.ReactNode;
  gradient: boolean;
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline';
  current?: boolean;
}

const UpgradePageNew: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('boost');
  const [isYearly, setIsYearly] = useState(false);

  const plans: Plan[] = [
    {
      id: 'lunch',
      name: 'Lunch',
      subtitle: 'Parfait pour débuter',
      price: '0',
      period: 'gratuit',
      description: 'Toutes les fonctionnalités essentielles pour commencer votre activité freelance.',
      features: [
        {
          icon: <Users size={20} />,
          title: 'Jusqu\'à 5 clients',
          description: 'Gérez vos premiers clients facilement'
        },
        {
          icon: <FileText size={20} />,
          title: '10 commandes par mois',
          description: 'Suivez vos premières commandes'
        },
        {
          icon: <Calendar size={20} />,
          title: 'Calendrier de base',
          description: 'Organisez votre emploi du temps'
        },
        {
          icon: <Shield size={20} />,
          title: 'Support par email',
          description: 'Assistance par email uniquement'
        }
      ],
      icon: <Users size={24} />,
      gradient: false,
      current: true,
      buttonText: 'Plan actuel',
      buttonVariant: 'outline'
    },
    {
      id: 'boost',
      name: 'Boost',
      subtitle: 'Pour les freelances actifs',
      price: isYearly ? '240' : '24',
      period: isYearly ? 'an' : 'mois',
      description: 'Augmentez votre productivité avec des outils avancés et plus de capacité.',
      features: [
        {
          icon: <Users size={20} />,
          title: 'Clients illimités',
          description: 'Gérez autant de clients que nécessaire'
        },
        {
          icon: <FileText size={20} />,
          title: 'Commandes illimitées',
          description: 'Aucune limite sur vos commandes'
        },
        {
          icon: <BarChart3 size={20} />,
          title: 'Statistiques avancées',
          description: 'Analyses détaillées de vos performances'
        },
        {
          icon: <Calendar size={20} />,
          title: 'Calendrier intelligent',
          description: 'Planification automatique et rappels'
        },
        {
          icon: <Network size={20} />,
          title: 'Réseau de partenaires',
          description: 'Connectez-vous avec d\'autres freelances'
        },
        {
          icon: <Headphones size={20} />,
          title: 'Support prioritaire',
          description: 'Assistance rapide par chat et email'
        }
      ],
      icon: <Zap size={24} />,
      gradient: true,
      popular: true,
      buttonText: 'Passer à Boost',
      buttonVariant: 'primary'
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'Pour les entreprises',
      price: isYearly ? '590' : '59',
      period: isYearly ? 'an' : 'mois',
      description: 'La solution complète pour faire évoluer votre entreprise vers de nouveaux sommets.',
      features: [
        {
          icon: <Crown size={20} />,
          title: 'Tout de Boost',
          description: 'Toutes les fonctionnalités Boost incluses'
        },
        {
          icon: <Users size={20} />,
          title: 'Gestion d\'équipe',
          description: 'Collaborez avec votre équipe'
        },
        {
          icon: <Shield size={20} />,
          title: 'API complète',
          description: 'Intégrations personnalisées'
        },
        {
          icon: <BarChart3 size={20} />,
          title: 'Rapports avancés',
          description: 'Analytics et insights détaillés'
        },
        {
          icon: <Headphones size={20} />,
          title: 'Support 24/7',
          description: 'Assistance disponible 24h/24'
        },
        {
          icon: <Award size={20} />,
          title: 'Formation personnalisée',
          description: 'Sessions de formation dédiées'
        },
        {
          icon: <Sparkles size={20} />,
          title: 'Fonctionnalités premium',
          description: 'Accès aux nouveautés en avant-première'
        }
      ],
      icon: <Rocket size={24} />,
      gradient: true,
      buttonText: 'Choisir Scale',
      buttonVariant: 'primary'
    }
  ];

  const benefits = [
    {
      icon: <Clock size={24} />,
      title: 'Gain de temps',
      description: 'Automatisez vos tâches répétitives et concentrez-vous sur l\'essentiel'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Croissance accélérée',
      description: 'Développez votre activité avec des outils professionnels'
    },
    {
      icon: <Shield size={24} />,
      title: 'Sécurité garantie',
      description: 'Vos données sont protégées avec un chiffrement de niveau bancaire'
    },
    {
      icon: <Users size={24} />,
      title: 'Communauté active',
      description: 'Rejoignez une communauté de freelances passionnés'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Designer UI/UX',
      avatar: 'MD',
      text: 'Boost m\'a permis de doubler mes revenus en 3 mois. Les outils d\'analytics sont incroyables !',
      plan: 'Boost'
    },
    {
      name: 'Pierre Martin',
      role: 'Développeur Full-Stack',
      avatar: 'PM',
      text: 'Scale est parfait pour mon équipe. La gestion collaborative change tout !',
      plan: 'Scale'
    },
    {
      name: 'Sophie Leroy',
      role: 'Marketing Digital',
      avatar: 'SL',
      text: 'Passer de Lunch à Boost était la meilleure décision de ma carrière freelance.',
      plan: 'Boost'
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="text-[#9c68f2]" size={32} />
            <h1 className="text-4xl font-bold text-white">
              Passez au niveau supérieur
            </h1>
          </div>
          <p className="text-xl text-gray-400 mb-8">
            Débloquez tout le potentiel de votre activité freelance avec nos plans premium
          </p>
          
          {/* Current Plan Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#35414e] rounded-full text-sm text-gray-300 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Plan actuel : Lunch
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Mensuel</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isYearly ? 'bg-[#9c68f2]' : 'bg-[#35414e]'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}>Annuel</span>
            {isYearly && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                -20% d'économie
              </span>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-[#9c68f2] text-white px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <Star size={12} />
                    Le plus populaire
                  </div>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <Check size={12} />
                    Plan actuel
                  </div>
                </div>
              )}
              
              <ModernCard 
                className={`h-full flex flex-col transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-[#9c68f2] scale-105' : 
                  plan.current ? 'ring-2 ring-green-500' : ''
                } ${selectedPlan === plan.id ? 'ring-2 ring-[#9c68f2]' : ''}`}
                gradient={plan.gradient}
              >
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl mx-auto mb-4 bg-[#35414e]">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.subtitle}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">
                      {plan.price === '0' ? 'Gratuit' : `$${plan.price}`}
                    </span>
                    {plan.price !== '0' && (
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>

                <div className="flex-1 mb-6">
                  <div className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#35414e]/50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#9c68f2]/20 text-[#9c68f2] flex-shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                          <p className="text-xs text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ModernButton 
                  variant={plan.buttonVariant}
                  className="w-full"
                  size="lg"
                  disabled={plan.current}
                >
                  {plan.current ? (
                    <>
                      <Check size={16} className="mr-2" />
                      {plan.buttonText}
                    </>
                  ) : (
                    <>
                      {plan.buttonText}
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </ModernButton>
              </ModernCard>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pourquoi upgrader ?
            </h2>
            <p className="text-gray-400">
              Découvrez les avantages qui feront la différence dans votre activité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <ModernCard key={index} className="text-center">
                <div className="w-16 h-16 bg-[#35414e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-[#9c68f2]">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ils ont fait le pas
            </h2>
            <p className="text-gray-400">
              Découvrez les témoignages de nos utilisateurs premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <ModernCard key={index}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <span className="text-xs px-2 py-1 bg-[#9c68f2]/20 text-[#9c68f2] rounded-full">
                        {testimonial.plan}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{testimonial.role}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">"{testimonial.text}"</p>
                  </div>
                </div>
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
                answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et vous ne payez que la différence."
              },
              {
                question: "Y a-t-il des frais de configuration ?",
                answer: "Non, il n'y a aucun frais de configuration caché. Vous payez seulement votre abonnement mensuel."
              },
              {
                question: "Que se passe-t-il si j'annule mon abonnement ?",
                answer: "Vous gardez accès à toutes les fonctionnalités premium jusqu'à la fin de votre période de facturation. Après cela, vous revenez au plan Lunch."
              },
              {
                question: "Proposez-vous un essai gratuit ?",
                answer: "Oui ! Nous offrons un essai gratuit de 14 jours pour tous nos plans premium. Aucune carte bancaire requise."
              }
            ].map((faq, index) => (
              <ModernCard key={index}>
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center max-w-4xl mx-auto">
          <ModernCard gradient className="p-12">
            <Crown size={48} className="text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à transformer votre activité ?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Rejoignez des milliers de freelances qui ont déjà fait le pas vers le succès
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ModernButton size="lg" variant="secondary">
                <Rocket size={20} className="mr-2" />
                Essayer gratuitement
              </ModernButton>
              <ModernButton size="lg" variant="outline">
                <Headphones size={20} className="mr-2" />
                Parler à un expert
              </ModernButton>
            </div>
          </ModernCard>
        </div>
      </div>
    </Layout>
  );
};

export default UpgradePageNew;
