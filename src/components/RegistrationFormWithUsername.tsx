import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUsernameValidation } from '../hooks/useUsernameValidation';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  name?: string;
  country?: string;
  services?: string;
  phone?: string;
}

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { isUsernameAvailable, validateUsername, loading: usernameLoading } = useUsernameValidation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    name: '',
    country: '',
    services: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

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

  const services = [
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

  // Check for referral username in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralUsername = urlParams.get('ref');
    
    if (referralUsername) {
      // Store referral username for later processing
      sessionStorage.setItem('referralUsername', referralUsername);
      console.log('🔗 Referral username found:', referralUsername);
    }
  }, []);

  // Username validation with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.username && formData.username.length >= 3) {
        setUsernameStatus('checking');
        
        const validation = validateUsername(formData.username);
        if (!validation.isValid) {
          setUsernameStatus('invalid');
          setErrors(prev => ({ ...prev, username: validation.error }));
          return;
        }
        
        const available = await isUsernameAvailable(formData.username);
        if (available) {
          setUsernameStatus('available');
          setErrors(prev => ({ ...prev, username: undefined }));
        } else {
          setUsernameStatus('taken');
          setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
        }
      } else if (formData.username && formData.username.length > 0) {
        setUsernameStatus('invalid');
        setErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
      } else {
        setUsernameStatus('idle');
        setErrors(prev => ({ ...prev, username: undefined }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, isUsernameAvailable, validateUsername]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Email is invalid';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      
      case 'name':
        if (!value) {
          newErrors.name = 'Name is required';
        } else {
          delete newErrors.name;
        }
        break;
      
      case 'country':
        if (!value) {
          newErrors.country = 'Country is required';
        } else {
          delete newErrors.country;
        }
        break;
      
      case 'services':
        if (!value) {
          newErrors.services = 'Service is required';
        } else {
          delete newErrors.services;
        }
        break;
      
      case 'phone':
        if (!value) {
          newErrors.phone = 'Phone number is required';
        } else {
          delete newErrors.phone;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateAllFields = () => {
    const fieldsToValidate = ['email', 'password', 'confirmPassword', 'username', 'name', 'country', 'services', 'phone'];
    fieldsToValidate.forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
    });

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields() || usernameStatus !== 'available') {
      toast.error('Please correct the errors before continuing');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        username: formData.username,
        name: formData.name,
        country: formData.country,
        services: formData.services,
        phone: formData.phone
      });
      
      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Registration failed');
      } else {
        toast.success('Account created successfully!');
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during account creation');
    } finally {
      setLoading(false);
    }
  };

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'taken':
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">FiverFlow</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Create Account</h2>
          <p className="text-sm sm:text-base text-gray-600">Join our community of freelancers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.username ? 'border-red-500' : usernameStatus === 'available' ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="Choose a unique username"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getUsernameIcon()}
              </div>
            </div>
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            {usernameStatus === 'available' && (
              <p className="mt-1 text-sm text-green-600">Username is available!</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your full name"
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
          </div>

          {/* Services */}
          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Service
            </label>
            <select
              id="services"
              name="services"
              value={formData.services}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.services ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select your service</option>
              {services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
            {errors.services && <p className="mt-1 text-sm text-red-600">{errors.services}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your phone number"
              required
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || usernameStatus !== 'available'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
