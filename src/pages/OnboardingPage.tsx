import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, processPendingReferral } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    activity: '',
    country: ''
  });

  const activities = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Graphic Design', label: 'Graphic Design' },
    { value: 'Content Writing', label: 'Content Writing' },
    { value: 'Digital Marketing', label: 'Digital Marketing' },
    { value: 'Video Editing', label: 'Video Editing' },
    { value: 'Translation', label: 'Translation' },
    { value: 'Data Entry', label: 'Data Entry' },
    { value: 'Virtual Assistant', label: 'Virtual Assistant' },
    { value: 'Photography', label: 'Photography' },
    { value: 'Other', label: 'Other' }
  ];

  const countries = [
    { value: 'France', label: 'France' },
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Spain', label: 'Spain' },
    { value: 'Italy', label: 'Italy' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'Belgium', label: 'Belgium' },
    { value: 'Switzerland', label: 'Switzerland' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Brazil', label: 'Brazil' },
    { value: 'India', label: 'India' },
    { value: 'Other', label: 'Other' }
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
      setError('Please fill in all fields');
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

      // Process pending referral if exists
      console.log('🔄 Processing pending referral...');
      const referralResult = await processPendingReferral(user!.id);
      
      if (referralResult.success) {
        if (referralResult.message) {
          toast.success(referralResult.message);
        }
      } else if (referralResult.error) {
        console.warn('⚠️ Referral processing failed:', referralResult.error);
        // Don't fail onboarding if referral fails
        toast.error(`Referral failed: ${referralResult.error}`);
      }

      // Rediriger vers le dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.name) {
      setError('Please enter your name');
      return;
    }
    if (currentStep === 2 && !formData.activity) {
      setError('Please select your activity');
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
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">{'Welcome!'}</h2>
          <p className="text-sm sm:text-base text-gray-600">{'Let\'s set up your profile in a few steps'}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">{'Step'} {currentStep} {'of'} 3</span>
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
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{'What\'s your name?'}</h3>
                <p className="text-sm text-gray-600">{'Your name will be displayed on your profile'}</p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  {'Full name'}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={'Your full name'}
                  required
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                {'Continue'}
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          )}

          {/* Étape 2: Activité */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{'What is your activity?'}</h3>
                <p className="text-sm text-gray-600">{'This helps us personalize your experience'}</p>
              </div>
              
              <div>
                <label htmlFor="activity" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  {'Activity field'}
                </label>
                <select
                  id="activity"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{'Select your activity'}</option>
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
                  {'Back'}
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {'Continue'}
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
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{'Where are you from?'}</h3>
                <p className="text-sm text-gray-600">{'Last step before getting started!'}</p>
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  {'Country'}
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{'Select your country'}</option>
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
                  {'Back'}
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
                      {'Start using FiverFlow'}
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
            {'Skip this step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;