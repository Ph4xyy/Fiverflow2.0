import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight, Loader } from 'lucide-react';
import { useStripeSubscription } from '../hooks/useStripeSubscription';
import { useAuth } from '../contexts/AuthContext';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { subscription, refreshSubscription } = useStripeSubscription();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription data after successful payment
    const refreshData = async () => {
      if (user && sessionId) {
        // Wait a moment for webhook to process
        setTimeout(async () => {
          await refreshSubscription();
          setLoading(false);
        }, 2000);
      } else {
        setLoading(false);
      }
    };

    refreshData();
  }, [user, sessionId, refreshSubscription]);

  const getSubscriptionPlan = () => {
    if (!subscription || !subscription.price_id) return 'Unknown';
    
    // Map price IDs to plan names
    switch (subscription.price_id) {
      case 'price_1RoRLDENcVsHr4WI6TViAPNb': // Pro Package (Monthly)
      case 'price_1RoXOgENcVsHr4WIitiOEaaz': // 1y pro package (Yearly)
        return 'Pro';
      case 'price_1RoRMdENcVsHr4WIVRYCy8JL': // Excellence Package (Monthly)
      case 'price_1RoXNwENcVsHr4WI3SP8AYYu': // 1y Excellence Package (Yearly)
        return 'Excellence';
      default:
        return subscription.product_name || 'Premium';
    }
  };

  const getPlanFeatures = () => {
    const plan = getSubscriptionPlan();
    
    if (plan === 'Pro') {
      return [
        'Unlimited clients and orders',
        'Calendar access',
        'Referral program',
        'Priority email support',
        'Advanced templates'
      ];
    } else if (plan === 'Excellence') {
      return [
        'All Pro features',
        'Advanced statistics',
        'Google Calendar integration',
        '24/7 phone & email support',
        'Custom integrations',
        'VIP dashboard badge'
      ];
    }
    
    return ['Premium features unlocked'];
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Session</h1>
          <p className="text-gray-600 mb-6">
            No valid session found. Please try again.
          </p>
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Upgrade
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader className="text-blue-600 animate-spin" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Payment</h1>
          <p className="text-gray-600 mb-6">
            Please wait while we confirm your subscription...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Payment Successful!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Welcome to FiverFlow {getSubscriptionPlan()}! Your subscription is now active.
        </p>

        {/* Plan Details */}
        {subscription && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="text-blue-600 mr-2" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">
                {getSubscriptionPlan()} Plan Activated
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's included:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  {getPlanFeatures().map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Subscription Details:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Status:</strong> {subscription.subscription_status}</p>
                  {subscription.current_period_end && (
                    <p><strong>Next billing:</strong> {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</p>
                  )}
                  {subscription.payment_method_brand && subscription.payment_method_last4 && (
                    <p><strong>Payment method:</strong> {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-600">
            <strong>Session ID:</strong> {sessionId}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Keep this for your records
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Go to Dashboard
            <ArrowRight size={20} className="ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            Manage Subscription
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>What's next?</strong> You now have access to all {getSubscriptionPlan()} features. 
            Head to your dashboard to start using your new capabilities!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;