import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  FaCrown, 
  FaCheck, 
  FaInfinity, 
  FaRocket, 
  FaBolt, 
  FaTrophy, 
  FaLock, 
  FaStar, 
  FaShieldAlt,
  FaArrowRight,
  FaTimes,
  FaFire,
  FaChartLine,
  FaQuestionCircle,
  FaChevronDown,
  FaGift,
  FaCreditCard,
  FaUserFriends,
  FaMobile,
  FaGlobe,
  FaCheckCircle,
  FaClock,
  FaAward,
  FaGraduationCap,
  FaGamepad
} from 'react-icons/fa';
import { BsStars, BsLightningChargeFill, BsCheckCircleFill } from 'react-icons/bs';
import { GiTwoCoins, GiDiamondTrophy } from 'react-icons/gi';
import { HiSparkles, HiOutlineSparkles } from 'react-icons/hi';
import { RiVipCrownFill } from 'react-icons/ri';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { logPremiumEvent } from '../../utils/analytics';
import LoadingSpinner from '../app/LoadingSpinner';
import posthog from 'posthog-js';
import SubscriptionManager from '../app/SubscriptionManager';
import AppBackground from '../app/AppBackground';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import couronneIcon from '../../assets/couronne.png';

// Initialize Stripe with your publishable key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// Animation de compteur fluide (réutilisée du Dashboard)
const CountUp = ({ end, duration = 1000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const Premium = () => {
  const { t, currentLang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isPremium, setIsPremium] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  // Cartes d'éducation financière (i18n)
  const eduCards = [
    { icon: FaGraduationCap, title: t('edu.card1.title'), text: t('edu.card1.text') },
    { icon: FaChartLine, title: t('edu.card2.title'), text: t('edu.card2.text') },
    { icon: FaGamepad, title: t('edu.card3.title'), text: t('edu.card3.text') },
  ];

  useEffect(() => {
    // Event de vue de page premium
    posthog.capture('premium_page_view');
    logPremiumEvent('premium_page_view');
  }, []);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();

      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        handleStripeReturn(sessionId);
      }
    } else {
      setCheckingStatus(false);
    }
  }, [user]);

  useEffect(() => {
    // Mettre à jour les propriétés utilisateur PostHog
    try {
      posthog.people && posthog.people.set({ premium_status: isPremium ? 'active' : 'none' });
    } catch (_) {}
  }, [isPremium]);

  const checkPremiumStatus = async () => {
    if (!user) {
      setCheckingStatus(false);
      return;
    }
    
    try {
      setCheckingStatus(true);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newPremiumStatus = !!userData.isPremium;
        setIsPremium(newPremiumStatus);
        
        // Si on a un stripeSubscriptionId mais que isPremium est false, 
        // on peut essayer de vérifier directement avec Stripe
        if (userData.stripeSubscriptionId && !newPremiumStatus) {
          console.log('Found subscription ID but premium is false, checking with Stripe...');
          await checkSubscriptionWithStripe(userData.stripeSubscriptionId);
        }
        
        return newPremiumStatus;
      } else {
        setIsPremium(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
      return false;
    } finally {
      setCheckingStatus(false);
    }
  };

  // Fonction de fallback pour vérifier directement avec Stripe
  const checkSubscriptionWithStripe = async (subscriptionId) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;

      const response = await fetch('/api/check-subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId
        }),
      });

      if (response.ok) {
        const { isActive } = await response.json();
        if (isActive) {
          console.log('Subscription is active, updating premium status...');
          setIsPremium(true);
          
          // Mettre à jour Firestore
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            isPremium: true,
            premiumStatus: 'active',
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error checking subscription with Stripe:', error);
    }
  };

  const handleSubscribe = async (plan = selectedPlan) => {
    if (!user) {
      toast.info('🔐 ' + (t('auth.login_required') || 'Please login to subscribe'));
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      // Analytics
      posthog.capture('checkout_start', {
        plan: plan,
        price: plan === 'monthly' ? 4.99 : 39.99
      });
      
      logPremiumEvent('premium_subscribe_attempt', { 
        plan: plan,
        price: plan === 'monthly' ? 4.99 : 39.99 
      });

      // Obtenir le token Firebase pour l'authentification
      // Utiliser auth.currentUser pour s'assurer d'avoir les méthodes Firebase Auth
      const idToken = await auth.currentUser?.getIdToken();
      
      if (!idToken) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          plan: plan,
          userId: user.uid,
          email: user.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API response not ok:', response.status, response.statusText, errorData);
        
        if (response.status === 401) {
          toast.error('🔐 ' + (t('auth.session_expired') || 'Session expired. Please login again.'));
          navigate('/login');
          return;
        }
        
        throw new Error(`Failed to create checkout session: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error('No session ID received from server');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe redirect error:', error);
        if (error.type === 'card_error' || error.type === 'validation_error') {
          toast.error('❌ ' + (error.message || 'Payment error occurred'));
        } else {
          throw error;
        }
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Messages d'erreur plus spécifiques
      if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error('🌐 ' + (t('errors.network_error') || 'Network error. Please check your connection.'));
      } else if (error.message.includes('Stripe not initialized')) {
        toast.error('⚙️ ' + (t('errors.config_error') || 'Payment system not configured. Please try again later.'));
      } else {
        toast.error('❌ ' + (t('errors.subscription_failed') || 'Failed to start subscription. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStripeReturn = async (sessionId) => {
    if (!user) return;
    
    try {
      console.log('Handling Stripe return for session:', sessionId);
      
      // Vérifier immédiatement le statut de la session
      await checkPremiumStatus();
      
      // Si pas encore premium, attendre et réessayer plusieurs fois
      let attempts = 0;
      const maxAttempts = 5;
      const checkInterval = setInterval(async () => {
        attempts++;
        console.log(`Checking premium status attempt ${attempts}/${maxAttempts}`);
        
        await checkPremiumStatus();
        
        if (isPremium || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          
          if (isPremium) {
            posthog.capture('checkout_success', {
              session_id: sessionId,
              plan: selectedPlan
            });
            
            logPremiumEvent('premium_subscribe_success', { 
              plan: selectedPlan,
              sessionId: sessionId
            });
            
            toast.success('✨ ' + (t('premium.subscribe_success') || 'Welcome to Premium!'));
          } else {
            console.warn('Premium status not updated after checkout, webhook may have failed');
            toast.info('⏳ ' + (t('premium.processing_subscription') || 'Processing your subscription... Please refresh the page in a few minutes.'));
          }
        }
      }, 3000); // Vérifier toutes les 3 secondes
      
      window.history.replaceState({}, document.title, '/premium');
      
    } catch (error) {
      console.error('Error handling Stripe return:', error);
      toast.error('❌ ' + (t('errors.subscription_processing') || 'Error processing subscription. Please contact support.'));
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error(t('auth.login_required') || 'Please login to manage subscription');
      return;
    }

    try {
      posthog.capture('portal_open_click');
      setLoading(true);
      
      // Obtenir le token Firebase pour l'authentification
      // Utiliser auth.currentUser pour s'assurer d'avoir les méthodes Firebase Auth
      const idToken = await auth.currentUser?.getIdToken();
      
      if (!idToken) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Portal session error:', response.status, errorData);
        
        if (response.status === 401) {
          toast.error('🔐 ' + (t('auth.session_expired') || 'Session expired. Please login again.'));
          navigate('/login');
          return;
        }
        
        throw new Error(`Failed to create portal session: ${response.status} - ${errorData.error || response.statusText}`);
      }
      
      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No portal URL received from server');
      }
      
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error('🌐 ' + (t('errors.network_error') || 'Network error. Please check your connection.'));
      } else {
        toast.error('❌ ' + (t('errors.portal_error') || 'Error opening subscription portal. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };



  // Calcul des économies
  const monthlyPrice = 4.99;
  const yearlyPrice = 39.99;
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;
  const yearlySavingsPercent = Math.round((yearlySavings / (monthlyPrice * 12)) * 100);

  if (checkingStatus) {
    return (
      <AppBackground variant="finance" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppBackground>
    );
  }

  // Premium member view
  if (isPremium) {
    return (
      <AppBackground variant="finance" grain grid={false} animate>
        <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
          <div className="px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="max-w-7xl mx-auto">
              
              {/* Header Hero Section - Style unifié avec Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                {/* Premium Member Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {/* Premium Badge animé */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-50"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-glow-purple">
                        <img 
                          src={couronneIcon} 
                          alt="Premium"
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    </motion.div>
                    
                    <div>
                      <h1 
                        className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight"
                        style={{ 
                          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                          fontWeight: 900,
                          letterSpacing: '-0.03em'
                        }}
                      >
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Premium
                        </span>
                        <span className="text-white ml-2">
                          Member
                        </span>
                      </h1>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                          <RiVipCrownFill className="text-purple-400 text-xs" />
                          <span className="text-xs font-bold text-purple-300">{t('premium.active_status') || 'Active'}</span>
                        </span>
                        <span className="text-sm text-gray-400">
                          {t('premium.already_premium_desc') || 'Enjoy unlimited access to all features'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <button
                    onClick={() => navigate('/quests')}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold shadow-glow-md hover:shadow-glow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                  >
                    <FaRocket />
                    {t('premium.continue_learning') || 'Continue Learning'}
                  </button>
                </div>

                {/* Benefits Grid - Style moderne néon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: FaInfinity, text: t('premium.features.unlimited_quests') || 'Unlimited quests', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                    { icon: FaBolt, text: t('premium.features.advanced_tracking') || 'Advanced tracking', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                    { icon: FaShieldAlt, text: t('premium.features.no_ads') || 'Ad-free', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                    { icon: FaStar, text: t('premium.features.early_access') || 'Early access', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
                  ].map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className={`neon-element rounded-2xl p-4 ${benefit.bg} ${benefit.border} border`}
                      >
                        <Icon className={`text-2xl ${benefit.color} mb-2`} />
                        <p className="text-sm font-semibold text-white">{benefit.text}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Subscription Management Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="neon-element rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 
                      className="text-lg font-bold text-white flex items-center gap-2"
                      style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                    >
                      <BsLightningChargeFill className="text-amber-400" />
                      {t('premium.manage_subscription') || 'Manage Your Subscription'}
                    </h2>
                    <span className="flex items-center gap-2 text-sm text-gray-400">
                      <FaCrown className="text-purple-400" />
                      {t('premium.active_subscription') || 'Active Subscription'}
                    </span>
                  </div>
                  <SubscriptionManager />
                </motion.div>

                {/* Referral Program CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 neon-element rounded-2xl p-6 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <FaGift className="text-xl text-gray-900" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{t('premium.referral_title') || 'Invite your friends'}</h3>
                        <p className="text-sm text-gray-400">{t('premium.referral_desc') || 'Earn 1 month free for each friend who subscribes'}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-sm font-semibold transition-all">
                      {t('premium.invite_button') || 'Invite'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </AppBackground>
    );
  }

  // Non-premium view with improved UX
  return (
    <AppBackground variant="finance" grain grid={false} animate>
      <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-7xl mx-auto">
            
            {/* Header Hero Section with Value Prop */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                {/* Removed 30-day money-back badge */}
                <span className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <FaLock className="text-blue-400 text-xs" />
                  <span className="text-xs text-blue-300 font-semibold">{t('premium.secure_payment')}</span>
                </span>
              </motion.div>

              {/* Icône sans glow en haut */}
              <div className="inline-block mb-6">
                <div className="relative">
                  <div className="relative flex items-center justify-center">
                    <img 
                      src={couronneIcon} 
                      alt="Premium"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                    />
                  </div>
                </div>
              </div>
              
              {/* Nouveau bloc valeur structurée sans CTA redondants ni datas exemple */}
              <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 
                  className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3"
                  style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 900, letterSpacing: '-0.03em' }}
                >
                  <span className="text-white">
                    {t('premium.title')}
                  </span>
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-2">
                  {t('premium.value_prop_headline')}
                </p>
                <p className="text-base text-gray-400 max-w-2xl mx-auto mb-6">
                  {t('premium.value_prop_sub')}
                </p>
                {/* Mentions légales déplacées en bas de page pour éviter la redondance */}
              </div>
            </motion.div>

            {/* Pricing Cards - Improved UX */}
            <div className="mb-8">
              {/* Toggle de période */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                <span className={`text-sm font-semibold transition-colors ${selectedPlan === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
                  {t('premium.monthly_plan')}
                </span>
                <button
                  onClick={() => {
                    const nextPlan = selectedPlan === 'monthly' ? 'yearly' : 'monthly';
                    setSelectedPlan(nextPlan);
                    posthog.capture('plan_toggled', { plan: nextPlan });
                  }}
                  className="relative w-14 h-7 rounded-full bg-gray-700 transition-colors"
                  aria-label="Toggle pricing plan"
                >
                  <motion.div
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-md"
                    animate={{ x: selectedPlan === 'yearly' ? 28 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </button>
                <span className={`text-sm font-semibold transition-colors ${selectedPlan === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
                  {t('premium.yearly_plan')}
                  {selectedPlan === 'yearly' && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold">
                      {t('premium.save_percent', { percent: 33 })}
                    </span>
                  )}
                </span>
              </motion.div>

              {/* Single pricing card with dynamic content (teinte réduite, meilleure lisibilité) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-md mx-auto"
              >
                <div className="relative">
                  {/* Glow externe au niveau des bordures */}
                  {!prefersReducedMotion && (
                    <motion.div
                      className="pointer-events-none absolute -inset-[2px] rounded-[22px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(251,191,36,0.45),rgba(249,115,22,0.35)_40%,transparent_70%)] opacity-60"
                      animate={{ opacity: [0.45, 0.7, 0.45] }}
                      transition={{ duration: 3.2, repeat: Infinity }}
                    />
                  )}
                  <div className="relative z-10 rounded-3xl p-8 border border-white/10 bg-black/20 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5 hover:ring-amber-400/40 transition-colors">
                    {/* Badge économie pour annuel */}
                    <AnimatePresence>
                      {selectedPlan === 'yearly' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-4 left-1/2 -translate-x-1/2"
                        >
                          <div className="px-4 py-1.5 rounded-full bg-emerald-500/90 text-white text-sm font-bold shadow-[0_8px_20px_rgba(16,185,129,0.35)] border border-emerald-400/60">
                            {t('premium.save_per_year', { amount: yearlySavings.toFixed(0) }) || `Save ${yearlySavings.toFixed(0)}€/year`}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Badge ROI au-dessus du prix (si yearly) */}
                    {selectedPlan === 'yearly' && (
                      <div className="mb-3 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                          {t('premium.roi_badge')}
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedPlan}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="text-[44px] leading-none font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] mb-2">
                            {selectedPlan === 'monthly' ? '4,99€' : '39,99€'}
                          </div>
                          <div className="text-[13px] text-gray-300">
                            {selectedPlan === 'monthly' ? t('premium.per_month') : t('premium.per_year')}
                            {selectedPlan === 'yearly' && (
                              <span className="block text-xs mt-1 text-gray-400">
                                {t('premium.effective_per_month', { amount: '3,33€' })}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <motion.button
                      onClick={() => handleSubscribe(selectedPlan)}
                      disabled={loading}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                      className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_36px_rgba(245,158,11,0.45)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                    >
                      {loading ? (
                        <>
                          <div className="scale-75">
                            <LoadingSpinner size="sm" />
                          </div>
                          {t('premium.processing') || 'Processing...'}
                        </>
                      ) : (
                        <>
                          <FaCreditCard />
                          {t('premium.start_free_trial')}
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-[11px] text-gray-400 mt-3">
                      {t('premium.copy_line')}
                    </p>

                    <div className="text-center mt-3">
                      <button
                        onClick={() => navigate('/quests')}
                        className="text-sm text-gray-400 hover:text-gray-200 underline"
                      >
                        {t('premium.continue_free')}
                      </button>
                    </div>

                    {/* Features list (véridique) */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="space-y-3">
                        {[
                          t('premium.features.full_access'),
                          t('premium.features.advanced_cats'),
                          t('premium.features.trial'),
                          t('premium.features.updates'),
                          t('premium.features.support_dev')
                        ].filter(Boolean).map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + index * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-5 h-5 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                              <FaCheck className="text-green-400 text-xs" />
                            </div>
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Section comparaison retirée */}

            {/* Why financial education matters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h3 
                className="text-xl font-bold text-white mb-6 text-center"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
              >
                {t('edu.title') || 'Why financial education matters'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {eduCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="neon-card rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                          <Icon className="text-amber-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">{card.title}</h4>
                      </div>
                      <p className="text-gray-300 text-sm">{card.text}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-3 text-center text-[11px] text-gray-500">
                {t('edu.disclaimer')}
              </div>
            </motion.div>

            {/* FAQ Section - Style moderne néon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-8"
            >
              <h3 
                className="text-xl font-bold text-white mb-6 text-center"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
              >
                {t('premium.faq.title')}
              </h3>
              
              <div className="space-y-4 max-w-3xl mx-auto">
                {[
                  { q: t('premium.faq.cancel_anytime_q') || 'Can I cancel anytime?', a: t('premium.faq.cancel_anytime_a') || 'Yes, cancel anytime from your account. No questions asked.' },
                  { q: t('premium.faq.free_trial_q') || 'Is there a free trial?', a: t('premium.faq.free_trial_a') || 'Yes! Enjoy a 7-day free trial to test Premium features with no commitment.' },
                  // Garantie satisfait ou remboursé supprimée
                  { q: t('premium.faq.switch_plan_q') || 'Can I switch plan?', a: t('premium.faq.switch_plan_a') || 'Yes, switch between monthly and yearly any time from your account.' }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="neon-element rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-white font-semibold flex items-center gap-3">
                        <FaQuestionCircle className="text-amber-400" />
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown className="text-gray-400" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-4 text-gray-400 text-sm">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Final CTA Section */}
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center py-8 px-6 neon-element rounded-3xl bg-gradient-to-r from-amber-500/5 to-orange-500/5"
            >
              <h3 className="text-2xl font-bold text-white mb-4">{t('premium.final_cta_title') || 'Ready to transform your finances?'}</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">{t('premium.final_cta_sub') || 'Join thousands who already improved their finances with Premium'}</p>
              <motion.button
                onClick={() => handleSubscribe(selectedPlan)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-2xl font-bold text-lg shadow-glow-md hover:shadow-glow-lg transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
              >
                  {t('premium.start_free_trial')}
              </motion.button>
                <p className="mt-3 text-xs text-gray-500">{t('premium.copy_line')}</p>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/quests')}
                    className="text-sm text-gray-400 hover:text-gray-200 underline"
                  >
                    {t('premium.continue_free')}
                  </button>
                </div>
            </motion.div>

            {/* Payment methods */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex items-center justify-center gap-6 mt-8 opacity-50"
            >
              <span className="text-xs text-gray-500">{t('premium.secured_by') || 'Payments secured by'}</span>
              <div className="flex items-center gap-4">
                <FaCreditCard className="text-2xl text-gray-600" />
                <FaLock className="text-xl text-gray-600" />
                <span className="text-gray-600 font-bold">Stripe</span>
              </div>
            </motion.div>

            <div className="mt-6 text-center text-[11px] text-gray-500">
              {t('premium.disclaimer')}
            </div>
          </div>
        </div>
      </div>
    </AppBackground>
  );
};

export default Premium;