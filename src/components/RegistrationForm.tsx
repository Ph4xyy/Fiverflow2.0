import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Globe, 
  Phone, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Loader2,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUsernameValidation } from '../hooks/useUsernameValidation';

import toast from 'react-hot-toast';
import LogoImage from '../assets/LogoFiverFlow.png';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  country: string;
  services: string[];
  phone?: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  country?: string;
  services?: string;
  phone?: string;
}

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    country: '',
    services: [],
    phone: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Hook de validation des usernames
  const usernameValidation = useUsernameValidation(formData.username);

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria',
    'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Czech Republic',
    'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia',
    'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala',
    'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
    'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
    'Pakistan', 'Panama', 'Perut(', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
    'Taiwan', 'Thailand', 'Tunisia', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam'
  ];

  const freelanceServices = [
    { id: 'web-dev', label: 'Développement Web', icon: '💻' },
    { id: 'graphic-design', label: 'Design Graphique', icon: '🎨' },
    { id: 'writing', label: 'Rédaction', icon: '✍️' },
    { id: 'translation', label: 'Traduction', icon: '🌐' },
    { id: 'digital-marketing', label: 'Marketing Digital', icon: '📱' },
    { id: 'photography', label: 'Photographie', icon: '📸' },
    { id: 'video', label: 'Vidéo', icon: '🎬' },
    { id: 'consulting', label: 'Conseil', icon: '💼' },
    { id: 'data-analysis', label: 'Analyse de Données', icon: '📊' },
    { id: 'mobile-dev', label: 'Développement Mobile', icon: '📱' },
    { id: 'ui-ux', label: 'UI/UX Design', icon: '🎯' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'social-media', label: 'Réseaux Sociaux', icon: '📢' },
    { id: 'voice-over', label: 'Voice-over', icon: '🎤' },
    { id: 'animation', label: 'Animation', icon: '🎞️' },
    { id: 'other', label: 'Autre', icon: '⚡' }
  ];

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'L\'adresse email est obligatoire';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Format d\'email invalide';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Le mot de passe est obligatoire';
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule';
    if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule';
    if (!/\d/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Le mot de passe doit contenir au moins un caractère spécial';
    return undefined;
  };

  const validateUsername = (username: string): string | undefined => {
    if (!username) return 'Le nom d\'utilisateur est obligatoire';
    if (username.length < 3) return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    if (username.length > 50) return 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères';
    if (!/^[a-z0-9_]+$/.test(username)) return 'Le nom d\'utilisateur ne peut contenir que des lettres minuscules, chiffres et underscores';
    if (/^[0-9]/.test(username)) return 'Le nom d\'utilisateur ne peut pas commencer par un chiffre';
    if (/_$/.test(username)) return 'Le nom d\'utilisateur ne peut pas se terminer par un underscore';
    
    // Vérifier le statut de validation en temps réel
    if (usernameValidation.status === 'taken') return 'Ce nom d\'utilisateur est déjà utilisé';
    if (usernameValidation.status === 'invalid') return 'Nom d\'utilisateur invalide';
    
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return undefined; // Optional field
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
      return 'Format de téléphone invalide (ex: +33123456789)';
    }
    return undefined;
  };

  const validateCountry = (country: string): string | undefined => {
    if (!country) return 'Le pays est obligatoire';
    if (!countries.includes(country)) return 'Pays invalide';
    return undefined;
  };

  const validateServices = (services: string[]): string | undefined => {
    if (services.length === 0) return 'Veuillez sélectionner au moins un service';
    if (services.length > 5) return 'Vous ne pouvez sélectionner que 5 services maximum';
    return undefined;
  };

  // Real-time validation
  const validateField = (fieldName: keyof FormData, value: any): string | undefined => {
    switch (fieldName) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        if (!value) return 'La confirmation du mot de passe est obligatoire';
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        return undefined;
      case 'username':
        return validateUsername(value);
      case 'country':
        return validateCountry(value);
      case 'services':
        return validateServices(value);
      case 'phone':
        return validatePhone(value);
      default:
        return undefined;
    }
  };

  const handleFieldChange = (fieldName: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Real-time validation for touched fields
    if (touchedFields.has(fieldName)) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleFieldBlur = (fieldName: keyof FormData) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    const error = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleServiceToggle = (serviceId: string) => {
    const newServices = formData.services.includes(serviceId)
      ? formData.services.filter(s => s !== serviceId)
      : [...formData.services, serviceId];
    
    setFormData(prev => ({ ...prev, services: newServices }));
    
    // Clear services error when at least one service is selected
    if (newServices.length > 0 && errors.services) {
      setErrors(prev => ({ ...prev, services: undefined }));
    }
    
    // Add services error if no services selected and field was touched
    if (newServices.length === 0 && touchedFields.has('services')) {
      setErrors(prev => ({ ...prev, services: 'Veuillez sélectionner au moins un service' }));
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submission
    const finalErrors: ValidationErrors = {};
    let isValid = true;

    // Validate all fields one more time
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    const usernameError = validateUsername(formData.username);
    const countryError = validateCountry(formData.country);
    const servicesError = validateServices(formData.services);
    const phoneError = validatePhone(formData.phone || '');

    if (emailError) { finalErrors.email = emailError; isValid = false; }
    if (passwordError) { finalErrors.password = passwordError; isValid = false; }
    if (confirmPasswordError) { finalErrors.confirmPassword = confirmPasswordError; isValid = false; }
    if (usernameError) { finalErrors.username = usernameError; isValid = false; }
    if (countryError) { finalErrors.country = countryError; isValid = false; }
    if (servicesError) { finalErrors.services = servicesError; isValid = false; }
    if (phoneError) { finalErrors.phone = phoneError; isValid = false; }

    setErrors(finalErrors);

    if (!isValid) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    // Vérifier que le username est disponible
    if (!usernameValidation.isAvailable) {
      toast.error('Le nom d\'utilisateur n\'est pas disponible');
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await signUp(formData.email, formData.password, {
        username: formData.username,
        country: formData.country,
        services: formData.services,
        phone: formData.phone
      });
      
      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // Si l'inscription réussit (avec ou sans user immédiat - dépend de la config email)
      if (user || !error) {
        // Store additional registration data in sessionStorage for onboarding
        sessionStorage.setItem('pendingRegistrationData', JSON.stringify({
          username: formData.username,
          country: formData.country,
          services: formData.services,
          phone: formData.phone
        }));
        
        toast.success('Compte créé avec succès !');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Une erreur est survenue lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step fields
    let stepValid = true;
    const stepErrors: ValidationErrors = {};

    if (currentStep === 1) {
      // Step 1: Account credentials
      const emailError = validateEmail(formData.email);
      const passwordError = validatePassword(formData.password);
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      const usernameError = validateUsername(formData.username);

      if (emailError) { stepErrors.email = emailError; stepValid = false; }
      if (passwordError) { stepErrors.password = passwordError; stepValid = false; }
      if (confirmPasswordError) { stepErrors.confirmPassword = confirmPasswordError; stepValid = false; }
      if (usernameError) { stepErrors.username = usernameError; stepValid = false; }
    } else if (currentStep === 2) {
      // Step 2: Personal information
      const countryError = validateCountry(formData.country);
      const phoneError = validatePhone(formData.phone);

      if (countryError) { stepErrors.country = countryError; stepValid = false; }
      if (phoneError) { stepErrors.phone = phoneError; stepValid = false; }
    }

    setErrors(stepErrors);

    if (stepValid) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Veuillez corriger les erreurs avant de continuer');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Faible', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Moyen', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Fort', color: 'bg-gradient-to-r from-purple-500 to-pink-600' };
    return { score, label: 'Très fort', color: 'bg-gradient-to-r from-emerald-500 to-teal-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Shield className="mx-auto h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{'Account Information'}</h3>
              <p className="text-sm text-slate-400">{'Create your secure login credentials'}</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                {'Email Address'} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#0E121A] text-white placeholder-slate-400 ${
                    errors.email ? 'border-red-500/50 bg-red-900/20' : 'border-[#1C2230]'
                  }`}
                  placeholder="votre@email.com"
                  required
                />
                {errors.email && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-300 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor='username' className='block text-sm font-medium text-slate-300 mb-2'>
                {'Username'} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleFieldChange('username', e.target.value.toLowerCase())}
                  onBlur={() => handleFieldBlur('username')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#0E121A] text-white placeholder-slate-400 ${
                    errors.username ? 'border-red-500/50 bg-red-900/20' : 
                    usernameValidation.isAvailable ? 'border-green-500/50 bg-green-900/20' : 'border-[#1C2230]'
                  }`}
                  placeholder="nom-utilisateur"
                  required
                />
                {/* Indicateur de validation en temps réel */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameValidation.isChecking && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {usernameValidation.isAvailable && !usernameValidation.isChecking && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {(usernameValidation.isTaken || usernameValidation.isInvalid) && !usernameValidation.isChecking && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-300 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.username}
                </p>
              )}
              {!errors.username && usernameValidation.isAvailable && (
                <p className="mt-1 text-sm text-green-300 flex items-center">
                  <CheckCircle size={14} className="mr-1" />
                  Nom d'utilisateur disponible
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Utilisez uniquement des lettres minuscules, chiffres et underscores (3-50 caractères)
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-slate-300 mb-2'>
                {'Password'} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#0E121A] text-white placeholder-slate-400 ${
                    errors.password ? 'border-red-500/50 bg-red-900/20' : 'border-[#1C2230]'
                  }`}
                  placeholder="Créez un mot de passe sécurisé"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Force du mot de passe</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-400' :
                      passwordStrength.score <= 3 ? 'text-yellow-400' :
                      passwordStrength.score <= 4 ? 'text-purple-400' : 'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-[#1C2230] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-300 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.password}
                </p>
              )}
              
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-slate-400">Le mot de passe doit contenir :</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-400' : 'text-slate-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    8+ caractères
                  </div>
                  <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-slate-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    1 majuscule
                  </div>
                  <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-slate-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    1 minuscule
                  </div>
                  <div className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-400' : 'text-slate-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    1 chiffre
                  </div>
                  <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-400' : 'text-slate-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    1 caractère spécial
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-slate-300 mb-2'>
                {'Confirm Password'} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#0E121A] text-white placeholder-slate-400 ${
                    errors.confirmPassword ? 'border-red-500/50 bg-red-900/20' : 'border-[#1C2230]'
                  }`}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-300 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Globe className="mx-auto h-12 w-12 text-purple-400 mb-4" />
              <h3 className='text-xl font-semibold text-white mb-2'>{'Personal Information'}</h3>
              <p className='text-sm text-slate-400'>{'Tell us more about yourself'}</p>
            </div>

            {/* Country */}
            <div>
              <label htmlFor='country' className='block text-sm font-medium text-slate-300 mb-2'>
                {'Country of Origin'} *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  onBlur={() => handleFieldBlur('country')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#0E121A] text-white ${
                    errors.country ? 'border-red-500/50 bg-red-900/20' : 'border-[#1C2230]'
                  }`}
                  required
                >
                  <option value="">Sélectionnez votre pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.country && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
                )}
              </div>
              {errors.country && (
                <p className="mt-1 text-sm text-red-300 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.country}
                </p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-slate-300 mb-2'>
                {'Phone Number'} <span className='text-slate-500'>{'(optional)'}</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  onBlur={() => handleFieldBlur('phone')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#0E121A] text-white placeholder-slate-400 ${
                    errors.phone ? 'border-red-500/50 bg-red-900/20' : 'border-[#1C2230]'
                  }`}
                  placeholder="+33 1 23 45 67 89"
                />
                {errors.phone && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
                )}
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-300 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.phone}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Format international recommandé (ex: +33123456789)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="mx-auto h-12 w-12 text-purple-400 mb-4" />
              <h3 className='text-xl font-semibold text-white mb-2'>{'Freelance Services'}</h3>
              <p className='text-sm text-slate-400'>{'What services do you offer? (1-5 services)'}</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-300 mb-4'>
                {'Services Offered'} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto border border-[#1C2230] rounded-lg p-4 bg-[#0E121A]">
                {freelanceServices.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.services.includes(service.id)
                        ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-300 ring-1 ring-purple-500/30'
                        : 'border-[#1C2230] hover:border-[#2A3347] hover:bg-[#121722] text-slate-300'
                    }`}
                    onClick={() => {
                      setTouchedFields(prev => new Set(prev).add('services'));
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{service.icon}</span>
                    <span className="text-sm font-medium">{service.label}</span>
                    {formData.services.includes(service.id) && (
                      <CheckCircle className="ml-auto text-purple-400" size={16} />
                    )}
                  </label>
                ))}
              </div>
              
              {errors.services && (
                <p className="mt-2 text-sm text-red-300 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.services}
                </p>
              )}
              
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Services sélectionnés : {formData.services.length}/5</span>
                {formData.services.length > 0 && (
                  <span className="text-green-400">✓ Au moins un service sélectionné</span>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'rut(', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex items-center justify-center px-4 py-8 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#11151D] border border-[#1C2230] text-slate-300 hover:text-white hover:bg-[#141A26] transition-all duration-200">
            <Globe size={16} />
            <span className="text-sm">{languages.find(l => l.code === language)?.flag}</span>
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#11151D] border border-[#1C2230] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#141A26] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                  language === lang.code ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-300' : 'text-slate-300'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl rounded-2xl border border-[#1C2230] bg-[#11151D]/95 shadow-lg p-6 sm:p-8 mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={LogoImage} alt="FiverFlow" className="h-8 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{'Create Account'}</h1>
          <p className="text-sm sm:text-base text-slate-400">{'Join the community of professional freelancers'}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-400">{'Step'} {currentStep} {'of'} 3</span>
            <span className="text-sm font-medium text-slate-400">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-[#1C2230] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span className={currentStep >= 1 ? 'text-purple-400 font-medium' : ''}>Compte</span>
            <span className={currentStep >= 2 ? 'text-purple-400 font-medium' : ''}>Personnel</span>
            <span className={currentStep >= 3 ? 'text-purple-400 font-medium' : ''}>Services</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type='button'
              onClick={prevStep}
              disabled={currentStep === 1}
              className='px-6 py-3 border border-[#1C2230] text-slate-300 rounded-lg hover:bg-[#121722] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {'Previous'}
            </button>
            
            {currentStep < 3 ? (
              <button
                type='button'
                onClick={nextStep}
                className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              >
                {'Next'}
              </button>
            ) : (
              <button
                type='submit'
                disabled={loading || Object.values(errors).some(error => error !== undefined)}
                className='px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    {'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className='mr-2' />
                    {'Create Account'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-[#0E121A] rounded-lg border border-[#1C2230]">
          <div className="flex items-start space-x-3">
            <Shield className="text-slate-400 mt-0.5" size={16} />
            <div className="text-xs text-slate-400">
              <p className='font-medium mb-1 text-slate-300'>{'Security and Privacy'}</p>
              <p>{'Your data is protected by bank-level encryption. We never share your personal information with third parties.'}</p>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
            <p className='text-sm text-slate-400'>
              {'Already have an account?'}{' '}
              <Link to='/login' className='text-purple-400 hover:text-purple-300 font-medium transition-colors'>
                {'Sign in'}
              </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;