import React from 'react';
import { StripeProvider } from '../components/StripeProvider';
import { SubscriptionButton } from '../components/SubscriptionButton';
import { Button } from '../components/ui/Button';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { stripeProducts } from '../stripe-config';

const SubscriptionPage: React.FC = () => {
  const features = [
    'Projets illimités',
    'Analyses avancées',
    'Support prioritaire',
    'Intégrations personnalisées',
    'Collaboration en équipe',
    'Accès API'
  ];

  const boostFeatures = [
    ...features,
    'Rapports avancés',
    'Marque personnalisée',
    'Options white-label'
  ];

  const scaleFeatures = [
    ...boostFeatures,
    'Gestionnaire de compte dédié',
    'Développement personnalisé',
    'Support téléphonique 24/7',
    'Garantie SLA'
  ];

  const getFeatures = (planName: string) => {
    if (planName.toLowerCase().includes('scale')) {
      return scaleFeatures;
    } else if (planName.toLowerCase().includes('boost')) {
      return boostFeatures;
    }
    return features;
  };

  const getIcon = (planName: string) => {
    if (planName.toLowerCase().includes('scale')) {
      return <Crown className="w-6 h-6" />;
    } else if (planName.toLowerCase().includes('boost')) {
      return <Star className="w-6 h-6" />;
    }
    return <Zap className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez Votre Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sélectionnez le plan parfait pour vos besoins
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {stripeProducts.map((product) => {
            const features = getFeatures(product.name);
            const isPopular = product.name.toLowerCase().includes('scale');

            return (
              <div
                key={product.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                  isPopular
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Le Plus Populaire
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-lg ${
                      isPopular
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getIcon(product.name)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 ml-3">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        {product.price}
                      </span>
                      <span className="text-gray-500 ml-1">
                        /{product.interval === 'month' ? 'mois' : 'an'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Facturation {product.currency}
                    </p>
                  </div>

                  <p className="text-gray-600 mb-6">
                    {product.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <StripeProvider>
                    <SubscriptionButton
                      priceId={product.priceId}
                      planName={product.name}
                      amount={product.price}
                      className={`w-full ${
                        isPopular
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      onSuccess={() => {
                        console.log('Souscription réussie!');
                      }}
                    />
                  </StripeProvider>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Questions Fréquentes
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements seront proratisés.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                Y a-t-il une période d'essai gratuite ?
              </h3>
              <p className="text-gray-600">
                Oui, nous offrons une période d'essai gratuite de 14 jours pour tous les plans. Aucune carte de crédit requise.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                Quels modes de paiement acceptez-vous ?
              </h3>
              <p className="text-gray-600">
                Nous acceptons toutes les principales cartes de crédit, PayPal et virements bancaires via notre intégration Stripe sécurisée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
