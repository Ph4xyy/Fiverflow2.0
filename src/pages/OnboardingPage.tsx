import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    activity: '',
    country: ''
  });

  const activities = [
    'Web Development',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'Video Editing',
    'Translation',
    'Data Entry',
    'Virtual Assistant',
    'Photography',
    'Other'
  ];

  const countries = [
    'France', 'United States', 'Canada', 'United Kingdom', 'Germany',
    'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
    'Australia', 'Brazil', 'India', 'Other'
  ];

  useEffect(() => {
    // Load registration data if available
    const registrationData = sessionStorage.getItem('pendingRegistrationData');
    if (registrationData) {
      try {
        const data = JSON.parse(registrationData);
        setFormData(prev => ({
          ...prev,
          name: data.username || '',
          activity: data.services?.[0] || '',
          country: data.country || ''
        }));
        // Clean up
        sessionStorage.removeItem('pendingRegistrationData');
      } catch (error) {
        console.error('Error parsing registration data:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.activity || !formData.country) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mettre à jour le profil utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          activity: formData.activity,
          country: formData.country,
          onboarding_completed: true
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      // Rediriger vers le dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.name) {
      setError('Veuillez saisir votre nom');
      return;
    }
    if (currentStep === 2 && !formData.activity) {
      setError('Veuillez sélectionner votre activité');
      return;
    }
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">FiverFlow</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Bienvenue !</h2>
          <p className="text-sm sm:text-base text-gray-600">Configurons votre profil en quelques étapes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Étape {currentStep} sur 3</span>
            <span className="text-xs sm:text-sm font-medium text-gray-600">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Étape 1: Nom */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Comment vous appelez-vous ?</h3>
                <p className="text-sm text-gray-600">Votre nom sera affiché dans votre profil</p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Continuer
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          )}

          {/* Étape 2: Activité */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Quelle est votre activité ?</h3>
                <p className="text-sm text-gray-600">Cela nous aide à personnaliser votre expérience</p>
              </div>
              
              <div>
                <label htmlFor="activity" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Domaine d'activité
                </label>
                <select
                  id="activity"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez votre activité</option>
                  {activities.map((activity) => (
                    <option key={activity} value={activity}>{activity}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Continuer
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Pays */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Globe className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">D'où venez-vous ?</h3>
                <p className="text-sm text-gray-600">Dernière étape avant de commencer !</p>
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez votre pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Commencer à utiliser FiverFlow
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;