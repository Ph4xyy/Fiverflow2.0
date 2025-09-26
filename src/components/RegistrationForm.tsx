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
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria',
    'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Czech Republic',
    'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia',
    'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala',
    'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
    'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
    'Pakistan', 'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
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
    if (username.length > 20) return 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères';
    if (!/^[a-zA-Z0-9-_]+$/.test(username)) return 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores';
    if (username.startsWith('-') || username.endsWith('-')) return 'Le nom d\'utilisateur ne peut pas commencer ou finir par un tiret';
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

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        username: formData.username,
        country: formData.country,
        services: formData.services,
        phone: formData.phone
      });
      
      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Registration failed');
      } else {
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

    if (score <= 2) return { score, label: 'Faible', color: 'bg-red-900/200' };
    if (score <= 3) return { score, label: 'Moyen', color: 'bg-blue-500' };
    if (score <= 4) return { score, label: 'Fort', color: 'bg-blue-500' };
    return { score, label: 'Très fort', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Informations de Compte</h3>
              <p className="text-sm text-zinc-400">Créez vos identifiants de connexion sécurisés</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-200 mb-2">
                Adresse Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100 placeholder-zinc-500 ${
                    errors.email ? 'border-red-400 bg-red-900/20' : 'border-zinc-800'
                  }`}
                  placeholder="votre@email.com"
                  required
                />
                {errors.email && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-zinc-200 mb-2">
                Nom d'Utilisateur *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleFieldChange('username', e.target.value.toLowerCase())}
                  onBlur={() => handleFieldBlur('username')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100 placeholder-zinc-500 ${
                    errors.username ? 'border-red-400' : 'border-zinc-800'
                  }`}
                  placeholder="nom-utilisateur"
                  required
                />
                {errors.username && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
                )}
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.username}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-400">
                3-20 caractères, lettres, chiffres, tirets et underscores autorisés
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-200 mb-2">
                Mot de Passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-900 text-zinc-100 placeholder-zinc-500 ${
                    errors.password ? 'border-red-400' : 'border-zinc-800'
                  }`}
                  placeholder="Créez un mot de passe sécurisé"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400">Force du mot de passe</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-400' :
                      passwordStrength.score <= 3 ? 'text-blue-400' :
                      passwordStrength.score <= 4 ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.password}
                </p>
              )}
              
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-zinc-400">Le mot de passe doit contenir :</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-400' : 'text-zinc-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    8+ caractères
                  </div>
                  <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-zinc-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    1 majuscule
                  </div>
                  <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-zinc-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    1 minuscule
                  </div>
                  <div className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-400' : 'text-zinc-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    1 chiffre
                  </div>
                  <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-400' : 'text-zinc-500'}`}>
                    <CheckCircle size={12} className="mr-1" />
                    1 caractère spécial
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-200 mb-2">
                Confirmer le Mot de Passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-400 bg-red-900/20' : 'border-zinc-800'
                  }`}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
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
              <Globe className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Informations Personnelles</h3>
              <p className="text-sm text-zinc-400">Dites-nous en plus sur vous</p>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-zinc-200 mb-2">
                Pays d'Origine *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  onBlur={() => handleFieldBlur('country')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.country ? 'border-red-400 bg-red-900/20' : 'border-zinc-800'
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
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.country}
                </p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-200 mb-2">
                Numéro de Téléphone <span className="text-zinc-500">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  onBlur={() => handleFieldBlur('phone')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-400 bg-red-900/20' : 'border-zinc-800'
                  }`}
                  placeholder="+33 1 23 45 67 89"
                />
                {errors.phone && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
                )}
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.phone}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-400">
                Format international recommandé (ex: +33123456789)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Services Freelance</h3>
              <p className="text-sm text-zinc-400">Quels services proposez-vous ? (1-5 services)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-4">
                Type de Services Proposés *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto border border-gray-200 rounded-xl p-4">
                {freelanceServices.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                      formData.services.includes(service.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-zinc-800 hover:bg-gray-50'
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
                      <CheckCircle className="ml-auto text-blue-600" size={16} />
                    )}
                  </label>
                ))}
              </div>
              
              {errors.services && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.services}
                </p>
              )}
              
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>Services sélectionnés : {formData.services.length}/5</span>
                {formData.services.length > 0 && (
                  <span className="text-green-600">✓ Au moins un service sélectionné</span>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 sm:p-8 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">FiverFlow</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Créer un Compte</h2>
          <p className="text-sm sm:text-base text-zinc-400">Rejoignez la communauté des freelancers professionnels</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">Étape {currentStep} sur 3</span>
            <span className="text-sm font-medium text-zinc-400">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between mt-2 text-xs text-zinc-400">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Compte</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Personnel</span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>Services</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-zinc-800 text-zinc-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || Object.values(errors).some(error => error !== undefined)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Créer mon Compte
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <Shield className="text-zinc-500 mt-0.5" size={16} />
            <div className="text-xs text-zinc-400">
              <p className="font-medium mb-1">Sécurité et Confidentialité</p>
              <p>Vos données sont protégées par un chiffrement de niveau bancaire. Nous ne partageons jamais vos informations personnelles avec des tiers.</p>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;