import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    activity: '',
    country: ''
  });

  const activities = [
    { value: 'Web Development', label: t('activity.web.development') },
    { value: 'Graphic Design', label: t('activity.graphic.design') },
    { value: 'Content Writing', label: t('activity.content.writing') },
    { value: 'Digital Marketing', label: t('activity.digital.marketing') },
    { value: 'Video Editing', label: t('activity.video.editing') },
    { value: 'Translation', label: t('activity.translation') },
    { value: 'Data Entry', label: t('activity.data.entry') },
    { value: 'Virtual Assistant', label: t('activity.virtual.assistant') },
    { value: 'Photography', label: t('activity.photography') },
    { value: 'Other', label: t('activity.other') }
  ];

  const countries = [
    { value: 'France', label: t('country.france') },
    { value: 'United States', label: t('country.united.states') },
    { value: 'Canada', label: t('country.canada') },
    { value: 'United Kingdom', label: t('country.united.kingdom') },
    { value: 'Germany', label: t('country.germany') },
    { value: 'Spain', label: t('country.spain') },
    { value: 'Italy', label: t('country.italy') },
    { value: 'Netherlands', label: t('country.netherlands') },
    { value: 'Belgium', label: t('country.belgium') },
    { value: 'Switzerland', label: t('country.switzerland') },
    { value: 'Australia', label: t('country.australia') },
    { value: 'Brazil', label: t('country.brazil') },
    { value: 'India', label: t('country.india') },
    { value: 'Other', label: t('country.other') }
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
      setError(t('onboarding.complete.all'));
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
      setError(t('onboarding.error.save'));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.name) {
      setError(t('onboarding.error.name'));
      return;
    }
    if (currentStep === 2 && !formData.activity) {
      setError(t('onboarding.error.activity'));
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
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">{t('onboarding.welcome')}</h2>
          <p className="text-sm sm:text-base text-gray-600">{t('onboarding.setup')}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">{t('onboarding.step')} {currentStep} {t('onboarding.of')} 3</span>
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
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('onboarding.name.title')}</h3>
                <p className="text-sm text-gray-600">{t('onboarding.name.subtitle')}</p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  {t('onboarding.name.label')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('onboarding.name.placeholder')}
                  required
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                {t('onboarding.continue')}
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          )}

          {/* Étape 2: Activité */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('onboarding.activity.title')}</h3>
                <p className="text-sm text-gray-600">{t('onboarding.activity.subtitle')}</p>
              </div>
              
              <div>
                <label htmlFor="activity" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  {t('onboarding.activity.label')}
                </label>
                <select
                  id="activity"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{t('onboarding.activity.placeholder')}</option>
                  {activities.map((activity) => (
                    <option key={activity.value} value={activity.value}>{activity.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  {t('onboarding.back')}
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {t('onboarding.continue')}
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
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('onboarding.country.title')}</h3>
                <p className="text-sm text-gray-600">{t('onboarding.country.subtitle')}</p>
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  {t('onboarding.country.label')}
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{t('onboarding.country.placeholder')}</option>
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>{country.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  {t('onboarding.back')}
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
                      {t('onboarding.start')}
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
            {t('onboarding.skip')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;