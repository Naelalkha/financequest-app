import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { FaCrown, FaCheck, FaInfinity, FaRocket, FaBolt, FaTrophy, FaLock, FaStar, FaShieldAlt } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { logPremiumEvent } from '../../utils/analytics';
import LoadingSpinner from '../common/LoadingSpinner';
import posthog from 'posthog-js';

// Initialize Stripe with your publishable key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const Premium = () => {
  const { t, currentLang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isPremium, setIsPremium] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      logPremiumEvent('premium_page_view');
      
      // Vérifier si on revient de Stripe (URL avec session_id)
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        console.log('Returning from Stripe checkout with session:', sessionId);
        // Recharger le statut premium après un délai
        setTimeout(() => {
          checkPremiumStatus();
        }, 2000);
      }
    } else {
      setCheckingStatus(false);
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) {
      setCheckingStatus(false);
      return;
    }
    
    try {
      setCheckingStatus(true);
      // First check if user object already has premium status
      if (user.isPremium !== undefined) {
        console.log('Premium status from user object:', user.isPremium);
        setIsPremium(user.isPremium);
        setCheckingStatus(false);
        return;
      }
      
      // Otherwise fetch from Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('User data from Firestore:', userData);
        // Check isPremium field
        setIsPremium(userData.isPremium || false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      // If error, check user object as fallback
      setIsPremium(user.isPremium || false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.info(t('auth.login_required') || 'Please login to subscribe');
      navigate('/login');
      return;
    }

    setLoading(true);
    
    // Définir priceId au niveau de la fonction pour être accessible partout
    // Utiliser les variables d'environnement ou les IDs par défaut
    // IMPORTANT: Utiliser des Price IDs (price_...) pas des Product IDs (prod_...)
    const priceId = selectedPlan === 'monthly' 
      ? (import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1ABC123DEF456GHI789JKL')
      : (import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_1XYZ789ABC123DEF456GHI');
    
    try {
      // Capture PostHog checkout_start event
      posthog.capture('checkout_start', {
        price_id: priceId
      });
      
      // Log the attempt
      logPremiumEvent('premium_subscribe_attempt', { 
        plan: selectedPlan,
        price: selectedPlan === 'monthly' ? 4.99 : 39.99 
      });

      // Créer la session Stripe via l'API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          variant: 'direct_premium',
          questId: 'premium_subscription',
          userId: user.uid
        }),
      });

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`Failed to create checkout session: ${response.status}`);
      }

      const { sessionId } = await response.json();
      console.log('Session created successfully:', sessionId);

      // Rediriger vers Stripe Checkout
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      console.log('Stripe key available:', !!stripeKey);
      
      if (!stripeKey) {
        throw new Error('Stripe publishable key not configured');
      }
      
      const stripe = await loadStripe(stripeKey);
      console.log('Stripe loaded:', !!stripe);
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      console.log('Redirect result:', { error });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw error;
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(t('errors.subscription_failed') || 'Failed to start subscription');
      
      // Fallback pour la démo si l'API n'est pas disponible
      toast.info(`Demo mode: Simulating successful subscription (API error: ${error.message})`);
      setTimeout(() => {
        // Capture PostHog checkout_success event
        const plan = selectedPlan === 'monthly' ? 'monthly' : 'yearly';
        posthog.capture('checkout_success', {
          price_id: priceId,
          plan: plan
        });
        
        // Mettre à jour Firebase
        updateUserPremiumStatus(true);
        
        toast.success(t('premium.subscribe_success') || 'Welcome to Premium!');
        setIsPremium(true);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le statut premium dans Firebase
  const updateUserPremiumStatus = async (isPremiumStatus) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isPremium: isPremiumStatus,
        premiumStartDate: isPremiumStatus ? new Date().toISOString() : null,
        lastUpdated: new Date().toISOString()
      });
      
      console.log('Premium status updated in Firebase:', isPremiumStatus);
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  };

  // Show loading while checking status
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show premium member screen
  if (isPremium) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Premium Member Header */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg animate-pulse">
              <FaCrown className="text-4xl text-gray-900" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('premium.already_premium_title') || 'You\'re a Premium Member!'}
            </h1>
            <p className="text-gray-400">
              {t('premium.already_premium_desc') || 'Enjoy unlimited access to all features'}
            </p>
          </div>

          {/* Benefits Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-bold text-white mb-4">
              {t('premium.your_benefits') || 'Your Premium Benefits'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: FaInfinity, text: t('premium.features.unlimited_quests') || 'Unlimited access to all quests' },
                { icon: FaCrown, text: t('premium.features.exclusive_content') || 'Exclusive premium content' },
                { icon: FaBolt, text: t('premium.features.advanced_tracking') || 'Advanced progress tracking' },
                { icon: FaShieldAlt, text: t('premium.features.no_ads') || 'Ad-free experience' },
                { icon: FaRocket, text: t('premium.features.priority_support') || 'Priority support' },
                { icon: FaStar, text: t('premium.features.early_access') || 'Early access to new features' },
                { icon: FaTrophy, text: t('premium.features.custom_challenges') || 'Custom daily challenges' },
                { icon: FaLock, text: t('premium.features.export_data') || 'Export your progress data' }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <li key={index} className="flex items-start gap-3">
                    <Icon className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{benefit.text}</span>
                  </li>
                );
              })}
            </div>
          </div>

          {/* Premium Status Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 animate-fadeIn" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <FaStar className="text-yellow-400 text-2xl" />
              <h3 className="text-lg font-bold text-white">
                {t('premium.member_since') || 'Premium Member'}
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              {t('premium.thank_you') || 'Thank you for supporting FinanceQuest! Your premium membership helps us create more amazing content.'}
            </p>
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                {t('premium.manage_subscription') || 'To manage your subscription, please contact support at support@financequest.app'}
              </p>
            </div>
          </div>

          {/* Continue Learning CTA */}
          <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '600ms' }}>
            <button
              onClick={() => navigate('/quests')}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {t('premium.continue_learning') || 'Continue Learning'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show subscription options for non-premium users
  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse shadow-lg">
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
            className={`relative bg-gray-800 border rounded-xl p-6 cursor-pointer transition-all duration-300 animate-fadeIn ${
              selectedPlan === 'monthly' 
                ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 scale-105' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            style={{ animationDelay: '200ms' }}
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
                <FaCheck className="text-green-400 text-sm flex-shrink-0" />
                {t('premium.cancel_anytime') || 'Cancel anytime'}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-400 text-sm flex-shrink-0" />
                {t('premium.instant_access') || 'Instant access'}
              </li>
            </ul>
          </div>

          {/* Yearly Plan */}
          <div 
            className={`relative bg-gray-800 border rounded-xl p-6 cursor-pointer transition-all duration-300 animate-fadeIn ${
              selectedPlan === 'yearly' 
                ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 scale-105' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            style={{ animationDelay: '300ms' }}
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
                <FaCheck className="text-green-400 text-sm flex-shrink-0" />
                {t('premium.best_value') || 'Best value'}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-green-400 text-sm flex-shrink-0" />
                {t('premium.months_free', { months: 4 }) || '4 months free'}
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8 animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {t('premium.features_title') || 'Everything in Premium'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: FaInfinity,
                color: 'yellow',
                title: t('premium.features.unlimited_quests') || 'Unlimited Quests',
                description: t('premium.features.unlimited_quests_desc') || 'Access all current and future quests'
              },
              {
                icon: FaRocket,
                color: 'purple',
                title: t('premium.features.advanced_content') || 'Advanced Content',
                description: t('premium.features.advanced_content_desc') || 'Expert-level strategies and techniques'
              },
              {
                icon: FaBolt,
                color: 'blue',
                title: t('premium.features.priority_updates') || 'Priority Updates',
                description: t('premium.features.priority_updates_desc') || 'Get new features and content first'
              },
              {
                icon: FaTrophy,
                color: 'green',
                title: t('premium.features.exclusive_badges') || 'Exclusive Badges',
                description: t('premium.features.exclusive_badges_desc') || 'Show off your premium status'
              },
              {
                icon: FaLock,
                color: 'red',
                title: t('premium.features.no_ads') || 'Ad-Free Experience',
                description: t('premium.features.no_ads_desc') || 'Focus on learning without distractions'
              },
              {
                icon: FaCrown,
                color: 'orange',
                title: t('premium.features.vip_support') || 'VIP Support',
                description: t('premium.features.vip_support_desc') || 'Get help when you need it most'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                yellow: 'bg-yellow-400/10 text-yellow-400',
                purple: 'bg-purple-400/10 text-purple-400',
                blue: 'bg-blue-400/10 text-blue-400',
                green: 'bg-green-400/10 text-green-400',
                red: 'bg-red-400/10 text-red-400',
                orange: 'bg-orange-400/10 text-orange-400'
              };
              
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses[feature.color]}`}>
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fadeIn" style={{ animationDelay: '500ms' }}>
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

        {/* FAQ Section */}
        <div className="mt-16 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            {t('premium.faq_title') || 'Frequently Asked Questions'}
          </h3>
          
          <div className="space-y-4">
            <details className="group bg-gray-800 border border-gray-700 rounded-lg p-4">
              <summary className="flex items-center justify-between cursor-pointer text-white hover:text-yellow-400 transition-colors">
                <span>{t('premium.faq_1_q') || 'Can I cancel anytime?'}</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-400 text-sm">
                {t('premium.faq_1_a') || 'Yes! You can cancel your subscription anytime from your account settings. You\'ll continue to have access until the end of your billing period.'}
              </p>
            </details>
            
            <details className="group bg-gray-800 border border-gray-700 rounded-lg p-4">
              <summary className="flex items-center justify-between cursor-pointer text-white hover:text-yellow-400 transition-colors">
                <span>{t('premium.faq_2_q') || 'What payment methods do you accept?'}</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-400 text-sm">
                {t('premium.faq_2_a') || 'We accept all major credit cards, debit cards, and digital wallets through our secure payment partner Stripe.'}
              </p>
            </details>
            
            <details className="group bg-gray-800 border border-gray-700 rounded-lg p-4">
              <summary className="flex items-center justify-between cursor-pointer text-white hover:text-yellow-400 transition-colors">
                <span>{t('premium.faq_3_q') || 'Do you offer refunds?'}</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-400 text-sm">
                {t('premium.faq_3_a') || 'Yes! We offer a 30-day money-back guarantee. If you\'re not satisfied, contact support for a full refund.'}
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;