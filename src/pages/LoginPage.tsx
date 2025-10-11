import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import LogoImage from '../assets/LogoFiverFlow.png';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [justSignedIn, setJustSignedIn] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // 🔥 FIXED: Rediriger automatiquement si l'utilisateur est déjà connecté OU vient de se connecter
  React.useEffect(() => {
    // Rediriger si user existe ET (on vient de se connecter OU authLoading est terminé)
    if (user && (justSignedIn || !authLoading)) {
      console.log('🔄 LoginPage: User detected, redirecting to dashboard', { justSignedIn, authLoading });
      navigate('/dashboard', { replace: true });
    }
  }, [user, justSignedIn, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Login form submitted with:', { email: formData.email, password: '***' });
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log('Starting authentication process...');

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error('Authentication error:', error);
        setError(error.message);
        setLoading(false);
        setJustSignedIn(false);
      } else {
        console.log('Authentication successful, waiting for user context to update...');
        // 🔥 FIXED: Marquer qut('on vient de se connecter, le useEffect s'occupera de la redirection
        setJustSignedIn(true);
        // Le loading reste true pour montrer que la connexion est en cours
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
      setJustSignedIn(false);
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
                  language === lang.code ? 'bg-blue-900/20 text-blue-300' : 'text-slate-300'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-[#1C2230] bg-[#11151D]/95 shadow-lg p-6 sm:p-8 mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={LogoImage} alt="FiverFlow" className="h-8 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{'Welcome Back'}</h1>
          <p className="text-sm sm:text-base text-slate-400">{'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-slate-300 mb-2">
              {'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 text-sm sm:text-base bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-slate-300 mb-2">
              {'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 text-sm sm:text-base bg-[#0E121A] border border-[#1C2230] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 text-sm sm:text-base rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={(e) => {
              console.log('Sign In button clicked');
              if (!loading) {
                handleSubmit(e);
              }
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {'Signing In...'}
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm sm:text-base text-slate-400">
            {'Don\'t have an account?'}{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {'Sign up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;