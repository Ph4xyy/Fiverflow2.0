import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Users, DollarSign, CheckCircle, ArrowRight, Star } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  country: string;
  services: string;
  created_at: string;
}

const ReferralLandingPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isSupabaseConfigured || !supabase || !username) {
        setError('Invalid referral link');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_user_by_username', {
          username_to_find: username
        });

        if (error) {
          console.error('Error fetching user profile:', error);
          setError('User not found');
          return;
        }

        if (!data || data.length === 0) {
          setError('User not found');
          return;
        }

        setUserProfile(data[0]);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleJoinNow = () => {
    if (userProfile) {
      // Store referral username for later processing
      sessionStorage.setItem('referralUsername', userProfile.username);
      console.log('🔗 Referral username stored:', userProfile.username);
      
      // Navigate to registration
      navigate('/register');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Referral Link</h1>
            <p className="text-gray-600 mb-6">
              The referral link you're trying to access is invalid or the user doesn't exist.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">FiverFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              You've been invited by <span className="text-blue-600">{userProfile.name}</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Join FiverFlow and start earning with our referral program!
            </p>

            {/* User Info Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{userProfile.name}</h3>
              <p className="text-gray-600 mb-2">@{userProfile.username}</p>
              <p className="text-gray-600 mb-2">{userProfile.services}</p>
              <p className="text-gray-500 text-sm">{userProfile.country}</p>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Earn 20% Commission</h3>
                <p className="text-gray-600 text-sm">Get paid for every successful referral</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Build Your Network</h3>
                <p className="text-gray-600 text-sm">Grow your referral network and income</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Easy Payouts</h3>
                <p className="text-gray-600 text-sm">Request payouts anytime you want</p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleJoinNow}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
            >
              Join FiverFlow Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            <p className="text-gray-500 text-sm mt-4">
              By joining, you'll be connected to {userProfile.name}'s referral network
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Join FiverFlow?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Premium Platform</h3>
              <p className="text-gray-600 text-sm">Access to high-quality clients and projects</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fair Pricing</h3>
              <p className="text-gray-600 text-sm">Competitive rates and transparent pricing</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600 text-sm">Connect with other freelancers</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Reliable</h3>
              <p className="text-gray-600 text-sm">Secure payments and project management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4">FiverFlow</h3>
          <p className="text-gray-400 mb-4">
            The platform where freelancers thrive and referrals pay off.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="/about" className="text-gray-400 hover:text-white">About</a>
            <a href="/contact" className="text-gray-400 hover:text-white">Contact</a>
            <a href="/privacy" className="text-gray-400 hover:text-white">Privacy</a>
            <a href="/terms" className="text-gray-400 hover:text-white">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReferralLandingPage;
