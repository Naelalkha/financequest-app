import React, { useState, useEffect } from 'react';
import { FaCrown, FaLock, FaCheck, FaRocket, FaBolt, FaTrophy, FaStar, FaShieldAlt, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { PAYWALL_VARIANTS } from '../hooks/usePaywall';
import posthog from 'posthog-js';
import { loadStripe } from '@stripe/stripe-js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const PaywallModal = ({ quest, variant, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  // Vérifier si on revient de Stripe (URL avec session_id)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      console.log('PaywallModal: Returning from Stripe checkout with session:', sessionId);
      handleStripeReturn(sessionId);
    }
  }, []);

  const handleStripeReturn = async (sessionId) => {
    if (!user) return;
    
    try {
      console.log('PaywallModal: Handling Stripe return for session:', sessionId);
      
      // Mettre à jour le statut premium directement
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isPremium: true,
        premiumStartDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      
      // Capture PostHog checkout_success event
      posthog.capture('checkout_success', {
        session_id: sessionId,
        variant,
        quest_id: quest.id,
        plan: selectedPlan
      });
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Fermer le modal
      onClose();
      
    } catch (error) {
      console.error('PaywallModal: Error handling Stripe return:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      // Rediriger vers login si pas connecté
      return;
    }

    setLoading(true);
    
    try {
      // Définir priceId avec les variables d'environnement
      const priceId = selectedPlan === 'monthly' 
        ? (import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1ABC123DEF456GHI789JKL')
        : (import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_1XYZ789ABC123DEF456GHI');

      // Capture l'événement checkout_start avec la variante
      posthog.capture('checkout_start', { 
        variant, 
        quest_id: quest.id,
        price_id: priceId
      });

      // Appel API pour créer la session Stripe
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: user.uid,
          email: user.email
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create checkout session: ${response.status}`);
      }

      const { sessionId } = await response.json();
      console.log('Paywall session created:', sessionId);
      
      // Rediriger vers Stripe Checkout
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        throw new Error('Stripe publishable key not configured');
      }
      
      const stripe = await loadStripe(stripeKey);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Fallback pour la démo
      setTimeout(() => {
        const plan = selectedPlan === 'monthly' ? 'monthly' : 'yearly';
        posthog.capture('checkout_success', {
          variant,
          quest_id: quest.id,
          plan
        });
        onClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const getVariantContent = () => {
    if (variant === PAYWALL_VARIANTS.A_DIRECT) {
      return {
        title: t('paywall.variant_a.title') || 'Unlock Premium Content',
        subtitle: t('paywall.variant_a.subtitle') || 'Get unlimited access to all quests and features',
        cta: t('paywall.variant_a.cta') || 'Start Your Premium Journey'
      };
    } else {
      return {
        title: t('paywall.variant_b.title') || 'You\'ve Completed 3 Free Quests!',
        subtitle: t('paywall.variant_b.subtitle') || 'Ready to unlock the full FinanceQuest experience?',
        cta: t('paywall.variant_b.cta') || 'Upgrade to Premium'
      };
    }
  };

  const content = getVariantContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <FaLock className="text-2xl text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {content.title}
            </h2>
            <p className="text-gray-400">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quest Info */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              {quest.title}
            </h3>
            <p className="text-gray-300 text-sm">
              {quest.description}
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              {t('paywall.benefits_title') || 'Premium Benefits'}
            </h3>
            <div className="space-y-3">
              {[
                { icon: FaRocket, text: t('paywall.benefits.unlimited_quests') || 'Unlimited access to all quests' },
                { icon: FaCrown, text: t('paywall.benefits.exclusive_content') || 'Exclusive premium content' },
                { icon: FaBolt, text: t('paywall.benefits.advanced_tracking') || 'Advanced progress tracking' },
                { icon: FaShieldAlt, text: t('paywall.benefits.no_ads') || 'Ad-free experience' }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <Icon className="text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              {t('paywall.choose_plan') || 'Choose Your Plan'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-white font-semibold">Monthly</div>
                  <div className="text-2xl font-bold text-yellow-400">$4.99</div>
                  <div className="text-gray-400 text-sm">per month</div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`p-4 rounded-lg border-2 transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 33%
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">Yearly</div>
                  <div className="text-2xl font-bold text-yellow-400">$39.99</div>
                  <div className="text-gray-400 text-sm">per year</div>
                </div>
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                {t('paywall.processing') || 'Processing...'}
              </div>
            ) : (
              content.cta
            )}
          </button>

          {/* Footer */}
          <p className="text-gray-500 text-xs text-center mt-4">
            {t('paywall.terms') || 'By subscribing, you agree to our Terms of Service and Privacy Policy'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal; 