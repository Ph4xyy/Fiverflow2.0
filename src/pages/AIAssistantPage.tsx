import React, { useState } from 'react';
import { Bot, MessageSquare, Zap, Users, TrendingUp, HelpCircle } from 'lucide-react';
import AssistantChat from '../components/AssistantChat';
import AssistantDemo from '../components/AssistantDemo';

const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'features' | 'demo'>('chat');

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Assistant IA Intelligent',
      description: 'Posez vos questions et obtenez des réponses personnalisées pour optimiser votre workflow freelance.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Conseils en Temps Réel',
      description: 'Recevez des conseils instantanés pour améliorer votre productivité et vos revenus.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Gestion des Clients',
      description: 'Apprenez à gérer efficacement vos clients et à maintenir de bonnes relations.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Optimisation des Revenus',
      description: 'Découvrez des stratégies pour augmenter vos revenus et développer votre business.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const quickActions = [
    {
      title: 'Comment gérer mes clients ?',
      description: 'Conseils pour une gestion client efficace'
    },
    {
      title: 'Optimiser mes factures',
      description: 'Créer des factures professionnelles'
    },
    {
      title: 'Augmenter mes revenus',
      description: 'Stratégies de croissance'
    },
    {
      title: 'Organiser mon temps',
      description: 'Gestion du temps et productivité'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#9c68f2] to-[#422ca5] rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Assistant IA FiverFlow</h1>
                <p className="text-slate-400">Votre partenaire intelligent pour optimiser votre workflow freelance</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'features'
                    ? 'bg-[#9c68f2] text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => setActiveTab('demo')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'demo'
                    ? 'bg-[#9c68f2] text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Démo
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-[#9c68f2] text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'features' ? (
          <div className="space-y-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Actions Rapides
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab('chat')}
                    className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors group"
                  >
                    <h4 className="font-medium text-white group-hover:text-[#9c68f2] transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Comment ça marche ?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Posez votre question</h4>
                  <p className="text-sm opacity-90">Décrivez votre problème ou votre besoin</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">L'IA analyse</h4>
                  <p className="text-sm opacity-90">Notre assistant comprend votre contexte</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Recevez des conseils</h4>
                  <p className="text-sm opacity-90">Obtenez des réponses personnalisées</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'demo' ? (
          <AssistantDemo />
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden" style={{ height: '600px' }}>
            <AssistantChat />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPage;