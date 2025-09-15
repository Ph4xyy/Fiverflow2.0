import React from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, Star, ArrowRight, Calendar, Share2, BarChart3 } from 'lucide-react';
import { CheckSquare } from 'lucide-react';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { UserPlan } from '../hooks/usePlanRestrictions';

interface PlanRestrictedPageProps {
  feature: 'calendar' | 'referrals' | 'stats' | 'tasks';
  currentPlan: UserPlan;
  isTrialActive?: boolean;
  trialDaysRemaining?: number | null;
}

const PlanRestrictedPage: React.FC<PlanRestrictedPageProps> = ({ 
  feature, 
  currentPlan, 
  isTrialActive,
  trialDaysRemaining 
}) => {
  const navigate = useNavigate();
  const { restrictions } = usePlanRestrictions();

  // If user is admin, they shouldn't see this page
  if (restrictions?.isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const featureConfig = {
    tasks: {
      icon: CheckSquare,
      title: 'Gestion des Tâches',
      description: 'Organisez vos projets en sous-tâches et suivez le temps passé sur chaque activité.',
      requiredPlan: 'Pro',
      color: 'from-blue-500 to-purple-600'
    },
    calendar: {
      icon: Calendar,
      title: 'Calendrier',
      description: 'Visualisez vos échéances et gérez votre planning avec notre calendrier interactif.',
      requiredPlan: 'Pro',
      color: 'from-purple-500 to-pink-600'
    },
    referrals: {
      icon: Share2,
      title: 'Système de Parrainage',
      description: 'Gagnez des commissions en parrainant de nouveaux utilisateurs sur FiverFlow.',
      requiredPlan: 'Pro',
      color: 'from-green-500 to-blue-600'
    },
    stats: {
      icon: BarChart3,
      title: 'Statistiques Avancées',
      description: 'Analysez vos performances avec des rapports détaillés et des métriques avancées.',
      requiredPlan: 'Excellence',
      color: 'from-orange-500 to-red-600'
    }
  };

  const config = featureConfig[feature];
  const Icon = config.icon;

  const getUpgradeMessage = () => {
    if (feature === 'stats') {
      return 'Passez au plan Excellence pour accéder aux statistiques avancées';
    }
    
    if (isTrialActive && trialDaysRemaining !== null) {
      if (trialDaysRemaining > 0) {
        return `Votre essai Pro expire dans ${trialDaysRemaining} jour${trialDaysRemaining > 1 ? 's' : ''}. Passez au plan Pro pour continuer à utiliser cette fonctionnalité.`;
      } else {
        return 'Votre essai Pro a expiré. Passez au plan Pro pour retrouver l\'accès à cette fonctionnalité.';
      }
    }
    
    return 'Passez au plan Pro pour accéder à cette fonctionnalité';
  };

  const getButtonText = () => {
    if (feature === 'stats') {
      return 'Passer à Excellence';
    }
    
    if (isTrialActive && trialDaysRemaining !== null && trialDaysRemaining > 0) {
      return 'Continuer avec Pro';
    }
    
    return 'Passer à Pro';
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Feature Icon */}
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${config.color} rounded-full mb-6 shadow-lg`}>
            <Icon className="text-white" size={40} />
          </div>

          {/* Lock Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-6 -mt-3 relative">
            <Lock className="text-gray-600" size={24} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {config.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {config.description}
          </p>

          {/* Current Plan Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full mb-6">
            <span className="text-sm font-medium text-gray-600">Plan actuel : </span>
            <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${
              currentPlan === 'free' ? 'bg-gray-200 text-gray-800' :
              currentPlan === 'pro' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {currentPlan === 'free' ? 'Gratuit' :
               currentPlan === 'pro' ? 'Pro' : 'Excellence'}
            </span>
            {isTrialActive && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Essai actif
              </span>
            )}
          </div>

          {/* Upgrade Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="text-blue-600 mr-2" size={24} />
              <h3 className="text-lg font-semibold text-blue-900">Fonctionnalité Premium</h3>
            </div>
            <p className="text-blue-800 mb-4">
              {getUpgradeMessage()}
            </p>
            
            {/* Features List */}
            <div className="text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-blue-900 mb-3">
                Le plan {config.requiredPlan} inclut :
              </p>
              <ul className="space-y-2 text-sm text-blue-800">
                {feature === 'calendar' && (
                  <>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Vue calendrier interactive
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Gestion des échéances
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Synchronisation Google Calendar
                    </li>
                  </>
                )}
                {feature === 'tasks' && (
                  <>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Création de sous-tâches par projet
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Suivi du temps avec timer intégré
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Rapports de productivité détaillés
                    </li>
                  </>
                )}
                {feature === 'referrals' && (
                  <>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Commissions de 20% sur les parrainages
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Suivi des gains en temps réel
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Liens de parrainage personnalisés
                    </li>
                  </>
                )}
                {feature === 'stats' && (
                  <>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Rapports détaillés et métriques avancées
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Analyse de performance par plateforme
                    </li>
                    <li className="flex items-center">
                      <Star className="mr-2 text-blue-600" size={14} />
                      Objectifs et suivi de croissance
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/upgrade')}
              className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${config.color} text-white text-lg font-semibold rounded-full hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5`}
            >
              <Crown size={20} className="mr-2" />
              {getButtonText()}
              <ArrowRight size={20} className="ml-2" />
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Retour au Dashboard
            </button>
          </div>

          {/* Trial Info */}
          {isTrialActive && trialDaysRemaining !== null && trialDaysRemaining > 0 && feature !== 'stats' && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Bonne nouvelle !</strong> Vous avez encore {trialDaysRemaining} jour{trialDaysRemaining > 1 ? 's' : ''} d'essai Pro gratuit. 
                Cette fonctionnalité sera accessible pendant votre période d'essai.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlanRestrictedPage;