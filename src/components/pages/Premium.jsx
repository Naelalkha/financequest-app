import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { FaCrown, FaCheck, FaInfinity, FaRocket, FaBolt, FaTrophy, FaLock } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { logPremiumEvent } from '../../utils/analytics';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RnceePEdl4W6QSBLwf47mjWRXZHOJbZO4Obw3tCZzocdvRgxFhbthIQt4BjQLHiVr0CCZEz7130mmOCEsHQTHMR007KEVMEbY');

const Premium = () => {
  const { t, currentLang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    logPremiumEvent('premium_page_view');
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setIsPremium(userSnap.data().isPremium || false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.info(t('auth.login_required') || 'Please login to subscribe');
      navigate('/login');
      return;
    }

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      toast.error('Stripe is not configured. Please add your Stripe keys.');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, you would create a checkout session on your backend
      // For now, we'll show a demo message
      toast.info('Stripe Checkout would open here in production');
      
      // Log the attempt
      logPremiumEvent('premium_subscribe_attempt', { 
        plan: selectedPlan,
        price: selectedPlan === 'monthly' ? 4.99 : 39.99 
      });
      
      // Simulate subscription for demo purposes
      // In production, this would be handled by Stripe webhook
      setTimeout(() => {
        toast.success(t('premium.subscribe_success') || 'Welcome to Premium!');
        setIsPremium(true);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(t('errors.subscription_failed') || 'Failed to start subscription');
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <FaCrown className="text-4xl text-gray-900" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('premium.already_premium_title') || 'You\'re a Premium Member!'}
            </h1>
            <p className="text-gray-400">
              {t('premium.already_premium_desc') || 'Enjoy unlimited access to all features'}
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {t('premium.your_benefits') || 'Your Premium Benefits'}
            </h2>
            <ul className="space-y-3">
              {[
                t('premium.features.unlimited_quests') || 'Unlimited access to all quests',
                t('premium.features.exclusive_content') || 'Exclusive premium content',
                t('premium.features.advanced_tracking') || 'Advanced progress tracking',
                t('premium.features.no_ads') || 'Ad-free experience',
                t('premium.features.priority_support') || 'Priority support'
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <FaCheck className="text-green-400 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse">
            <FaCrown className="text-4xl text-gray-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t('premium.title') || 'Unlock FinanceQuest Premium'}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('premium.subtitle') || 'Get unlimited access to all quests and exclusive features to accelerate your financial journey'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Monthly Plan */}
          <div 
            className={`relative bg-gray-800 border rounded-xl p-6 cursor-pointer transition-all duration-300 ${
              selectedPlan === 'monthly' 
                ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 scale-105' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            {selectedPlan === 'monthly' && (
              <div className="absolute -top-3 -right-3">
                <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                  {t('premium.selected') || 'Selected'}
                </div>
              </div>
            )}
            
            <h3 className="text-2xl font-bold text-white mb-2">
              {t('premium.monthly_plan') || 'Monthly'}
            </h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">
                {currentLang === 'fr' ? '4,99€' : '$4.99'}
              </span>
              <span className="text-gray-400 ml-2">
                /{t('ui.month') || 'month'}
              </span>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-400 text-sm" />
                {t('premium.cancel_anytime') || 'Cancel anytime'}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-400 text-sm" />
                {t('premium.instant_access') || 'Instant access'}
              </li>
            </ul>
          </div>

          {/* Yearly Plan */}
          <div 
            className={`relative bg-gray-800 border rounded-xl p-6 cursor-pointer transition-all duration-300 ${
              selectedPlan === 'yearly' 
                ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 scale-105' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <div className="absolute -top-3 -right-3">
              <div className="bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {t('premium.save_percent', { percent: 33 }) || 'Save 33%'}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">
              {t('premium.yearly_plan') || 'Yearly'}
            </h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">
                {currentLang === 'fr' ? '39,99€' : '$39.99'}
              </span>
              <span className="text-gray-400 ml-2">
                /{t('ui.year') || 'year'}
              </span>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-400 text-sm" />
                {t('premium.best_value') || 'Best value'}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-400 text-sm" />
                {t('premium.months_free', { months: 4 }) || '4 months free'}
              </li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {t('premium.features_title') || 'Everything in Premium'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <FaInfinity className="text-yellow-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('premium.features.unlimited_quests') || 'Unlimited Quests'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('premium.features.unlimited_quests_desc') || 'Access all current and future quests'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-400/10 rounded-lg">
                  <FaRocket className="text-purple-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('premium.features.advanced_content') || 'Advanced Content'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('premium.features.advanced_content_desc') || 'Expert-level strategies and techniques'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-400/10 rounded-lg">
                  <FaBolt className="text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('premium.features.priority_updates') || 'Priority Updates'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('premium.features.priority_updates_desc') || 'Get new features and content first'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-400/10 rounded-lg">
                  <FaTrophy className="text-green-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('premium.features.exclusive_badges') || 'Exclusive Badges'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('premium.features.exclusive_badges_desc') || 'Show off your premium status'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-400/10 rounded-lg">
                  <FaLock className="text-red-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('premium.features.no_ads') || 'Ad-Free Experience'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('premium.features.no_ads_desc') || 'Focus on learning without distractions'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-400/10 rounded-lg">
                  <FaCrown className="text-orange-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {t('premium.features.vip_support') || 'VIP Support'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('premium.features.vip_support_desc') || 'Get help when you need it most'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading 
              ? t('ui.processing') || 'Processing...' 
              : t('premium.subscribe_button') || 'Get Premium Now'
            }
          </button>
          
          <p className="mt-4 text-sm text-gray-500">
            {t('premium.money_back') || '30-day money-back guarantee'}
          </p>
          
          <p className="mt-2 text-xs text-gray-600">
            {t('premium.secure_payment') || 'Secure payment powered by Stripe'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;