import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCrown, FaStar, FaCheck, FaTrophy, FaLock, 
  FaRocket, FaGem, FaInfinity, FaBolt, FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Premium = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [userIsPremium, setUserIsPremium] = useState(false);

  const plans = {
    monthly: {
      price: 4.99,
      period: t('premium.monthly') || 'month',
      priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID
    },
    yearly: {
      price: 39.99,
      period: t('premium.yearly') || 'year',
      priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID,
      savings: 20
    }
  };

  const features = [
    {
      icon: FaInfinity,
      title: t('premium.features.unlimited_quests') || 'Unlimited Premium Quests',
      description: t('premium.features.unlimited_desc') || 'Access all quests including exclusive premium content'
    },
    {
      icon: FaBolt,
      title: t('premium.features.daily_challenges') || 'Daily Challenges',
      description: t('premium.features.daily_desc') || 'New challenges every day with bonus rewards'
    },
    {
      icon: FaGem,
      title: t('premium.features.exclusive_badges') || 'Exclusive Badges',
      description: t('premium.features.badges_desc') || 'Unlock special achievements and show off your progress'
    },
    {
      icon: FaRocket,
      title: t('premium.features.early_access') || 'Early Access',
      description: t('premium.features.early_desc') || 'Be the first to try new features and content'
    },
    {
      icon: FaShieldAlt,
      title: t('premium.features.priority_support') || 'Priority Support',
      description: t('premium.features.support_desc') || 'Get help faster with dedicated support'
    },
    {
      icon: FaTrophy,
      title: t('premium.features.leaderboards') || 'Global Leaderboards',
      description: t('premium.features.leaderboard_desc') || 'Compete with learners worldwide'
    }
  ];

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  const checkPremiumStatus = async () => {
    // Check if user already has premium
    if (user?.isPremium) {
      setUserIsPremium(true);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const stripe = await stripePromise;
      const selectedPlan = plans[billingPeriod];

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan.priceId,
          userId: user.uid,
          userEmail: user.email,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/premium`
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(t('errors.subscription_failed') || 'Failed to start subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-purple-900/20 to-gray-900 px-4 pt-16 pb-12 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 animate-bounce shadow-lg">
            <FaCrown className="text-4xl text-gray-900" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fadeIn">
            {t('premium.unlock_premium') || 'Unlock Premium'}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fadeIn" style={{ animationDelay: '100ms' }}>
            {t('premium.hero_subtitle') || 'Take your financial education to the next level with unlimited access and exclusive features'}
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 text-gray-400 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-400" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-green-400" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTrophy className="text-purple-400" />
              <span className="text-sm">50K+ Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="px-4 py-12 max-w-4xl mx-auto">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <div className="bg-gray-800 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('premium.monthly') || 'Monthly'}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('premium.yearly') || 'Yearly'}
              {billingPeriod === 'yearly' && (
                <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  -{plans.yearly.savings}%
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Price Card */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-center mb-12 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="text-5xl font-bold text-white">
              ${plans[billingPeriod].price}
            </span>
            <span className="text-xl text-purple-100">
              /{plans[billingPeriod].period}
            </span>
          </div>
          
          {billingPeriod === 'yearly' && (
            <p className="text-purple-100 mb-6">
              {t('premium.billed_yearly', { total: plans.yearly.price }) || `Billed ${plans.yearly.price} yearly`}
            </p>
          )}
          
          <button
            onClick={handleSubscribe}
            disabled={loading || userIsPremium}
            className={`
              w-full px-8 py-4 rounded-xl font-bold text-lg
              transform transition-all duration-300 shadow-lg
              ${userIsPremium
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 hover:scale-105 hover:shadow-xl'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                {t('ui.processing') || 'Processing...'}
              </span>
            ) : userIsPremium ? (
              t('premium.already_premium') || 'You already have Premium'
            ) : (
              t('premium.start_free_trial') || 'Start 7-Day Free Trial'
            )}
          </button>
          
          <p className="text-sm text-purple-100 mt-4">
            {t('premium.cancel_anytime') || 'Cancel anytime. No hidden fees.'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transform hover:scale-105 transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden animate-fadeIn" style={{ animationDelay: '800ms' }}>
          <h2 className="text-2xl font-bold text-white p-6 text-center">
            {t('premium.compare_plans') || 'Compare Plans'}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-700">
                  <th className="text-left p-4 text-gray-400 font-medium">
                    {t('premium.features') || 'Features'}
                  </th>
                  <th className="p-4 text-center">
                    <div className="text-gray-400 font-medium">{t('premium.free_plan') || 'Free'}</div>
                  </th>
                  <th className="p-4 text-center bg-purple-900/20">
                    <div className="text-purple-400 font-medium flex items-center justify-center gap-2">
                      <FaCrown />
                      {t('premium.premium_plan') || 'Premium'}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: t('premium.basic_quests') || 'Basic Quests', free: '10', premium: '∞' },
                  { feature: t('premium.premium_quests') || 'Premium Quests', free: <FaLock className="text-gray-600" />, premium: <FaCheck className="text-green-400" /> },
                  { feature: t('premium.daily_challenges') || 'Daily Challenges', free: <FaLock className="text-gray-600" />, premium: <FaCheck className="text-green-400" /> },
                  { feature: t('premium.offline_mode') || 'Offline Mode', free: 'Limited', premium: 'Full' },
                  { feature: t('premium.badges_achievements') || 'Badges & Achievements', free: 'Basic', premium: 'All' },
                  { feature: t('premium.priority_support') || 'Priority Support', free: <FaLock className="text-gray-600" />, premium: <FaCheck className="text-green-400" /> },
                  { feature: t('premium.analytics') || 'Advanced Analytics', free: <FaLock className="text-gray-600" />, premium: <FaCheck className="text-green-400" /> },
                ].map((row, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="p-4 text-white">{row.feature}</td>
                    <td className="p-4 text-center text-gray-400">
                      {typeof row.free === 'string' ? row.free : row.free}
                    </td>
                    <td className="p-4 text-center bg-purple-900/20 text-white font-medium">
                      {typeof row.premium === 'string' ? row.premium : row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-12 animate-fadeIn" style={{ animationDelay: '900ms' }}>
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            {t('premium.what_users_say') || 'What Our Users Say'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                role: 'Freelancer',
                content: t('premium.testimonial_1') || 'FinanceQuest Premium helped me save $2,000 in just 3 months!',
                rating: 5
              },
              {
                name: 'David L.',
                role: 'Student',
                content: t('premium.testimonial_2') || 'The daily challenges keep me motivated. Best investment in myself!',
                rating: 5
              },
              {
                name: 'Emma K.',
                role: 'Parent',
                content: t('premium.testimonial_3') || 'Finally understand investing. The premium quests are worth every penny.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
                style={{ animationDelay: `${1000 + index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-xl p-6 animate-fadeIn" style={{ animationDelay: '1100ms' }}>
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            {t('premium.faq_title') || 'Frequently Asked Questions'}
          </h3>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-white hover:text-yellow-400 transition-colors">
                <span>{t('premium.faq_1_q') || 'Can I cancel anytime?'}</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-gray-400 text-sm">
                {t('premium.faq_1_a') || 'Yes! You can cancel your subscription anytime from your account settings. No questions asked.'}
              </p>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-white hover:text-yellow-400 transition-colors">
                <span>{t('premium.faq_2_q') || 'Is there a free trial?'}</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-gray-400 text-sm">
                {t('premium.faq_2_a') || 'Yes! New users get a 7-day free trial to explore all premium features.'}
              </p>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-white hover:text-yellow-400 transition-colors">
                <span>{t('premium.faq_3_q') || 'What payment methods do you accept?'}</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-gray-400 text-sm">
                {t('premium.faq_3_a') || 'We accept all major credit cards, debit cards, and digital wallets through our secure payment partner Stripe.'}
              </p>
            </details>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center animate-fadeIn" style={{ animationDelay: '1200ms' }}>
          <p className="text-gray-400 mb-6">
            {t('premium.ready_to_level_up') || 'Ready to level up your financial knowledge?'}
          </p>
          <button
            onClick={handleSubscribe}
            disabled={loading || userIsPremium}
            className={`
              px-12 py-4 rounded-xl font-bold text-lg
              transform transition-all duration-300 shadow-lg
              ${userIsPremium
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 hover:scale-105 hover:shadow-xl'
              }
            `}
          >
            {userIsPremium 
              ? t('premium.already_premium') || 'You already have Premium'
              : t('premium.get_premium_now') || 'Get Premium Now'
            }
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            {t('premium.secure_payment') || 'Secure payment powered by Stripe'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;