import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthWith2FA } from '../hooks/useAuthWith2FA';
import TwoFactorVerification from '../components/TwoFactorVerification';

import LogoImage from '../assets/LogoFiverFlow.png';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    isVerifying2FA, 
    userEmail, 
    signInWith2FA, 
    cancel2FA 
  } = useAuthWith2FA();
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
      // Utiliser le nouveau système avec 2FA
      const result = await signInWith2FA(formData.email, formData.password);
      
      if (result.success) {
        console.log('Authentication successful, waiting for user context to update...');
        setJustSignedIn(true);
        // Le loading reste true pour montrer que la connexion est en cours
      } else if (result.requires2FA) {
        console.log('2FA required, showing verification modal');
        setLoading(false);
        // Le modal 2FA sera affiché automatiquement
      } else {
        console.error('Authentication failed');
        setError('Email ou mot de passe incorrect');
        setLoading(false);
        setJustSignedIn(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
      setJustSignedIn(false);
    }
  };

  const handle2FASuccess = () => {
    setJustSignedIn(true);
  };

  const handle2FACancel = () => {
    cancel2FA();
    setLoading(false);
  };
    

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md rounded-2xl border border-[#1C2230] bg-[#11151D]/95 shadow-lg p-6 sm:p-8 mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={LogoImage} alt="FiverFlow" className="h-8 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-slate-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-slate-300 mb-2">
              Email Address
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
              Password
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
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm sm:text-base text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Two-Factor Authentication Verification Modal */}
      {isVerifying2FA && (
        <TwoFactorVerification
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
          userEmail={userEmail}
        />
      )}
    </div>
  );
};

export default LoginPage;